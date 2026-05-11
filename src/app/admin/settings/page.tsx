import { requireOwnerSession } from "@/lib/auth";
import { ResetButton } from "@/components/admin/reset-button";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  await requireOwnerSession();

  return (
    <div className="space-y-6">
      <header>
        <p className="text-[11px] font-bold uppercase tracking-wider text-white/60">
          Workspace
        </p>
        <h1 className="mt-1 display-title text-3xl font-semibold text-white">
          Settings
        </h1>
        <p className="mt-2 max-w-3xl text-sm text-white/70">
          Operator tools for the owner workspace.
        </p>
      </header>

      <section className="rounded border border-white/10 bg-white/[0.04] p-6 text-white">
        <p className="text-[11px] font-bold uppercase tracking-wider text-rose-300">
          Danger zone
        </p>
        <h2 className="mt-1 text-xl font-semibold">Hard reset catalog data</h2>
        <p className="mt-2 max-w-2xl text-sm text-white/70">
          Deletes every Customer, Rfq, and RfqItem row so you can replay scripted
          scenarios. Catalog Products, ProductVariants, pricing, and the
          ManufacturingData vault are <strong>not</strong> touched.
        </p>
        <div className="mt-4">
          <ResetButton />
        </div>
      </section>
    </div>
  );
}
