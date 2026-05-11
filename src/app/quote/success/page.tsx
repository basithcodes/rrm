import Link from "next/link";

type SuccessPageProps = {
  searchParams: Promise<{ id?: string }>;
};

export default async function QuoteSuccessPage({ searchParams }: SuccessPageProps) {
  const { id } = await searchParams;

  return (
    <main className="min-h-screen w-full bg-[#F7FAFC]">
      <div className="mx-auto max-w-2xl px-4 py-16">
        <div className="rounded border border-[#CBD5E0] bg-white p-8">
          <p className="text-[11px] font-bold uppercase tracking-wider text-[#2F855A]">
            ✓ Submitted
          </p>
          <h1 className="mt-2 text-3xl font-bold text-[#1A202C]">
            Thanks — your RFQ is in.
          </h1>
          <p className="mt-3 text-sm text-[#4A5568]">
            Our sales team will respond within two business days with a formal quote,
            confirmed lead times, and final pricing in your chosen currency.
          </p>

          {id ? (
            <div className="mt-6 rounded border border-[#CBD5E0] bg-[#F7FAFC] p-4">
              <p className="text-[11px] font-bold uppercase tracking-wider text-[#4A5568]">
                Reference
              </p>
              <p className="mt-1 font-mono text-sm font-bold text-[#1A202C]">
                RFQ #{id}
              </p>
              <a
                href={`/api/rfq/${id}/pdf`}
                className="mt-4 inline-block rounded bg-[#1A202C] px-4 py-2.5 text-xs font-bold uppercase tracking-wide text-white hover:bg-[#2D3748]"
                download={`RRM-RFQ-${id}.pdf`}
              >
                ↓ Download your RFQ PDF
              </a>
            </div>
          ) : null}

          <div className="mt-8 flex gap-3">
            <Link
              href="/products"
              className="rounded border border-[#CBD5E0] px-3 py-2 text-xs font-bold uppercase tracking-wide text-[#1A202C] hover:bg-[#EDF2F7]"
            >
              Continue browsing
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
