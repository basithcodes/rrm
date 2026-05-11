import { InquiryStatus, type MarketCode } from "@prisma/client";
import { getPrismaClient, isDatabaseConfigured } from "@/lib/prisma";

export type PublicRfqSubmissionInput = {
  companyName: string;
  contactPerson: string;
  emailPhone: string;
  countryAndDeliveryCity: string;
  productOrVariantCode: string;
  requestedQuantity: string;
  applicationDetails: string;
  drawingOrSampleReference: string;
  sourceChannel?: string;
};

export type PublicRfqSubmissionResult = {
  status: "submitted" | "unavailable";
  message: string;
  reference?: string;
};

export type OwnerRfqSnapshot = {
  reference: string;
  company: string;
  requestedProduct: string;
  market: string;
  quantity: string;
  source: string;
  status: string;
};

type ContactBundle = {
  email: string | null;
  phone: string | null;
};

type LiveRfqDashboardData = {
  pendingRfqs: number;
  activeCustomers: number;
  recentRfqs: OwnerRfqSnapshot[];
};

const requestedQuantityPrefix = "Requested quantity text:";
const databaseUnavailableMessage =
  "RFQ persistence is configured but the database is not reachable. Start PostgreSQL on localhost:5432 or update DATABASE_URL to a live server.";

function normalizeText(value: string, maxLength = 500) {
  return value.trim().replace(/\s+/g, " ").slice(0, maxLength);
}

function extractContactBundle(value: string): ContactBundle {
  const normalized = normalizeText(value, 240);

  if (!normalized) {
    return {
      email: null,
      phone: null,
    };
  }

  const emailMatch = normalized.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);
  const email = emailMatch?.[0]?.toLowerCase() ?? null;
  const phone = normalizeText(normalized.replace(email ?? "", ""), 60) || null;

  return {
    email,
    phone,
  };
}

function inferMarketFromLocation(location: string): MarketCode {
  const normalized = location.trim().toLowerCase();

  if (normalized.includes("uae") || normalized.includes("dubai") || normalized.includes("abu dhabi")) {
    return "UAE";
  }

  if (normalized.includes("saudi") || normalized.includes("riyadh") || normalized.includes("jeddah")) {
    return "SAUDI_ARABIA";
  }

  if (normalized.includes("oman") || normalized.includes("muscat")) {
    return "OMAN";
  }

  if (normalized.includes("qatar") || normalized.includes("doha")) {
    return "QATAR";
  }

  return "GLOBAL";
}

function extractCity(value: string) {
  const normalized = normalizeText(value, 120);

  if (!normalized) {
    return null;
  }

  const parts = normalized.split(",").map((part) => part.trim()).filter(Boolean);

  return parts.at(-1) ?? normalized;
}

function parseQuantityValue(value: string) {
  const normalized = normalizeText(value, 80);
  const match = normalized.match(/[\d,.]+/);

  if (!match) {
    throw new Error("Requested quantity must include a numeric value.");
  }

  const parsed = Number(match[0].replaceAll(",", ""));

  if (!Number.isFinite(parsed) || parsed <= 0) {
    throw new Error("Requested quantity must be greater than zero.");
  }

  return {
    parsed: Math.max(1, Math.round(parsed)),
    raw: normalized,
  };
}

function buildRfqReference(id: string, createdAt: Date) {
  const year = createdAt.getUTCFullYear();
  const month = String(createdAt.getUTCMonth() + 1).padStart(2, "0");
  const day = String(createdAt.getUTCDate()).padStart(2, "0");

  return `RRM-${year}${month}${day}-${id.slice(-6).toUpperCase()}`;
}

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

function formatInquiryStatus(status: InquiryStatus) {
  switch (status) {
    case InquiryStatus.NEW:
      return "New";
    case InquiryStatus.REVIEWING:
      return "Reviewing";
    case InquiryStatus.QUOTED:
      return "Quoted";
    case InquiryStatus.CLOSED:
      return "Closed";
    case InquiryStatus.LOST:
      return "Lost";
  }
}

