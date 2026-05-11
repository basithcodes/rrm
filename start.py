#!/usr/bin/env python3

from __future__ import annotations

import argparse
import os
from pathlib import Path
import re
import secrets
import shutil
import socket
import subprocess
import sys
import time
from urllib.parse import urlparse

ROOT = Path(__file__).resolve().parent
ENV_PATH = ROOT / ".env"
ENV_EXAMPLE_PATH = ROOT / ".env.example"
COMPOSE_PATH = ROOT / "compose.yaml"
DEFAULT_DATABASE_URL = "postgresql://postgres:postgres@localhost:5432/rrm?schema=public"
PLACEHOLDER_PREFIX = "replace-with-"
PRISMA_DEV_NAME = "rrm"


def print_status(message: str) -> None:
    print(f"[start.py] {message}")


def fail(message: str, exit_code: int = 1) -> int:
    print_status(message)
    return exit_code


def command_exists(name: str) -> bool:
    return shutil.which(name) is not None


def parse_env_text(text: str) -> dict[str, str]:
    values: dict[str, str] = {}

    for raw_line in text.splitlines():
        line = raw_line.strip()

        if not line or line.startswith("#") or "=" not in line:
            continue

        key, raw_value = line.split("=", 1)
        value = raw_value.strip()

        if value.startswith(('"', "'")) and value.endswith(('"', "'")):
            value = value[1:-1]

        values[key.strip()] = value

    return values


def load_env_file(path: Path) -> dict[str, str]:
    if not path.exists():
        return {}

    return parse_env_text(path.read_text(encoding="utf-8"))


def ensure_env_file() -> dict[str, str]:
    original_lines = []

    if ENV_PATH.exists():
        original_lines = ENV_PATH.read_text(encoding="utf-8").splitlines()
        env_values = parse_env_text("\n".join(original_lines))
    elif ENV_EXAMPLE_PATH.exists():
        original_lines = ENV_EXAMPLE_PATH.read_text(encoding="utf-8").splitlines()
        env_values = parse_env_text("\n".join(original_lines))
    else:
        env_values = {}

    desired_values = {
        "DATABASE_URL": os.environ.get("DATABASE_URL") or env_values.get("DATABASE_URL") or DEFAULT_DATABASE_URL,
        "OWNER_ACCESS_CODE": os.environ.get("OWNER_ACCESS_CODE") or env_values.get("OWNER_ACCESS_CODE") or secrets.token_hex(12),
        "SESSION_SECRET": os.environ.get("SESSION_SECRET") or env_values.get("SESSION_SECRET") or secrets.token_hex(32),
    }

    replacements: dict[str, str] = {}

    for key, value in desired_values.items():
        current = env_values.get(key)

        if not current or current.startswith(PLACEHOLDER_PREFIX):
            replacements[key] = value
            env_values[key] = value

    if not ENV_PATH.exists() and not original_lines:
        ENV_PATH.write_text(
            "\n".join(f'{key}="{env_values[key]}"' for key in desired_values) + "\n",
            encoding="utf-8",
        )
        print_status("Created .env with local development defaults.")
    elif replacements:
        updated_lines = []
        handled_keys = set()

        for line in original_lines:
            stripped = line.strip()
            replaced = False

            for key, value in replacements.items():
                if stripped.startswith(f"{key}="):
                    updated_lines.append(f'{key}="{value}"')
                    handled_keys.add(key)
                    replaced = True
                    break

            if not replaced:
                updated_lines.append(line)

        for key, value in replacements.items():
            if key not in handled_keys:
                updated_lines.append(f'{key}="{value}"')

        ENV_PATH.write_text("\n".join(updated_lines) + "\n", encoding="utf-8")
        print_status("Updated .env with missing local development values.")
    elif not ENV_PATH.exists():
        ENV_PATH.write_text("\n".join(original_lines) + "\n", encoding="utf-8")
        print_status("Copied .env.example to .env.")

    return env_values


def build_child_environment(file_values: dict[str, str]) -> dict[str, str]:
    env = os.environ.copy()

    for key, value in file_values.items():
        env.setdefault(key, value)

    return env


def run_command(
    command: list[str],
    *,
    env: dict[str, str],
    check: bool = True,
    capture_output: bool = False,
) -> subprocess.CompletedProcess[str]:
    print_status("Running: " + " ".join(command))
    return subprocess.run(
        command,
        cwd=ROOT,
        env=env,
        check=check,
        stdout=subprocess.PIPE if capture_output else None,
        stderr=subprocess.STDOUT if capture_output else None,
        text=True,
    )


def database_endpoint(database_url: str) -> tuple[str, int]:
    parsed = urlparse(database_url)
    host = parsed.hostname or "localhost"
    port = parsed.port or 5432
    return host, port


