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
    <div className="min-h-screen bg-[#111b23] text-white">
      <div className="mx-auto grid min-h-screen max-w-7xl gap-6 px-4 py-6 lg:grid-cols-[17rem_1fr] lg:px-6">
        <aside className="rounded-[2rem] border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/55">
            Owner workspace
          </p>
          <h1 className="mt-4 display-title text-3xl font-semibold text-white">
            RRM Control Room
          </h1>

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
                className="rounded-2xl border border-white/8 px-4 py-3 text-sm font-semibold text-white/80 transition hover:border-white/20 hover:bg-white/8 hover:text-white"
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
                className="rounded-2xl border border-white/8 px-4 py-3 text-sm font-semibold text-white/80 transition hover:border-white/20 hover:bg-white/8 hover:text-white"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <form action={signOutAction} className="mt-8">
            <button
              type="submit"
              className="inline-flex w-full items-center justify-center rounded-full border border-white/15 px-4 py-3 text-sm font-semibold text-white/85"
            >
              Sign out
            </button>
          </form>
        </aside>

        <div className="rounded-[2rem] border border-white/10 bg-[#17232d] p-6 shadow-[0_30px_90px_-50px_rgba(0,0,0,0.7)] md:p-8">
          {children}
        </div>
      </div>
    </div>
  );
}