function formatSourceChannel(sourceChannel: string | null) {
  if (!sourceChannel) {
    return "Website";
  }

  return sourceChannel
    .split(/[_\s-]+/)
    .filter(Boolean)
    .map((token) => token.charAt(0).toUpperCase() + token.slice(1).toLowerCase())
    .join(" ");
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

function formatRfqError(error: unknown) {
  if (isDatabaseUnavailableError(error)) {
    return databaseUnavailableMessage;
  }

  const message = error instanceof Error ? error.message : "Unable to submit the RFQ.";

  if (
    message.includes("Can't reach database server") ||
    message.includes("ECONNREFUSED") ||
    message.includes("Connection refused")
  ) {
    return "RFQ persistence is configured but the database is not reachable. Start PostgreSQL on localhost:5432 or update DATABASE_URL to a live server.";
  }

  return message;
}

function isDatabaseUnavailableError(error: unknown) {
  const queue: unknown[] = [error];
  const seen = new Set<unknown>();

  while (queue.length > 0) {
    const current = queue.shift();

    if (!current || seen.has(current)) {
      continue;
    }

    seen.add(current);

    if (typeof current === "object") {
      const currentRecord = current as {
        code?: unknown;
        message?: unknown;
        cause?: unknown;
      };

      if (currentRecord.code === "ECONNREFUSED" || currentRecord.code === "P1001") {
        return true;
      }

      if (typeof currentRecord.message === "string") {
        const message = currentRecord.message;

        if (
          message.includes("Can't reach database server") ||
          message.includes("ECONNREFUSED") ||
          message.includes("Connection refused")
        ) {
          return true;
        }
      }

      if (currentRecord.cause) {
        queue.push(currentRecord.cause);
      }
    }
  }

  return false;
}

async function findExistingCustomer(
  companyName: string,
  market: MarketCode,
  contact: ContactBundle,
  city: string | null,
) {
  const prisma = getPrismaClient();

  if (contact.email) {
    const customer = await prisma.customer.findFirst({
      where: {
        companyName,
        email: contact.email,
      },
    });

    if (customer) {
      return customer;
    }
  }

  if (contact.phone) {
    const customer = await prisma.customer.findFirst({
      where: {
        companyName,
        phone: contact.phone,
      },
    });

    if (customer) {
      return customer;
    }
  }

  return prisma.customer.findFirst({
    where: city
      ? {
          companyName,
          market,
          city,
        }
      : {
          companyName,
          market,
        },
  });
}

export async function createPublicRfqSubmission(
  input: PublicRfqSubmissionInput,
): Promise<PublicRfqSubmissionResult> {
  if (!isDatabaseConfigured()) {
    return {
      status: "unavailable",
      message: "RFQ submission is unavailable because DATABASE_URL is not configured.",
    };
  }

  const companyName = normalizeText(input.companyName, 120);
  const contactPerson = normalizeText(input.contactPerson, 120);
  const countryAndDeliveryCity = normalizeText(input.countryAndDeliveryCity, 140);
  const productOrVariantCode = normalizeText(input.productOrVariantCode, 160);
  const applicationDetails = normalizeText(input.applicationDetails, 1_000);
  const drawingOrSampleReference = normalizeText(input.drawingOrSampleReference, 240);
  const sourceChannel = normalizeText(input.sourceChannel ?? "public_website", 60) || "public_website";

  if (!companyName) {
    throw new Error("Company name is required.");
  }

  if (!countryAndDeliveryCity) {
    throw new Error("Country and delivery city are required.");
  }

  if (!productOrVariantCode) {
    throw new Error("Product or variant code is required.");
  }

  const quantity = parseQuantityValue(input.requestedQuantity);
  const contact = extractContactBundle(input.emailPhone);
  const requestedMarket = inferMarketFromLocation(countryAndDeliveryCity);
  const city = extractCity(countryAndDeliveryCity);
  const prisma = getPrismaClient();

  try {
    const existingCustomer = await findExistingCustomer(companyName, requestedMarket, contact, city);

    const variant = await prisma.productVariant.findUnique({
      where: {
        code: productOrVariantCode,
      },
      include: {
        product: true,
      },
    });

    const customer = existingCustomer
      ? await prisma.customer.update({
          where: {
            id: existingCustomer.id,
          },
          data: {
            contactName: contactPerson || existingCustomer.contactName,
            email: contact.email ?? existingCustomer.email,
            phone: contact.phone ?? existingCustomer.phone,
            market: requestedMarket,
            city: city ?? existingCustomer.city,
            sourceChannel,
          },
        })
      : await prisma.customer.create({
          data: {
            companyName,
            contactName: contactPerson || null,
            email: contact.email,
            phone: contact.phone,
            market: requestedMarket,
            city,
            sourceChannel,
          },
        });

    const notes = [
      `${requestedQuantityPrefix} ${quantity.raw}`,
      `Delivery request: ${countryAndDeliveryCity}`,
    ].join("\n");

    const rfq = await prisma.rfq.create({
      data: {
        customerId: customer.id,
        requestedMarket,
        status: InquiryStatus.NEW,
        sourceChannel,
        notes,
        items: {
          create: {
            variantId: variant?.id,
            requestedProductName: variant
              ? `${variant.code} · ${variant.product.name}`
              : productOrVariantCode,
            quantity: quantity.parsed,
            applicationNotes: applicationDetails || null,
            attachmentReference: drawingOrSampleReference || null,
          },
        },
      },
    });

    return {
      status: "submitted",
      message: "RFQ submitted and added to the owner queue.",
      reference: buildRfqReference(rfq.id, rfq.createdAt),
    };
  } catch (error) {
    if (isDatabaseUnavailableError(error)) {
      return {
        status: "unavailable",
        message: databaseUnavailableMessage,
      };
    }

    throw new Error(formatRfqError(error));
  }
}

export async function getLiveRfqDashboardData(limit = 4): Promise<LiveRfqDashboardData> {
  if (!isDatabaseConfigured()) {
    return {
      pendingRfqs: 0,
      activeCustomers: 0,
      recentRfqs: [],
    };
  }

  const prisma = getPrismaClient();
  const [pendingRfqs, activeCustomers, recentRfqs] = await Promise.all([
    prisma.rfq.count({
      where: {
        status: {
          in: [InquiryStatus.NEW, InquiryStatus.REVIEWING, InquiryStatus.QUOTED],
        },
      },
    }),
    prisma.customer.count(),
    prisma.rfq.findMany({
      orderBy: {
        createdAt: "desc",
      },
      take: limit,
      include: {
        customer: true,
        items: {
          take: 1,
          orderBy: {
            id: "asc",
          },
          include: {
            variant: {
              include: {
                product: true,
              },
            },
          },
        },
      },
    }),
  ]);

  return {
    pendingRfqs,
    activeCustomers,
    recentRfqs: recentRfqs.map((rfq) => {
      const firstItem = rfq.items[0];
      const requestedProduct =
        firstItem?.requestedProductName ??
        firstItem?.variant?.product.name ??
        firstItem?.variant?.code ??
        "Unspecified product";
      const requestedQuantity = extractRequestedQuantityText(rfq.notes) ?? `${firstItem?.quantity ?? 0}`;

      return {
        reference: buildRfqReference(rfq.id, rfq.createdAt),
        company: rfq.customer.companyName,
        requestedProduct,
        market: formatMarketLabel(rfq.requestedMarket),
        quantity: requestedQuantity,
        source: formatSourceChannel(rfq.sourceChannel),
        status: formatInquiryStatus(rfq.status),
      };
    }),
  };
}