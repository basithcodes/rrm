"use client";

// =====================================================================
// /quote — RFQ Cart + Buyer Form
// ---------------------------------------------------------------------
// Industrial checkout for a factory, not a contact form for a startup.
//   * Top half  → dense Quote Cart data table (SKU / Name / Material /
//                  Qty input / Remove).
//   * Bottom    → strict 2-col mono form with the buyer's details.
//   * CTA       → single sharp emerald "SUBMIT OFFICIAL RFQ" bar.
// =====================================================================

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState, useTransition } from "react";
import { useQuoteCart } from "@/lib/quote-cart";
import { submitRfq } from "./actions";

const MARKETS = [
  { value: "GLOBAL", label: "Global / Other" },
  { value: "UAE", label: "United Arab Emirates" },
  { value: "SAUDI_ARABIA", label: "Saudi Arabia" },
  { value: "OMAN", label: "Oman" },
  { value: "QATAR", label: "Qatar" },
] as const;

const INPUT_CLASS =
  "w-full p-2 text-sm font-mono border border-slate-300 rounded-sm bg-white text-slate-900 focus:border-emerald-600 focus:outline-none";

export default function QuotePage() {
  // useSearchParams() requires a Suspense boundary during static export.
  return (
    <Suspense fallback={null}>
      <QuotePageInner />
    </Suspense>
  );
}

