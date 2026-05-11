"use client";

import { useState } from "react";

type PublicRfqFormState = {
  companyName: string;
  contactPerson: string;
  emailPhone: string;
  countryAndDeliveryCity: string;
  productOrVariantCode: string;
  requestedQuantity: string;
  applicationDetails: string;
  drawingOrSampleReference: string;
};

type SubmissionState = {
  tone: "idle" | "success" | "error";
  message: string;
  reference?: string;
};

const initialFormState: PublicRfqFormState = {
  companyName: "",
  contactPerson: "",
  emailPhone: "",
  countryAndDeliveryCity: "",
  productOrVariantCode: "",
  requestedQuantity: "",
  applicationDetails: "",
  drawingOrSampleReference: "",
};

const rfqFieldConfig: Array<{
  key: keyof PublicRfqFormState;
  label: string;
  placeholder: string;
  required?: boolean;
  multiline?: boolean;
}> = [
  {
    key: "companyName",
    label: "Company name",
    placeholder: "Al Noor Industrial Supplies",
    required: true,
  },
  {
    key: "contactPerson",
    label: "Contact person",
    placeholder: "Amina Hassan",
  },
  {
    key: "emailPhone",
    label: "Email and phone",
    placeholder: "amina@alnoor.ae | +971 50 000 0000",
  },
  {
    key: "countryAndDeliveryCity",
    label: "Country and delivery city",
    placeholder: "UAE, Dubai",
    required: true,
  },
  {
    key: "productOrVariantCode",
    label: "Product or variant code",
    placeholder: "NBR-OR-042 or NBR O-Ring Series",
    required: true,
  },
  {
    key: "requestedQuantity",
    label: "Requested quantity",
    placeholder: "5000 pcs",
    required: true,
  },
  {
    key: "applicationDetails",
    label: "Application details",
    placeholder: "Hydraulic sealing for food-processing equipment with oil exposure.",
    multiline: true,
  },
  {
    key: "drawingOrSampleReference",
    label: "Drawing or sample reference",
    placeholder: "DWG-17 Rev B / physical sample to follow",
  },
];

function alertClasses(tone: SubmissionState["tone"]) {
  if (tone === "success") {
    return "border-[rgba(47,125,58,0.2)] bg-[rgba(222,240,204,0.52)] text-accent-deep";
  }

  if (tone === "error") {
    return "public-alert-error";
  }

  return "border-line bg-white/72 text-muted";
}

export function PublicRfqForm() {
  const [formState, setFormState] = useState<PublicRfqFormState>(initialFormState);
  const [submission, setSubmission] = useState<SubmissionState>({
    tone: "idle",
    message: "Structured submissions land in the owner RFQ queue once the form is sent.",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setSubmission({ tone: "idle", message: "Submitting RFQ..." });

    try {
      const response = await fetch("/api/public/rfq", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formState,
          sourceChannel: "public_website",
        }),
      });

      const payload = (await response.json()) as {
        message?: string;
        reference?: string;
      };

      if (!response.ok) {
        throw new Error(payload.message ?? "Unable to submit the RFQ.");
      }

      setSubmission({
        tone: "success",
        message: payload.message ?? "RFQ submitted successfully.",
        reference: payload.reference,
      });
      setFormState(initialFormState);
    } catch (error) {
      setSubmission({
        tone: "error",
        message: error instanceof Error ? error.message : "Unable to submit the RFQ.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 grid gap-5">
      <div className="grid gap-4 sm:grid-cols-2">
        {rfqFieldConfig.map((field) => {
          const sharedProps = {
            required: field.required,
            value: formState[field.key],
            onChange: (
              event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
            ) => {
              setFormState((current) => ({
                ...current,
                [field.key]: event.target.value,
              }));
            },
            placeholder: field.placeholder,
            className:
              "rounded-[1.35rem] border border-line bg-white/80 px-4 py-3 text-sm text-foreground outline-none transition focus:border-accent",
          };

          return (
            <label
              key={field.key}
              className={`grid gap-2 ${field.multiline ? "sm:col-span-2" : ""}`}
            >
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
                {field.label}
              </span>
              {field.multiline ? (
                <textarea {...sharedProps} rows={5} />
              ) : (
                <input {...sharedProps} />
              )}
            </label>
          );
        })}
      </div>

      <div className={`rounded-[1.45rem] border px-4 py-4 text-sm leading-7 ${alertClasses(submission.tone)}`}>
        <p className="font-semibold">{submission.message}</p>
        {submission.reference ? (
          <p className="mt-2 text-xs font-semibold uppercase tracking-[0.18em]">
            Reference {submission.reference}
          </p>
        ) : null}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <button
          type="submit"
          disabled={isSubmitting}
          className="brand-button inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-semibold disabled:opacity-60"
        >
          {isSubmitting ? "Submitting RFQ..." : "Submit RFQ to owner queue"}
        </button>
        <p className="text-sm leading-7 text-muted">
          The submission creates a real RFQ record when the database is available.
        </p>
      </div>
    </form>
  );
}