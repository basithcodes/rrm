import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-36 bg-[repeating-linear-gradient(90deg,rgba(255,250,240,0.72)_0,rgba(255,250,240,0.72)_72px,rgba(246,213,158,0.42)_72px,rgba(246,213,158,0.42)_144px)] opacity-80" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[32rem] bg-[radial-gradient(circle_at_18%_8%,rgba(47,125,58,0.16),transparent_24%),radial-gradient(circle_at_82%_2%,rgba(214,137,53,0.18),transparent_20%),linear-gradient(180deg,rgba(255,251,241,0.68),transparent_76%)]" />
      <div className="pointer-events-none absolute -left-16 top-28 h-64 w-64 rounded-full bg-[rgba(222,240,204,0.78)] blur-3xl" />
      <div className="pointer-events-none absolute -right-16 top-56 h-72 w-72 rounded-full bg-[rgba(246,213,158,0.55)] blur-3xl" />
      <div className="relative flex min-h-screen flex-col">
        <SiteHeader />
        <main className="relative flex-1">{children}</main>
        <SiteFooter />
      </div>
    </div>
  );
}