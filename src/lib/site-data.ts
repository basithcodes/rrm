export type CurrencyCode = "AED" | "SAR" | "OMR" | "QAR" | "USD";

export type ProductViewerPreset =
  | "seal-profile"
  | "o-ring"
  | "expansion-joint"
  | "sheet-roll"
  | "mount"
  | "gasket-strip";

export type ProductDimension = {
  label: string;
  value: string;
};

export type OwnerRawMaterial = {
  name: string;
  percentage: string;
  supplier: string;
  origin: string;
  sourceType: string;
  landedCostUsdPerKg: number;
  leadTimeDays: number;
};

export type OwnerProcessRecord = {
  compoundCode: string;
  cureSystem: string;
  batchSizeKg: number;
  monthlyOutputKg: number;
  scrapRate: string;
  qaChecks: string[];
};

export type OwnerCostAllocation = {
  label: string;
  monthlyUsd: number;
  allocationBasis: string;
};

export type CompetitorBenchmark = {
  competitor: string;
  market: string;
  currency: CurrencyCode;
  unitPrice: number;
  note: string;
};

export type ProductOwnerRecord = {
  slug: string;
  priceBookNotes: string;
  sourcingNotes: string[];
  rawMaterials: OwnerRawMaterial[];
  process: OwnerProcessRecord;
  overheadAllocation: OwnerCostAllocation[];
  competitorBenchmarks: CompetitorBenchmark[];
};

export type ProductViewerConfig = {
  preset: ProductViewerPreset;
  label: string;
  accentColor: string;
  surfaceColor: string;
  cameraPosition: [number, number, number];
  rotationSpeed: number;
};

export type ProductVariant = {
  code: string;
  description: string;
  dimensions: ProductDimension[];
  minimumOrderQuantity: number;
  currenciesTracked: CurrencyCode[];
  priceBook: Record<CurrencyCode, number>;
};

export type Product = {
  slug: string;
  name: string;
  category: string;
  material: string;
  summary: string;
  description: string;
  applications: string[];
  industries: string[];
  features: string[];
  certifications: string[];
  technicalProfile: ProductDimension[];
  supplyFormats: string[];
  qualityChecks: string[];
  standardLeadTimeDays: number;
  viewer: ProductViewerConfig;
  manufacturingVisibility: "owner-only";
  variants: ProductVariant[];
  featured?: boolean;
};

export const markets = [
  {
    name: "UAE",
    currency: "AED",
    serviceLevel: "Fast RFQ turnaround for Dubai and Abu Dhabi supply chains.",
  },
  {
    name: "Saudi Arabia",
    currency: "SAR",
    serviceLevel: "Application-led quoting for industrial and automotive buyers.",
  },
  {
    name: "Oman",
    currency: "OMR",
    serviceLevel: "Project-based support for maintenance and replacement cycles.",
  },
  {
    name: "Qatar",
    currency: "QAR",
    serviceLevel: "Specification-driven supply for contractors and distributors.",
  },
] as const;

export const qualityPillars = [
  {
    metric: "Catalog structure",
    title: "Thousands of products, one clear browsing model.",
    detail:
      "The first slice uses simple categories, clear dimensions, application tags, and strong RFQ triggers instead of cluttered navigation.",
  },
  {
    metric: "Private know-how",
    title: "Chemistry and process notes stay owner-only.",
    detail:
      "Manufacturing composition, batch logic, and internal operating data are separated from customer-facing content from the start.",
  },
  {
    metric: "Regional pricing",
    title: "AED, SAR, OMR, QAR, and USD are tracked in parallel.",
    detail:
      "The site is prepared for country-specific quotation output while keeping live price numbers off public pages.",
  },
  {
    metric: "Operations control",
    title: "Labor, power, rent, and equipment costs belong in the same system.",
    detail:
      "Internal costing is part of the platform plan so quotes can be grounded in real operating inputs, not isolated spreadsheets.",
  },
] as const;

export const customerSegments = [
  {
    title: "Automotive distributors and OEM support teams",
    detail:
      "Need consistent dimensions, predictable sealing performance, and fast replacement options for recurring vehicle programs.",
    channel: "Direct outreach + application pages",
  },
  {
    title: "Industrial maintenance suppliers",
    detail:
      "Care about quick identification of profiles, O-rings, joints, and replacement parts across multiple sizes and materials.",
    channel: "Search-led catalog + RFQ",
  },
  {
    title: "Construction, HVAC, and infrastructure contractors",
    detail:
      "Buy on project timelines and need confidence around fit, weather resistance, and supply continuity in GCC conditions.",
    channel: "Country pages + quote-first flow",
  },
] as const;

export const industrySolutions = [
  {
    name: "Automotive",
    focus: "Weather sealing",
    challenge:
      "Door, window, trunk, and under-hood rubber parts need precise extrusion geometry and repeatable finish quality.",
    products: ["EPDM edge trims", "Door sealing profiles", "NBR molded parts"],
  },
  {
    name: "Industrial Equipment",
    focus: "Maintenance and uptime",
    challenge:
      "Factories and workshops need standard parts and custom replacements with short quoting cycles and clear dimensional data.",
    products: ["O-rings", "Rubber sheets", "Gaskets and sleeves"],
  },
  {
    name: "Oil, Gas, and Utilities",
    focus: "Application resilience",
    challenge:
      "Projects require durable compounds, clear traceability, and supplier confidence for harsh-duty environments.",
    products: ["Expansion joints", "Flange gaskets", "Cable protection sleeves"],
  },
  {
    name: "Building Systems",
    focus: "Fit and weather resistance",
    challenge:
      "Contractors need profiles and seals that install cleanly, perform outdoors, and stay easy to reorder by dimension.",
    products: ["Facade gaskets", "Window seals", "Anti-vibration pads"],
  },
] as const;

