import Link from "next/link";
import { signOutAction } from "@/app/owner-access/actions";
import { requireOwnerSession } from "@/lib/auth";

const ownerNavigation = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/pricing", label: "Pricing" },
  { href: "/admin/costs", label: "Costs" },
  { href: "/admin/sourcing", label: "Sourcing" },
  { href: "/admin/manufacturing", label: "Manufacturing" },
  { href: "/admin/competitors", label: "Competitors" },
  { href: "/admin/imports", label: "Imports" },
];

const surfaceNavigation = [
  { href: "/products", label: "Public catalog" },
  { href: "/rfq", label: "RFQ surface" },
];

export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  await requireOwnerSession();

  return (
    <div className="admin-root">
      <div className="mx-auto grid min-h-screen max-w-[90rem] gap-6 px-4 py-6 lg:grid-cols-[18rem_1fr] lg:px-6">
        <aside className="admin-sidebar rounded-[2.4rem] p-6 backdrop-blur-xl lg:sticky lg:top-6 lg:h-[calc(100vh-3rem)] lg:overflow-y-auto">
          <div className="flex items-center gap-3">
            <span className="brand-mark flex h-14 w-14 items-center justify-center rounded-[1.35rem] text-lg font-semibold text-white">
              RRM
            </span>
            <div>
              <p className="text-sm font-semibold text-white">Owner workspace</p>
              <p className="mt-1 text-xs uppercase tracking-[0.18em] text-white/55">
                Private market board
              </p>
            </div>
          </div>

          <p className="mt-8 text-xs font-semibold uppercase tracking-[0.18em] text-white/55">
            Owner workspace
          </p>
          <h1 className="mt-4 display-title text-3xl font-semibold text-white">
            RRM Control Room
          </h1>
          <p className="mt-4 text-sm leading-7 text-white/72">
            Pricing, manufacturing, sourcing, imports, and benchmark data stay in the back-room ledger.
          </p>

          <div className="mt-6 flex flex-wrap gap-2">
            <span className="admin-chip">Secure session</span>
            <span className="admin-chip">Owner only</span>
          </div>

          <div className="mt-8">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/45">
              Owner data
            </p>
          </div>
          <nav className="mt-3 grid gap-2">
            {ownerNavigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="admin-link rounded-[1.4rem] px-4 py-3 text-sm font-semibold"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="mt-8">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/45">
              Public surfaces
            </p>
          </div>
          <nav className="mt-3 grid gap-2">
            {surfaceNavigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="admin-link rounded-[1.4rem] px-4 py-3 text-sm font-semibold"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <form action={signOutAction} className="mt-8">
            <button
              type="submit"
              className="admin-outline-button inline-flex w-full items-center justify-center rounded-full px-4 py-3 text-sm font-semibold"
            >
              Sign out
            </button>
          </form>
        </aside>

        <main className="admin-main rounded-[2.6rem] p-6 md:p-8">
          <div className="mb-6 flex flex-col gap-4 border-b border-white/8 pb-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/50">
                Owner operations
              </p>
              <h2 className="mt-3 display-title text-3xl font-semibold text-white sm:text-4xl md:text-5xl">
                Private modules styled to match the new storefront.
              </h2>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Link
                href="/products"
                className="admin-outline-button inline-flex w-full items-center justify-center rounded-full px-5 py-3 text-sm font-semibold sm:w-auto"
              >
                View public catalog
              </Link>
              <Link
                href="/admin/imports"
                className="admin-highlight-button inline-flex w-full items-center justify-center rounded-full px-5 py-3 text-sm font-semibold sm:w-auto"
              >
                Import catalog data
              </Link>
            </div>
          </div>

          {children}
        </main>
      </div>
    </div>
  );
}