import type { Metadata } from "next";
import { PimCatalog } from "@/components/pim-catalog";
import { products } from "@/lib/site-data";

export const metadata: Metadata = {
  title: "Product Catalog | RRM Industrial Rubber",
  description:
    "Industrial PIM catalog — filter by category, material, and application; scan SKUs, specs, and dimensions in a high-density data grid.",
};

// Full-screen industrial PIM. Renders OUTSIDE the marketing layout on purpose:
// the catalog is a dedicated workbench surface (sidebar + table), not a
// content page.
export default function ProductsPage() {
  return <PimCatalog products={products} />;
}
