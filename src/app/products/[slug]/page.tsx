import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ParametricProductDetail } from "@/components/parametric-product-detail";
import { getProductBySlug, products } from "@/lib/site-data";

type ProductPageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return products.map((product) => ({ slug: product.slug }));
}

// Static AED conversion (ties USD price book to a market currency for
// schema.org/Offer indexing). When live FX lands swap this constant for a
// rates lookup.
const USD_TO_AED = 3.6725;
const USD_TO_SAR = 3.75;

// =====================================================================
// Programmatic SEO
// ---------------------------------------------------------------------
// Title pattern (per spec):
//   "[Material] [Category] Supplier in UAE & Saudi | RRM Industrial"
// Description bakes in the variant range and key dimensions for long-tail
// procurement queries (e.g. "EPDM door sealing profile UAE supplier").
// =====================================================================
export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = getProductBySlug(slug);

  if (!product) {
    return { title: "Product not found | RRM Industrial Rubber" };
  }

  const title = `${product.material} ${product.category} Supplier in UAE & Saudi | RRM Industrial`;
  const description = `${product.summary} Supplied across UAE, Saudi Arabia, Oman, and Qatar with ${product.variants.length} catalogued variants and ${product.standardLeadTimeDays}-day standard lead time.`;
  const keywords = [
    product.name,
    product.category,
    product.material,
    `${product.material} ${product.category}`,
    `${product.material} supplier UAE`,
    `${product.material} supplier Saudi Arabia`,
    "industrial rubber GCC",
    "RRM Industrial",
    ...product.applications,
  ];

  return {
    title,
    description,
    keywords,
    alternates: {
      canonical: `/products/${product.slug}`,
    },
    openGraph: {
      title,
      description,
      type: "website",
      url: `/products/${product.slug}`,
      siteName: "RRM Industrial",
    },
    twitter: {
      card: "summary",
      title,
      description,
    },
  };
}

// Constrained product-detail surface: top/bottom split rendered inside a
// max-w-7xl container so the 3D viewer can't dominate the viewport.
export default async function ProductDetailPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  // ============================================================
  // schema.org/Product JSON-LD
  // ------------------------------------------------------------
  // Each variant is published as a child Product (with sku +
  // AggregateOffer in AED + a USD/SAR offer) so Google can surface
  // exact dimension/SKU rich results in GCC procurement search.
  // ============================================================
  const variantOffers = product.variants
    .map((variant) => {
      const usd = variant.priceBook?.USD ?? 0;
      if (!Number.isFinite(usd) || usd <= 0) return null;
      const aed = +(usd * USD_TO_AED).toFixed(2);
      const sar = +(usd * USD_TO_SAR).toFixed(2);
      return {
        "@type": "Product",
        sku: variant.code,
        name: `${product.name} — ${variant.code}`,
        description: variant.description,
        material: product.material,
        category: product.category,
        additionalProperty: variant.dimensions.map((dim) => ({
          "@type": "PropertyValue",
          name: dim.label,
          value: dim.value,
        })),
        offers: [
          {
            "@type": "Offer",
            priceCurrency: "AED",
            price: aed,
            availability: "https://schema.org/InStock",
            areaServed: "AE",
            seller: { "@type": "Organization", name: "RRM Industrial" },
          },
          {
            "@type": "Offer",
            priceCurrency: "SAR",
            price: sar,
            availability: "https://schema.org/InStock",
            areaServed: "SA",
            seller: { "@type": "Organization", name: "RRM Industrial" },
          },
          {
            "@type": "Offer",
            priceCurrency: "USD",
            price: usd,
            availability: "https://schema.org/InStock",
            seller: { "@type": "Organization", name: "RRM Industrial" },
          },
        ],
      };
    })
    .filter((offer): offer is NonNullable<typeof offer> => offer !== null);

  const aedPrices = product.variants
    .map((variant) => variant.priceBook?.USD ?? 0)
    .filter((value) => value > 0)
    .map((value) => +(value * USD_TO_AED).toFixed(2));
  const aggregateOffer =
    aedPrices.length > 0
      ? {
          "@type": "AggregateOffer",
          priceCurrency: "AED",
          lowPrice: Math.min(...aedPrices),
          highPrice: Math.max(...aedPrices),
          offerCount: aedPrices.length,
          availability: "https://schema.org/InStock",
          areaServed: ["AE", "SA", "OM", "QA"],
          seller: { "@type": "Organization", name: "RRM Industrial" },
        }
      : undefined;

  const jsonLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.summary,
    sku: product.slug,
    category: product.category,
    material: product.material,
    brand: { "@type": "Brand", name: "RRM Industrial" },
    additionalProperty: product.technicalProfile.map((dim) => ({
      "@type": "PropertyValue",
      name: dim.label,
      value: dim.value,
    })),
    hasVariant: variantOffers,
  };
  if (aggregateOffer) jsonLd.offers = aggregateOffer;

  return (
    <main className="min-h-screen w-full bg-[#F7FAFC]">
      {/* JSON-LD for schema.org/Product. Inlined as a static <script> so
          the markup ends up in the server-rendered HTML for Googlebot. */}
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger -- trusted server-built payload
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="max-w-7xl mx-auto px-4 py-6">
        <ParametricProductDetail product={product} />
      </div>
    </main>
  );
}
