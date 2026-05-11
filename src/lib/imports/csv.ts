import { z } from "zod";
import type {
  CompetitorBenchmark,
  CurrencyCode,
  OwnerRawMaterial,
  Product,
  ProductDimension,
  ProductOwnerRecord,
  ProductVariant,
} from "@/lib/site-data";
import { ownerProductRecords, products } from "@/lib/site-data";

const productImportRowSchema = z.object({
  slug: z.string().trim().min(1, "Slug is required."),
  productName: z.string().trim().min(1, "Product name is required."),
  category: z.string().trim().min(1, "Category is required."),
  material: z.string().trim().min(1, "Material is required."),
  summary: z.string().trim().min(1, "Summary is required."),
  description: z.string().trim().min(1, "Description is required."),
  applications: z.string().trim().default(""),
  industries: z.string().trim().default(""),
  features: z.string().trim().default(""),
  variantCode: z.string().trim().min(1, "Variant code is required."),
  variantDescription: z.string().trim().min(1, "Variant description is required."),
  minimumOrderQuantity: z.string().trim().min(1, "MOQ is required."),
  dimensions: z.string().trim().min(1, "Dimensions are required."),
  aed: z.string().trim().optional().default(""),
  sar: z.string().trim().optional().default(""),
  omr: z.string().trim().optional().default(""),
  qar: z.string().trim().optional().default(""),
  usd: z.string().trim().optional().default(""),
});

const extendedProductImportRowSchema = productImportRowSchema.extend({
  certifications: z.string().trim().optional().default(""),
  technicalProfile: z.string().trim().optional().default(""),
  supplyFormats: z.string().trim().optional().default(""),
  qualityChecks: z.string().trim().optional().default(""),
  priceBookNotes: z.string().trim().optional().default(""),
  sourcingNotes: z.string().trim().optional().default(""),
  rawMaterials: z.string().trim().optional().default(""),
  processCompoundCode: z.string().trim().optional().default(""),
  cureSystem: z.string().trim().optional().default(""),
  batchSizeKg: z.string().trim().optional().default(""),
  monthlyOutputKg: z.string().trim().optional().default(""),
  scrapRate: z.string().trim().optional().default(""),
  qaChecks: z.string().trim().optional().default(""),
  competitorBenchmarks: z.string().trim().optional().default(""),
});

export type ProductImportInput = z.input<typeof productImportRowSchema>;
export type ExtendedProductImportInput = z.input<typeof extendedProductImportRowSchema>;

export type NormalizedProductImport = {
  slug: string;
  product: {
    name: string;
    category: string;
    material: string;
    summary: string;
    description: string;
    applications: string[];
    industries: string[];
    features: string[];
  };
  variant: {
    code: string;
    description: string;
    minimumOrderQuantity: number;
    dimensions: ProductDimension[];
  };
  priceBook: Partial<Record<CurrencyCode, number>>;
};

export type NormalizedExtendedProductImport = NormalizedProductImport & {
  product: NormalizedProductImport["product"] & {
    certifications: string[];
    technicalProfile: ProductDimension[];
    supplyFormats: string[];
    qualityChecks: string[];
  };
  owner: {
    priceBookNotes: string;
    sourcingNotes: string[];
    rawMaterials: OwnerRawMaterial[];
    process: {
      compoundCode: string;
      cureSystem: string;
      batchSizeKg?: number;
      monthlyOutputKg?: number;
      scrapRate: string;
      qaChecks: string[];
    };
    competitorBenchmarks: CompetitorBenchmark[];
  };
};

export const productImportHeaders = [
  "slug",
  "productName",
  "category",
  "material",
  "summary",
  "description",
  "applications",
  "industries",
  "features",
  "variantCode",
  "variantDescription",
  "minimumOrderQuantity",
  "dimensions",
  "aed",
  "sar",
  "omr",
  "qar",
  "usd",
] as const;