export const products: Product[] = [
  {
    slug: "epdm-door-sealing-profile",
    name: "EPDM Door Sealing Profile",
    category: "Extrusion Profiles",
    material: "EPDM",
    summary:
      "Automotive and transport sealing profile for doors, trunk lines, and access panels.",
    description:
      "A dimension-aware EPDM profile family built for automotive weather sealing, dust resistance, and long service life under outdoor exposure.",
    applications: ["Passenger vehicles", "Commercial vans", "Access panels"],
    industries: ["Automotive", "Fleet service", "Industrial enclosures"],
    features: ["Multi-durometer compatible", "Weather resistant", "Repeatable extrusion profile"],
    certifications: ["Automotive trim fit", "UV-ready compound", "Dust and splash sealing"],
    technicalProfile: [
      { label: "Operating range", value: "-40C to 120C" },
      { label: "Specific gravity", value: "1.18 +/- 0.05" },
      { label: "Tensile strength", value: "11 MPa" },
      { label: "Elongation at break", value: "300%" },
    ],
    supplyFormats: ["25 m coils", "50 m export cartons", "Cut-to-length kits"],
    qualityChecks: [
      "Laser profile gauge verification",
      "Compression set sampling",
      "Surface crack and splice inspection",
    ],
    standardLeadTimeDays: 14,
    viewer: {
      preset: "seal-profile",
      label: "Extrusion profile demo",
      accentColor: "#b85f2d",
      surfaceColor: "#16212b",
      cameraPosition: [5.4, 3.2, 5.2],
      rotationSpeed: 0.5,
    },
    manufacturingVisibility: "owner-only",
    featured: true,
    variants: [
      {
        code: "RRM-EPDM-DSP-18",
        description: "Compact perimeter seal for narrow channel fitment.",
        minimumOrderQuantity: 600,
        currenciesTracked: ["AED", "SAR", "OMR", "QAR", "USD"],
        priceBook: { AED: 12.4, SAR: 12.7, OMR: 1.31, QAR: 12.2, USD: 3.37 },
        dimensions: [
          { label: "Width", value: "18 mm" },
          { label: "Height", value: "14 mm" },
          { label: "Hardness", value: "65 Shore A" },
        ],
      },
      {
        code: "RRM-EPDM-DSP-24",
        description: "Medium-duty profile for wider panel compression zones.",
        minimumOrderQuantity: 450,
        currenciesTracked: ["AED", "SAR", "OMR", "QAR", "USD"],
        priceBook: { AED: 16.9, SAR: 17.3, OMR: 1.79, QAR: 16.6, USD: 4.6 },
        dimensions: [
          { label: "Width", value: "24 mm" },
          { label: "Height", value: "18 mm" },
          { label: "Hardness", value: "70 Shore A" },
        ],
      },
    ],
  },
  {
    slug: "nbr-o-ring-series",
    name: "NBR O-Ring Series",
    category: "Seals and O-Rings",
    material: "NBR",
    summary:
      "General-purpose sealing range for automotive, workshop, and equipment maintenance applications.",
    description:
      "NBR O-rings supplied in common industrial sizes and custom-request dimensions, optimized for simple identification and quotation.",
    applications: ["Hydraulic systems", "Workshop maintenance", "Pump sealing"],
    industries: ["Industrial Equipment", "Automotive", "Service workshops"],
    features: ["Oil resistance", "Wide size coverage", "Stock-and-quote workflow"],
    certifications: ["Oil-contact service", "Workshop stock program", "Maintenance kit sizing"],
    technicalProfile: [
      { label: "Operating range", value: "-25C to 110C" },
      { label: "Hardness range", value: "70-75 Shore A" },
      { label: "Fluid compatibility", value: "Mineral oil and grease" },
      { label: "Shelf life", value: "5 years sealed storage" },
    ],
    supplyFormats: ["Bulk bags by code", "Workshop service kits", "Custom count pouches"],
    qualityChecks: [
      "ID and cross-section digital gauge check",
      "Flash removal inspection",
      "Oil swell sample retention",
    ],
    standardLeadTimeDays: 7,
    viewer: {
      preset: "o-ring",
      label: "O-ring cross-section demo",
      accentColor: "#d7723d",
      surfaceColor: "#181d24",
      cameraPosition: [4.5, 3.2, 4.6],
      rotationSpeed: 0.45,
    },
    manufacturingVisibility: "owner-only",
    featured: true,
    variants: [
      {
        code: "RRM-NBR-OR-210",
        description: "Standard service O-ring for workshop maintenance cycles.",
        minimumOrderQuantity: 1200,
        currenciesTracked: ["AED", "SAR", "OMR", "QAR", "USD"],
        priceBook: { AED: 0.78, SAR: 0.8, OMR: 0.082, QAR: 0.77, USD: 0.21 },
        dimensions: [
          { label: "ID", value: "21 mm" },
          { label: "CS", value: "3 mm" },
          { label: "Hardness", value: "70 Shore A" },
        ],
      },
      {
        code: "RRM-NBR-OR-455",
        description: "Heavy-section ring for larger gland and flange conditions.",
        minimumOrderQuantity: 800,
        currenciesTracked: ["AED", "SAR", "OMR", "QAR", "USD"],
        priceBook: { AED: 2.15, SAR: 2.2, OMR: 0.227, QAR: 2.1, USD: 0.58 },
        dimensions: [
          { label: "ID", value: "45 mm" },
          { label: "CS", value: "5.5 mm" },
          { label: "Hardness", value: "75 Shore A" },
        ],
      },
    ],
  },
  {
    slug: "neoprene-expansion-joint",
    name: "Neoprene Expansion Joint",
    category: "Joints and Connectors",
    material: "Neoprene",
    summary:
      "Flexible joint family for utilities, building systems, and industrial piping movements.",
    description:
      "A product family designed for movement absorption, vibration control, and replacement-friendly dimension management across project sites.",
    applications: ["Cooling systems", "Industrial piping", "Building services"],
    industries: ["Utilities", "Construction", "Industrial Equipment"],
    features: ["Movement absorption", "Project quoting", "Dimensional traceability"],
    certifications: ["PN-rated configuration", "Project traceability", "Maintenance planning"],
    technicalProfile: [
      { label: "Working temperature", value: "-20C to 95C" },
      { label: "Axial movement", value: "+/- 12 mm" },
      { label: "Lateral movement", value: "+/- 8 mm" },
      { label: "Reinforcement", value: "Nylon fabric + steel flange" },
    ],
    supplyFormats: ["Flanged units", "Project-labeled crates", "Maintenance replacement batches"],
    qualityChecks: [
      "Hydrostatic sample test",
      "Bolt circle verification",
      "Visual rubber-to-flange bond inspection",
    ],
    standardLeadTimeDays: 18,
    viewer: {
      preset: "expansion-joint",
      label: "Joint body demo",
      accentColor: "#cf7e4e",
      surfaceColor: "#222d36",
      cameraPosition: [5.8, 3.8, 6],
      rotationSpeed: 0.36,
    },
    manufacturingVisibility: "owner-only",
    featured: true,
    variants: [
      {
        code: "RRM-NEO-EJ-80",
        description: "Compact joint body for smaller line diameters and service loops.",
        minimumOrderQuantity: 40,
        currenciesTracked: ["AED", "SAR", "OMR", "QAR", "USD"],
        priceBook: { AED: 248, SAR: 254, OMR: 26.2, QAR: 243, USD: 67.5 },
        dimensions: [
          { label: "Nominal bore", value: "80 mm" },
          { label: "Face-to-face", value: "140 mm" },
          { label: "Pressure class", value: "PN10" },
        ],
      },
      {
        code: "RRM-NEO-EJ-150",
        description: "Larger duty joint for contractor and utility maintenance programs.",
        minimumOrderQuantity: 20,
        currenciesTracked: ["AED", "SAR", "OMR", "QAR", "USD"],
        priceBook: { AED: 432, SAR: 443, OMR: 45.6, QAR: 424, USD: 117.6 },
        dimensions: [
          { label: "Nominal bore", value: "150 mm" },
          { label: "Face-to-face", value: "180 mm" },
          { label: "Pressure class", value: "PN16" },
        ],
      },
    ],
  },
  {
    slug: "silicone-sheet-roll",
    name: "Silicone Sheet Roll",
    category: "Sheets and Rolls",
    material: "Silicone",
    summary:
      "High-cleanliness sheet format for industrial fabrication, gasketing, and heat-resistant applications.",
    description:
      "A silicone sheet range intended for fabricators and OEM buyers that need thickness options, clean surface finish, and reliable repeat ordering.",
    applications: ["Gasket cutting", "Heat shielding", "Food-safe fabrication"],
    industries: ["Industrial Equipment", "Food processing", "OEM fabrication"],
    features: ["Thickness options", "Cut-to-size quoting", "Heat resistant"],
    certifications: ["High-cleanliness finish", "Heat-resistant stock", "Fabrication-ready supply"],
    technicalProfile: [
      { label: "Operating range", value: "-55C to 200C" },
      { label: "Density", value: "1.25 g/cm3" },
      { label: "Hardness", value: "60 Shore A" },
      { label: "Surface finish", value: "Smooth matte export finish" },
    ],
    supplyFormats: ["10 m rolls", "Cut sheets", "Fabrication packs by thickness"],
    qualityChecks: [
      "Thickness tolerance inspection",
      "Surface contamination check",
      "Heat aging sample retention",
    ],
    standardLeadTimeDays: 10,
    viewer: {
      preset: "sheet-roll",
      label: "Sheet roll demo",
      accentColor: "#d75c69",
      surfaceColor: "#98414f",
      cameraPosition: [5.6, 3.6, 5.4],
      rotationSpeed: 0.42,
    },
    manufacturingVisibility: "owner-only",
    variants: [
      {
        code: "RRM-SIL-SR-3",
        description: "General fabrication grade sheet in 3 mm thickness.",
        minimumOrderQuantity: 12,
        currenciesTracked: ["AED", "SAR", "OMR", "QAR", "USD"],
        priceBook: { AED: 368, SAR: 377, OMR: 38.8, QAR: 361, USD: 100.2 },
        dimensions: [
          { label: "Thickness", value: "3 mm" },
          { label: "Roll width", value: "1.2 m" },
          { label: "Length", value: "10 m" },
        ],
      },
      {
        code: "RRM-SIL-SR-6",
        description: "Thicker sheet for heavier gasketing and thermal isolation programs.",
        minimumOrderQuantity: 8,
        currenciesTracked: ["AED", "SAR", "OMR", "QAR", "USD"],
        priceBook: { AED: 612, SAR: 626, OMR: 64.6, QAR: 601, USD: 166.6 },
        dimensions: [
          { label: "Thickness", value: "6 mm" },
          { label: "Roll width", value: "1.2 m" },
          { label: "Length", value: "10 m" },
        ],
      },
    ],
  },
  {
    slug: "natural-rubber-anti-vibration-mount",
    name: "Natural Rubber Anti-Vibration Mount",
    category: "Mounts and Pads",
    material: "NR/SBR",
    summary:
      "Isolation mount family for generators, compressors, and machine frames requiring reliable vibration damping.",
    description:
      "A mount range for industrial equipment bases and skid frames where vibration control, threaded installation, and repeat replacement are part of normal maintenance.",
    applications: ["Generator skids", "Pump bases", "Compressor frames"],
    industries: ["Utilities", "Industrial Equipment", "Construction"],
    features: ["Vibration damping", "Threaded mounting options", "Service replacement planning"],
    certifications: ["Machine isolation", "Warehouse stock program", "Maintenance support"],
    technicalProfile: [
      { label: "Load range", value: "60 to 320 kg per mount" },
      { label: "Deflection target", value: "6 mm nominal" },
      { label: "Hardness", value: "55 Shore A" },
      { label: "Thread options", value: "M10 and M12 zinc-plated" },
    ],
    supplyFormats: ["Individual boxed units", "Maintenance cartons", "Project-tagged pallets"],
    qualityChecks: [
      "Thread pull-out verification",
      "Rubber-metal bond inspection",
      "Deflection load sample test",
    ],
    standardLeadTimeDays: 12,
    viewer: {
      preset: "mount",
      label: "Isolation mount demo",
      accentColor: "#bf6a35",
      surfaceColor: "#1b2026",
      cameraPosition: [5.2, 3.4, 5.4],
      rotationSpeed: 0.38,
    },
    manufacturingVisibility: "owner-only",
    variants: [
      {
        code: "RRM-NR-AVM-50",
        description: "Compact mount for lighter-duty machine frames and pump feet.",
        minimumOrderQuantity: 200,
        currenciesTracked: ["AED", "SAR", "OMR", "QAR", "USD"],
        priceBook: { AED: 23.5, SAR: 24.1, OMR: 2.48, QAR: 23, USD: 6.4 },
        dimensions: [
          { label: "Diameter", value: "50 mm" },
          { label: "Height", value: "30 mm" },
          { label: "Thread", value: "M10" },
        ],
      },
      {
        code: "RRM-NR-AVM-80",
        description: "Higher load mount for compressors and heavier fabricated frames.",
        minimumOrderQuantity: 120,
        currenciesTracked: ["AED", "SAR", "OMR", "QAR", "USD"],
        priceBook: { AED: 38.9, SAR: 39.9, OMR: 4.11, QAR: 38.2, USD: 10.6 },
        dimensions: [
          { label: "Diameter", value: "80 mm" },
          { label: "Height", value: "45 mm" },
          { label: "Thread", value: "M12" },
        ],
      },
    ],
  },
  {
    slug: "epdm-facade-glazing-gasket",
    name: "EPDM Facade Glazing Gasket",
    category: "Building Seals",
    material: "EPDM",
    summary:
      "Facade and glazing gasket range for aluminum systems, curtain walls, and weather-exposed building envelopes.",
    description:
      "A snap-fit gasket family aimed at facade contractors and aluminium fabricators who need repeatable profile geometry, UV stability, and project-batch quoting by dimension.",
    applications: ["Curtain walls", "Window systems", "Facade glazing"],
    industries: ["Building Systems", "Construction", "Aluminium fabrication"],
    features: ["Snap-in profile", "UV-stable finish", "Long-run extrusion repeatability"],
    certifications: ["Facade weathering", "Aluminium system fit", "Project batching"],
    technicalProfile: [
      { label: "UV performance", value: "GCC exterior grade" },
      { label: "Hardness", value: "65 to 70 Shore A" },
      { label: "Profile tolerance", value: "+/- 0.30 mm" },
      { label: "Standard lengths", value: "Coils and cut frame kits" },
    ],
    supplyFormats: ["Facade project coils", "Cut frame sets", "Color-marked cartons"],
    qualityChecks: [
      "Profile projection check",
      "UV color stability sample review",
      "Fitment gauge against aluminium section",
    ],
    standardLeadTimeDays: 15,
    viewer: {
      preset: "gasket-strip",
      label: "Facade gasket demo",
      accentColor: "#ae5f3f",
      surfaceColor: "#24303a",
      cameraPosition: [5.5, 3.1, 5.3],
      rotationSpeed: 0.4,
    },
    manufacturingVisibility: "owner-only",
    variants: [
      {
        code: "RRM-EPDM-FGG-12",
        description: "Slim glazing gasket for narrow aluminium channels and panel retention.",
        minimumOrderQuantity: 700,
        currenciesTracked: ["AED", "SAR", "OMR", "QAR", "USD"],
        priceBook: { AED: 9.6, SAR: 9.8, OMR: 1.01, QAR: 9.4, USD: 2.61 },
        dimensions: [
          { label: "Width", value: "12 mm" },
          { label: "Height", value: "11 mm" },
          { label: "Hardness", value: "65 Shore A" },
        ],
      },
      {
        code: "RRM-EPDM-FGG-18",
        description: "Broader gasket profile for heavier facade and glazing retention zones.",
        minimumOrderQuantity: 520,
        currenciesTracked: ["AED", "SAR", "OMR", "QAR", "USD"],
        priceBook: { AED: 13.8, SAR: 14.1, OMR: 1.46, QAR: 13.5, USD: 3.76 },
        dimensions: [
          { label: "Width", value: "18 mm" },
          { label: "Height", value: "15 mm" },
          { label: "Hardness", value: "70 Shore A" },
        ],
      },
    ],
  },
];

