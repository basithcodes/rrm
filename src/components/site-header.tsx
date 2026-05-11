"use client";

// =====================================================================
// Industrial Site Header
// ---------------------------------------------------------------------
// Tight, schematic-style top bar — no pastel panels, no rounded blobs.
// Single white surface with a slate underline, brand mark, route links,
// and the two primary CTAs.
// =====================================================================

import Link from "next/link";
import { usePathname } from "next/navigation";
import { publicNavigation } from "@/lib/public-site";
import { ThemeToggle } from "@/components/theme-toggle";

function isRouteActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function SiteHeader() {
  const pathname = usePathname();
  const links = [
    { href: "/", label: "Home" },
    ...publicNavigation.map((item) => ({ href: item.href, label: item.label })),
  ];

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur dark:border-slate-800 dark:bg-slate-950/95">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-4 py-2">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-sm bg-slate-900 font-mono text-[11px] font-bold tracking-wider text-white">
            RRM
          </span>
          <div className="leading-tight">
            <p className="font-mono text-[12px] font-bold uppercase tracking-[0.18em] text-slate-900">
              RRM Industrial
            </p>
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
              GCC Sealing Supplier
            </p>
          </div>
        </Link>

        {/* Routes */}
        <nav className="hidden flex-1 items-center justify-center gap-1 lg:flex">
          {links.map((link) => {
            const active = isRouteActive(pathname, link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-2 py-1 text-[12px] font-semibold uppercase tracking-wider transition-colors ${
                  active
                    ? "text-emerald-700"
                    : "text-slate-700 hover:text-emerald-700"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Link
            href="/owner-access"
            className="rounded-sm border border-slate-300 bg-white px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-900 transition-colors hover:border-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:border-slate-100"
          >
            Owner
          </Link>
          <Link
            href="/rfq"
            className="rounded-sm bg-emerald-700 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-white transition-colors hover:bg-emerald-800"
          >
            Request Quote
          </Link>
          <ThemeToggle />
        </div>
      </div>

      {/* Mobile route strip */}
      <div className="border-t border-slate-200 bg-slate-50 lg:hidden">
        <div className="mx-auto flex max-w-7xl gap-1 overflow-x-auto px-3 py-1">
          {links.map((link) => {
            const active = isRouteActive(pathname, link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`shrink-0 px-2 py-1 text-[11px] font-bold uppercase tracking-wider ${
                  active ? "text-emerald-700" : "text-slate-700"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>
      </div>
    </header>
  );
}
