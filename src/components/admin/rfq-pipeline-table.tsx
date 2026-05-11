"use client";

import { useState, useTransition } from "react";
import { updateRfqStatus } from "@/app/admin/rfqs/actions";

const STATUSES = ["NEW", "REVIEWING", "QUOTED", "CLOSED", "LOST"] as const;
type Status = (typeof STATUSES)[number];

const STATUS_STYLES: Record<Status, string> = {
  NEW: "bg-blue-100 text-blue-800 border-blue-200",
  REVIEWING: "bg-amber-100 text-amber-800 border-amber-200",
  QUOTED: "bg-emerald-100 text-emerald-800 border-emerald-200",
  CLOSED: "bg-slate-200 text-slate-700 border-slate-300",
  LOST: "bg-rose-100 text-rose-800 border-rose-200",
};

export type RfqRow = {
  id: string;
  createdAt: string;
  status: Status;
  itemCount: number;
  customer: {
    companyName: string;
    contactName: string;
    email: string;
    phone: string;
    deliveryPort: string;
    market: string;
    notes: string;
  };
  items: Array<{
    sku: string;
    name: string;
    quantity: number;
    basePriceUsd: number | null;
  }>;
};

export function RfqPipelineTable({ rows }: { rows: RfqRow[] }) {
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <div className="overflow-hidden rounded border border-[#CBD5E0] bg-white">
      <table className="w-full border-collapse text-sm">
        <thead className="bg-[#EDF2F7] text-[11px] font-bold uppercase tracking-wide text-[#1A202C]">
          <tr>
            <th className="border-b border-[#CBD5E0] p-2 text-left">Date</th>
            <th className="border-b border-[#CBD5E0] p-2 text-left">Customer</th>
            <th className="border-b border-[#CBD5E0] p-2 text-left">RFQ ID</th>
            <th className="border-b border-[#CBD5E0] p-2 text-left">Status</th>
            <th className="border-b border-[#CBD5E0] p-2 text-right">Items</th>
            <th className="border-b border-[#CBD5E0] p-2"></th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 && (
            <tr>
              <td colSpan={6} className="p-8 text-center text-sm text-[#4A5568]">
                No RFQs yet. The pipeline populates automatically as buyers submit
                quotes through the public /quote flow.
              </td>
            </tr>
          )}
          {rows.map((row) => {
            const isOpen = expanded === row.id;
            return (
              <RfqRowGroup
                key={row.id}
                row={row}
                isOpen={isOpen}
                onToggle={() =>
                  setExpanded((current) => (current === row.id ? null : row.id))
                }
              />
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function RfqRowGroup({
  row,
  isOpen,
  onToggle,
}: {
  row: RfqRow;
  isOpen: boolean;
  onToggle: () => void;
}) {
  const [pending, startTransition] = useTransition();
  const [status, setStatus] = useState<Status>(row.status);
  const [error, setError] = useState<string | null>(null);

  function handleStatusChange(next: Status) {
    setError(null);
    setStatus(next);
    startTransition(async () => {
      const result = await updateRfqStatus({ rfqId: row.id, status: next });
      if (!result.ok) {
        setError(result.error);
        setStatus(row.status); // revert
      }
    });
  }

  return (
    <>
      <tr className="border-b border-[#CBD5E0] hover:bg-[#F7FAFC]">
        <td className="p-2 text-[#4A5568]">{row.createdAt}</td>
        <td className="p-2 font-bold text-[#1A202C]">{row.customer.companyName}</td>
        <td className="p-2 font-mono text-xs text-[#4A5568]">{row.id}</td>
        <td className="p-2">
          <select
            value={status}
            disabled={pending}
            onChange={(e) => handleStatusChange(e.target.value as Status)}
            className={`rounded border px-2 py-1 text-[11px] font-bold uppercase tracking-wide ${STATUS_STYLES[status]}`}
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          {error && <p className="mt-1 text-[11px] text-rose-700">{error}</p>}
        </td>
        <td className="p-2 text-right font-bold">{row.itemCount}</td>
        <td className="p-2 text-right">
          <button
            type="button"
            onClick={onToggle}
            className="rounded border border-[#CBD5E0] px-2 py-1 text-[11px] font-bold uppercase tracking-wide text-[#1A202C] hover:bg-[#EDF2F7]"
          >
            {isOpen ? "Hide" : "View Details"}
          </button>
          <a
            href={`/api/rfq/${row.id}/pdf`}
            target="_blank"
            rel="noreferrer"
            className="ml-2 rounded bg-[#1A202C] px-2 py-1 text-[11px] font-bold uppercase tracking-wide text-white hover:bg-[#2D3748]"
          >
            PDF
          </a>
        </td>
      </tr>
      {isOpen && (
        <tr className="border-b border-[#CBD5E0] bg-[#F7FAFC]">
          <td colSpan={6} className="p-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="rounded border border-[#CBD5E0] bg-white p-3 text-xs">
                <p className="font-bold uppercase tracking-wider text-[#4A5568]">
                  Customer
                </p>
                <dl className="mt-2 grid grid-cols-2 gap-y-1">
                  <Detail label="Contact" value={row.customer.contactName} />
                  <Detail label="Email" value={row.customer.email} />
                  <Detail label="Phone" value={row.customer.phone || "—"} />
                  <Detail label="Port" value={row.customer.deliveryPort} />
                  <Detail label="Market" value={row.customer.market} />
                </dl>
                {row.customer.notes && (
                  <p className="mt-2 border-t border-[#CBD5E0] pt-2 text-[#4A5568]">
                    {row.customer.notes}
                  </p>
                )}
              </div>
              <div className="lg:col-span-2 overflow-hidden rounded border border-[#CBD5E0] bg-white">
                <table className="w-full border-collapse text-xs">
                  <thead className="bg-[#EDF2F7] font-bold uppercase tracking-wide text-[#1A202C]">
                    <tr>
                      <th className="border-b border-[#CBD5E0] p-2 text-left">SKU</th>
                      <th className="border-b border-[#CBD5E0] p-2 text-left">Product</th>
                      <th className="border-b border-[#CBD5E0] p-2 text-right">Qty</th>
                      <th className="border-b border-[#CBD5E0] p-2 text-right">
                        Unit USD
                      </th>
                      <th className="border-b border-[#CBD5E0] p-2 text-right">Line</th>
                    </tr>
                  </thead>
                  <tbody>
                    {row.items.map((item) => {
                      const line =
                        item.basePriceUsd != null
                          ? item.basePriceUsd * item.quantity
                          : null;
                      return (
                        <tr key={item.sku} className="border-b border-[#CBD5E0]">
                          <td className="p-2 font-mono">{item.sku}</td>
                          <td className="p-2">{item.name}</td>
                          <td className="p-2 text-right">{item.quantity}</td>
                          <td className="p-2 text-right">
                            {item.basePriceUsd != null
                              ? `USD ${item.basePriceUsd.toFixed(2)}`
                              : "—"}
                          </td>
                          <td className="p-2 text-right font-bold">
                            {line != null ? `USD ${line.toFixed(2)}` : "—"}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <>
      <dt className="font-semibold uppercase tracking-wide text-[#4A5568]">{label}</dt>
      <dd className="font-bold text-[#1A202C]">{value}</dd>
    </>
  );
}
