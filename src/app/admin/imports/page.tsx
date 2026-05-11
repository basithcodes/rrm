import Link from "next/link";
import { BulkImportWorkbench } from "@/components/admin/bulk-import-workbench";
import { ImportWorkbench } from "@/components/admin/import-workbench";
import { buildSampleExtendedImportCsvText } from "@/lib/imports/csv";

// =====================================================================
// /admin/imports
// ---------------------------------------------------------------------
// Two surfaces share this page:
//   1. <BulkImportWorkbench/>  — drag-drop CSV → executeCatalogImport
//      server action → upserts Product/ProductVariant/ManufacturingData.
//   2. <ImportWorkbench/>      — pre-existing extended preview/commit
//      flow (kept untouched so existing operator habits still work).
// =====================================================================

export default function AdminImportsPage() {
  const csvText = buildSampleExtendedImportCsvText();

  return (
    <div className="space-y-2">
      <header className="flex items-center justify-between border border-[#CBD5E0] bg-white px-3 py-1.5">
        <div className="flex items-center gap-3">
          <span className="inline-flex h-2 w-2 rounded-full bg-[#2F855A]" aria-hidden />
          <p className="text-[11px] font-bold uppercase tracking-wider text-[#1A202C]">
            Catalog Imports
          </p>
          <p className="text-[11px] text-[#4A5568]">
            Drag-drop bulk upsert · extended preview/commit · CSV export
          </p>
        </div>
        <Link
          href="/admin/imports/export"
          className="rounded border border-[#CBD5E0] bg-white px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider text-[#1A202C] hover:bg-[#EDF2F7]"
        >
          Export current catalog CSV
        </Link>
      </header>

      <BulkImportWorkbench />

      <details className="border border-[#CBD5E0] bg-white">
        <summary className="cursor-pointer border-b border-[#CBD5E0] bg-[#EDF2F7] px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-[#1A202C]">
          Extended preview / commit workbench (legacy flow)
        </summary>
        <div className="p-3">
          <ImportWorkbench sampleCsvText={csvText} />
        </div>
      </details>
    </div>
  );
}