export const ownerOnlyImportHeaders = [
  "certifications",
  "technicalProfile",
  "supplyFormats",
  "qualityChecks",
  "priceBookNotes",
  "sourcingNotes",
  "rawMaterials",
  "processCompoundCode",
  "cureSystem",
  "batchSizeKg",
  "monthlyOutputKg",
  "scrapRate",
  "qaChecks",
  "competitorBenchmarks",
] as const;

export const extendedProductImportHeaders = [
  ...productImportHeaders,
  ...ownerOnlyImportHeaders,
] as const;

const supportedCurrencies: CurrencyCode[] = ["AED", "SAR", "OMR", "QAR", "USD"];

export const sampleExtendedProductImportRow = {
  slug: "epdm-door-sealing-profile",
  productName: "EPDM Door Sealing Profile",
  category: "Extrusion Profiles",
  material: "EPDM",
  summary: "Automotive and transport sealing profile for doors, trunk lines, and access panels.",
  description:
    "A dimension-aware EPDM profile family built for automotive weather sealing, dust resistance, and long service life under outdoor exposure.",
  applications: "Passenger vehicles;Commercial vans;Access panels",
  industries: "Automotive;Fleet service;Industrial enclosures",
  features: "Multi-durometer compatible;Weather resistant;Repeatable extrusion profile",
  variantCode: "RRM-EPDM-DSP-18",
  variantDescription: "Compact perimeter seal for narrow channel fitment.",
  minimumOrderQuantity: "600",
  dimensions: "Width:18 mm|Height:14 mm|Hardness:65 Shore A",
  aed: "12.4",
  sar: "12.7",
  omr: "1.31",
  qar: "12.2",
  usd: "3.37",
  certifications: "Automotive trim fit;UV-ready compound;Dust and splash sealing",
  technicalProfile:
    "Operating range:-40C to 120C|Specific gravity:1.18 +/- 0.05|Tensile strength:11 MPa",
  supplyFormats: "25 m coils;50 m export cartons;Cut-to-length kits",
  qualityChecks:
    "Laser profile gauge verification;Compression set sampling;Surface crack and splice inspection",
  priceBookNotes:
    "Owner price book keeps a 22% margin floor and applies GCC freight adjustments separately for UAE, Saudi Arabia, Oman, and Qatar.",
  sourcingNotes:
    "Primary EPDM polymer is sourced on a 21-day import cycle through Jebel Ali consolidation.;Carbon black and zinc oxide have alternate local distributors to reduce shipment delays during peak season.",
  rawMaterials:
    "EPDM base polymer~46%~Desert Polymer Trading~South Korea~Direct import~2.48~21|Carbon black N550~22%~BlackFill Middle East~India~Regional distributor~1.18~11",
  processCompoundCode: "EPDM-742A",
  cureSystem: "Peroxide cure extrusion",
  batchSizeKg: "180",
  monthlyOutputKg: "6400",
  scrapRate: "3.4%",
  qaChecks:
    "Cross-section gauge every 500 m;Compression set sample each batch;UV chamber control sample weekly",
  competitorBenchmarks:
    "GulfSeal Profiles~UAE~AED~14.2~Comparable 18 mm perimeter seal sold in mixed carton batches.|Riyadh Elastomer Works~Saudi Arabia~SAR~18.1~Quoted for a wider automotive profile with color marking.",
} as const;

export function escapeCsvValue(value: string) {
  if (value.includes(",") || value.includes("\n") || value.includes('"')) {
    return `"${value.replaceAll('"', '""')}"`;
  }

  return value;
}

export function buildCsvTextFromRows(rows: Array<Record<string, unknown>>) {
  return [
    extendedProductImportHeaders.join(","),
    ...rows.map((row) =>
      extendedProductImportHeaders
        .map((header) => escapeCsvValue(String(row[header] ?? "")))
        .join(","),
    ),
  ].join("\n");
}

export function buildSampleExtendedImportCsvText() {
  return buildCsvTextFromRows([sampleExtendedProductImportRow]);
}

function serializeList(values: string[]) {
  return values.join(";");
}

function serializeDimensions(values: ProductDimension[]) {
  return values.map((value) => `${value.label}:${value.value}`).join("|");
}

