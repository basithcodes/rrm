"use client";

// Parametric 3D Viewer for Parent Products
// =====================================================================
// Renders a single GLB/GLTF asset via @react-three/drei's `useGLTF` hook.
// When the user selects a Variant row in the data table below, the mesh
// `scale` updates live — no re-load, no new fetch.
//
// Falls back to the existing procedural `ProductViewer` if the parent
// product has no `threeDModelUrl`. This keeps the demo catalog working
// while we wait for real GLB assets.
// =====================================================================

import { Bounds, Center, OrbitControls, useGLTF } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import Link from "next/link";
import { Suspense, useMemo, useState } from "react";
import { useQuoteCart } from "@/lib/quote-cart";
import { ProductViewer } from "@/components/product-viewer";
import type { Product, ProductVariant } from "@/lib/site-data";

type Currency = "USD" | "AED" | "SAR" | "OMR" | "QAR";

const USD_RATES: Record<Currency, number> = {
  USD: 1,
  AED: 3.6725,
  SAR: 3.75,
  OMR: 0.3845,
  QAR: 3.64,
};
const CURRENCIES: Currency[] = ["USD", "AED", "SAR", "OMR", "QAR"];

function formatPrice(usd: number, currency: Currency) {
  if (!Number.isFinite(usd) || usd <= 0) return "—";
  const value = usd * USD_RATES[currency];
  return `${currency} ${value.toFixed(currency === "OMR" ? 3 : 2)}`;
}

function readDimension(variant: ProductVariant, needles: string[]) {
  for (const dim of variant.dimensions) {
    const k = dim.label.toLowerCase();
    if (needles.some((n) => k.includes(n))) return dim.value;
  }
  return "—";
}

function parseFirstNumber(raw: string | undefined): number | null {
  if (!raw) return null;
  const match = raw.match(/-?\d+(?:[.,]\d+)?/);
  if (!match) return null;
  const value = parseFloat(match[0].replace(",", "."));
  return Number.isFinite(value) ? value : null;
}

// Compute a `[x, y, z]` parametric scale for the selected variant based on
// its dimensions, normalised against the parent's median variant so the GLB
// resizes proportionally rather than absolutely.
function computeVariantScale(product: Product, variantId: string): [number, number, number] {
  const target = product.variants.find((v) => v.code === variantId);
  if (!target) return [1, 1, 1];

  const medians = (() => {
    const buckets: Record<string, number[]> = { width: [], thickness: [], length: [] };
    for (const v of product.variants) {
      const width = parseFirstNumber(
        v.dimensions.find((d) => /outer|od|width|⌀/i.test(d.label))?.value,
      );
      const thick = parseFirstNumber(
        v.dimensions.find((d) => /thick|cs|cross/i.test(d.label))?.value,
      );
      const len = parseFirstNumber(
        v.dimensions.find((d) => /inner|id|length|height/i.test(d.label))?.value,
      );
      if (width) buckets.width.push(width);
      if (thick) buckets.thickness.push(thick);
      if (len) buckets.length.push(len);
    }
    const median = (arr: number[]) => {
      if (arr.length === 0) return null;
      const sorted = [...arr].sort((a, b) => a - b);
      return sorted[Math.floor(sorted.length / 2)];
    };
    return {
      width: median(buckets.width),
      thickness: median(buckets.thickness),
      length: median(buckets.length),
    };
  })();

  const ratio = (current: number | null, baseline: number | null) => {
    if (!current || !baseline || baseline <= 0) return 1;
    // Clamp so a single absurd dimension can't blow the scene apart.
    return Math.min(Math.max(current / baseline, 0.35), 2.4);
  };

  const widthVal = parseFirstNumber(
    target.dimensions.find((d) => /outer|od|width|⌀/i.test(d.label))?.value,
  );
  const thickVal = parseFirstNumber(
    target.dimensions.find((d) => /thick|cs|cross/i.test(d.label))?.value,
  );
  const lenVal = parseFirstNumber(
    target.dimensions.find((d) => /inner|id|length|height/i.test(d.label))?.value,
  );

  return [
    ratio(widthVal, medians.width),
    ratio(thickVal, medians.thickness),
    ratio(lenVal, medians.length),
  ];
}

function GltfMesh({ url, scale }: { url: string; scale: [number, number, number] }) {
  const gltf = useGLTF(url);
  return <primitive object={gltf.scene} scale={scale} />;
}

