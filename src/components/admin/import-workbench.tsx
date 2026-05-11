"use client";

import Papa from "papaparse";
import { useActionState, useState, useTransition } from "react";
import {
  type ImportBatchActionState,
  importPreviewRows,
} from "@/app/admin/imports/actions";
import {
  extendedProductImportHeaders,
  normalizeExtendedProductImportRow,
  ownerOnlyImportHeaders,
  productImportHeaders,
  type NormalizedExtendedProductImport,
} from "@/lib/imports/csv";

type ImportPreviewState = {
  fileName: string;
  rowCount: number;
  successfulCount: number;
  failedCount: number;
  missingHeaders: string[];
  rows: NormalizedExtendedProductImport[];
  errors: string[];
};

const initialBatchState: ImportBatchActionState = {
  status: "idle",
  message: "",
};

function parseCsvContent(csvText: string, fileName: string): ImportPreviewState {
  const parseResult = Papa.parse<Record<string, string>>(csvText, {
    header: true,
    skipEmptyLines: true,
  });

  const fields = parseResult.meta.fields ?? [];
  const missingHeaders = productImportHeaders.filter((header) => !fields.includes(header));
  const errors = parseResult.errors.map((error) => {
    const rowLabel = error.row !== undefined ? `Row ${error.row + 2}` : "CSV parser";
    return `${rowLabel}: ${error.message}`;
  });

  if (missingHeaders.length > 0) {
    errors.unshift(`Missing required headers: ${missingHeaders.join(", ")}.`);
  }

  const rows: NormalizedExtendedProductImport[] = [];

  parseResult.data.forEach((row, index) => {
    const hasValues = Object.values(row).some((value) => String(value ?? "").trim().length > 0);

    if (!hasValues) {
      return;
    }

    try {
      rows.push(normalizeExtendedProductImportRow(row));
    } catch (error) {
      errors.push(
        `Row ${index + 2}: ${error instanceof Error ? error.message : "Unable to normalize row."}`,
      );
    }
  });

  const rowCount = parseResult.data.filter((row) =>
    Object.values(row).some((value) => String(value ?? "").trim().length > 0),
  ).length;

  return {
    fileName,
    rowCount,
    successfulCount: rows.length,
    failedCount: errors.length,
    missingHeaders,
    rows,
    errors,
  };
}

