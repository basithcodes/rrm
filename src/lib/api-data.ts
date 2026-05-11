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
import { getLiveRfqDashboardData } from "@/lib/rfqs/service";

function formatMinimumOrderRange(product: Product) {
  const quantities = product.variants.map((variant) => variant.minimumOrderQuantity);
  const minimum = Math.min(...quantities);
  const maximum = Math.max(...quantities);

  return minimum === maximum ? `${minimum}` : `${minimum}-${maximum}`;
}

function serializeVariant(variant: ProductVariant) {
  return {
    code: variant.code,
    description: variant.description,
    minimumOrderQuantity: variant.minimumOrderQuantity,
    currenciesTracked: variant.currenciesTracked,
    dimensions: variant.dimensions,
    priceBook: variant.priceBook,
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
  const fallbackPayload = {
    dashboard: ownerDashboard,
    recentRfqs,
    keyCustomers,
    internalCostBuckets,
    products: products.map(serializeProductDetail),
    ownerProductRecords,
  };

  try {
    const liveRfqData = await getLiveRfqDashboardData(recentRfqs.length);

    if (liveRfqData.pendingRfqs === 0 && liveRfqData.recentRfqs.length === 0) {
      return fallbackPayload;
    }

    return {
      ...fallbackPayload,
      dashboard: {
        ...ownerDashboard,
        pendingRfqs: ownerDashboard.pendingRfqs + liveRfqData.pendingRfqs,
      },
      recentRfqs: [...liveRfqData.recentRfqs, ...recentRfqs].slice(0, recentRfqs.length),
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