export const ownerDashboard = {
  pendingRfqs: 18,
  activeCustomers: 74,
  catalogedVariants: 5210,
  protectedManufacturingRecords: 332,
};

export const internalCostBuckets = [
  {
    title: "Labor salaries",
    monthlyUsd: 18600,
    note: "Molding, trimming, finishing, packaging, and shift supervision.",
    costCenter: "Factory floor",
    allocationBasis: "Direct labor hours across extrusion, molding, and finishing",
  },
  {
    title: "Electricity and utilities",
    monthlyUsd: 6400,
    note: "Mixing, curing, compression, cooling, and warehouse support systems.",
    costCenter: "Utilities",
    allocationBasis: "Kilowatt-hour loading from mixers, presses, curing ovens, and HVAC",
  },
  {
    title: "Maintenance",
    monthlyUsd: 2700,
    note: "Routine upkeep for tooling, mixers, presses, and extrusion lines.",
    costCenter: "Maintenance workshop",
    allocationBasis: "Scheduled servicing and spare-parts reserve by line utilization",
  },
  {
    title: "Warehouse rent",
    monthlyUsd: 9200,
    note: "Finished goods, raw material staging, and regional dispatch storage.",
    costCenter: "Warehousing",
    allocationBasis: "Square-meter occupancy across raw material and finished goods zones",
  },
  {
    title: "New equipment reserve",
    monthlyUsd: 5200,
    note: "Provisioning for molds, dies, mixers, curing presses, and inspection gear.",
    costCenter: "Capital reserve",
    allocationBasis: "Monthly reserve against planned die, mold, and inspection equipment replacement",
  },
] as const;

