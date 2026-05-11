import { signInAction } from "@/app/owner-access/actions";

type OwnerAccessPageProps = {
  searchParams: Promise<{ error?: string }>;
};

export default async function OwnerAccessPage({ searchParams }: OwnerAccessPageProps) {
  const params = await searchParams;
  const hasError = params.error === "invalid";

  return (
    <main className="section-shell relative flex flex-1 items-center py-10 md:py-16">
      <div className="pointer-events-none absolute left-0 top-10 h-56 w-56 rounded-full bg-[rgba(222,240,204,0.72)] blur-3xl" />
      <div className="pointer-events-none absolute right-0 top-20 h-56 w-56 rounded-full bg-[rgba(246,213,158,0.45)] blur-3xl" />
      <div className="mx-auto grid w-full max-w-5xl gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <section className="market-card-dark relative overflow-hidden rounded-[2.6rem] p-8 text-ink-inverse md:p-10">
          <div className="pointer-events-none absolute right-[-2rem] top-[-2rem] h-40 w-40 rounded-full bg-[rgba(246,213,158,0.16)] blur-2xl" />
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/55">
            Owner workspace access
          </p>
          <h1 className="mt-5 display-title text-5xl font-semibold text-white">
            Private pricing, chemistry, and cost controls stay behind a server-side gate.
          </h1>
          <p className="mt-5 max-w-xl text-sm leading-7 text-white/75">
            This first implementation uses a secure, httpOnly owner session cookie driven by environment variables. It is a practical bridge until full role-based auth is connected.
          </p>
        </section>

        <section className="panel rounded-[2.6rem] border border-white/65 p-8 md:p-10">
          <span className="eyebrow">Sign in</span>
          <h2 className="mt-5 display-title text-4xl font-semibold text-foreground">
            Owner-only area
          </h2>
          <p className="mt-4 text-sm leading-7 text-muted">
            Set OWNER_ACCESS_CODE and SESSION_SECRET in the environment before production use.
          </p>

          <form action={signInAction} className="mt-8 grid gap-5">
            <label className="grid gap-2">
              <span className="text-sm font-semibold text-foreground">Access code</span>
              <input
                name="passcode"
                type="password"
                className="rounded-[1.4rem] border border-line bg-white/80 px-4 py-3 text-foreground outline-none transition focus:border-accent"
                placeholder="Enter owner access code"
                required
              />
            </label>

            {hasError ? (
              <p className="rounded-2xl border border-[#e9b79a] bg-[#fff3ec] px-4 py-3 text-sm text-accent-deep">
                Access code was not accepted.
              </p>
            ) : null}

            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-full bg-[linear-gradient(135deg,#2f7d3a_0%,#1c5428_100%)] px-5 py-3 text-sm font-semibold text-ink-inverse"
            >
              Enter owner workspace
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}