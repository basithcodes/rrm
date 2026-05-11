import type { Metadata } from "next";
import Link from "next/link";
import { MarketingLayout } from "@/components/marketing-layout";

// =====================================================================
// Capabilities — Manufacturing & Production
// ---------------------------------------------------------------------
// Industrial buyers land here to verify factory capability before they
// commit to an RFQ. Strict slate-and-white, no shadows, no warm tones.
// Dense fact rows over prose; every capability lists the polymers,
// methods, and certifications that decide a sourcing decision.
// =====================================================================

export const metadata: Metadata = {
  title: "Manufacturing Capabilities | RRM Industrial",
  description:
    "In-house compounding, precision extrusion, compression & injection molding, and ISO 9001 quality assurance for industrial rubber.",
};

type Capability = {
  code: string;
  title: string;
  summary: string;
  facts: Array<{ label: string; value: string }>;
};

const CAPABILITIES: Capability[] = [
  {
    code: "C-01",
    title: "Custom Compounding",
    summary:
      "In-house mixing line compounds NBR, EPDM, Silicone, and FKM/Viton to customer-supplied or in-house spec.",
    facts: [
      { label: "Polymers", value: "NBR · HNBR · EPDM · Silicone (VMQ) · FKM / Viton · Neoprene" },
      { label: "Compliance", value: "FDA 21 CFR 177.2600 · WRAS BS 6920 · NSF 61" },
      { label: "Service range", value: "−55 °C to +250 °C (FKM); high-temp Silicone to +300 °C" },
      { label: "Hardness range", value: "30 – 90 Shore A" },
      { label: "Batch sizes", value: "25 kg pilot → 250 kg production master batches" },
    ],
  },
  {
    code: "C-02",
    title: "Precision Extrusion",
    summary:
      "Continuous curing lines for weather seals, glazing profiles, and custom die-cut sections at tight tolerance.",
    facts: [
      { label: "Profiles", value: "Solid · Sponge · Co-extruded dense/sponge · Metal-reinforced" },
      { label: "Curing", value: "Salt bath (LCM) · Hot-air tunnel · Microwave (UHF)" },
      { label: "Tolerance", value: "±0.15 mm cross-section per ISO 3302-1 Class E2" },
      { label: "Die service", value: "In-house tool room — first-article die in 3 – 5 working days" },
      { label: "Continuous length", value: "Up to 100 m coils, cut-to-length on request" },
    ],
  },
  {
    code: "C-03",
    title: "Compression & Injection Molding",
    summary:
      "High-tonnage presses for large-bore O-rings, anti-vibration mounts, and complex heavy-duty gaskets.",
    facts: [
      { label: "Press tonnage", value: "Compression 100 – 600 t · Injection 150 – 400 t" },
      { label: "Platen sizes", value: "Up to 1200 × 1200 mm" },
      { label: "Typical parts", value: "O-rings ⌀ 2 – 1500 mm · Anti-vibration mounts · Diaphragms · Bonded metal-rubber assemblies" },
      { label: "Tooling", value: "Single & multi-cavity steel tools · Insert molding · Rubber-to-metal bonding (Chemlok)" },
      { label: "Cycle capacity", value: "Up to 24/7 lights-out cells for repeat production" },
    ],
  },
  {
    code: "C-04",
    title: "Quality Assurance & Testing",
    summary:
      "Every batch is rheology-fingerprinted before cure and physically verified after cure against the released spec.",
    facts: [
      { label: "Rheometry", value: "MDR 2000 · ML, MH, ts2, tc90 logged per batch" },
      { label: "Hardness", value: "Shore A & Shore D durometers (ISO 7619-1)" },
      { label: "Tensile", value: "Universal testing machine — tensile, elongation, modulus (ISO 37)" },
      { label: "Compression set", value: "ISO 815 method A & B (22 h / 70 h fixtures)" },
      { label: "Ageing & ozone", value: "Hot-air ageing (ISO 188) · Ozone chamber (ISO 1431-1)" },
      { label: "System", value: "ISO 9001:2015 certified QMS · COA issued per shipment" },
    ],
  },
];

const RFQ_HREF =
  "/quote?note=" +
  encodeURIComponent(
    "Custom Engineering Drawing — please reach out to align on tooling, polymer spec, and target tolerance. Drawing/STEP file will be supplied on reply.",
  );

export default function CapabilitiesPage() {
  return (
    <MarketingLayout>
      <section className="mx-auto max-w-7xl px-4 py-4">
        {/* Header strip — facts not prose */}
        <header className="mb-3 flex flex-wrap items-end justify-between gap-3 border-b border-slate-200 pb-2">
          <div>
            <p className="font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-emerald-700">
              Manufacturing & Production
            </p>
            <h1 className="mt-1 text-xl font-bold tracking-tight text-slate-900 md:text-2xl">
              Capabilities
            </h1>
          </div>
          <p className="font-mono text-[11px] uppercase tracking-wider text-slate-500">
            {CAPABILITIES.length} core operations · ISO 9001:2015
          </p>
        </header>

        {/* Capability grid — flat industrial cards */}
        <div className="grid grid-cols-1 gap-px bg-slate-200 md:grid-cols-2">
          {CAPABILITIES.map((cap) => (
            <article key={cap.code} className="bg-white p-4">
              <header className="flex items-baseline gap-3 border-b border-slate-200 pb-2">
                <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  {cap.code}
                </span>
                <h2 className="text-[15px] font-bold tracking-tight text-slate-900">
                  {cap.title}
                </h2>
              </header>
              <p className="mt-2 text-[12px] leading-snug text-slate-700">{cap.summary}</p>
              <dl className="mt-3 divide-y divide-slate-100 border border-slate-200">
                {cap.facts.map((fact) => (
                  <div
                    key={fact.label}
                    className="grid grid-cols-[110px_1fr] gap-3 px-2 py-1.5"
                  >
                    <dt className="font-mono text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      {fact.label}
                    </dt>
                    <dd className="font-mono text-[11px] text-slate-900">{fact.value}</dd>
                  </div>
                ))}
              </dl>
            </article>
          ))}
        </div>

        {/* CTA — single dense action bar */}
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border border-slate-200 bg-slate-50 px-3 py-2">
          <div>
            <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-slate-500">
              Custom part · Tooling · Engineered solution
            </p>
            <p className="mt-0.5 text-[13px] font-bold tracking-tight text-slate-900">
              Send us your drawing — quote returned with polymer, tooling, and lead time.
            </p>
          </div>
          <Link
            href={RFQ_HREF}
            className="rounded-sm bg-emerald-700 px-3 py-2 font-mono text-[11px] font-bold uppercase tracking-wider text-white hover:bg-emerald-800"
          >
            Submit Custom Engineering Drawing (RFQ) →
          </Link>
        </div>
      </section>
    </MarketingLayout>
  );
}
