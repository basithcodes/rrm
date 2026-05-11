import Link from "next/link";
import { publicNavigation } from "@/lib/public-site";

type PublicRouteSupportAction = {
  href: string;
  label: string;
  variant?: "primary" | "secondary";
};

type PublicRouteSupportProps = {
  currentHref: string;
  title?: string;
  description?: string;
  maxItems?: number;
  actions?: PublicRouteSupportAction[];
};

export function PublicRouteSupport({
  currentHref,
  title = "Route support",
  description,
  maxItems = 4,
  actions = [],
}: PublicRouteSupportProps) {
  const routes = publicNavigation.filter((item) => item.href !== currentHref).slice(0, maxItems);

  return (
    <div className="mt-6">
      <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-accent-deep">
        {title}
      </p>
      {description ? (
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">{description}</p>
      ) : null}

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {routes.map((route) => (
          <Link
            key={route.href}
            href={route.href}
            className="rounded-[1.55rem] border border-line bg-white/76 px-4 py-4 transition-transform hover:-translate-y-0.5"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-muted">
                  {route.section}
                </p>
                <h2 className="mt-2 text-lg font-semibold text-foreground">{route.label}</h2>
              </div>
              <span className="market-stamp">{route.badge}</span>
            </div>
            <p className="mt-3 text-sm leading-6 text-muted">{route.description}</p>
          </Link>
        ))}
      </div>

      {actions.length > 0 ? (
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          {actions.map((action) => (
            <Link
              key={action.href + action.label}
              href={action.href}
              className={
                action.variant === "primary"
                  ? "brand-button inline-flex items-center justify-center rounded-full px-5 py-3 text-sm font-semibold"
                  : "inline-flex items-center justify-center rounded-full border border-line bg-white/80 px-5 py-3 text-sm font-semibold text-foreground"
              }
            >
              {action.label}
            </Link>
          ))}
        </div>
      ) : null}
    </div>
  );
}