export const recentRfqs = [
  {
    reference: "RFQ-2407",
    company: "Al Noor Auto Spare Parts",
    market: "UAE",
    requestedProduct: "EPDM Door Sealing Profile",
    quantity: "2,400 m",
    status: "Reviewing",
    source: "Website inquiry",
  },
  {
    reference: "RFQ-2411",
    company: "Gulf Utility Projects",
    market: "Qatar",
    requestedProduct: "Neoprene Expansion Joint",
    quantity: "36 units",
    status: "Quoted",
    source: "Direct sales follow-up",
  },
  {
    reference: "RFQ-2414",
    company: "Modern Facade Systems",
    market: "Saudi Arabia",
    requestedProduct: "EPDM Facade Glazing Gasket",
    quantity: "8,500 m",
    status: "New",
    source: "Industry landing page",
  },
  {
    reference: "RFQ-2418",
    company: "Delta Process Equipment",
    market: "Oman",
    requestedProduct: "Natural Rubber Anti-Vibration Mount",
    quantity: "320 units",
    status: "Reviewing",
    source: "WhatsApp handoff",
  },
] as const;

export const keyCustomers = [
  {
    company: "Riyadh Fleet Components",
    segment: "Automotive distributor",
    market: "Saudi Arabia",
    demand: "Monthly door and glazing profile replenishment",
    relationship: "Repeat buyer",
  },
  {
    company: "Doha MEP Supplies",
    segment: "Industrial maintenance supplier",
    market: "Qatar",
    demand: "Mixed O-ring and gasket kits for service calls",
    relationship: "Prospect in quote cycle",
  },
  {
    company: "Muscat Fabrication House",
    segment: "OEM fabrication",
    market: "Oman",
    demand: "Silicone sheet rolls cut into custom gasket programs",
    relationship: "Qualified lead",
  },
  {
    company: "Dubai Vibration Control",
    segment: "Utilities contractor",
    market: "UAE",
    demand: "Machine mount replenishment for packaged equipment projects",
    relationship: "Account under development",
  },
] as const;

