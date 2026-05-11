import {
  buildSampleExtendedImportCsvText,
  extendedProductImportHeaders,
  ownerOnlyImportHeaders,
  productImportHeaders,
} from "@/lib/imports/csv";
import {
  customerSegments,
  getFeaturedProducts,
  getProductBySlug,
  industrySolutions,
  internalCostBuckets,
  keyCustomers,
  markets,
  ownerDashboard,
  ownerProductRecords,
  products,
  qualityPillars,
  recentRfqs,
  type Product,
  type ProductVariant,
} from "@/lib/site-data";
import { getLiveOwnerDashboardData } from "@/lib/owner-dashboard/service";

function formatMinimumOrderRange(product: Product) {
  const quantities = product.variants.map((variant) => variant.minimumOrderQuantity);
  const minimum = Math.min(...quantities);
  const maximum = Math.max(...quantities);

  return minimum === maximum ? `${minimum}` : `${minimum}-${maximum}`;
}

function serializeVariant(variant: ProductVariant) {
  const basePriceUsd = variant.priceBook?.USD ?? null;
  return {
    code: variant.code,
    // `code` is treated as the public SKU for the strict Parent-Child
    // variant model. Expose both keys so older Flutter builds keep working.
    sku: variant.code,
    description: variant.description,
    minimumOrderQuantity: variant.minimumOrderQuantity,
    currenciesTracked: variant.currenciesTracked,
    dimensions: variant.dimensions,
    // Engineer-facing JSONB-style flat bag. The strict B2B detail page reads
    // this for its high-density variant data table.
    dimensionsJson: Object.fromEntries(
      variant.dimensions.map((dimension) => [dimension.label, dimension.value]),
    ),
    priceBook: variant.priceBook,
    // Canonical USD price; clients convert dynamically based on a state toggle.
    basePriceUsd,
  };
}

function serializeProductSummary(product: Product) {
  return {
    slug: product.slug,
    name: product.name,
    category: product.category,
    material: product.material,
    summary: product.summary,
    description: product.description,
    applications: product.applications,
    industries: product.industries,
    features: product.features,
    certifications: product.certifications,
    standardLeadTimeDays: product.standardLeadTimeDays,
    featured: Boolean(product.featured),
    variantCount: product.variants.length,
    minimumOrderQuantityRange: formatMinimumOrderRange(product),
    supplyFormats: product.supplyFormats,
    variants: product.variants.map(serializeVariant),
    viewer: product.viewer,
  };
}

function serializeProductDetail(product: Product) {
  return {
    ...serializeProductSummary(product),
    description: product.description,
    technicalProfile: product.technicalProfile,
    supplyFormats: product.supplyFormats,
    qualityChecks: product.qualityChecks,
    variants: product.variants.map(serializeVariant),
  };
}

export function getPublicBootstrapPayload() {
  return {
    markets,
    qualityPillars,
    customerSegments,
    industrySolutions,
    featuredProducts: getFeaturedProducts().map(serializeProductSummary),
  };
}

export function getCatalogPayload() {
  return {
    products: products.map(serializeProductSummary),
  };
}

export function getProductDetailPayload(slug: string) {
  const product = getProductBySlug(slug);

  if (!product) {
    return null;
  }

  return {
    product: serializeProductDetail(product),
  };
}

export async function getOwnerDashboardPayload() {
  const fallbackSummary = {
    productFamilies: products.length,
    totalVariants: products.reduce((sum, product) => sum + product.variants.length, 0),
    totalRawMaterialLines: ownerProductRecords.reduce(
      (sum, record) => sum + record.rawMaterials.length,
      0,
    ),
    totalCompetitorBenchmarks: ownerProductRecords.reduce(
      (sum, record) => sum + record.competitorBenchmarks.length,
      0,
    ),
    monthlyInternalCosts: internalCostBuckets.reduce((sum, bucket) => sum + bucket.monthlyUsd, 0),
    catalogMode: "seeded",
    costMode: "seeded",
    importMode: "seeded",
    latestImportTitle: "Extended CSV import template ready",
    latestImportDetail:
      "The import helper now supports owner-only columns for sourcing, process records, QA, and competitor benchmarks.",
  };

  const fallbackPayload = {
    dashboard: ownerDashboard,
    recentRfqs,
    keyCustomers,
    internalCostBuckets,
    products: products.map(serializeProductDetail),
    ownerProductRecords,
    summary: fallbackSummary,
  };

  try {
    const liveDashboardData = await getLiveOwnerDashboardData(
      recentRfqs.length,
      keyCustomers.length,
    );

    if (!liveDashboardData) {
      return fallbackPayload;
    }

    return {
      ...fallbackPayload,
      dashboard: {
        pendingRfqs: liveDashboardData.hasCommercialData
          ? liveDashboardData.dashboard.pendingRfqs
          : ownerDashboard.pendingRfqs,
        activeCustomers: liveDashboardData.hasCommercialData
          ? liveDashboardData.dashboard.activeCustomers
          : ownerDashboard.activeCustomers,
        catalogedVariants: liveDashboardData.hasCatalogData
          ? liveDashboardData.dashboard.catalogedVariants
          : ownerDashboard.catalogedVariants,
        protectedManufacturingRecords: liveDashboardData.hasCatalogData
          ? liveDashboardData.dashboard.protectedManufacturingRecords
          : ownerDashboard.protectedManufacturingRecords,
      },
      recentRfqs: liveDashboardData.hasCommercialData
        ? liveDashboardData.recentRfqs
        : recentRfqs,
      keyCustomers: liveDashboardData.hasCommercialData
        ? liveDashboardData.keyCustomers
        : keyCustomers,
      internalCostBuckets: liveDashboardData.hasCostData
        ? liveDashboardData.internalCostBuckets
        : internalCostBuckets,
      summary: {
        productFamilies: liveDashboardData.hasCatalogData
          ? liveDashboardData.summary.productFamilies
          : fallbackSummary.productFamilies,
        totalVariants: liveDashboardData.hasCatalogData
          ? liveDashboardData.summary.totalVariants
          : fallbackSummary.totalVariants,
        totalRawMaterialLines: liveDashboardData.hasCatalogData
          ? liveDashboardData.summary.totalRawMaterialLines
          : fallbackSummary.totalRawMaterialLines,
        totalCompetitorBenchmarks: liveDashboardData.hasCatalogData
          ? liveDashboardData.summary.totalCompetitorBenchmarks
          : fallbackSummary.totalCompetitorBenchmarks,
        monthlyInternalCosts: liveDashboardData.hasCostData
          ? liveDashboardData.summary.monthlyInternalCosts
          : fallbackSummary.monthlyInternalCosts,
        catalogMode: liveDashboardData.hasCatalogData ? "live" : "seeded",
        costMode: liveDashboardData.hasCostData ? "live" : "seeded",
        importMode: liveDashboardData.hasImportData ? "live" : "seeded",
        latestImportTitle: liveDashboardData.hasImportData
          ? liveDashboardData.summary.latestImportTitle
          : fallbackSummary.latestImportTitle,
        latestImportDetail: liveDashboardData.hasImportData
          ? liveDashboardData.summary.latestImportDetail
          : fallbackSummary.latestImportDetail,
      },
    };
  } catch {
    return fallbackPayload;
  }
}

export function getImportMetaPayload() {
  return {
    sampleCsvText: buildSampleExtendedImportCsvText(),
    productImportHeaders,
    ownerOnlyImportHeaders,
    extendedProductImportHeaders,
    exportUrl: "/api/owner/imports/export",
  };
}