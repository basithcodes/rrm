import Link from "next/link";
import { signInAction } from "@/app/owner-access/actions";

// =====================================================================
// /owner-access  —  Owner Passcode Gate
// ---------------------------------------------------------------------
// Tight, theme-aware login surface. The page used to be hardcoded dark
// (white/10 panels on a slate hero) which ignored the global theme
// toggle. It is now a flat industrial card that flips with next-themes:
// `bg-white dark:bg-slate-950` for the page, `dark:bg-slate-900` for
// the inner card.
// =====================================================================

type OwnerAccessPageProps = {
  searchParams: Promise<{ error?: string }>;
};

export default async function OwnerAccessPage({ searchParams }: OwnerAccessPageProps) {
  const params = await searchParams;
  const hasError = params.error === "invalid";

  return (
    <main className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center bg-white px-4 py-12 transition-colors duration-300 dark:bg-slate-950">
      <section className="w-full max-w-md border border-slate-200 bg-white p-6 transition-colors duration-300 dark:border-slate-800 dark:bg-slate-900">
        <p className="font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-emerald-700 dark:text-emerald-400">
          Owner Access
        </p>
        <h1 className="mt-2 text-xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
          Enter the control room
        </h1>
        <p className="mt-1 text-[12px] leading-5 text-slate-600 dark:text-slate-400">
          Use the owner passcode to unlock pricing, imports, sourcing, and the
          live RFQ queue.
        </p>

        <form action={signInAction} className="mt-5 grid gap-3">
          <label className="grid gap-1">
            <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
              Owner passcode
            </span>
            <input
              name="passcode"
              type="password"
              required
              autoFocus
              placeholder="Enter access code"
              className="w-full rounded-sm border border-slate-300 bg-white p-2 font-mono text-sm text-slate-900 placeholder-slate-400 focus:border-emerald-600 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-50 dark:placeholder-slate-600"
            />
          </label>

          {hasError && (
            <p className="rounded-sm border border-rose-300 bg-rose-50 p-2 font-mono text-[11px] font-bold text-rose-800 dark:border-rose-900 dark:bg-rose-950/50 dark:text-rose-300">
              Access code was not accepted.
            </p>
          )}

          <button
            type="submit"
            className="rounded-sm bg-emerald-700 px-4 py-2 font-mono text-[11px] font-bold uppercase tracking-widest text-white transition-colors hover:bg-emerald-800"
          >
            Enter Owner Workspace →
          </button>

          <Link
            href="/products"
            className="text-center font-mono text-[10px] font-bold uppercase tracking-widest text-slate-600 hover:text-emerald-700 dark:text-slate-400 dark:hover:text-emerald-400"
          >
            ← View public catalog
          </Link>
        </form>

        <p className="mt-5 border-t border-slate-200 pt-3 font-mono text-[10px] leading-5 text-slate-500 dark:border-slate-800 dark:text-slate-500">
          Set <span className="font-bold text-slate-700 dark:text-slate-300">OWNER_ACCESS_CODE</span> and{" "}
          <span className="font-bold text-slate-700 dark:text-slate-300">SESSION_SECRET</span> in the
          environment before production.
        </p>
      </section>
    </main>
  );
}
