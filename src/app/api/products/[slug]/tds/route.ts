import { NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import React from "react";
import { getProductBySlug } from "@/lib/site-data";

// =====================================================================
// Technical Data Sheet (TDS) — placeholder generator
// ---------------------------------------------------------------------
// Produces a single-page A4 PDF for a parent product. It carries the
// material, category, lead time, certifications, and a short variant
// table so the asset reads like a real engineering hand-off until the
// final TDS template lands.
// =====================================================================

export const dynamic = "force-dynamic";

const styles = StyleSheet.create({
  page: { padding: 36, fontSize: 10, fontFamily: "Helvetica", color: "#1A202C" },
  header: { borderBottom: "2 solid #1A202C", paddingBottom: 8, marginBottom: 12 },
  brand: { fontSize: 10, letterSpacing: 2, color: "#2F855A", fontFamily: "Helvetica-Bold" },
  title: { fontSize: 18, marginTop: 4, fontFamily: "Helvetica-Bold" },
  subtitle: { fontSize: 9, color: "#4A5568", marginTop: 2 },
  sectionLabel: {
    fontSize: 9,
    letterSpacing: 1.5,
    color: "#4A5568",
    fontFamily: "Helvetica-Bold",
    marginTop: 14,
    marginBottom: 4,
  },
  paragraph: { lineHeight: 1.4 },
  metaRow: { flexDirection: "row", borderBottom: "1 solid #CBD5E0", paddingVertical: 3 },
  metaKey: { width: "30%", color: "#4A5568", fontFamily: "Helvetica-Bold" },
  metaVal: { width: "70%" },
  tableHead: {
    flexDirection: "row",
    backgroundColor: "#EDF2F7",
    paddingVertical: 4,
    paddingHorizontal: 4,
    borderBottom: "1 solid #CBD5E0",
    fontFamily: "Helvetica-Bold",
  },
  tableRow: {
    flexDirection: "row",
    borderBottom: "1 solid #EDF2F7",
    paddingVertical: 3,
    paddingHorizontal: 4,
  },
  cellSku: { width: "20%", fontFamily: "Helvetica-Bold" },
  cellDim: { width: "45%" },
  cellMoq: { width: "15%", textAlign: "right" },
  cellPrice: { width: "20%", textAlign: "right" },
  footer: {
    position: "absolute",
    bottom: 24,
    left: 36,
    right: 36,
    fontSize: 8,
    color: "#718096",
    borderTop: "1 solid #CBD5E0",
    paddingTop: 6,
  },
});

const USD_TO_AED = 3.6725;

function dimensionSummary(dimensions: { label: string; value: string }[]) {
  return dimensions.map((dim) => `${dim.label} ${dim.value}`).join("  ·  ");
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ slug: string }> },
) {
  const { slug } = await context.params;
  const product = getProductBySlug(slug);

  if (!product) {
    return NextResponse.json({ error: "product_not_found" }, { status: 404 });
  }

  const document = React.createElement(
    Document,
    null,
    React.createElement(
      Page,
      { size: "A4", style: styles.page },
      // ── Header ────────────────────────────────────────────────
      React.createElement(
        View,
        { style: styles.header },
        React.createElement(Text, { style: styles.brand }, "RRM INDUSTRIAL · TECHNICAL DATA SHEET"),
        React.createElement(Text, { style: styles.title }, product.name),
        React.createElement(
          Text,
          { style: styles.subtitle },
          `${product.category} · ${product.material} · ${product.variants.length} catalogued variants`,
        ),
      ),
      // ── Summary ───────────────────────────────────────────────
      React.createElement(Text, { style: styles.sectionLabel }, "OVERVIEW"),
      React.createElement(Text, { style: styles.paragraph }, product.summary),
      // ── Metadata ──────────────────────────────────────────────
      React.createElement(Text, { style: styles.sectionLabel }, "PRODUCT METADATA"),
      ...[
        ["Category", product.category],
        ["Material", product.material],
        ["Standard lead time", `${product.standardLeadTimeDays} days`],
        ["Applications", product.applications.join(", ") || "—"],
        ["Industries", product.industries.join(", ") || "—"],
        ["Certifications", product.certifications.join(", ") || "—"],
        ["Supply formats", product.supplyFormats.join(", ") || "—"],
      ].map(([key, value]) =>
        React.createElement(
          View,
          { style: styles.metaRow, key: String(key) },
          React.createElement(Text, { style: styles.metaKey }, String(key)),
          React.createElement(Text, { style: styles.metaVal }, String(value)),
        ),
      ),
      // ── Variant table ─────────────────────────────────────────
      React.createElement(Text, { style: styles.sectionLabel }, "VARIANT SCHEDULE"),
      React.createElement(
        View,
        { style: styles.tableHead },
        React.createElement(Text, { style: styles.cellSku }, "SKU"),
        React.createElement(Text, { style: styles.cellDim }, "Dimensions"),
        React.createElement(Text, { style: styles.cellMoq }, "MOQ"),
        React.createElement(Text, { style: styles.cellPrice }, "AED / unit"),
      ),
      ...product.variants.map((variant) => {
        const usd = variant.priceBook?.USD ?? 0;
        const aed = usd > 0 ? `AED ${(usd * USD_TO_AED).toFixed(2)}` : "—";
        return React.createElement(
          View,
          { style: styles.tableRow, key: variant.code },
          React.createElement(Text, { style: styles.cellSku }, variant.code),
          React.createElement(Text, { style: styles.cellDim }, dimensionSummary(variant.dimensions)),
          React.createElement(Text, { style: styles.cellMoq }, String(variant.minimumOrderQuantity)),
          React.createElement(Text, { style: styles.cellPrice }, aed),
        );
      }),
      // ── Footer ────────────────────────────────────────────────
      React.createElement(
        Text,
        { style: styles.footer, fixed: true },
        `Issued by RRM Industrial · GCC supply (UAE · KSA · OMN · QAT) · Generated ${new Date().toISOString().slice(0, 10)} · Reference TDS/${product.slug.toUpperCase()}`,
      ),
    ),
  );

  const buffer = await renderToBuffer(document);
  return new NextResponse(new Uint8Array(buffer), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="RRM-TDS-${product.slug}.pdf"`,
      "Cache-Control": "no-store",
    },
  });
}