def database_is_reachable(host: str, port: int) -> bool:
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as sock:
        sock.settimeout(1)
        return sock.connect_ex((host, port)) == 0


def is_local_database(host: str) -> bool:
    return host in {"localhost", "127.0.0.1", "0.0.0.0"}


def docker_compose_command(env: dict[str, str]) -> list[str] | None:
    if command_exists("docker"):
        result = subprocess.run(
            ["docker", "compose", "version"],
            cwd=ROOT,
            env=env,
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
            check=False,
            text=True,
        )

        if result.returncode == 0:
            return ["docker", "compose"]

    if command_exists("docker-compose"):
        return ["docker-compose"]

    return None


def extract_database_url(command_output: str) -> str | None:
    match = re.search(r"(postgres(?:ql)?://\S+)", command_output)

    if match:
        return match.group(1)

    return None


def start_prisma_dev_database(env: dict[str, str]) -> str | None:
    try:
        result = run_command(
            ["npx", "prisma", "dev", "-d", "--name", PRISMA_DEV_NAME],
            env=env,
            capture_output=True,
        )
    except subprocess.CalledProcessError:
        return None

    database_url = extract_database_url(result.stdout or "")

    if not database_url:
        return None

    print_status("Using Prisma-managed local PostgreSQL.")
    return database_url


def start_local_database_if_needed(database_url: str, env: dict[str, str]) -> str:
    host, port = database_endpoint(database_url)

    if database_is_reachable(host, port):
        print_status(f"Database is reachable at {host}:{port}.")
        return database_url

    if not is_local_database(host):
        raise RuntimeError(
            f"Database is not reachable at {host}:{port}. Start that server or update DATABASE_URL before running start.py.",
        )

    prisma_dev_url = start_prisma_dev_database(env)

    if prisma_dev_url:
        return prisma_dev_url

    if not COMPOSE_PATH.exists():
        raise RuntimeError(
            f"Database is not reachable at {host}:{port} and {COMPOSE_PATH.name} is missing, so start.py has no local fallback.",
        )

    compose_command = docker_compose_command(env)

    if compose_command is None:
        raise RuntimeError(
            f"Database is not reachable at {host}:{port} and Docker Compose is not installed. Start PostgreSQL manually or install Docker.",
        )

    print_status("Database is down; starting the bundled PostgreSQL service.")
    run_command([*compose_command, "up", "-d", "postgres"], env=env)

    deadline = time.monotonic() + 60

    while time.monotonic() < deadline:
        if database_is_reachable(host, port):
            print_status("PostgreSQL is ready.")
            return database_url

        time.sleep(2)

    raise RuntimeError(f"PostgreSQL did not become reachable at {host}:{port} within 60 seconds.")


def dependencies_need_install() -> bool:
    node_modules = ROOT / "node_modules"
    package_lock = ROOT / "package-lock.json"
    install_marker = node_modules / ".package-lock.json"

    if not node_modules.exists():
        return True

    if package_lock.exists() and not install_marker.exists():
        return True

    if package_lock.exists() and install_marker.exists():
        return package_lock.stat().st_mtime > install_marker.stat().st_mtime

    return False


def install_dependencies(env: dict[str, str]) -> None:
    if dependencies_need_install():
        run_command(["npm", "install"], env=env)
        return

    print_status("Node dependencies are already installed.")


def sync_database(env: dict[str, str]) -> None:
    run_command(["npx", "prisma", "db", "push"], env=env)


def start_dev_server(env: dict[str, str]) -> int:
    print_status("Starting the Next.js development server.")
    result = run_command(["npm", "run", "dev"], env=env, check=False)
    return result.returncode


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Bootstrap the local RRM development stack and start the Next.js dev server.",
    )
    parser.add_argument(
        "--setup-only",
        action="store_true",
        help="Prepare the environment and database, then exit without launching npm run dev.",
    )
    return parser.parse_args()


def main() -> int:
    args = parse_args()

    missing_commands = [command for command in ("npm", "npx") if not command_exists(command)]

    if missing_commands:
        return fail("Missing required commands: " + ", ".join(missing_commands))

    env_values = ensure_env_file()
    env = build_child_environment(env_values)

    try:
        install_dependencies(env)
        env["DATABASE_URL"] = start_local_database_if_needed(env["DATABASE_URL"], env)
        sync_database(env)
    except subprocess.CalledProcessError as error:
        return fail(f"Command failed with exit code {error.returncode}: {' '.join(error.cmd)}")
    except RuntimeError as error:
        return fail(str(error))

    if args.setup_only:
        print_status("Setup completed successfully.")
        return 0

    return start_dev_server(env)


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except KeyboardInterrupt:
        raise SystemExit(130)