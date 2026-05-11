import type { NextRequest } from "next/server";
import { jsonResponse, optionsResponse } from "@/lib/api-response";
import { createPublicRfqSubmission } from "@/lib/rfqs/service";

type PublicRfqBody = {
  companyName?: unknown;
  contactPerson?: unknown;
  emailPhone?: unknown;
  countryAndDeliveryCity?: unknown;
  productOrVariantCode?: unknown;
  requestedQuantity?: unknown;
  applicationDetails?: unknown;
  drawingOrSampleReference?: unknown;
  sourceChannel?: unknown;
};

const publicRfqMethods = ["POST", "OPTIONS"];

function readStringField(value: unknown) {
  return typeof value === "string" ? value : "";
}

export async function POST(request: NextRequest) {
  let body: PublicRfqBody;

  try {
    body = (await request.json()) as PublicRfqBody;
  } catch {
    return jsonResponse(
      request,
      {
        message: "Invalid JSON body.",
      },
      {
        status: 400,
        methods: publicRfqMethods,
      },
    );
  }

  try {
    const result = await createPublicRfqSubmission({
      companyName: readStringField(body.companyName),
      contactPerson: readStringField(body.contactPerson),
      emailPhone: readStringField(body.emailPhone),
      countryAndDeliveryCity: readStringField(body.countryAndDeliveryCity),
      productOrVariantCode: readStringField(body.productOrVariantCode),
      requestedQuantity: readStringField(body.requestedQuantity),
      applicationDetails: readStringField(body.applicationDetails),
      drawingOrSampleReference: readStringField(body.drawingOrSampleReference),
      sourceChannel: readStringField(body.sourceChannel),
    });

    return jsonResponse(request, result, {
      status: result.status === "submitted" ? 201 : 503,
      methods: publicRfqMethods,
    });
  } catch (error) {
    return jsonResponse(
      request,
      {
        message: error instanceof Error ? error.message : "Unable to submit the RFQ.",
      },
      {
        status: 400,
        methods: publicRfqMethods,
      },
    );
  }
}

export function OPTIONS(request: NextRequest) {
  return optionsResponse(request, {
    methods: publicRfqMethods,
  });
}