export const ownerProductRecords: ProductOwnerRecord[] = [
  {
    slug: "epdm-door-sealing-profile",
    priceBookNotes:
      "Owner price book keeps a 22% margin floor and applies GCC freight adjustments separately for UAE, Saudi Arabia, Oman, and Qatar.",
    sourcingNotes: [
      "Primary EPDM polymer is sourced on a 21-day import cycle through Jebel Ali consolidation.",
      "Carbon black and zinc oxide have alternate local distributors to reduce shipment delays during peak season.",
    ],
    rawMaterials: [
      {
        name: "EPDM base polymer",
        percentage: "46%",
        supplier: "Desert Polymer Trading",
        origin: "South Korea",
        sourceType: "Direct import",
        landedCostUsdPerKg: 2.48,
        leadTimeDays: 21,
      },
      {
        name: "Carbon black N550",
        percentage: "22%",
        supplier: "BlackFill Middle East",
        origin: "India",
        sourceType: "Regional distributor",
        landedCostUsdPerKg: 1.18,
        leadTimeDays: 11,
      },
      {
        name: "Paraffinic process oil",
        percentage: "14%",
        supplier: "Gulf Additives Hub",
        origin: "UAE",
        sourceType: "Local purchase",
        landedCostUsdPerKg: 0.92,
        leadTimeDays: 4,
      },
      {
        name: "Zinc oxide and cure package",
        percentage: "6%",
        supplier: "ChemLink FZCO",
        origin: "Turkey",
        sourceType: "Consolidated import",
        landedCostUsdPerKg: 2.86,
        leadTimeDays: 13,
      },
    ],
    process: {
      compoundCode: "EPDM-742A",
      cureSystem: "Peroxide cure extrusion",
      batchSizeKg: 180,
      monthlyOutputKg: 6400,
      scrapRate: "3.4%",
      qaChecks: [
        "Cross-section gauge every 500 m",
        "Compression set sample each batch",
        "UV chamber control sample weekly",
      ],
    },
    overheadAllocation: [
      { label: "Labor", monthlyUsd: 2150, allocationBasis: "Extrusion line shift hours" },
      { label: "Electricity", monthlyUsd: 1280, allocationBasis: "Extruder and cooling line power draw" },
      { label: "Warehouse rent", monthlyUsd: 890, allocationBasis: "Finished coil storage footprint" },
      { label: "Maintenance", monthlyUsd: 420, allocationBasis: "Die cleaning and line servicing" },
    ],
    competitorBenchmarks: [
      {
        competitor: "GulfSeal Profiles",
        market: "UAE",
        currency: "AED",
        unitPrice: 14.2,
        note: "Comparable 18 mm perimeter seal sold in mixed carton batches.",
      },
      {
        competitor: "Riyadh Elastomer Works",
        market: "Saudi Arabia",
        currency: "SAR",
        unitPrice: 18.1,
        note: "Quoted for a wider automotive profile with color marking.",
      },
    ],
  },
  {
    slug: "nbr-o-ring-series",
    priceBookNotes:
      "Workshop and maintenance accounts receive tiered pricing by size group, pack count, and annual consumption history.",
    sourcingNotes: [
      "NBR polymer and nitrile additives are stocked with two approved sources to maintain supply continuity for service kits.",
      "Small-section rings are packed locally to support fast distributor replenishment.",
    ],
    rawMaterials: [
      {
        name: "NBR polymer",
        percentage: "41%",
        supplier: "RubberCore Asia",
        origin: "Malaysia",
        sourceType: "Direct import",
        landedCostUsdPerKg: 2.72,
        leadTimeDays: 18,
      },
      {
        name: "Carbon black N660",
        percentage: "24%",
        supplier: "Industrial Filler Network",
        origin: "Saudi Arabia",
        sourceType: "Regional distributor",
        landedCostUsdPerKg: 1.11,
        leadTimeDays: 7,
      },
      {
        name: "Processing oil",
        percentage: "12%",
        supplier: "Gulf Additives Hub",
        origin: "UAE",
        sourceType: "Local purchase",
        landedCostUsdPerKg: 0.88,
        leadTimeDays: 4,
      },
      {
        name: "Antioxidant and cure pack",
        percentage: "5%",
        supplier: "ChemLink FZCO",
        origin: "Germany",
        sourceType: "Consolidated import",
        landedCostUsdPerKg: 3.42,
        leadTimeDays: 15,
      },
    ],
    process: {
      compoundCode: "NBR-318K",
      cureSystem: "Compression molding",
      batchSizeKg: 120,
      monthlyOutputKg: 4100,
      scrapRate: "2.8%",
      qaChecks: [
        "ID and CS digital measurement by cavity",
        "Flash inspection after trimming",
        "Oil swell verification by sample lot",
      ],
    },
    overheadAllocation: [
      { label: "Labor", monthlyUsd: 1680, allocationBasis: "Molding press and trimming labor hours" },
      { label: "Electricity", monthlyUsd: 930, allocationBasis: "Compression press and curing load" },
      { label: "Warehouse rent", monthlyUsd: 530, allocationBasis: "Bin storage for size assortment" },
      { label: "Maintenance", monthlyUsd: 360, allocationBasis: "Mold cleaning and press maintenance" },
    ],
    competitorBenchmarks: [
      {
        competitor: "ME Seal House",
        market: "Qatar",
        currency: "QAR",
        unitPrice: 0.89,
        note: "Standard maintenance kit supply for 21 mm ID service ring.",
      },
      {
        competitor: "AutoFix Rubber Parts",
        market: "UAE",
        currency: "AED",
        unitPrice: 0.95,
        note: "Retail-focused workshop pack pricing, not bulk distributor pricing.",
      },
    ],
  },
  {
    slug: "neoprene-expansion-joint",
    priceBookNotes:
      "Project pricing adds flange hardware and transport separately; quoted unit price is protected in the owner workspace only.",
    sourcingNotes: [
      "Neoprene compound is mixed in-house while flanges are sourced from two steel fabricators based on pressure class.",
      "Utility projects require longer raw material planning for reinforcement fabric and flange drilling schedules.",
    ],
    rawMaterials: [
      {
        name: "Neoprene base compound",
        percentage: "51%",
        supplier: "Alliance Elastomers",
        origin: "Thailand",
        sourceType: "Direct import",
        landedCostUsdPerKg: 3.14,
        leadTimeDays: 24,
      },
      {
        name: "Reinforcement fabric",
        percentage: "14%",
        supplier: "TechFab Industrial",
        origin: "India",
        sourceType: "Project-based purchase",
        landedCostUsdPerKg: 2.36,
        leadTimeDays: 16,
      },
      {
        name: "Steel flange set",
        percentage: "23%",
        supplier: "Arabian Pipe Works",
        origin: "UAE",
        sourceType: "Local fabrication",
        landedCostUsdPerKg: 1.87,
        leadTimeDays: 8,
      },
      {
        name: "Bonding adhesive package",
        percentage: "4%",
        supplier: "Process Bond Tech",
        origin: "Turkey",
        sourceType: "Regional distributor",
        landedCostUsdPerKg: 4.48,
        leadTimeDays: 10,
      },
    ],
    process: {
      compoundCode: "CR-EJ-510",
      cureSystem: "Fabric-reinforced molding and flange bonding",
      batchSizeKg: 240,
      monthlyOutputKg: 5200,
      scrapRate: "4.1%",
      qaChecks: [
        "Bond line inspection after cure",
        "Hydrostatic test sample by lot",
        "Face-to-face and bolt circle check before dispatch",
      ],
    },
    overheadAllocation: [
      { label: "Labor", monthlyUsd: 2440, allocationBasis: "Fabric layup, bonding, and assembly hours" },
      { label: "Electricity", monthlyUsd: 1160, allocationBasis: "Large curing press and finishing tools" },
      { label: "Warehouse rent", monthlyUsd: 990, allocationBasis: "Crated project stock footprint" },
      { label: "Maintenance", monthlyUsd: 510, allocationBasis: "Flange tooling and press upkeep" },
    ],
    competitorBenchmarks: [
      {
        competitor: "Qatar Flow Controls",
        market: "Qatar",
        currency: "QAR",
        unitPrice: 458,
        note: "Comparable 80 mm joint excluding freight and hardware add-ons.",
      },
      {
        competitor: "Saudi Pipe Flex",
        market: "Saudi Arabia",
        currency: "SAR",
        unitPrice: 469,
        note: "150 mm joint quote for contractor maintenance stock.",
      },
    ],
  },
  {
    slug: "silicone-sheet-roll",
    priceBookNotes:
      "Silicone sheet pricing is grouped by thickness, finish quality, and whether the account needs food-contact documentation packs.",
    sourcingNotes: [
      "Base silicone gum is imported quarterly while release liners and packaging are sourced locally.",
      "Thickness-based price changes are driven mostly by gum cost and slower curing throughput on thicker rolls.",
    ],
    rawMaterials: [
      {
        name: "Silicone gum",
        percentage: "58%",
        supplier: "Prime Silicone Materials",
        origin: "China",
        sourceType: "Direct import",
        landedCostUsdPerKg: 4.82,
        leadTimeDays: 27,
      },
      {
        name: "Fumed silica",
        percentage: "18%",
        supplier: "SilicaTech Gulf",
        origin: "Saudi Arabia",
        sourceType: "Regional distributor",
        landedCostUsdPerKg: 1.94,
        leadTimeDays: 9,
      },
      {
        name: "Pigment and additive pack",
        percentage: "6%",
        supplier: "ChemLink FZCO",
        origin: "Germany",
        sourceType: "Consolidated import",
        landedCostUsdPerKg: 5.11,
        leadTimeDays: 14,
      },
      {
        name: "Release liner and packaging",
        percentage: "7%",
        supplier: "Dubai Industrial Films",
        origin: "UAE",
        sourceType: "Local purchase",
        landedCostUsdPerKg: 0.76,
        leadTimeDays: 3,
      },
    ],
    process: {
      compoundCode: "SIL-260F",
      cureSystem: "Sheet calendaring and post-cure",
      batchSizeKg: 160,
      monthlyOutputKg: 3300,
      scrapRate: "3.1%",
      qaChecks: [
        "Thickness mapping every roll",
        "Surface cleanliness inspection under lamp",
        "Heat aging sample retention",
      ],
    },
    overheadAllocation: [
      { label: "Labor", monthlyUsd: 1540, allocationBasis: "Calendaring, cutting, and wrapping hours" },
      { label: "Electricity", monthlyUsd: 1040, allocationBasis: "Post-cure oven and roll finishing power" },
      { label: "Warehouse rent", monthlyUsd: 610, allocationBasis: "Roll rack storage area" },
      { label: "Maintenance", monthlyUsd: 290, allocationBasis: "Calender and slitter maintenance" },
    ],
    competitorBenchmarks: [
      {
        competitor: "ThermaSeal Materials",
        market: "UAE",
        currency: "AED",
        unitPrice: 392,
        note: "3 mm roll price observed for fabrication shop supply.",
      },
      {
        competitor: "Oman Gasket Supply",
        market: "Oman",
        currency: "OMR",
        unitPrice: 41.8,
        note: "6 mm sheet roll quoted with local cut-to-size service.",
      },
    ],
  },
  {
    slug: "natural-rubber-anti-vibration-mount",
    priceBookNotes:
      "Mount pricing is influenced by bonded insert cost, thread size, and vibration-load class rather than raw compound cost alone.",
    sourcingNotes: [
      "Natural rubber base stock is blended with SBR for cost control and stable vibration response across recurring machine programs.",
      "Threaded studs are sourced locally with zinc plating to keep replacement batches quick.",
    ],
    rawMaterials: [
      {
        name: "Natural rubber / SBR blend",
        percentage: "49%",
        supplier: "FlexCore Elastomers",
        origin: "Thailand",
        sourceType: "Direct import",
        landedCostUsdPerKg: 2.14,
        leadTimeDays: 18,
      },
      {
        name: "Carbon black N330",
        percentage: "21%",
        supplier: "Industrial Filler Network",
        origin: "Saudi Arabia",
        sourceType: "Regional distributor",
        landedCostUsdPerKg: 1.24,
        leadTimeDays: 7,
      },
      {
        name: "Bonding system and primer",
        percentage: "5%",
        supplier: "Process Bond Tech",
        origin: "Turkey",
        sourceType: "Regional distributor",
        landedCostUsdPerKg: 4.22,
        leadTimeDays: 11,
      },
      {
        name: "Zinc-plated inserts and studs",
        percentage: "17%",
        supplier: "Sharjah Fastener Works",
        origin: "UAE",
        sourceType: "Local fabrication",
        landedCostUsdPerKg: 1.56,
        leadTimeDays: 5,
      },
    ],
    process: {
      compoundCode: "NRM-440V",
      cureSystem: "Rubber-metal bonded compression molding",
      batchSizeKg: 140,
      monthlyOutputKg: 3700,
      scrapRate: "2.9%",
      qaChecks: [
        "Rubber-metal bond peel sample",
        "Thread depth and pull-out verification",
        "Load-deflection sample test by batch",
      ],
    },
    overheadAllocation: [
      { label: "Labor", monthlyUsd: 1320, allocationBasis: "Insert loading, molding, and finishing hours" },
      { label: "Electricity", monthlyUsd: 810, allocationBasis: "Compression press and blasting booth load" },
      { label: "Warehouse rent", monthlyUsd: 480, allocationBasis: "Packed unit storage footprint" },
      { label: "Maintenance", monthlyUsd: 250, allocationBasis: "Mold and insert fixture upkeep" },
    ],
    competitorBenchmarks: [
      {
        competitor: "VibeStop Arabia",
        market: "Saudi Arabia",
        currency: "SAR",
        unitPrice: 42.3,
        note: "80 mm anti-vibration mount with plated hardware.",
      },
      {
        competitor: "GCC Machine Pads",
        market: "UAE",
        currency: "AED",
        unitPrice: 26.4,
        note: "Compact 50 mm mount sold to maintenance contractors.",
      },
    ],
  },
  {
    slug: "epdm-facade-glazing-gasket",
    priceBookNotes:
      "Facade gasket price bands are managed by profile complexity, project volume, and color-marking requirements for installers.",
    sourcingNotes: [
      "Facade projects often require reservation of polymer and additive stock well ahead of installation schedules.",
      "Aluminium system fitment gauges are maintained in-house to reduce profile mismatch risk during project dispatch.",
    ],
    rawMaterials: [
      {
        name: "EPDM base polymer",
        percentage: "48%",
        supplier: "Desert Polymer Trading",
        origin: "South Korea",
        sourceType: "Direct import",
        landedCostUsdPerKg: 2.52,
        leadTimeDays: 21,
      },
      {
        name: "Carbon black N550",
        percentage: "20%",
        supplier: "BlackFill Middle East",
        origin: "India",
        sourceType: "Regional distributor",
        landedCostUsdPerKg: 1.18,
        leadTimeDays: 11,
      },
      {
        name: "UV stabilizer package",
        percentage: "7%",
        supplier: "ChemLink FZCO",
        origin: "Germany",
        sourceType: "Consolidated import",
        landedCostUsdPerKg: 3.88,
        leadTimeDays: 14,
      },
      {
        name: "Process oil and aids",
        percentage: "12%",
        supplier: "Gulf Additives Hub",
        origin: "UAE",
        sourceType: "Local purchase",
        landedCostUsdPerKg: 0.93,
        leadTimeDays: 4,
      },
    ],
    process: {
      compoundCode: "EPDM-FG-615",
      cureSystem: "Continuous extrusion and cut-kit finishing",
      batchSizeKg: 170,
      monthlyOutputKg: 5800,
      scrapRate: "3.2%",
      qaChecks: [
        "Projection gauge against aluminium section",
        "UV color consistency review",
        "Cut-length and corner pack verification",
      ],
    },
    overheadAllocation: [
      { label: "Labor", monthlyUsd: 1980, allocationBasis: "Extrusion line and project kit packing hours" },
      { label: "Electricity", monthlyUsd: 1140, allocationBasis: "Extrusion, cooling, and cut-length systems" },
      { label: "Warehouse rent", monthlyUsd: 760, allocationBasis: "Project coil and kit staging space" },
      { label: "Maintenance", monthlyUsd: 390, allocationBasis: "Die calibration and cutting line upkeep" },
    ],
    competitorBenchmarks: [
      {
        competitor: "FacadeRubber Systems",
        market: "Qatar",
        currency: "QAR",
        unitPrice: 14.4,
        note: "12 mm glazing gasket quoted for curtain wall package.",
      },
      {
        competitor: "Saudi Glaze Profiles",
        market: "Saudi Arabia",
        currency: "SAR",
        unitPrice: 15.2,
        note: "18 mm facade profile with color-marked installation batches.",
      },
    ],
  },
];

export function getFeaturedProducts() {
  return products.filter((product) => product.featured);
}

export function getProductBySlug(slug: string) {
  return products.find((product) => product.slug === slug);
}

export function getOwnerRecordBySlug(slug: string) {
  return ownerProductRecords.find((record) => record.slug === slug);
}

export function getTotalInternalCosts() {
  return internalCostBuckets.reduce((total, bucket) => total + bucket.monthlyUsd, 0);
}

export function formatCurrency(value: number, currency: CurrencyCode) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: currency === "OMR" ? 3 : 2,
  }).format(value);
}