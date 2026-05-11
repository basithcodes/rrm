// =====================================================================
// Industrial Site Footer
// ---------------------------------------------------------------------
// Tight engineering footer: thin slate borders, mono typography, no
// rounded blobs or gradients. Two columns — directory + market context.
// =====================================================================

import Link from "next/link";
import { marketProfiles, publicNavigation } from "@/lib/public-site";

export function SiteFooter() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="grid gap-8 lg:grid-cols-[1fr_2fr]">
          {/* Brand block */}
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-sm bg-slate-900 font-mono text-[10px] font-bold tracking-wider text-white">
                RRM
              </span>
              <p className="font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-slate-900">
                RRM Industrial
              </p>
            </div>
            <p className="mt-3 max-w-sm text-[12px] leading-5 text-slate-600">
              Precision industrial rubber and sealing solutions for GCC
              procurement teams. Direct routing, RFQ ordering, and material
              guidance.
            </p>
            <div className="mt-4 flex flex-wrap gap-1">
              {marketProfiles.map((market) => (
                <span
                  key={market.name}
                  className="rounded-sm border border-slate-300 bg-slate-50 px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider text-slate-700"
                >
                  {market.name}
                </span>
              ))}
            </div>
          </div>

          {/* Directory */}
          <div className="grid grid-cols-2 gap-x-6 gap-y-1 sm:grid-cols-3">
            {publicNavigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="border-b border-slate-100 py-1 text-[12px] font-semibold text-slate-700 transition-colors hover:text-emerald-700"
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="/owner-access"
              className="border-b border-slate-100 py-1 text-[12px] font-semibold text-slate-700 transition-colors hover:text-emerald-700"
            >
              Owner Access
            </Link>
            <Link
              href="/rfq"
              className="border-b border-slate-100 py-1 text-[12px] font-semibold text-emerald-700 transition-colors hover:text-emerald-800"
            >
              Request Quote
            </Link>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-2 border-t border-slate-200 pt-4">
          <p className="font-mono text-[10px] uppercase tracking-wider text-slate-500">
            © {new Date().getFullYear()} RRM Industrial · UAE · KSA · Oman · Qatar
          </p>
          <p className="font-mono text-[10px] uppercase tracking-wider text-slate-500">
            ISO 9001 · FDA-grade compounds · REACH/RoHS documentation
          </p>
        </div>
      </div>
    </footer>
  );
}