function QuotePageInner() {
  const cart = useQuoteCart();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  // Optional URL prefill — e.g. /quote?note=Custom%20engineering%20drawing
  // from the Capabilities page deep-link.
  const prefilledNote = searchParams.get("note") ?? "";

  const subtotal = cart.items.reduce(
    (sum, item) => sum + (item.basePriceUsd ?? 0) * item.quantity,
    0,
  );

  function handleSubmit(formData: FormData) {
    setError(null);
    if (cart.items.length === 0) {
      setError("Your quote cart is empty.");
      return;
    }

    startTransition(async () => {
      const result = await submitRfq({
        companyName: String(formData.get("companyName") ?? ""),
        contactName: String(formData.get("contactName") ?? ""),
        email: String(formData.get("email") ?? ""),
        phone: String(formData.get("phone") ?? ""),
        deliveryPort: String(formData.get("deliveryPort") ?? ""),
        market: (formData.get("market") as
          | "GLOBAL"
          | "UAE"
          | "SAUDI_ARABIA"
          | "OMAN"
          | "QATAR") ?? "GLOBAL",
        notes: String(formData.get("notes") ?? ""),
        items: cart.items.map((item) => ({
          sku: item.sku,
          name: item.name,
          quantity: item.quantity,
          basePriceUsd: item.basePriceUsd,
        })),
      });

      if (!result.ok) {
        setError(result.error);
        return;
      }

      cart.clear();
      router.push(`/quote/success?id=${result.rfqId}`);
    });
  }

  return (
    <main className="min-h-screen w-full bg-white text-slate-900">
      <div className="mx-auto max-w-6xl px-4 py-4">
        {/* ── Header strip ────────────────────────────────────── */}
        <header className="mb-3 flex flex-wrap items-end justify-between gap-3 border-b border-slate-200 pb-2">
          <div>
            <p className="font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-emerald-700">
              Request for Quote
            </p>
            <h1 className="mt-1 text-xl font-bold tracking-tight text-slate-900 md:text-2xl">
              Quote Cart
            </h1>
          </div>
          <p className="font-mono text-[11px] uppercase tracking-wider text-slate-500">
            {cart.count} variant{cart.count === 1 ? "" : "s"} ·
            {subtotal > 0 ? ` est USD ${subtotal.toFixed(2)}` : " est —"}
          </p>
          <Link
            href="/products"
            className="rounded-sm border border-slate-200 px-3 py-1 font-mono text-[11px] font-bold uppercase tracking-widest text-slate-600 hover:bg-slate-50 hover:text-slate-900"
          >
            ← Catalog
          </Link>
        </header>

        {/* ── Cart table ──────────────────────────────────────── */}
        <section className="border border-slate-200 bg-white">
          <div className="overflow-auto">
            <table className="w-full border-collapse text-[12px]">
              <thead className="bg-slate-100 text-[10px] font-bold uppercase tracking-widest text-slate-900">
                <tr>
                  <th className="border-b border-slate-200 p-1 text-left">SKU</th>
                  <th className="border-b border-slate-200 p-1 text-left">Name</th>
                  <th className="border-b border-slate-200 p-1 text-left">Material</th>
                  <th className="border-b border-slate-200 p-1 text-right">Requested Qty</th>
                  <th className="border-b border-slate-200 p-1 text-right">Unit USD</th>
                  <th className="border-b border-slate-200 p-1 text-right">Line</th>
                  <th className="border-b border-slate-200 p-1 text-left">Action</th>
                </tr>
              </thead>
              <tbody>
                {cart.items.length === 0 && (
                  <tr>
                    <td
                      colSpan={7}
                      className="p-3 text-center font-mono text-[11px] uppercase tracking-wider text-slate-500"
                    >
                      Cart is empty ·{" "}
                      <Link href="/products" className="text-emerald-700 underline">
                        browse the catalog
                      </Link>
                    </td>
                  </tr>
                )}
                {cart.items.map((item) => {
                  const line =
                    item.basePriceUsd != null ? item.basePriceUsd * item.quantity : null;
                  return (
                    <tr
                      key={item.sku}
                      className="border-b border-slate-100 odd:bg-white even:bg-slate-50 hover:bg-emerald-50"
                    >
                      <td className="p-1 font-mono font-bold text-slate-900">{item.sku}</td>
                      <td className="p-1 text-slate-900">{item.name}</td>
                      <td className="p-1 font-mono text-slate-600">
                        {item.material ?? "—"}
                      </td>
                      <td className="p-1 text-right">
                        <input
                          type="number"
                          min={1}
                          value={item.quantity}
                          onChange={(e) =>
                            cart.setQuantity(item.sku, Number(e.target.value) || 1)
                          }
                          className="h-7 w-20 rounded-sm border border-slate-300 bg-white px-2 text-right font-mono text-[12px] focus:border-emerald-600 focus:outline-none"
                        />
                      </td>
                      <td className="p-1 text-right font-mono text-slate-700">
                        {item.basePriceUsd != null
                          ? `${item.basePriceUsd.toFixed(2)}`
                          : "—"}
                      </td>
                      <td className="p-1 text-right font-mono font-bold text-slate-900">
                        {line != null ? `${line.toFixed(2)}` : "—"}
                      </td>
                      <td className="p-1">
                        <button
                          type="button"
                          onClick={() => cart.remove(item.sku)}
                          className="rounded-sm border border-slate-200 px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-widest text-rose-700 hover:bg-rose-50"
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        {/* ── Buyer details form ──────────────────────────────── */}
        <form action={handleSubmit} className="mt-4">
          <div className="mb-2 flex items-center justify-between border-b border-slate-200 pb-1">
            <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-slate-900">
              Buyer details
            </p>
            <p className="font-mono text-[10px] uppercase tracking-wider text-slate-500">
              Required for a binding quotation
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <Field name="companyName" label="Company Name" required />
            <Field name="contactName" label="Contact Person" required />
            <Field name="email" label="Email" type="email" required />
            <Field name="phone" label="Phone" required />
            <Field name="deliveryPort" label="Country / Delivery City" required />
            <label className="flex flex-col gap-1">
              <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-slate-500">
                Market
              </span>
              <select
                name="market"
                defaultValue="GLOBAL"
                className={INPUT_CLASS}
              >
                {MARKETS.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1 md:col-span-2">
              <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-slate-500">
                Application Notes
              </span>
              <textarea
                name="notes"
                rows={3}
                defaultValue={prefilledNote}
                placeholder="Service medium, temperature, pressure, expected duty cycle, drawing reference…"
                className={INPUT_CLASS}
              />
            </label>
          </div>

          {error && (
            <p className="mt-3 border border-rose-300 bg-rose-50 p-2 font-mono text-[11px] font-bold text-rose-800">
              {error}
            </p>
          )}

          {/* ── CTA bar ──────────────────────────────────────── */}
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-3">
            <p className="font-mono text-[11px] uppercase tracking-wider text-slate-500">
              {cart.count} line item{cart.count === 1 ? "" : "s"} ·
              {subtotal > 0 ? ` est USD ${subtotal.toFixed(2)}` : " est —"}
            </p>
            <button
              type="submit"
              disabled={pending || cart.items.length === 0}
              className="rounded-sm bg-emerald-700 px-4 py-2 font-mono text-[11px] font-bold uppercase tracking-widest text-white hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {pending ? "Submitting…" : "Submit Official RFQ →"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}

function Field({
  name,
  label,
  type = "text",
  required,
}: {
  name: string;
  label: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-slate-500">
        {label}
        {required ? " *" : ""}
      </span>
      <input
        name={name}
        type={type}
        required={required}
        className={INPUT_CLASS}
      />
    </label>
  );
}
