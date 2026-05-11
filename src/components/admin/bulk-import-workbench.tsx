"use client";

// =====================================================================
// Bulk CSV Import Workbench
// ---------------------------------------------------------------------
// Operator-facing drag-drop surface for the catalog import pipeline.
//   1. Drop or pick a CSV file (dashed slate-300 dropzone).
//   2. papaparse parses on the client; first 5 rows render in a dense
//      mono preview table so the operator can verify column mapping.
//   3. "Execute Import Run" posts the parsed JSON to the
//      `executeCatalogImport` server action.
//   4. Result summary + per-row error log are rendered inline.
// =====================================================================

import Papa from "papaparse";
import { useRef, useState, useTransition } from "react";
import {
  executeCatalogImport,
  type CatalogImportResult,
  type ImportRowError,
} from "@/app/actions/importActions";

const REQUIRED_COLUMNS = ["Parent_Name", "Category", "Material", "SKU"] as const;
const OPTIONAL_COLUMNS = [
  "BasePrice_USD",
  "Chemistry_Notes",
  "LaborCost",
  "MachineCost",
  "Description",
  "MOQ",
] as const;

type ParsedState = {
  fileName: string;
  rowCount: number;
  columns: string[];
  rows: Array<Record<string, unknown>>;
  missingRequired: string[];
};

