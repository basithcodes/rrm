// Server-only PDF generator for the formal RFQ document.
// Uses @react-pdf/renderer's `renderToBuffer` so we can stream the result
// back through a Next.js route handler without writing to disk.

import {
  Document,
  Page,
  StyleSheet,
  Text,
  View,
  renderToBuffer,
} from "@react-pdf/renderer";
import * as React from "react";

export type RfqPdfPayload = {
  rfqId: string;
  createdAt: Date;
  customer: {
    companyName: string;
    contactName: string;
    email: string;
    phone?: string;
    deliveryPort: string;
    market: string;
    notes?: string;
  };
  items: Array<{
    sku: string;
    name: string;
    quantity: number;
    basePriceUsd: number | null;
  }>;
};

const styles = StyleSheet.create({
  page: { padding: 40, fontSize: 10, fontFamily: "Helvetica", color: "#1A202C" },
  brandRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    borderBottomWidth: 2,
    borderBottomColor: "#2F855A",
    paddingBottom: 12,
    marginBottom: 16,
  },
  brand: { fontSize: 18, fontWeight: 700, color: "#1A202C" },
  brandSub: { fontSize: 9, color: "#4A5568", marginTop: 2 },
  meta: { fontSize: 9, color: "#4A5568", textAlign: "right" },
  metaStrong: { fontSize: 11, fontWeight: 700, color: "#1A202C" },
  sectionTitle: {
    fontSize: 11,
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 6,
    color: "#1A202C",
  },
  customerCard: {
    flexDirection: "row",
    flexWrap: "wrap",
    borderWidth: 1,
    borderColor: "#CBD5E0",
    padding: 10,
    marginBottom: 18,
  },
  customerCol: { width: "50%", marginBottom: 6 },
  fieldLabel: { fontSize: 8, color: "#4A5568", textTransform: "uppercase" },
  fieldValue: { fontSize: 10.5, fontWeight: 700, color: "#1A202C" },
  table: { borderWidth: 1, borderColor: "#CBD5E0" },
  tableRow: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: "#CBD5E0" },
  tableHeader: { backgroundColor: "#EDF2F7", fontWeight: 700, fontSize: 9 },
  cell: { padding: 6 },
  colSku: { width: "20%" },
  colName: { width: "44%" },
  colQty: { width: "12%", textAlign: "right" },
  colUnit: { width: "12%", textAlign: "right" },
  colTotal: { width: "12%", textAlign: "right" },
  totalRow: { flexDirection: "row", marginTop: 14, justifyContent: "flex-end" },
  totalLabel: { fontSize: 11, color: "#4A5568", marginRight: 12 },
  totalValue: { fontSize: 13, fontWeight: 700, color: "#1A202C" },
  footer: {
    marginTop: 24,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#CBD5E0",
    fontSize: 8,
    color: "#4A5568",
  },
});

function fmtUsd(value: number | null): string {
  if (value == null || !Number.isFinite(value) || value <= 0) return "—";
  return `USD ${value.toFixed(2)}`;
}

function RfqDocument({ payload }: { payload: RfqPdfPayload }) {
  const subtotal = payload.items.reduce(
    (sum, item) => sum + (item.basePriceUsd ?? 0) * item.quantity,
    0,
  );

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.brandRow}>
          <View>
            <Text style={styles.brand}>RRM Industrial Rubber</Text>
            <Text style={styles.brandSub}>Industrial elastomer solutions · GCC region</Text>
          </View>
          <View>
            <Text style={styles.metaStrong}>Request for Quote</Text>
            <Text style={styles.meta}>RFQ #{payload.rfqId}</Text>
            <Text style={styles.meta}>
              {payload.createdAt.toISOString().slice(0, 10)}
            </Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Customer</Text>
        <View style={styles.customerCard}>
          <View style={styles.customerCol}>
            <Text style={styles.fieldLabel}>Company</Text>
            <Text style={styles.fieldValue}>{payload.customer.companyName}</Text>
          </View>
          <View style={styles.customerCol}>
            <Text style={styles.fieldLabel}>Contact</Text>
            <Text style={styles.fieldValue}>{payload.customer.contactName}</Text>
          </View>
          <View style={styles.customerCol}>
            <Text style={styles.fieldLabel}>Email</Text>
            <Text style={styles.fieldValue}>{payload.customer.email}</Text>
          </View>
          <View style={styles.customerCol}>
            <Text style={styles.fieldLabel}>Phone</Text>
            <Text style={styles.fieldValue}>{payload.customer.phone || "—"}</Text>
          </View>
          <View style={styles.customerCol}>
            <Text style={styles.fieldLabel}>Delivery port</Text>
            <Text style={styles.fieldValue}>{payload.customer.deliveryPort}</Text>
          </View>
          <View style={styles.customerCol}>
            <Text style={styles.fieldLabel}>Market</Text>
            <Text style={styles.fieldValue}>{payload.customer.market}</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Requested items</Text>
        <View style={styles.table}>
          <View style={[styles.tableRow, styles.tableHeader]}>
            <Text style={[styles.cell, styles.colSku]}>SKU</Text>
            <Text style={[styles.cell, styles.colName]}>Product</Text>
            <Text style={[styles.cell, styles.colQty]}>Qty</Text>
            <Text style={[styles.cell, styles.colUnit]}>Unit (USD)</Text>
            <Text style={[styles.cell, styles.colTotal]}>Line (USD)</Text>
          </View>
          {payload.items.map((item) => {
            const line =
              item.basePriceUsd != null ? item.basePriceUsd * item.quantity : null;
            return (
              <View key={item.sku} style={styles.tableRow}>
                <Text style={[styles.cell, styles.colSku]}>{item.sku}</Text>
                <Text style={[styles.cell, styles.colName]}>{item.name}</Text>
                <Text style={[styles.cell, styles.colQty]}>{item.quantity}</Text>
                <Text style={[styles.cell, styles.colUnit]}>
                  {fmtUsd(item.basePriceUsd)}
                </Text>
                <Text style={[styles.cell, styles.colTotal]}>{fmtUsd(line)}</Text>
              </View>
            );
          })}
        </View>

        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Estimated subtotal</Text>
          <Text style={styles.totalValue}>{fmtUsd(subtotal)}</Text>
        </View>

        {payload.customer.notes ? (
          <View style={{ marginTop: 18 }}>
            <Text style={styles.sectionTitle}>Notes</Text>
            <Text>{payload.customer.notes}</Text>
          </View>
        ) : null}

        <Text style={styles.footer}>
          This document is a request for a formal quote, not a binding offer. Final pricing,
          MOQs, lead times, and Incoterms will be confirmed by RRM Industrial Rubber sales
          within two business days.
        </Text>
      </Page>
    </Document>
  );
}

export async function renderRfqPdf(payload: RfqPdfPayload): Promise<Buffer> {
  return renderToBuffer(<RfqDocument payload={payload} />);
}
