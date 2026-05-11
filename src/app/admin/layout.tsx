import Link from "next/link";
import { signOutAction } from "@/app/owner-access/actions";
import { requireOwnerSession } from "@/lib/auth";

type NavItem = {
  href: string;
  label: string;
  description: string;
  badge: string;
};

const ownerSections: Array<{ title: string; items: NavItem[] }> = [
  {
    title: "Overview",
    items: [
      {
        href: "/admin",
        label: "Dashboard",
        description: "Daily pulse, live RFQs, customer activity, and import health.",
        badge: "DB",
      },
    ],
  },
  {
    title: "Commercial",
    items: [
      {
        href: "/admin/pricing",
        label: "Pricing",
        description: "Regional price books, variant pricing, and internal notes.",
        badge: "PR",
      },
      {
        href: "/admin/costs",
        label: "Costs",
        description: "Overhead buckets, reserve planning, and owner-only cost signals.",
        badge: "CS",
      },
      {
        href: "/admin/competitors",
        label: "Competitors",
        description: "Benchmark records that stay out of the public buying flow.",
        badge: "CP",
      },
    ],
  },
  {
    title: "Operations",
    items: [
      {
        href: "/admin/sourcing",
        label: "Sourcing",
        description: "Raw materials, origin data, landed cost, and supplier context.",
        badge: "SO",
      },
      {
        href: "/admin/manufacturing",
        label: "Manufacturing",
        description: "Protected process notes, QA checks, and output signals.",
        badge: "MF",
      },
      {
        href: "/admin/imports",
        label: "Imports",
        description: "Preview and commit catalog batches without exposing owner data.",
        badge: "IM",
      },
    ],
  },
];

const surfaceNavigation: NavItem[] = [
  {
    href: "/products",
    label: "Public catalog",
    description: "Open the customer-facing catalog and review the live storefront.",
    badge: "PC",
  },
  {
    href: "/rfq",
    label: "RFQ surface",
    description: "Validate the quote handoff page from the public side of the app.",
    badge: "RF",
  },
];

export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  await requireOwnerSession();

  return (
    <div className="admin-root">
      <div className="mx-auto grid min-h-screen max-w-[96rem] gap-6 px-4 py-6 lg:grid-cols-[21rem_1fr] lg:px-6">
        <aside className="admin-sidebar rounded-[2.6rem] p-6 backdrop-blur-xl lg:sticky lg:top-6 lg:h-[calc(100vh-3rem)] lg:overflow-y-auto">
          <div className="flex items-center gap-3">
            <span className="brand-mark flex h-14 w-14 items-center justify-center rounded-[1.35rem] text-lg font-semibold text-white">
              RRM
            </span>
            <div>
              <p className="text-sm font-semibold text-white">Owner workspace</p>
              <p className="mt-1 text-xs uppercase tracking-[0.18em] text-white/55">
                Private control room
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
            Pricing, sourcing, imports, RFQ handling, and protected operating data stay in one operator shell.
          </p>

          <div className="mt-6 flex flex-wrap gap-2">
            <span className="admin-chip">Secure session</span>
            <span className="admin-chip">Owner only</span>
            <span className="admin-chip">Live RFQ queue</span>
          </div>

          <div className="admin-rail-note mt-8 rounded-[1.8rem] p-4">
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-white/45">
              Workspace mode
            </p>
            <div className="mt-3 grid gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/38">
                  Server gate
                </p>
                <p className="mt-1 text-sm leading-6 text-white/72">
                  Owner pages render only after the session check passes.
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/38">
                  Public split
                </p>
                <p className="mt-1 text-sm leading-6 text-white/72">
                  Buyers stay on the catalog and RFQ paths while private data stays here.
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/38">
                  Import aware
                </p>
                <p className="mt-1 text-sm leading-6 text-white/72">
                  Catalog growth and owner-only records stay tied to the same workflow.
                </p>
              </div>
            </div>
          </div>

          {ownerSections.map((section) => (
            <div key={section.title} className="mt-8">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/45">
                {section.title}
              </p>
              <nav className="mt-3 grid gap-2">
                {section.items.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="admin-link rounded-[1.6rem] px-4 py-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-white/95">{item.label}</p>
                        <p className="mt-1 text-xs leading-6 text-white/58">{item.description}</p>
                      </div>
                      <span className="admin-link-badge">{item.badge}</span>
                    </div>
                  </Link>
                ))}
              </nav>
            </div>
          ))}

          <div className="mt-8">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/45">
              Public surfaces
            </p>
            <nav className="mt-3 grid gap-2">
              {surfaceNavigation.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="admin-link rounded-[1.6rem] px-4 py-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-white/95">{item.label}</p>
                      <p className="mt-1 text-xs leading-6 text-white/58">{item.description}</p>
                    </div>
                    <span className="admin-link-badge">{item.badge}</span>
                  </div>
                </Link>
              ))}
            </nav>
          </div>

          <form action={signOutAction} className="mt-8">
            <button
              type="submit"
              className="admin-outline-button inline-flex w-full items-center justify-center rounded-full px-4 py-3 text-sm font-semibold"
            >
              Sign out
            </button>
          </form>
        </aside>

        <main className="admin-main rounded-[2.8rem] p-5 md:p-8">
          <div className="mb-8 rounded-[2.2rem] border border-white/8 bg-white/[0.03] p-6 md:p-8">
            <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/50">
                  Owner operations
                </p>
                <h2 className="mt-3 display-title text-3xl font-semibold text-white sm:text-4xl md:text-5xl">
                  Run pricing, sourcing, imports, and RFQ follow-up from one operator shell.
                </h2>
                <p className="mt-4 max-w-3xl text-sm leading-7 text-white/68">
                  This layout now mirrors the wp control-room structure: grouped navigation, protected workspace context, and fast links back to the public surfaces.
                </p>
                <div className="mt-5 flex flex-wrap gap-2">
                  <span className="admin-chip">Dashboard pulse</span>
                  <span className="admin-chip">Protected data</span>
                  <span className="admin-chip">Import console</span>
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <Link
                  href="/products"
                  className="admin-outline-button inline-flex w-full items-center justify-center rounded-full px-5 py-3 text-sm font-semibold sm:w-auto"
                >
                  View public catalog
                </Link>
                <Link
                  href="/rfq"
                  className="admin-outline-button inline-flex w-full items-center justify-center rounded-full px-5 py-3 text-sm font-semibold sm:w-auto"
                >
                  Open RFQ surface
                </Link>
                <Link
                  href="/admin/imports"
                  className="admin-highlight-button inline-flex w-full items-center justify-center rounded-full px-5 py-3 text-sm font-semibold sm:col-span-2"
                >
                  Import catalog data
                </Link>
              </div>
            </div>
          </div>

          {children}
        </main>
      </div>
    </div>
  );
}