import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

// =====================================================================
// Industrial Public Layout
// ---------------------------------------------------------------------
// Pure-white surface, no gradients, no pastel halos. The body element
// in globals.css carries a warm radial gradient + grid overlay for the
// admin shell; this wrapper sits opaque on top so public pages render
// as a crisp engineering surface.
// =====================================================================
export function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen bg-white text-slate-900">
      <div className="flex min-h-screen flex-col">
        <SiteHeader />
        <main className="flex-1 bg-white">{children}</main>
        <SiteFooter />
      </div>
    </div>
  );
}