export function BulkImportWorkbench() {
  const [parsed, setParsed] = useState<ParsedState | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);
  const [result, setResult] = useState<CatalogImportResult | null>(null);
  const [isPending, startTransition] = useTransition();
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFile(file: File) {
    setParseError(null);
    setResult(null);
    if (!file.name.toLowerCase().endsWith(".csv")) {
      setParseError("Only .csv files are accepted.");
      setParsed(null);
      return;
    }
    Papa.parse<Record<string, unknown>>(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => header.trim(),
      complete: (results) => {
        const rows = (results.data || []).filter(
          (row) => row && Object.values(row).some((v) => v !== "" && v != null),
        );
        const columns = results.meta.fields ?? [];
        const missingRequired = REQUIRED_COLUMNS.filter((c) => !columns.includes(c));
        setParsed({
          fileName: file.name,
          rowCount: rows.length,
          columns,
          rows,
          missingRequired,
        });
      },
      error: (err) => {
        setParsed(null);
        setParseError(err.message || "Failed to parse CSV.");
      },
    });
  }

  function onDrop(event: React.DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    setDragActive(false);
    const file = event.dataTransfer.files?.[0];
    if (file) handleFile(file);
  }

  function execute() {
    if (!parsed || parsed.missingRequired.length > 0) return;
    startTransition(async () => {
      try {
        const res = await executeCatalogImport(parsed.rows);
        setResult(res);
      } catch (error) {
        setResult({
          ok: false,
          message: error instanceof Error ? error.message : "Import failed.",
        });
      }
    });
  }

  const previewRows = parsed?.rows.slice(0, 5) ?? [];

  return (
    <section className="border border-[var(--color-border)] bg-[var(--color-bg)]">
      <header className="flex items-center justify-between border-b border-[var(--color-border)] bg-[var(--color-surface)] px-2 py-1">
        <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-[var(--color-fg)]">
          Bulk catalog import (CSV)
        </p>
        <p className="font-mono text-[11px] text-[var(--color-text-muted)]">
          Required:{" "}
          <span className="font-bold text-[var(--color-fg)]">
            {REQUIRED_COLUMNS.join(", ")}
          </span>
          {" · "}Dynamic <span className="font-bold text-[var(--color-fg)]">Dim_*</span> →
          dimensionsJson
        </p>
      </header>

      <div className="p-3">
        {/* ── Drop zone ─────────────────────────────────────────── */}
        <label
          htmlFor="bulk-import-file"
          onDragOver={(e) => {
            e.preventDefault();
            setDragActive(true);
          }}
          onDragLeave={() => setDragActive(false)}
          onDrop={onDrop}
          className={`flex cursor-pointer flex-col items-center justify-center gap-2 border-dashed border-2 px-4 py-10 text-center transition-colors ${
            dragActive
              ? "border-emerald-700 bg-emerald-50"
              : "border-[var(--color-border)] bg-[var(--color-surface)] hover:bg-[var(--color-bg)]"
          }`}
        >
          <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-[var(--color-text-muted)]">
            CSV upload
          </span>
          <p className="text-[13px] font-bold tracking-tight text-[var(--color-fg)]">
            Drop a supplier price-list CSV here
          </p>
          <p className="font-mono text-[11px] text-[var(--color-text-muted)]">
            or click to browse — first 5 rows render in a preview before submission.
          </p>
          <input
            ref={inputRef}
            id="bulk-import-file"
            type="file"
            accept=".csv,text/csv"
            className="hidden"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) handleFile(file);
            }}
          />
        </label>

        {parseError && (
          <p className="mt-3 border border-rose-300 bg-rose-50 p-2 font-mono text-[11px] font-bold text-rose-800">
            {parseError}
          </p>
        )}

        {parsed && parsed.missingRequired.length > 0 && (
          <p className="mt-3 border border-rose-300 bg-rose-50 p-2 font-mono text-[11px] font-bold text-rose-800">
            Missing required column(s): {parsed.missingRequired.join(", ")}
          </p>
        )}

        {/* ── Preview table (first 5 rows, dense p-1 mono) ──────── */}
        {parsed && previewRows.length > 0 && (
          <div className="mt-4">
            <div className="mb-1 flex items-center justify-between">
              <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-[var(--color-fg)]">
                Preview · {parsed.fileName} · showing {previewRows.length} of {parsed.rowCount} rows
              </p>
              <p className="font-mono text-[11px] text-[var(--color-text-muted)]">
                {parsed.columns.length} columns detected
              </p>
            </div>
            <div className="overflow-auto border border-[var(--color-border)]">
              <table className="w-full border-collapse text-[11px]">
                <thead className="bg-[var(--color-surface)] text-[10px] font-bold uppercase tracking-widest text-[var(--color-fg)]">
                  <tr>
                    <th className="border-b border-[var(--color-border)] p-1 text-left">#</th>
                    {parsed.columns.map((col) => (
                      <th
                        key={col}
                        className={`border-b border-[var(--color-border)] p-1 text-left font-mono ${
                          (REQUIRED_COLUMNS as readonly string[]).includes(col)
                            ? "text-emerald-700"
                            : col.startsWith("Dim_")
                              ? "text-[var(--color-fg)]"
                              : "text-[var(--color-text-muted)]"
                        }`}
                      >
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {previewRows.map((row, i) => (
                    <tr
                      key={i}
                      className="border-b border-slate-100 odd:bg-[var(--color-bg)] even:bg-[var(--color-surface)] hover:bg-emerald-50"
                    >
                      <td className="p-1 font-mono text-[var(--color-text-muted)]">{i + 1}</td>
                      {parsed.columns.map((col) => (
                        <td key={col} className="p-1 font-mono text-[var(--color-fg)]">
                          {row[col] === undefined || row[col] === null || row[col] === ""
                            ? "—"
                            : String(row[col])}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── Execute button ────────────────────────────────────── */}
        {parsed && (
          <div className="mt-4 flex items-center justify-between gap-3 border-t border-[var(--color-border)] pt-3">
            <p className="font-mono text-[11px] text-[var(--color-text-muted)]">
              <span className="font-bold text-[var(--color-fg)]">{parsed.rowCount}</span> rows
              ready for upsert into Product / ProductVariant /{" "}
              <span className="text-[var(--color-fg)]">ManufacturingData</span>.
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setParsed(null);
                  setResult(null);
                  setParseError(null);
                  if (inputRef.current) inputRef.current.value = "";
                }}
                className="rounded-sm border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-1.5 font-mono text-[11px] font-bold uppercase tracking-widest text-[var(--color-text-muted)] transition-colors hover:bg-[var(--color-surface)] hover:text-[var(--color-fg)]"
              >
                Reset
              </button>
              <button
                type="button"
                disabled={isPending || parsed.missingRequired.length > 0}
                onClick={execute}
                className="rounded-sm bg-emerald-700 px-3 py-1.5 font-mono text-[11px] font-bold uppercase tracking-widest text-white hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isPending ? "Running…" : "Execute Import Run"}
              </button>
            </div>
          </div>
        )}

        {/* ── Result summary ─────────────────────────────────────── */}
        {result && <ImportResult result={result} />}

        {/* ── Column reference ───────────────────────────────────── */}
        <details className="mt-4 border border-[var(--color-border)]">
          <summary className="cursor-pointer bg-[var(--color-surface)] px-2 py-1 font-mono text-[10px] font-bold uppercase tracking-widest text-[var(--color-text-muted)]">
            Expected column reference
          </summary>
          <div className="grid gap-3 p-3 text-[11px] sm:grid-cols-3">
            <div>
              <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-emerald-700">
                Required
              </p>
              <ul className="mt-1 space-y-0.5 font-mono text-[var(--color-fg)]">
                {REQUIRED_COLUMNS.map((c) => (
                  <li key={c}>{c}</li>
                ))}
              </ul>
            </div>
            <div>
              <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-[var(--color-fg)]">
                Optional
              </p>
              <ul className="mt-1 space-y-0.5 font-mono text-[var(--color-text-muted)]">
                {OPTIONAL_COLUMNS.map((c) => (
                  <li key={c}>{c}</li>
                ))}
              </ul>
            </div>
            <div>
              <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-[var(--color-fg)]">
                Dynamic
              </p>
              <p className="mt-1 font-mono text-[var(--color-text-muted)]">
                Dim_ID, Dim_OD, Dim_CS, Dim_Width, Dim_*… any header beginning with{" "}
                <span className="text-[var(--color-fg)]">Dim_</span> is folded into{" "}
                <span className="text-[var(--color-fg)]">dimensionsJson</span> on the variant.
              </p>
            </div>
          </div>
        </details>
      </div>
    </section>
  );
}

function ImportResult({ result }: { result: CatalogImportResult }) {
  if (!result.ok) {
    return (
      <div className="mt-4 border border-rose-300 bg-rose-50 p-3 font-mono text-[11px] text-rose-800">
        <p className="font-bold uppercase tracking-widest">Import failed</p>
        <p className="mt-1">{result.message}</p>
        {result.errors && result.errors.length > 0 && (
          <ErrorTable errors={result.errors} />
        )}
      </div>
    );
  }

  return (
    <div className="mt-4 border border-emerald-700 bg-emerald-50 p-3">
      <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-emerald-800">
        Import successful
      </p>
      <p className="mt-1 font-mono text-[11px] text-[var(--color-fg)]">{result.message}</p>
      <table className="mt-2 w-full border-collapse text-[11px]">
        <tbody>
          {Object.entries(result.summary).map(([key, value]) => (
            <tr key={key} className="border-b border-[var(--color-border)] last:border-b-0">
              <th
                scope="row"
                className="w-64 p-1 text-left font-mono text-[var(--color-text-muted)]"
              >
                {key}
              </th>
              <td className="p-1 text-right font-mono font-bold text-[var(--color-fg)]">
                {value}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {result.errors.length > 0 && <ErrorTable errors={result.errors} />}
    </div>
  );
}

function ErrorTable({ errors }: { errors: ImportRowError[] }) {
  return (
    <div className="mt-3 border border-rose-300">
      <p className="border-b border-rose-300 bg-rose-100 px-2 py-1 font-mono text-[10px] font-bold uppercase tracking-widest text-rose-900">
        Skipped rows ({errors.length})
      </p>
      <table className="w-full border-collapse text-[11px]">
        <thead className="bg-rose-50 text-[10px] font-bold uppercase tracking-widest text-rose-900">
          <tr>
            <th className="border-b border-rose-200 p-1 text-left">Row</th>
            <th className="border-b border-rose-200 p-1 text-left">SKU</th>
            <th className="border-b border-rose-200 p-1 text-left">Reason</th>
          </tr>
        </thead>
        <tbody>
          {errors.map((error, i) => (
            <tr key={i} className="border-b border-rose-100">
              <td className="p-1 font-mono text-[var(--color-fg)]">{error.rowIndex}</td>
              <td className="p-1 font-mono font-bold text-[var(--color-fg)]">{error.sku}</td>
              <td className="p-1 font-mono text-rose-900">{error.reason}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