function serializeRawMaterials(values: OwnerRawMaterial[]) {
  return values
    .map(
      (value) =>
        `${value.name}~${value.percentage}~${value.supplier}~${value.origin}~${value.sourceType}~${value.landedCostUsdPerKg}~${value.leadTimeDays}`,
    )
    .join("|");
}

function serializeCompetitorBenchmarks(values: CompetitorBenchmark[]) {
  return values
    .map(
      (value) =>
        `${value.competitor}~${value.market}~${value.currency}~${value.unitPrice}~${value.note}`,
    )
    .join("|");
}

function buildExtendedImportRowFromCatalog(
  product: Product,
  variant: ProductVariant,
  ownerRecord?: ProductOwnerRecord,
) {
  return {
    slug: product.slug,
    productName: product.name,
    category: product.category,
    material: product.material,
    summary: product.summary,
    description: product.description,
    applications: serializeList(product.applications),
    industries: serializeList(product.industries),
    features: serializeList(product.features),
    variantCode: variant.code,
    variantDescription: variant.description,
    minimumOrderQuantity: String(variant.minimumOrderQuantity),
    dimensions: serializeDimensions(variant.dimensions),
    aed: String(variant.priceBook.AED ?? ""),
    sar: String(variant.priceBook.SAR ?? ""),
    omr: String(variant.priceBook.OMR ?? ""),
    qar: String(variant.priceBook.QAR ?? ""),
    usd: String(variant.priceBook.USD ?? ""),
    certifications: serializeList(product.certifications),
    technicalProfile: serializeDimensions(product.technicalProfile),
    supplyFormats: serializeList(product.supplyFormats),
    qualityChecks: serializeList(product.qualityChecks),
    priceBookNotes: ownerRecord?.priceBookNotes ?? "",
    sourcingNotes: serializeList(ownerRecord?.sourcingNotes ?? []),
    rawMaterials: serializeRawMaterials(ownerRecord?.rawMaterials ?? []),
    processCompoundCode: ownerRecord?.process.compoundCode ?? "",
    cureSystem: ownerRecord?.process.cureSystem ?? "",
    batchSizeKg: String(ownerRecord?.process.batchSizeKg ?? ""),
    monthlyOutputKg: String(ownerRecord?.process.monthlyOutputKg ?? ""),
    scrapRate: ownerRecord?.process.scrapRate ?? "",
    qaChecks: serializeList(ownerRecord?.process.qaChecks ?? []),
    competitorBenchmarks: serializeCompetitorBenchmarks(
      ownerRecord?.competitorBenchmarks ?? [],
    ),
  };
}

export function buildCatalogExtendedImportRows() {
  return products.flatMap((product) => {
    const ownerRecord = ownerProductRecords.find((record) => record.slug === product.slug);

    return product.variants.map((variant) =>
      buildExtendedImportRowFromCatalog(product, variant, ownerRecord),
    );
  });
}

export function buildCatalogExtendedImportCsvText() {
  return buildCsvTextFromRows(buildCatalogExtendedImportRows());
}

function normalizeText(value: unknown) {
  if (typeof value === "string") {
    return value;
  }

  if (value === null || value === undefined) {
    return "";
  }

  return String(value);
}