export function ParametricProductDetail({ product }: { product: Product }) {
  const [selectedVariantId, setSelectedVariantId] = useState<string>(
    product.variants[0]?.code ?? "",
  );
  const [currency, setCurrency] = useState<Currency>("USD");
  const [filter, setFilter] = useState("");
  const cart = useQuoteCart();

  const scale = useMemo(
    () => computeVariantScale(product, selectedVariantId),
    [product, selectedVariantId],
  );

  const filteredVariants = useMemo(() => {
    const q = filter.trim().toLowerCase();
    if (!q) return product.variants;
    return product.variants.filter((v) => {
      const hay = [
        v.code,
        v.description,
        `${v.minimumOrderQuantity}`,
        ...v.dimensions.map((d) => `${d.label} ${d.value}`),
      ]
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    });
  }, [product.variants, filter]);

  const hasModelUrl = Boolean(product.threeDModelUrl);

  return (
    <div className="space-y-8">
      {/* ============================================================
          TOP SECTION — Visual & Summary (3-col grid).
          Cols 1-2: constrained 3D viewer (h-96 fixed). Col 3:
          parent product metadata + TDS download. The viewer container
          never expands beyond h-96 so the variant table below remains
          the page's primary read.
          ============================================================ */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
        {/* ---------------- Left (2/3): 3D viewer ---------------- */}
        <div className="md:col-span-2">
          {hasModelUrl ? (
            <div className="relative w-full h-96 border border-slate-300 rounded bg-slate-50 overflow-hidden">
              <Canvas camera={{ position: [0, 2, 5], fov: 50 }} dpr={[1, 2]}>
                {/* Studio lighting — keeps geometry off the black silhouette. */}
                <ambientLight intensity={0.6} />
                <directionalLight position={[10, 10, 10]} intensity={1.5} />
                <directionalLight position={[-10, -10, -10]} intensity={0.5} />
                <Suspense fallback={null}>
                  {/* Bounds auto-fits any geometry into view; Center
                      re-centers at origin. Variant-driven `scale` is
                      applied inside so selection still resizes the mesh
                      relative to the auto-fit baseline. */}
                  <Bounds fit clip observe margin={1.2}>
                    <Center>
                      <GltfMesh url={product.threeDModelUrl as string} scale={scale} />
                    </Center>
                  </Bounds>
                </Suspense>
                <OrbitControls makeDefault enableRotate enableZoom enablePan />
              </Canvas>
              <div className="pointer-events-none absolute left-3 top-3 rounded border border-slate-200 bg-white/90 px-2 py-1 text-[11px] font-bold uppercase tracking-wider text-[#1A202C]">
                Parametric scale: {scale.map((s) => s.toFixed(2)).join(" · ")}
              </div>
            </div>
          ) : (
            // No GLB attached yet — drop in the procedural demo viewer
            // bounded to the same h-96 frame.
            <div className="relative w-full h-96 border border-slate-300 rounded bg-slate-50 overflow-hidden p-2">
              <ProductViewer product={product} />
            </div>
          )}
        </div>

        {/* ---------------- Right (1/3): metadata + TDS ---------------- */}
        <aside className="md:col-span-1 flex flex-col gap-4 rounded border border-slate-300 bg-white p-5">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-[#4A5568]">
              Parent product
            </p>
            <h1 className="mt-1 text-2xl font-bold leading-tight text-[#1A202C]">
              {product.name}
            </h1>
          </div>

          <dl className="grid grid-cols-1 gap-2 text-sm">
            <div className="flex justify-between border-b border-slate-200 pb-1.5">
              <dt className="font-semibold text-[#4A5568]">Category</dt>
              <dd className="font-bold text-[#1A202C]">{product.category}</dd>
            </div>
            <div className="flex justify-between border-b border-slate-200 pb-1.5">
              <dt className="font-semibold text-[#4A5568]">Material</dt>
              <dd className="font-bold text-[#1A202C]">{product.material}</dd>
            </div>
            <div className="flex justify-between border-b border-slate-200 pb-1.5">
              <dt className="font-semibold text-[#4A5568]">Lead time</dt>
              <dd className="font-bold text-[#1A202C]">
                {product.standardLeadTimeDays} days
              </dd>
            </div>
            <div className="flex justify-between border-b border-slate-200 pb-1.5">
              <dt className="font-semibold text-[#4A5568]">Variants</dt>
              <dd className="font-bold text-[#1A202C]">{product.variants.length}</dd>
            </div>
          </dl>

          <p className="text-sm text-[#4A5568]">{product.summary}</p>

          <div className="mt-auto flex flex-col gap-2">
            <Link
              href={`/api/catalog/${product.slug}`}
              className="block w-full rounded bg-[#1A202C] px-3 py-2.5 text-center text-xs font-bold uppercase tracking-wide text-white hover:bg-[#2D3748]"
            >
              ↓ Download Technical Data Sheet (TDS)
            </Link>
            <Link
              href="/rfq"
              className="block w-full rounded bg-[#2F855A] px-3 py-2.5 text-center text-xs font-bold uppercase tracking-wide text-white hover:bg-[#276749]"
            >
              Request for Quote
            </Link>
          </div>
        </aside>
      </section>

      {/* ============================================================
          BOTTOM SECTION — Variant data table (dense, full width).
          Mirrors the catalog's PIM styling: native HTML <table>,
          border-collapse, text-sm, sticky header.
          ============================================================ */}
      <section className="overflow-hidden rounded border border-[#CBD5E0] bg-white">
        <header className="flex items-center gap-3 border-b border-[#CBD5E0] px-4 py-3">
          <div className="mr-auto">
            <p className="text-[11px] font-bold uppercase tracking-wider text-[#1A202C]">
              Variant dimensions
            </p>
            <p className="text-xs text-[#4A5568]">
              Click a row to drive the parametric 3D model. {filteredVariants.length} of{" "}
              {product.variants.length} variants.
            </p>
          </div>
          <input
            type="search"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Filter Part #, ID, OD, Hardness…"
            className="h-9 w-72 rounded border border-[#CBD5E0] px-3 text-sm focus:border-[#2F855A] focus:outline-none focus:ring-1 focus:ring-[#2F855A]"
          />
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value as Currency)}
            className="h-9 rounded border border-[#CBD5E0] bg-white px-2 text-sm font-bold"
          >
            {CURRENCIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </header>

        <div className="max-h-[60vh] overflow-auto">
          <table className="w-full border-collapse text-sm">
            <thead className="sticky top-0 z-10 bg-[#EDF2F7] text-[11px] font-bold uppercase tracking-wide text-[#1A202C]">
              <tr>
                <th className="border-b border-[#CBD5E0] p-2 text-left">SKU</th>
                <th className="border-b border-[#CBD5E0] p-2 text-left">Inner ⌀</th>
                <th className="border-b border-[#CBD5E0] p-2 text-left">Outer ⌀</th>
                <th className="border-b border-[#CBD5E0] p-2 text-left">Thickness</th>
                <th className="border-b border-[#CBD5E0] p-2 text-left">Hardness</th>
                <th className="border-b border-[#CBD5E0] p-2 text-right">MOQ</th>
                <th className="border-b border-[#CBD5E0] p-2 text-right">Base Price (USD)</th>
                <th className="border-b border-[#CBD5E0] p-2 text-right">Price ({currency})</th>
                <th className="border-b border-[#CBD5E0] p-2 text-left">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredVariants.length === 0 && (
                <tr>
                  <td colSpan={9} className="p-6 text-center text-sm text-[#4A5568]">
                    No variants match this filter.
                  </td>
                </tr>
              )}
              {filteredVariants.map((v) => {
                const selected = v.code === selectedVariantId;
                const usd = v.priceBook?.USD ?? 0;
                const inQuote = cart.has(v.code);
                return (
                  <tr
                    key={v.code}
                    onClick={() => setSelectedVariantId(v.code)}
                    className={
                      selected
                        ? "cursor-pointer border-b border-[#CBD5E0] bg-[#E6FFFA]"
                        : "cursor-pointer border-b border-[#CBD5E0] odd:bg-white even:bg-[#F7FAFC] hover:bg-[#EDF2F7]"
                    }
                  >
                    <td className="p-2 font-bold">
                      {selected && <span className="mr-1 text-[#2F855A]">●</span>}
                      {v.code}
                    </td>
                    <td className="p-2">{readDimension(v, ["inner", "id", "i.d"])}</td>
                    <td className="p-2">{readDimension(v, ["outer", "od", "o.d"])}</td>
                    <td className="p-2">{readDimension(v, ["thick", "cs", "cross"])}</td>
                    <td className="p-2">{readDimension(v, ["hardness", "shore", "durometer"])}</td>
                    <td className="p-2 text-right">{v.minimumOrderQuantity}</td>
                    <td className="p-2 text-right font-bold">
                      {usd > 0 ? `USD ${usd.toFixed(2)}` : "—"}
                    </td>
                    <td className="p-2 text-right font-bold">{formatPrice(usd, currency)}</td>
                    <td className="p-2">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (inQuote) {
                            cart.remove(v.code);
                          } else {
                            cart.add({
                              variantId: v.code,
                              sku: v.code,
                              name: `${product.name} — ${v.code}`,
                              basePriceUsd: usd > 0 ? usd : null,
                            });
                          }
                        }}
                        className={
                          inQuote
                            ? "rounded border border-[#2F855A] px-2 py-1 text-[11px] font-bold uppercase tracking-wide text-[#2F855A]"
                            : "rounded bg-[#2F855A] px-2 py-1 text-[11px] font-bold uppercase tracking-wide text-white hover:bg-[#276749]"
                        }
                      >
                        {inQuote ? "✓ In Quote" : "Add to Quote"}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

// Preload hook stays a no-op when no URL is configured — keeps useGLTF happy.
useGLTF.preload = useGLTF.preload ?? (() => {});