export function ImportWorkbench({ sampleCsvText }: { sampleCsvText: string }) {
  const [csvText, setCsvText] = useState(sampleCsvText);
  const [activeFileName, setActiveFileName] = useState("sample-template.csv");
  const [preview, setPreview] = useState<ImportPreviewState>(() =>
    parseCsvContent(sampleCsvText, "sample-template.csv"),
  );
  const [isParsing, startTransition] = useTransition();
  const [actionState, formAction, isSaving] = useActionState(importPreviewRows, initialBatchState);

  const templateHref = `data:text/csv;charset=utf-8,${encodeURIComponent(sampleCsvText)}`;

  function updatePreview(nextCsvText: string, fileName: string) {
    startTransition(() => {
      setCsvText(nextCsvText);
      setActiveFileName(fileName);
      setPreview(parseCsvContent(nextCsvText, fileName));
    });
  }

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const fileText = await file.text();
    updatePreview(fileText, file.name);
  }

  return (
    <div className="grid gap-8">
      <section className="grid gap-6 xl:grid-cols-[0.92fr_1.08fr]">
        <div className="admin-surface-card rounded-[2.4rem] p-6 md:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/55">
                Upload and preview
              </p>
              <p className="mt-2 text-sm leading-7 text-white/65">
                Upload a CSV file or paste its contents below to validate rows before import.
              </p>
            </div>
            <a
              href={templateHref}
              download="rrm-import-template.csv"
              className="admin-outline-button inline-flex rounded-full px-4 py-2 text-sm font-semibold"
            >
              Download sample template
            </a>
          </div>

          <div className="mt-6 grid gap-5">
            <label className="grid gap-2">
              <span className="text-sm font-semibold text-white">CSV file</span>
              <input
                type="file"
                accept=".csv,text/csv"
                onChange={handleFileChange}
                className="admin-table-surface rounded-[1.4rem] border border-white/10 px-4 py-3 text-sm text-white/75 file:mr-4 file:rounded-full file:border-0 file:bg-accent-warm file:px-4 file:py-2 file:font-semibold file:text-foreground"
              />
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-semibold text-white">CSV text</span>
              <textarea
                value={csvText}
                onChange={(event) => setCsvText(event.target.value)}
                className="admin-table-surface min-h-72 rounded-[1.6rem] border border-white/10 px-4 py-4 font-mono text-xs leading-6 text-white/78 outline-none"
                spellCheck={false}
              />
            </label>

            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => updatePreview(csvText, activeFileName || "pasted-import.csv")}
                className="admin-highlight-button inline-flex items-center justify-center rounded-full px-5 py-3 text-sm font-semibold"
              >
                {isParsing ? "Parsing..." : "Parse current CSV"}
              </button>
              <button
                type="button"
                onClick={() => updatePreview(sampleCsvText, "sample-template.csv")}
                className="admin-outline-button inline-flex items-center justify-center rounded-full px-5 py-3 text-sm font-semibold"
              >
                Reset to sample
              </button>
            </div>
          </div>
        </div>

        <div className="admin-surface-card rounded-[2.4rem] p-6 md:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/55">
            CSV columns
          </p>
          <div className="mt-6 grid gap-6">
            <div>
              <p className="text-sm font-semibold text-white">Public/shared columns</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {productImportHeaders.map((header) => (
                  <span
                    key={header}
                    className="admin-chip"
                  >
                    {header}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Owner-only columns</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {ownerOnlyImportHeaders.map((header) => (
                  <span
                    key={header}
                    className="admin-chip"
                  >
                    {header}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-4">
        <article className="admin-deep-card rounded-[1.8rem] p-5">
          <p className="text-xs uppercase tracking-[0.18em] text-white/45">File</p>
          <p className="mt-3 text-lg font-semibold text-white">{preview.fileName}</p>
        </article>
        <article className="admin-deep-card rounded-[1.8rem] p-5">
          <p className="text-xs uppercase tracking-[0.18em] text-white/45">Rows detected</p>
          <p className="admin-metric-value mt-3 text-3xl font-semibold">{preview.rowCount}</p>
        </article>
        <article className="admin-deep-card rounded-[1.8rem] p-5">
          <p className="text-xs uppercase tracking-[0.18em] text-white/45">Valid rows</p>
          <p className="admin-metric-value mt-3 text-3xl font-semibold">{preview.successfulCount}</p>
        </article>
        <article className="admin-deep-card rounded-[1.8rem] p-5">
          <p className="text-xs uppercase tracking-[0.18em] text-white/45">Issues</p>
          <p className="admin-metric-value mt-3 text-3xl font-semibold">{preview.failedCount}</p>
        </article>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <div className="admin-surface-card rounded-[2.4rem] p-6 md:p-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/55">
                Normalized preview
              </p>
              <p className="mt-2 text-sm leading-7 text-white/65">
                First valid rows after parsing and normalization.
              </p>
            </div>
            <form action={formAction} className="grid gap-3 text-right">
              <input type="hidden" name="fileName" value={preview.fileName} />
              <input type="hidden" name="rowCount" value={String(preview.rowCount)} />
              <input type="hidden" name="successfulCount" value={String(preview.successfulCount)} />
              <input type="hidden" name="failedCount" value={String(preview.failedCount)} />
              <input type="hidden" name="rowsJson" value={JSON.stringify(preview.rows)} />
              <button
                type="submit"
                disabled={preview.successfulCount === 0 || isSaving}
                className="admin-highlight-button inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-semibold disabled:opacity-50"
              >
                {isSaving ? "Importing..." : "Import valid rows"}
              </button>
              {actionState.message ? (
                <p className="max-w-xs text-xs leading-6 text-white/55">{actionState.message}</p>
              ) : null}
            </form>
          </div>

          <div className="mt-6 grid gap-4">
            {preview.rows.slice(0, 5).map((row) => (
              <article
                key={`${row.slug}-${row.variant.code}`}
                className="admin-deep-card rounded-[1.8rem] p-5"
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-white/45">{row.slug}</p>
                    <h3 className="mt-2 text-lg font-semibold text-white">{row.product.name}</h3>
                    <p className="mt-2 text-sm leading-7 text-white/65">{row.product.summary}</p>
                  </div>
                  <span className="admin-chip">
                    {row.variant.code}
                  </span>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {row.product.certifications.map((certification) => (
                    <span
                      key={`${row.slug}-${certification}`}
                      className="rounded-full border border-white/10 px-3 py-1 text-xs font-semibold text-white/75"
                    >
                      {certification}
                    </span>
                  ))}
                </div>

                <div className="mt-5 grid gap-3 md:grid-cols-3">
                  <div className="rounded-[1rem] border border-white/10 bg-white/3 px-4 py-3">
                    <p className="text-xs uppercase tracking-[0.18em] text-white/45">Dimensions</p>
                    <ul className="mt-2 grid gap-1 text-sm leading-6 text-white/65">
                      {row.variant.dimensions.map((dimension) => (
                        <li key={`${row.variant.code}-${dimension.label}`}>
                          {dimension.label}: {dimension.value}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="rounded-[1rem] border border-white/10 bg-white/3 px-4 py-3">
                    <p className="text-xs uppercase tracking-[0.18em] text-white/45">Owner sourcing</p>
                    <p className="mt-2 text-sm leading-6 text-white/65">
                      {row.owner.rawMaterials.length} raw material lines
                    </p>
                    <p className="mt-1 text-sm leading-6 text-white/65">
                      {row.owner.competitorBenchmarks.length} competitor entries
                    </p>
                  </div>
                  <div className="rounded-[1rem] border border-white/10 bg-white/3 px-4 py-3">
                    <p className="text-xs uppercase tracking-[0.18em] text-white/45">Process</p>
                    <p className="mt-2 text-sm leading-6 text-white/65">{row.owner.process.compoundCode}</p>
                    <p className="mt-1 text-sm leading-6 text-white/65">{row.owner.process.cureSystem}</p>
                  </div>
                </div>
              </article>
            ))}

            {preview.rows.length === 0 ? (
              <div className="admin-deep-card rounded-[1.8rem] p-5 text-sm leading-7 text-white/65">
                No valid rows parsed yet.
              </div>
            ) : null}
          </div>
        </div>

        <div className="admin-surface-card rounded-[2.4rem] p-6 md:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/55">
            Validation issues
          </p>
          <div className="mt-6 grid gap-4">
            {preview.errors.length > 0 ? (
              preview.errors.map((error) => (
                <div
                  key={error}
                  className="admin-alert-error rounded-[1rem] px-4 py-3 text-sm leading-7"
                >
                  {error}
                </div>
              ))
            ) : (
              <div className="admin-alert-success rounded-[1rem] px-4 py-3 text-sm leading-7">
                No validation issues detected in the current preview.
              </div>
            )}

            {preview.missingHeaders.length === 0 ? null : (
              <div className="admin-deep-card rounded-[1rem] px-4 py-3 text-sm leading-7 text-white/65">
                Required public headers must always be present. Owner-only headers can be added gradually.
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}