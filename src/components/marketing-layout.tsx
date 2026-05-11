import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[26rem] bg-[radial-gradient(circle_at_top,rgba(184,95,45,0.12),transparent_50%)]" />
      <div className="pointer-events-none absolute left-1/2 top-48 h-72 w-72 -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(20,33,43,0.06),transparent_70%)] blur-3xl" />
      <div className="relative">
        <SiteHeader />
        <main>{children}</main>
        <SiteFooter />
      </div>
    </div>
  );
}