"use client";

// =====================================================================
// Bulk CSV Import Workbench
// ---------------------------------------------------------------------
// Operator-facing drag-drop surface for the catalog import pipeline.
//   1. Drop or pick a CSV file.
//   2. papaparse parses on the client; first 5 rows render in a preview
//      table so the operator can verify column mapping.
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
    <section className="border border-[#CBD5E0] bg-white">
      <header className="flex items-center justify-between border-b border-[#CBD5E0] bg-[#EDF2F7] px-2 py-1">
        <p className="text-[10px] font-bold uppercase tracking-wider text-[#1A202C]">
          Bulk catalog import (CSV)
        </p>
        <p className="text-[11px] text-[#4A5568]">
          Required columns:{" "}
          <span className="font-mono font-bold text-[#1A202C]">
            {REQUIRED_COLUMNS.join(", ")}
          </span>
          {" · "}Dynamic{" "}
          <span className="font-mono font-bold text-[#1A202C]">Dim_*</span> columns
          fold into <span className="font-mono">dimensionsJson</span>.
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
          className={`flex cursor-pointer flex-col items-center justify-center gap-2 border-2 border-dashed px-4 py-10 text-center transition ${
            dragActive
              ? "border-[#2F855A] bg-[#E6FFFA]"
              : "border-[#CBD5E0] bg-[#F7FAFC] hover:bg-[#EDF2F7]"
          }`}
        >
          <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-[#4A5568]">
            CSV upload
          </span>
          <p className="text-sm font-bold text-[#1A202C]">
            Drop a supplier price-list CSV here
          </p>
          <p className="text-[12px] text-[#4A5568]">
            or click to browse — first 5 rows will render in a preview before submission.
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
          <p className="mt-3 border border-rose-300 bg-rose-50 p-2 text-[12px] font-bold text-rose-800">
            {parseError}
          </p>
        )}

        {parsed && parsed.missingRequired.length > 0 && (
          <p className="mt-3 border border-rose-300 bg-rose-50 p-2 text-[12px] font-bold text-rose-800">
            Missing required column(s):{" "}
            <span className="font-mono">{parsed.missingRequired.join(", ")}</span>
          </p>
        )}

        {/* ── Preview table ─────────────────────────────────────── */}
        {parsed && previewRows.length > 0 && (
          <div className="mt-4">
            <div className="mb-1 flex items-center justify-between">
              <p className="font-mono text-[11px] font-bold uppercase tracking-wider text-[#1A202C]">
                Preview · {parsed.fileName} · showing {previewRows.length} of {parsed.rowCount} rows
              </p>
              <p className="text-[11px] text-[#4A5568]">
                {parsed.columns.length} columns detected
              </p>
            </div>
            <div className="overflow-auto border border-[#CBD5E0]">
              <table className="w-full border-collapse text-[11px]">
                <thead className="bg-[#EDF2F7] text-[10px] font-bold uppercase tracking-wider text-[#1A202C]">
                  <tr>
                    <th className="border-b border-[#CBD5E0] p-1 text-left">#</th>
                    {parsed.columns.map((col) => (
                      <th
                        key={col}
                        className={`border-b border-[#CBD5E0] p-1 text-left font-mono ${
                          (REQUIRED_COLUMNS as readonly string[]).includes(col)
                            ? "text-[#2F855A]"
                            : col.startsWith("Dim_")
                              ? "text-[#1A202C]"
                              : "text-[#4A5568]"
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
                      className="border-b border-[#EDF2F7] hover:bg-[#F7FAFC]"
                    >
                      <td className="p-1 font-mono text-[#4A5568]">{i + 1}</td>
                      {parsed.columns.map((col) => (
                        <td key={col} className="p-1 font-mono">
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
          <div className="mt-4 flex items-center justify-between gap-3 border-t border-[#CBD5E0] pt-3">
            <p className="text-[12px] text-[#4A5568]">
              <span className="font-bold text-[#1A202C]">{parsed.rowCount}</span> rows ready for upsert into Product / ProductVariant /{" "}
              <span className="font-mono">ManufacturingData</span>.
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
                className="rounded border border-[#CBD5E0] bg-white px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-[#1A202C] hover:bg-[#EDF2F7]"
              >
                Reset
              </button>
              <button
                type="button"
                disabled={isPending || parsed.missingRequired.length > 0}
                onClick={execute}
                className="rounded bg-[#2F855A] px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-white hover:bg-[#276749] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isPending ? "Running…" : "Execute Import Run"}
              </button>
            </div>
          </div>
        )}

        {/* ── Result summary ─────────────────────────────────────── */}
        {result && <ImportResult result={result} />}

        {/* ── Column reference ───────────────────────────────────── */}
        <details className="mt-4 border border-[#EDF2F7]">
          <summary className="cursor-pointer bg-[#F7FAFC] px-2 py-1 font-mono text-[11px] font-bold uppercase tracking-wider text-[#4A5568]">
            Expected column reference
          </summary>
          <div className="grid gap-3 p-3 text-[11px] sm:grid-cols-3">
            <div>
              <p className="font-mono font-bold text-[#2F855A]">Required</p>
              <ul className="mt-1 space-y-0.5 font-mono">
                {REQUIRED_COLUMNS.map((c) => (
                  <li key={c}>{c}</li>
                ))}
              </ul>
            </div>
            <div>
              <p className="font-mono font-bold text-[#1A202C]">Optional</p>
              <ul className="mt-1 space-y-0.5 font-mono text-[#4A5568]">
                {OPTIONAL_COLUMNS.map((c) => (
                  <li key={c}>{c}</li>
                ))}
              </ul>
            </div>
            <div>
              <p className="font-mono font-bold text-[#1A202C]">Dynamic</p>
              <p className="mt-1 font-mono text-[#4A5568]">
                Dim_ID, Dim_OD, Dim_CS, Dim_Width, Dim_*… — any header beginning with{" "}
                <span className="text-[#1A202C]">Dim_</span> is folded into{" "}
                <span className="text-[#1A202C]">dimensionsJson</span> on the variant.
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
      <div className="mt-4 border border-rose-300 bg-rose-50 p-3 text-[12px] text-rose-800">
        <p className="font-bold uppercase tracking-wider">Import failed</p>
        <p className="mt-1">{result.message}</p>
        {result.errors && result.errors.length > 0 && (
          <ErrorTable errors={result.errors} />
        )}
      </div>
    );
  }

  return (
    <div className="mt-4 border border-[#2F855A] bg-[#E6FFFA] p-3">
      <p className="font-mono text-[11px] font-bold uppercase tracking-wider text-[#276749]">
        Import successful
      </p>
      <p className="mt-1 text-[12px] text-[#1A202C]">{result.message}</p>
      <table className="mt-2 w-full border-collapse text-[11px]">
        <tbody>
          {Object.entries(result.summary).map(([key, value]) => (
            <tr key={key} className="border-b border-[#CBD5E0] last:border-b-0">
              <th
                scope="row"
                className="w-64 p-1 text-left font-mono text-[#4A5568]"
              >
                {key}
              </th>
              <td className="p-1 text-right font-mono font-bold text-[#1A202C]">
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
      <p className="border-b border-rose-300 bg-rose-100 px-2 py-1 font-mono text-[10px] font-bold uppercase tracking-wider text-rose-900">
        Skipped rows ({errors.length})
      </p>
      <table className="w-full border-collapse text-[11px]">
        <thead className="bg-rose-50 text-[10px] font-bold uppercase tracking-wider text-rose-900">
          <tr>
            <th className="border-b border-rose-200 p-1 text-left">Row</th>
            <th className="border-b border-rose-200 p-1 text-left">SKU</th>
            <th className="border-b border-rose-200 p-1 text-left">Reason</th>
          </tr>
        </thead>
        <tbody>
          {errors.map((error, i) => (
            <tr key={i} className="border-b border-rose-100">
              <td className="p-1 font-mono">{error.rowIndex}</td>
              <td className="p-1 font-mono font-bold">{error.sku}</td>
              <td className="p-1 text-rose-900">{error.reason}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
