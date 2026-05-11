import Link from "next/link";
import { signOutAction } from "@/app/owner-access/actions";
import { requireOwnerSession } from "@/lib/auth";

// =====================================================================
// Industrial Admin Shell
// ---------------------------------------------------------------------
// Layout requirements (per spec):
//   * Fixed left sidebar, h-screen, never scrolls the body.
//   * Hierarchical accordion nav (native <details>/<summary>) so all
//     primary sections stay visible without overflow.
//   * Light, dense surface — no oversized cards, no shadows. Every
//     pixel is a scannable data control.
// =====================================================================

type NavItem = { href: string; label: string };
type NavSection = { title: string; defaultOpen?: boolean; items: NavItem[] };

const navSections: NavSection[] = [
  {
    title: "Operator Modules",
    defaultOpen: true,
    items: [
      { href: "/admin", label: "Dashboard" },
      { href: "/admin/imports", label: "Imports" },
      { href: "/admin/settings", label: "Settings" },
    ],
  },
  {
    title: "Secure RFQ Queue",
    defaultOpen: true,
    items: [
      { href: "/admin/rfqs", label: "RFQ Pipeline" },
      { href: "/admin/secrets", label: "Trade Secret Vault" },
    ],
  },
  {
    title: "Commercial",
    items: [
      { href: "/admin/pricing", label: "Pricing" },
      { href: "/admin/costs", label: "Costs" },
      { href: "/admin/competitors", label: "Competitors" },
    ],
  },
  {
    title: "Operations",
    items: [
      { href: "/admin/sourcing", label: "Sourcing" },
      { href: "/admin/manufacturing", label: "Manufacturing" },
    ],
  },
  {
    title: "Public Surfaces",
    items: [
      { href: "/products", label: "Public catalog" },
      { href: "/rfq", label: "RFQ surface" },
    ],
  },
];

export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Server-side HMAC owner gate. Unauthenticated requests are redirected
  // to /owner-access by `requireOwnerSession` itself.
  await requireOwnerSession();

  return (
    <div className="min-h-screen w-full bg-[#F7FAFC] text-[#1A202C]">
      {/* ============================================================
          FIXED SIDEBAR — h-screen, never scrolls the body. The inner
          <nav> handles its own overflow if section content grows.
          ============================================================ */}
      <aside className="fixed left-0 top-0 z-40 flex h-screen w-60 flex-col border-r border-[#CBD5E0] bg-white">
        <div className="flex items-center gap-2 border-b border-[#CBD5E0] px-3 py-2">
          <span className="inline-flex h-7 w-7 items-center justify-center rounded bg-[#1A202C] text-[10px] font-bold tracking-wider text-white">
            RRM
          </span>
          <div className="leading-tight">
            <p className="text-[11px] font-bold uppercase tracking-wider text-[#1A202C]">
              Owner Console
            </p>
            <p className="text-[10px] text-[#4A5568]">Secure session</p>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto px-1 py-1">
          {navSections.map((section) => (
            <details
              key={section.title}
              open={section.defaultOpen}
              className="group border-b border-[#EDF2F7]"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between px-2 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[#4A5568] hover:bg-[#EDF2F7]">
                <span>{section.title}</span>
                <span className="text-[#A0AEC0] transition group-open:rotate-90">▸</span>
              </summary>
              <ul className="pb-1">
                {section.items.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="block px-3 py-1 text-[12px] font-semibold text-[#1A202C] hover:bg-[#E6FFFA] hover:text-[#2F855A]"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </details>
          ))}
        </nav>

        <form action={signOutAction} className="border-t border-[#CBD5E0] p-2">
          <button
            type="submit"
            className="block w-full rounded border border-[#CBD5E0] bg-white px-2 py-1 text-[11px] font-bold uppercase tracking-wider text-[#1A202C] hover:bg-[#EDF2F7]"
          >
            Sign out
          </button>
        </form>
      </aside>

      {/* ============================================================
          MAIN CONTENT — left-margin matches sidebar width. Minimal
          padding so children render edge-to-edge.
          ============================================================ */}
      <main className="ml-60 min-h-screen p-2">
        {children}
      </main>
    </div>
  );
}
