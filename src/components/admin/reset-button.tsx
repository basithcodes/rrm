"use client";

import { useState, useTransition } from "react";
import { hardResetCatalog, type ResetResult } from "@/app/admin/settings/actions";

export function ResetButton() {
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<ResetResult | null>(null);
  const [confirmed, setConfirmed] = useState(false);

  function handleClick() {
    if (!confirmed) {
      setConfirmed(true);
      return;
    }
    setResult(null);
    startTransition(async () => {
      const next = await hardResetCatalog();
      setResult(next);
      setConfirmed(false);
    });
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={handleClick}
        disabled={pending}
        className={`rounded px-4 py-2.5 text-xs font-bold uppercase tracking-wide text-white disabled:opacity-50 ${
          confirmed
            ? "bg-rose-700 hover:bg-rose-800"
            : "bg-[#1A202C] hover:bg-[#2D3748]"
        }`}
      >
        {pending
          ? "Resetting…"
          : confirmed
            ? "Click again to confirm — this deletes RFQs + customers"
            : "Hard Reset Catalog"}
      </button>

      {result?.ok && (
        <p className="text-xs text-emerald-300">
          ✓ Reset complete — deleted {result.deleted.rfqs} RFQs,{" "}
          {result.deleted.rfqItems} items, {result.deleted.customers} customers.
        </p>
      )}
      {result && !result.ok && (
        <p className="text-xs text-rose-300">✗ {result.error}</p>
      )}
    </div>
  );
}
