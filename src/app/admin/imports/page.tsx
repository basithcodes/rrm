import { ImportWorkbench } from "@/components/admin/import-workbench";
import { buildSampleExtendedImportCsvText } from "@/lib/imports/csv";
import Link from "next/link";

export default function AdminImportsPage() {
  const csvText = buildSampleExtendedImportCsvText();

  return (
    <div className="grid gap-8">
      <section className="admin-surface-card rounded-[2.4rem] p-6 md:p-8">
        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/55">
              Imports
            </p>
            <h2 className="mt-4 display-title text-5xl font-semibold text-white">
              Extended CSV import template for public and owner-only dummy data
            </h2>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-white/72">
              The import helper now supports the richer dataset: product prices, dimensions, certifications, supply formats, sourcing notes, raw materials, manufacturing process fields, and competitor benchmarks. Upload a CSV below to preview real rows before any database step.
            </p>
          </div>
          <Link
            href="/admin/imports/export"
            className="admin-outline-button inline-flex items-center justify-center rounded-full px-5 py-3 text-sm font-semibold"
          >
            Export current catalog CSV
          </Link>
        </div>
      </section>

      <ImportWorkbench sampleCsvText={csvText} />
    </div>
  );
}