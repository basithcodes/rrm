import {
  customerSegments,
  industrySolutions,
  markets,
  products,
  qualityPillars,
} from "@/lib/site-data";

export type CatalogAisle = {
  category: string;
  productCount: number;
  variantCount: number;
  fastestLeadTime: number;
  materials: string[];
};

export type MaterialSummary = {
  material: string;
  productCount: number;
  variantCount: number;
  fastestLeadTime: number;
  categories: string[];
  applications: string[];
  industries: string[];
  focus: string;
  detail: string;
};

export type MarketProfile = {
  name: string;
  currency: string;
  serviceLevel: string;
  buyingPattern: string;
  bestFor: string;
  nextStep: string;
};

export type HomeRouteCard = {
  href: string;
  eyebrow: string;
  title: string;
  detail: string;
  stat: string;
};

export type CapabilityTrack = {
  eyebrow: string;
  title: string;
  detail: string;
  bullets: string[];
};

const materialProfiles: Record<string, { focus: string; detail: string }> = {
  EPDM: {
    focus: "Outdoor sealing, glazing, and weather resistance.",
    detail:
      "Best when buyers need durable exterior performance, clean profile geometry, and repeatable replacement supply.",
  },
  NBR: {
    focus: "Oil contact, workshop service kits, and molded sealing parts.",
    detail:
      "Useful for industrial maintenance and automotive service environments where fluid resistance matters early in selection.",
  },
  Neoprene: {
    focus: "Project joints, utility equipment, and flexible industrial interfaces.",
    detail:
      "A good fit when the buyer is working from project conditions, movement range, and installed environment rather than shelf stock alone.",
  },
  Silicone: {
    focus: "Clean sheet stock, temperature-sensitive use, and custom gasket cutting.",
    detail:
      "Best when documentation, finish quality, and thickness selection are central to the buying conversation.",
  },
  "Natural Rubber": {
    focus: "General-purpose mounting, vibration control, and fabricated shop parts.",
    detail:
      "Useful where buyers care about simple replenishment, fit, and recurring workshop or contractor demand.",
  },
};

const marketPlaybooks: Record<
  string,
  {
    buyingPattern: string;
    bestFor: string;
    nextStep: string;
  }
> = {
  UAE: {
    buyingPattern: "Fast replenishment cycles, mixed-size demand, and distributor-led RFQs.",
    bestFor: "Dubai and Abu Dhabi buyers who need quick routing from catalog to quote.",
    nextStep: "Start in the catalog, shortlist parts, then send one structured RFQ.",
  },
  "Saudi Arabia": {
    buyingPattern: "Application-led quoting for automotive, contractor, and industrial programs.",
    bestFor: "Buyers who need a clear technical first pass before pricing discussion.",
    nextStep: "Use industries or materials first, then move to RFQ with application notes.",
  },
  Oman: {
    buyingPattern: "Maintenance and project replacement cycles with practical fit checks.",
    bestFor: "Teams buying for plant upkeep, local fabrication, and repeat replacement work.",
    nextStep: "Use materials and industries to narrow fit, then send the RFQ with quantity and city.",
  },
  Qatar: {
    buyingPattern: "Specification-heavy contractor and utilities demand with project timing pressure.",
    bestFor: "Buyers who start from project environment, compliance, and replacement schedule.",
    nextStep: "Review industries, confirm the product family, then hand off through RFQ.",
  },
};

export const publicNavigation = [
  { href: "/products", label: "Catalog" },
  { href: "/industries", label: "Industries" },
  { href: "/materials", label: "Materials" },
  { href: "/markets", label: "Markets" },
  { href: "/capabilities", label: "Capabilities" },
];

export const publicFooterLinks = [
  ...publicNavigation,
  { href: "/rfq", label: "RFQ" },
  { href: "/owner-access", label: "Owner workspace" },
];

export function formatCountLabel(count: number, singular: string, plural = `${singular}s`) {
  return `${count} ${count === 1 ? singular : plural}`;
}

export function getCatalogAisles(): CatalogAisle[] {
  return Array.from(
    products.reduce(
      (map, product) => {
        const current = map.get(product.category) ?? {
          category: product.category,
          productCount: 0,
          variantCount: 0,
          fastestLeadTime: product.standardLeadTimeDays,
          materials: new Set<string>(),
        };

        current.productCount += 1;
        current.variantCount += product.variants.length;
        current.fastestLeadTime = Math.min(current.fastestLeadTime, product.standardLeadTimeDays);
        current.materials.add(product.material);
        map.set(product.category, current);

        return map;
      },
      new Map<
        string,
        {
          category: string;
          productCount: number;
          variantCount: number;
          fastestLeadTime: number;
          materials: Set<string>;
        }
      >(),
    ).values(),
  )
    .map((item) => ({
      category: item.category,
      productCount: item.productCount,
      variantCount: item.variantCount,
      fastestLeadTime: item.fastestLeadTime,
      materials: Array.from(item.materials).slice(0, 3),
    }))
    .sort(
      (left, right) =>
        right.productCount - left.productCount || left.category.localeCompare(right.category),
    );
}

