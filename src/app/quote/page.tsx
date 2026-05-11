"use client";

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

export default function QuotePage() {
  // useSearchParams() requires a Suspense boundary during static export
  // (Next.js bails out of CSR otherwise). Wrap the real client form here.
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
  // attached. Lets other pages (Capabilities, Materials, etc.) deep-link
  // into the RFQ flow with operational context already filled in.
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
    <main className="min-h-screen w-full bg-[#F7FAFC]">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <header className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-[#4A5568]">
              Step 1 of 2
            </p>
            <h1 className="mt-1 text-2xl font-bold text-[#1A202C]">Review your quote</h1>
            <p className="text-sm text-[#4A5568]">
              {cart.count} variant{cart.count === 1 ? "" : "s"} · Estimated subtotal{" "}
              {subtotal > 0 ? `USD ${subtotal.toFixed(2)}` : "—"}
            </p>
          </div>
          <Link
            href="/products"
            className="rounded border border-[#CBD5E0] px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-[#1A202C] hover:bg-[#EDF2F7]"
          >
            ← Back to catalog
          </Link>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ---------- Cart table ---------- */}
          <section className="lg:col-span-2 overflow-hidden rounded border border-[#CBD5E0] bg-white">
            <div className="border-b border-[#CBD5E0] px-4 py-3">
              <p className="text-[11px] font-bold uppercase tracking-wider text-[#1A202C]">
                Selected variants
              </p>
            </div>
            <table className="w-full border-collapse text-sm">
              <thead className="bg-[#EDF2F7] text-[11px] font-bold uppercase tracking-wide text-[#1A202C]">
                <tr>
                  <th className="border-b border-[#CBD5E0] p-2 text-left">SKU</th>
                  <th className="border-b border-[#CBD5E0] p-2 text-left">Product</th>
                  <th className="border-b border-[#CBD5E0] p-2 text-right">Qty</th>
                  <th className="border-b border-[#CBD5E0] p-2 text-right">Unit USD</th>
                  <th className="border-b border-[#CBD5E0] p-2 text-right">Line</th>
                  <th className="border-b border-[#CBD5E0] p-2"></th>
                </tr>
              </thead>
              <tbody>
                {cart.items.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-sm text-[#4A5568]">
                      Your quote cart is empty.{" "}
                      <Link href="/products" className="text-[#2F855A] underline">
                        Browse the catalog
                      </Link>
                      .
                    </td>
                  </tr>
                )}
                {cart.items.map((item) => {
                  const line =
                    item.basePriceUsd != null ? item.basePriceUsd * item.quantity : null;
                  return (
                    <tr key={item.sku} className="border-b border-[#CBD5E0]">
                      <td className="p-2 font-bold">{item.sku}</td>
                      <td className="p-2">{item.name}</td>
                      <td className="p-2 text-right">
                        <input
                          type="number"
                          min={1}
                          value={item.quantity}
                          onChange={(e) =>
                            cart.setQuantity(item.sku, Number(e.target.value) || 1)
                          }
                          className="h-8 w-20 rounded border border-[#CBD5E0] px-2 text-right text-sm"
                        />
                      </td>
                      <td className="p-2 text-right">
                        {item.basePriceUsd != null
                          ? `USD ${item.basePriceUsd.toFixed(2)}`
                          : "—"}
                      </td>
                      <td className="p-2 text-right font-bold">
                        {line != null ? `USD ${line.toFixed(2)}` : "—"}
                      </td>
                      <td className="p-2 text-right">
                        <button
                          type="button"
                          onClick={() => cart.remove(item.sku)}
                          className="text-xs font-bold uppercase tracking-wide text-red-700 hover:underline"
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </section>

          {/* ---------- Customer form ---------- */}
          <aside className="lg:col-span-1 rounded border border-[#CBD5E0] bg-white p-5">
            <p className="text-[11px] font-bold uppercase tracking-wider text-[#1A202C]">
              Your details
            </p>
            <form
              action={handleSubmit}
              className="mt-3 flex flex-col gap-3 text-sm"
            >
              <Field name="companyName" label="Company name" required />
              <Field name="contactName" label="Contact person" required />
              <Field name="email" label="Email" type="email" required />
              <Field name="phone" label="Phone" />
              <Field name="deliveryPort" label="Target delivery port" required />
              <label className="flex flex-col gap-1">
                <span className="text-[11px] font-bold uppercase tracking-wide text-[#4A5568]">
                  Market
                </span>
                <select
                  name="market"
                  defaultValue="GLOBAL"
                  className="h-9 rounded border border-[#CBD5E0] bg-white px-2 text-sm"
                >
                  {MARKETS.map((m) => (
                    <option key={m.value} value={m.value}>
                      {m.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-[11px] font-bold uppercase tracking-wide text-[#4A5568]">
                  Notes
                </span>
                <textarea
                  name="notes"
                  rows={3}
                  defaultValue={prefilledNote}
                  className="rounded border border-[#CBD5E0] px-2 py-1.5 text-sm"
                />
              </label>

              {error && (
                <p className="rounded border border-red-300 bg-red-50 p-2 text-xs text-red-700">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={pending || cart.items.length === 0}
                className="rounded bg-[#2F855A] px-3 py-2.5 text-xs font-bold uppercase tracking-wide text-white hover:bg-[#276749] disabled:opacity-50"
              >
                {pending ? "Submitting…" : "Submit Request for Quote"}
              </button>
            </form>
          </aside>
        </div>
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
      <span className="text-[11px] font-bold uppercase tracking-wide text-[#4A5568]">
        {label}
        {required ? " *" : ""}
      </span>
      <input
        name={name}
        type={type}
        required={required}
        className="h-9 rounded border border-[#CBD5E0] px-2 text-sm"
      />
    </label>
  );
}
