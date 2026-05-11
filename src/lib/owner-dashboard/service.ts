import {
  CostBucketType,
  CustomerSegment,
  ImportBatchStatus,
  InquiryStatus,
  type MarketCode,
} from "@prisma/client";
import { getPrismaClient, isDatabaseConfigured } from "@/lib/prisma";
import { getLiveRfqDashboardData, type OwnerRfqSnapshot } from "@/lib/rfqs/service";

export type OwnerCustomerSnapshot = {
  company: string;
  segment: string;
  market: string;
  demand: string;
  relationship: string;
};

export type OwnerInternalCostBucketSnapshot = {
  title: string;
  monthlyUsd: number;
  note: string;
  costCenter: string;
  allocationBasis: string;
};

export type OwnerWorkspaceSummary = {
  productFamilies: number;
  totalVariants: number;
  totalRawMaterialLines: number;
  totalCompetitorBenchmarks: number;
  monthlyInternalCosts: number;
  latestImportTitle: string;
  latestImportDetail: string;
};

export type LiveOwnerDashboardData = {
  hasCommercialData: boolean;
  hasCatalogData: boolean;
  hasCostData: boolean;
  hasImportData: boolean;
  dashboard: {
    pendingRfqs: number;
    activeCustomers: number;
    catalogedVariants: number;
    protectedManufacturingRecords: number;
  };
  recentRfqs: OwnerRfqSnapshot[];
  keyCustomers: OwnerCustomerSnapshot[];
  internalCostBuckets: OwnerInternalCostBucketSnapshot[];
  summary: OwnerWorkspaceSummary;
};

const requestedQuantityPrefix = "Requested quantity text:";

function formatMarketLabel(market: MarketCode) {
  switch (market) {
    case "UAE":
      return "UAE";
    case "SAUDI_ARABIA":
      return "Saudi Arabia";
    case "OMAN":
      return "Oman";
    case "QATAR":
      return "Qatar";
    case "GLOBAL":
      return "Global";
  }
}

function formatCustomerSegment(segment: CustomerSegment | null) {
  switch (segment) {
    case "DISTRIBUTOR":
      return "Distributor";
    case "OEM":
      return "OEM";
    case "CONTRACTOR":
      return "Contractor";
    case "MAINTENANCE":
      return "Maintenance supplier";
    case "SUPPLIER":
      return "Supplier";
    case "END_USER":
      return "End user";
    default:
      return "General account";
  }
}

function formatCostBucket(bucket: CostBucketType) {
  switch (bucket) {
    case "LABOR":
      return "Labor";
    case "ELECTRICITY":
      return "Electricity";
    case "MAINTENANCE":
      return "Maintenance";
    case "EQUIPMENT":
      return "Equipment";
    case "WAREHOUSE_RENT":
      return "Warehouse rent";
    case "RAW_MATERIALS":
      return "Raw materials";
    case "LOGISTICS":
      return "Logistics";
    case "OTHER":
      return "Other";
  }
}

function formatImportBatchStatus(status: ImportBatchStatus) {
  switch (status) {
    case "PENDING":
      return "Pending";
    case "PROCESSED":
      return "Processed";
    case "PARTIAL":
      return "Partial";
    case "FAILED":
      return "Failed";
  }
}

function extractRequestedQuantityText(notes: string | null) {
  if (!notes) {
    return null;
  }

  const line = notes
    .split("\n")
    .map((entry) => entry.trim())
    .find((entry) => entry.startsWith(requestedQuantityPrefix));

  if (!line) {
    return null;
  }

  return line.slice(requestedQuantityPrefix.length).trim() || null;
}

function formatCustomerRelationship(
  rfqs: Array<{
    status: InquiryStatus;
    quote: { id: string } | null;
  }>,
) {
  const latestRfq = rfqs[0];

  if (rfqs.length >= 3) {
    return "Repeat buyer";
  }

  if (latestRfq?.quote) {
    return "Prospect in quote cycle";
  }

  switch (latestRfq?.status) {
    case "NEW":
      return "New inquiry";
    case "REVIEWING":
      return "Under review";
    case "QUOTED":
      return "Quoted prospect";
    case "CLOSED":
      return "Closed account";
    case "LOST":
      return "Dormant lead";
    default:
      return "New account";
  }
}

function buildImportSummary(batch: {
  fileName: string;
  status: ImportBatchStatus;
  rowCount: number;
  successfulRowCount: number;
  failedRowCount: number;
  notes: string | null;
} | null) {
  if (!batch) {
    return {
      title: "No live import batches yet",
      detail:
        "CSV import is enabled. Once a batch runs through Prisma, the latest status appears here.",
    };
  }

  return {
    title: `${formatImportBatchStatus(batch.status)} import batch · ${batch.fileName}`,
    detail:
      batch.notes ??
      `${batch.rowCount} row(s), ${batch.successfulRowCount} successful, ${batch.failedRowCount} issue(s).`,
  };
}