function parseList(value: string) {
  return value
    .split(/[;,|]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function parseDimensions(value: string) {
  return value
    .split("|")
    .map((entry) => entry.trim())
    .filter(Boolean)
    .map((entry) => {
      const separatorIndex = entry.indexOf(":");

      if (separatorIndex === -1) {
        throw new Error(`Dimension entry must use label:value format. Received '${entry}'.`);
      }

      return {
        label: entry.slice(0, separatorIndex).trim(),
        value: entry.slice(separatorIndex + 1).trim(),
      };
    });
}

function parseNumber(value: string, label: string) {
  const parsed = Number(value);

  if (Number.isNaN(parsed)) {
    throw new Error(`${label} must be numeric. Received '${value}'.`);
  }

  return parsed;
}

function parseOptionalPrice(value: string, currency: CurrencyCode) {
  if (!value) {
    return undefined;
  }

  return parseNumber(value, `${currency} price`);
}

function parseOptionalNumber(value: string, label: string) {
  if (!value) {
    return undefined;
  }

  return parseNumber(value, label);
}

function parseRawMaterials(value: string): OwnerRawMaterial[] {
  if (!value.trim()) {
    return [];
  }

  return value
    .split("|")
    .map((entry) => entry.trim())
    .filter(Boolean)
    .map((entry) => {
      const parts = entry.split("~").map((part) => part.trim());

      if (parts.length !== 7) {
        throw new Error(
          `Raw material entries must use name~percentage~supplier~origin~sourceType~cost~leadTime format. Received '${entry}'.`,
        );
      }

      const [name, percentage, supplier, origin, sourceType, cost, leadTime] = parts;

      return {
        name,
        percentage,
        supplier,
        origin,
        sourceType,
        landedCostUsdPerKg: parseNumber(cost, `${name} landed cost`),
        leadTimeDays: parseNumber(leadTime, `${name} lead time`),
      };
    });
}

function parseCompetitorBenchmarks(value: string): CompetitorBenchmark[] {
  if (!value.trim()) {
    return [];
  }

  return value
    .split("|")
    .map((entry) => entry.trim())
    .filter(Boolean)
    .map((entry) => {
      const parts = entry.split("~").map((part) => part.trim());

      if (parts.length !== 5) {
        throw new Error(
          `Competitor entries must use competitor~market~currency~price~note format. Received '${entry}'.`,
        );
      }

      const [competitor, market, currencyInput, price, note] = parts;
      const currency = currencyInput.toUpperCase() as CurrencyCode;

      if (!supportedCurrencies.includes(currency)) {
        throw new Error(`Unsupported competitor currency '${currencyInput}'.`);
      }

      return {
        competitor,
        market,
        currency,
        unitPrice: parseNumber(price, `${competitor} benchmark price`),
        note,
      };
    });
}

export function normalizeProductImportRow(row: Record<string, unknown>): NormalizedProductImport {
  const parsed = productImportRowSchema.parse({
    slug: normalizeText(row.slug),
    productName: normalizeText(row.productName),
    category: normalizeText(row.category),
    material: normalizeText(row.material),
    summary: normalizeText(row.summary),
    description: normalizeText(row.description),
    applications: normalizeText(row.applications),
    industries: normalizeText(row.industries),
    features: normalizeText(row.features),
    variantCode: normalizeText(row.variantCode),
    variantDescription: normalizeText(row.variantDescription),
    minimumOrderQuantity: normalizeText(row.minimumOrderQuantity),
    dimensions: normalizeText(row.dimensions),
    aed: normalizeText(row.aed),
    sar: normalizeText(row.sar),
    omr: normalizeText(row.omr),
    qar: normalizeText(row.qar),
    usd: normalizeText(row.usd),
  });

  return {
    slug: parsed.slug.trim().toLowerCase(),
    product: {
      name: parsed.productName.trim(),
      category: parsed.category.trim(),
      material: parsed.material.trim(),
      summary: parsed.summary.trim(),
      description: parsed.description.trim(),
      applications: parseList(parsed.applications),
      industries: parseList(parsed.industries),
      features: parseList(parsed.features),
    },
    variant: {
      code: parsed.variantCode.trim(),
      description: parsed.variantDescription.trim(),
      minimumOrderQuantity: parseNumber(parsed.minimumOrderQuantity, "Minimum order quantity"),
      dimensions: parseDimensions(parsed.dimensions),
    },
    priceBook: {
      AED: parseOptionalPrice(parsed.aed, "AED"),
      SAR: parseOptionalPrice(parsed.sar, "SAR"),
      OMR: parseOptionalPrice(parsed.omr, "OMR"),
      QAR: parseOptionalPrice(parsed.qar, "QAR"),
      USD: parseOptionalPrice(parsed.usd, "USD"),
    },
  };
}

export function normalizeProductImportRows(rows: Record<string, unknown>[]) {
  return rows.map((row) => normalizeProductImportRow(row));
}

export function normalizeExtendedProductImportRow(
  row: Record<string, unknown>,
): NormalizedExtendedProductImport {
  const parsed = extendedProductImportRowSchema.parse({
    slug: normalizeText(row.slug),
    productName: normalizeText(row.productName),
    category: normalizeText(row.category),
    material: normalizeText(row.material),
    summary: normalizeText(row.summary),
    description: normalizeText(row.description),
    applications: normalizeText(row.applications),
    industries: normalizeText(row.industries),
    features: normalizeText(row.features),
    variantCode: normalizeText(row.variantCode),
    variantDescription: normalizeText(row.variantDescription),
    minimumOrderQuantity: normalizeText(row.minimumOrderQuantity),
    dimensions: normalizeText(row.dimensions),
    aed: normalizeText(row.aed),
    sar: normalizeText(row.sar),
    omr: normalizeText(row.omr),
    qar: normalizeText(row.qar),
    usd: normalizeText(row.usd),
    certifications: normalizeText(row.certifications),
    technicalProfile: normalizeText(row.technicalProfile),
    supplyFormats: normalizeText(row.supplyFormats),
    qualityChecks: normalizeText(row.qualityChecks),
    priceBookNotes: normalizeText(row.priceBookNotes),
    sourcingNotes: normalizeText(row.sourcingNotes),
    rawMaterials: normalizeText(row.rawMaterials),
    processCompoundCode: normalizeText(row.processCompoundCode),
    cureSystem: normalizeText(row.cureSystem),
    batchSizeKg: normalizeText(row.batchSizeKg),
    monthlyOutputKg: normalizeText(row.monthlyOutputKg),
    scrapRate: normalizeText(row.scrapRate),
    qaChecks: normalizeText(row.qaChecks),
    competitorBenchmarks: normalizeText(row.competitorBenchmarks),
  });

  return {
    slug: parsed.slug.trim().toLowerCase(),
    product: {
      name: parsed.productName.trim(),
      category: parsed.category.trim(),
      material: parsed.material.trim(),
      summary: parsed.summary.trim(),
      description: parsed.description.trim(),
      applications: parseList(parsed.applications),
      industries: parseList(parsed.industries),
      features: parseList(parsed.features),
      certifications: parseList(parsed.certifications),
      technicalProfile: parseDimensions(parsed.technicalProfile),
      supplyFormats: parseList(parsed.supplyFormats),
      qualityChecks: parseList(parsed.qualityChecks),
    },
    variant: {
      code: parsed.variantCode.trim(),
      description: parsed.variantDescription.trim(),
      minimumOrderQuantity: parseNumber(parsed.minimumOrderQuantity, "Minimum order quantity"),
      dimensions: parseDimensions(parsed.dimensions),
    },
    priceBook: {
      AED: parseOptionalPrice(parsed.aed, "AED"),
      SAR: parseOptionalPrice(parsed.sar, "SAR"),
      OMR: parseOptionalPrice(parsed.omr, "OMR"),
      QAR: parseOptionalPrice(parsed.qar, "QAR"),
      USD: parseOptionalPrice(parsed.usd, "USD"),
    },
    owner: {
      priceBookNotes: parsed.priceBookNotes.trim(),
      sourcingNotes: parseList(parsed.sourcingNotes),
      rawMaterials: parseRawMaterials(parsed.rawMaterials),
      process: {
        compoundCode: parsed.processCompoundCode.trim(),
        cureSystem: parsed.cureSystem.trim(),
        batchSizeKg: parseOptionalNumber(parsed.batchSizeKg, "Batch size"),
        monthlyOutputKg: parseOptionalNumber(parsed.monthlyOutputKg, "Monthly output"),
        scrapRate: parsed.scrapRate.trim(),
        qaChecks: parseList(parsed.qaChecks),
      },
      competitorBenchmarks: parseCompetitorBenchmarks(parsed.competitorBenchmarks),
    },
  };
}

export function normalizeExtendedProductImportRows(rows: Record<string, unknown>[]) {
  return rows.map((row) => normalizeExtendedProductImportRow(row));
}