export function getMaterialSummaries(): MaterialSummary[] {
  return Array.from(
    products.reduce(
      (map, product) => {
        const current = map.get(product.material) ?? {
          material: product.material,
          productCount: 0,
          variantCount: 0,
          fastestLeadTime: product.standardLeadTimeDays,
          categories: new Set<string>(),
          applications: new Set<string>(),
          industries: new Set<string>(),
        };

        current.productCount += 1;
        current.variantCount += product.variants.length;
        current.fastestLeadTime = Math.min(current.fastestLeadTime, product.standardLeadTimeDays);
        current.categories.add(product.category);
        product.applications.forEach((application) => current.applications.add(application));
        product.industries.forEach((industry) => current.industries.add(industry));
        map.set(product.material, current);

        return map;
      },
      new Map<
        string,
        {
          material: string;
          productCount: number;
          variantCount: number;
          fastestLeadTime: number;
          categories: Set<string>;
          applications: Set<string>;
          industries: Set<string>;
        }
      >(),
    ).values(),
  )
    .map((item) => ({
      material: item.material,
      productCount: item.productCount,
      variantCount: item.variantCount,
      fastestLeadTime: item.fastestLeadTime,
      categories: Array.from(item.categories).slice(0, 3),
      applications: Array.from(item.applications).slice(0, 3),
      industries: Array.from(item.industries).slice(0, 3),
      focus: materialProfiles[item.material]?.focus ?? "General industrial rubber applications.",
      detail:
        materialProfiles[item.material]?.detail ??
        "Use this page to identify the right material family before narrowing to product codes.",
    }))
    .sort(
      (left, right) =>
        right.productCount - left.productCount || left.material.localeCompare(right.material),
    );
}

export const marketProfiles: MarketProfile[] = markets.map((market) => ({
  ...market,
  buyingPattern:
    marketPlaybooks[market.name]?.buyingPattern ??
    "Regional industrial supply with quote-first commercial handling.",
  bestFor:
    marketPlaybooks[market.name]?.bestFor ??
    "Buyers who need a clear route from catalog discovery into owner quoting.",
  nextStep:
    marketPlaybooks[market.name]?.nextStep ??
    "Review the catalog first, then continue through RFQ when the family is clear.",
}));

export const homeRouteCards: HomeRouteCard[] = [
  {
    href: "/products",
    eyebrow: "Catalog",
    title: "Browse by product family",
    detail:
      "Use this page when you already know the kind of part you need and want filters, shortlist tools, and variant cues.",
    stat: formatCountLabel(products.length, "family", "families"),
  },
  {
    href: "/industries",
    eyebrow: "Industries",
    title: "Browse by application environment",
    detail:
      "Use this page when the buyer starts from automotive, equipment, building, or project use rather than a product name.",
    stat: formatCountLabel(industrySolutions.length, "industry lane", "industry lanes"),
  },
  {
    href: "/materials",
    eyebrow: "Materials",
    title: "Compare compounds before SKUs",
    detail:
      "Use this page when teams need to decide between EPDM, NBR, neoprene, silicone, or natural rubber first.",
    stat: formatCountLabel(getMaterialSummaries().length, "material group", "material groups"),
  },
  {
    href: "/markets",
    eyebrow: "Markets",
    title: "See GCC commercial coverage",
    detail:
      "Use this page for country-specific service context, currency handling, and entry path for UAE, Saudi Arabia, Oman, and Qatar.",
    stat: formatCountLabel(marketProfiles.length, "GCC market", "GCC markets"),
  },
  {
    href: "/capabilities",
    eyebrow: "Capabilities",
    title: "Understand how the platform works",
    detail:
      "Use this page to see what belongs to the public storefront, what stays owner-only, and how imports and quote handling fit together.",
    stat: formatCountLabel(qualityPillars.length, "operating pillar", "operating pillars"),
  },
  {
    href: "/rfq",
    eyebrow: "RFQ",
    title: "Send one structured request",
    detail:
      "Use this page when the family, quantity, market, or application is clear enough to move into a real quote request.",
    stat: formatCountLabel(customerSegments.length, "buyer path supported", "buyer paths supported"),
  },
];

export const capabilityTracks: CapabilityTrack[] = [
  {
    eyebrow: "Public storefront",
    title: "Keep buying discovery simple and visible.",
    detail:
      "The public site is for product families, material clues, dimensions, industries, and RFQ preparation. It should answer what the buyer needs next, not expose internal cost logic.",
    bullets: [
      "Catalog browse lanes with clear filters and shortlist tools",
      "Material, application, and variant detail before the quote handoff",
      "RFQ-first flow instead of public price dumping",
    ],
  },
  {
    eyebrow: "Owner workspace",
    title: "Keep pricing and operating records protected.",
    detail:
      "The admin surface is where internal price books, sourcing notes, manufacturing records, and competitor benchmarks should live. Buyers should never need to parse this data directly.",
    bullets: [
      "Regional price books and private cost signals",
      "Protected manufacturing, QA, and sourcing notes",
      "Live RFQ queue and customer pipeline visibility",
    ],
  },
  {
    eyebrow: "Operations backbone",
    title: "Keep imports and updates structured.",
    detail:
      "Catalog growth should come through repeatable import and review paths, not random page edits. That keeps large inventories readable even as the dataset grows.",
    bullets: [
      "CSV preview and commit flow for catalog growth",
      "Manufacturing and competitor records linked to product families",
      "Dashboard summaries that switch from seeded data to live Prisma signals",
    ],
  },
];