export async function getLiveOwnerDashboardData(
  rfqLimit: number,
  customerLimit: number,
): Promise<LiveOwnerDashboardData | null> {
  if (!isDatabaseConfigured()) {
    return null;
  }

  const prisma = getPrismaClient();
  const [
    rfqData,
    productFamilies,
    totalVariants,
    protectedManufacturingRecords,
    totalRawMaterialLines,
    totalCompetitorBenchmarks,
    customers,
    latestCostEntries,
    latestImportBatch,
  ] = await Promise.all([
    getLiveRfqDashboardData(rfqLimit),
    prisma.product.count(),
    prisma.productVariant.count(),
    prisma.manufacturingRecord.count({
      where: {
        ownerOnly: true,
      },
    }),
    prisma.manufacturingIngredient.count(),
    prisma.competitorProduct.count(),
    prisma.customer.findMany({
      orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }],
      take: customerLimit,
      include: {
        rfqs: {
          orderBy: {
            createdAt: "desc",
          },
          take: 3,
          include: {
            quote: {
              select: {
                id: true,
              },
            },
            items: {
              orderBy: {
                id: "asc",
              },
              take: 1,
              include: {
                variant: {
                  include: {
                    product: true,
                  },
                },
              },
            },
          },
        },
      },
    }),
    prisma.internalCostEntry.findMany({
      orderBy: [{ periodStart: "desc" }, { createdAt: "desc" }],
      take: 24,
    }),
    prisma.importBatch.findFirst({
      orderBy: {
        createdAt: "desc",
      },
      select: {
        fileName: true,
        status: true,
        rowCount: true,
        successfulRowCount: true,
        failedRowCount: true,
        notes: true,
      },
    }),
  ]);

  const latestCostsByBucket = new Map<CostBucketType, (typeof latestCostEntries)[number]>();

  for (const entry of latestCostEntries) {
    if (!latestCostsByBucket.has(entry.bucket)) {
      latestCostsByBucket.set(entry.bucket, entry);
    }
  }

  const internalCostBuckets = Array.from(latestCostsByBucket.values())
    .map((entry) => ({
      title: entry.title,
      monthlyUsd: Number(entry.amountUsd),
      note: entry.notes || `Latest live ${formatCostBucket(entry.bucket).toLowerCase()} entry.`,
      costCenter: formatCostBucket(entry.bucket),
      allocationBasis: entry.allocationBasis || "Latest live cost allocation entry",
    }))
    .sort((left, right) => right.monthlyUsd - left.monthlyUsd);

  const importSummary = buildImportSummary(latestImportBatch);

  return {
    hasCommercialData:
      rfqData.pendingRfqs > 0 ||
      rfqData.activeCustomers > 0 ||
      rfqData.recentRfqs.length > 0 ||
      customers.length > 0,
    hasCatalogData:
      productFamilies > 0 ||
      totalVariants > 0 ||
      protectedManufacturingRecords > 0 ||
      totalRawMaterialLines > 0 ||
      totalCompetitorBenchmarks > 0 ||
      Boolean(latestImportBatch),
    hasCostData: internalCostBuckets.length > 0,
    hasImportData: Boolean(latestImportBatch),
    dashboard: {
      pendingRfqs: rfqData.pendingRfqs,
      activeCustomers: rfqData.activeCustomers,
      catalogedVariants: totalVariants,
      protectedManufacturingRecords,
    },
    recentRfqs: rfqData.recentRfqs,
    keyCustomers: customers.map((customer) => {
      const latestRfq = customer.rfqs[0];
      const latestItem = latestRfq?.items[0];
      const requestedProduct =
        latestItem?.requestedProductName ||
        latestItem?.variant?.product.name ||
        latestItem?.variant?.code ||
        "Recently added customer record";
      const requestedQuantity =
        extractRequestedQuantityText(latestRfq?.notes ?? null) ||
        (latestItem ? `${latestItem.quantity} units` : null);

      return {
        company: customer.companyName,
        segment: formatCustomerSegment(customer.segment),
        market: formatMarketLabel(customer.market),
        demand: requestedQuantity ? `${requestedProduct} · ${requestedQuantity}` : requestedProduct,
        relationship: formatCustomerRelationship(customer.rfqs),
      };
    }),
    internalCostBuckets,
    summary: {
      productFamilies,
      totalVariants,
      totalRawMaterialLines,
      totalCompetitorBenchmarks,
      monthlyInternalCosts: internalCostBuckets.reduce(
        (sum, bucket) => sum + bucket.monthlyUsd,
        0,
      ),
      latestImportTitle: importSummary.title,
      latestImportDetail: importSummary.detail,
    },
  };
}