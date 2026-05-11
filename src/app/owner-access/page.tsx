import Link from "next/link";
import { signInAction } from "@/app/owner-access/actions";

type OwnerAccessPageProps = {
  searchParams: Promise<{ error?: string }>;
};

const workspaceSignals = [
  {
    label: "Workspace",
    value: "Owner only",
    detail: "Pricing, costs, sourcing, and protected records.",
  },
  {
    label: "Session",
    value: "Server gate",
    detail: "Owner pages stay hidden until the secure cookie is issued.",
  },
  {
    label: "Flow",
    value: "RFQ aware",
    detail: "Follow live requests, imports, and public catalog changes together.",
  },
];

export default async function OwnerAccessPage({ searchParams }: OwnerAccessPageProps) {
  const params = await searchParams;
  const hasError = params.error === "invalid";

  return (
    <main className="section-shell relative flex flex-1 items-center py-10 md:py-16">
      <div className="pointer-events-none absolute left-0 top-10 h-56 w-56 rounded-full bg-[rgba(215,238,232,0.78)] blur-3xl" />
      <div className="pointer-events-none absolute right-0 top-20 h-56 w-56 rounded-full bg-[rgba(245,201,170,0.46)] blur-3xl" />
      <div className="mx-auto grid w-full max-w-6xl gap-6 lg:grid-cols-[1.02fr_0.98fr]">
        <section className="market-card-dark relative overflow-hidden rounded-[2.8rem] p-8 text-ink-inverse md:p-10">
          <div className="pointer-events-none absolute right-[-2rem] top-[-2rem] h-40 w-40 rounded-full bg-[rgba(239,139,83,0.18)] blur-2xl" />
          <div className="pointer-events-none absolute bottom-[-2rem] left-[-2rem] h-40 w-40 rounded-full bg-[rgba(15,118,110,0.16)] blur-2xl" />
          <span className="inline-flex rounded-full border border-white/12 bg-white/10 px-4 py-2 text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-white/82">
            Owner access
          </span>
          <h1 className="mt-6 display-title text-5xl font-semibold text-white md:text-6xl">
            Private control room for pricing, imports, and RFQ follow-up.
          </h1>
          <p className="mt-5 max-w-2xl text-sm leading-7 text-white/72">
            The operator side of RRM now follows the wp control-room pattern: one protected workspace for pricing books, internal costs, import operations, and live request handling.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {workspaceSignals.map((signal) => (
              <article
                key={signal.label}
                className="rounded-[1.7rem] border border-white/10 bg-white/8 px-4 py-4"
              >
                <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-white/55">
                  {signal.label}
                </p>
                <p className="mt-3 text-2xl font-semibold text-white">{signal.value}</p>
                <p className="mt-2 text-sm leading-6 text-white/65">{signal.detail}</p>
              </article>
            ))}
          </div>

          <div className="mt-6 rounded-[1.8rem] border border-white/10 bg-white/8 p-5">
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-white/55">
              Secure owner gate
            </p>
            <p className="mt-3 text-sm leading-7 text-white/70">
              This entry point stays server-side and only reveals the operational workspace after the secure session cookie has been issued.
            </p>
          </div>
        </section>

        <section className="panel relative overflow-hidden rounded-[2.8rem] border border-white/70 p-8 md:p-10">
          <div className="pointer-events-none absolute right-[-3rem] top-[-3rem] h-32 w-32 rounded-full bg-[rgba(15,118,110,0.12)] blur-3xl" />
          <div className="relative">
            <span className="eyebrow">Admin access</span>
            <h2 className="mt-5 display-title text-4xl font-semibold text-foreground md:text-5xl">
              Enter the control room
            </h2>
            <p className="mt-4 max-w-xl text-sm leading-7 text-muted">
              Use the owner access code to unlock pricing books, import tools, and the live RFQ board.
            </p>

            <div className="mt-6 rounded-[1.8rem] border border-line bg-white/78 p-5">
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-accent-deep">
                Before production
              </p>
              <p className="mt-3 text-sm leading-7 text-muted">
                Set <span className="font-semibold text-foreground">OWNER_ACCESS_CODE</span> and <span className="font-semibold text-foreground">SESSION_SECRET</span> in the environment. This passcode gate is the current bridge until full role-based auth lands.
              </p>
            </div>

            <form action={signInAction} className="mt-8 grid gap-5">
              <label className="grid gap-2">
                <span className="text-sm font-semibold text-foreground">Owner passcode</span>
                <input
                  name="passcode"
                  type="password"
                  className="rounded-[1.4rem] border border-line bg-white/85 px-4 py-3 text-foreground outline-none transition focus:border-accent"
                  placeholder="Enter owner access code"
                  required
                />
              </label>

              {hasError ? (
                <p className="public-alert-error rounded-[1.25rem] px-4 py-3 text-sm leading-6">
                  Access code was not accepted.
                </p>
              ) : null}

              <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-center">
                <button
                  type="submit"
                  className="brand-button inline-flex items-center justify-center rounded-full px-5 py-3 text-sm font-semibold"
                >
                  Enter owner workspace
                </button>
                <Link
                  href="/products"
                  className="inline-flex items-center justify-center rounded-full border border-line bg-white/78 px-5 py-3 text-sm font-semibold text-foreground"
                >
                  View public catalog
                </Link>
              </div>
            </form>
          </div>
        </section>
      </div>
    </main>
  );
}