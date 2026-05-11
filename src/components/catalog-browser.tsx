"use client";

import Link from "next/link";
import { startTransition, useDeferredValue, useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { ProductCard } from "@/components/product-card";
import { formatCountLabel, publicNavigation } from "@/lib/public-site";
import type { Product } from "@/lib/site-data";

const allCategoriesLabel = "All categories";
const allMaterialsLabel = "All materials";
const maxComparedProducts = 3;

const sortOptions = [
  { value: "relevance", label: "Best match" },
  { value: "name", label: "Name A-Z" },
  { value: "lead-time", label: "Fastest lead time" },
  { value: "variants", label: "Most variants" },
] as const;

type CatalogSort = (typeof sortOptions)[number]["value"];
type SearchParamReader = Pick<URLSearchParams, "get" | "has" | "toString">;

function isSortValue(value: string | null): value is CatalogSort {
  return sortOptions.some((option) => option.value === value);
}

function formatMinimumOrderRange(product: Product) {
  const values = product.variants.map((variant) => variant.minimumOrderQuantity);
  const minimum = Math.min(...values);
  const maximum = Math.max(...values);

  return minimum === maximum ? `${minimum}` : `${minimum}-${maximum}`;
}

function buildComparisonRows(product: Product) {
  return {
    category: product.category,
    material: product.material,
    leadTime: `${product.standardLeadTimeDays} days`,
    variants: `${product.variants.length}`,
    minimumOrderQuantity: formatMinimumOrderRange(product),
    applications: product.applications.slice(0, 3).join(", "),
    supplyFormats: product.supplyFormats.join(", "),
    certifications: product.certifications.join(", "),
  };
}

function getRelevanceScore(product: Product, query: string) {
  if (!query) {
    return 0;
  }

  let score = 0;
  const name = product.name.toLowerCase();
  const material = product.material.toLowerCase();
  const category = product.category.toLowerCase();

  if (name.includes(query)) {
    score += 120;
  }

  if (material.includes(query)) {
    score += 75;
  }

  if (category.includes(query)) {
    score += 60;
  }

  product.applications.forEach((application) => {
    if (application.toLowerCase().includes(query)) {
      score += 32;
    }
  });

  product.industries.forEach((industry) => {
    if (industry.toLowerCase().includes(query)) {
      score += 26;
    }
  });

  product.variants.forEach((variant) => {
    if (variant.code.toLowerCase().includes(query)) {
      score += 90;
    }

    if (variant.description.toLowerCase().includes(query)) {
      score += 28;
    }

    variant.dimensions.forEach((dimension) => {
      if (`${dimension.label} ${dimension.value}`.toLowerCase().includes(query)) {
        score += 18;
      }
    });
  });

  return score;
}

function sortCatalogProducts(products: Product[], sortValue: CatalogSort, query: string) {
  const nextProducts = [...products];

  nextProducts.sort((left, right) => {
    switch (sortValue) {
      case "name":
        return left.name.localeCompare(right.name);
      case "lead-time":
        return left.standardLeadTimeDays - right.standardLeadTimeDays || left.name.localeCompare(right.name);
      case "variants":
        return right.variants.length - left.variants.length || left.name.localeCompare(right.name);
      case "relevance":
      default: {
        if (!query) {
          return 0;
        }

        return (
          getRelevanceScore(right, query) - getRelevanceScore(left, query) ||
          left.name.localeCompare(right.name)
        );
      }
    }
  });

  return nextProducts;
}

function resolveInitialState(products: Product[], searchParams: SearchParamReader) {
  const categories = new Set(products.map((product) => product.category));
  const materials = new Set(products.map((product) => product.material));
  const sortValue = searchParams.get("sort");

  return {
    query: searchParams.get("q") ?? "",
    category:
      searchParams.has("category") && categories.has(searchParams.get("category") ?? "")
        ? (searchParams.get("category") as string)
        : allCategoriesLabel,
    material:
      searchParams.has("material") && materials.has(searchParams.get("material") ?? "")
        ? (searchParams.get("material") as string)
        : allMaterialsLabel,
    sort: isSortValue(sortValue) ? sortValue : "relevance",
    compareSlugs: (searchParams.get("compare") ?? "")
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean)
      .filter((value, index, values) => values.indexOf(value) === index)
      .filter((value) => products.some((product) => product.slug === value))
      .slice(0, maxComparedProducts),
  };
}

function buildCatalogQueryString(state: {
  query: string;
  category: string;
  material: string;
  sort: CatalogSort;
  compareSlugs: string[];
}) {
  const nextParams = new URLSearchParams();
  const trimmedQuery = state.query.trim();

  if (trimmedQuery) {
    nextParams.set("q", trimmedQuery);
  }

  if (state.category !== allCategoriesLabel) {
    nextParams.set("category", state.category);
  }

  if (state.material !== allMaterialsLabel) {
    nextParams.set("material", state.material);
  }

  if (state.sort !== "relevance") {
    nextParams.set("sort", state.sort);
  }

  if (state.compareSlugs.length > 0) {
    nextParams.set("compare", state.compareSlugs.join(","));
  }

  return nextParams.toString();
}

function matchesSearch(product: Product, query: string) {
  if (!query) {
    return true;
  }

  const haystack = [
    product.name,
    product.category,
    product.material,
    product.summary,
    product.description,
    ...product.applications,
    ...product.industries,
    ...product.features,
    ...product.certifications,
    ...product.supplyFormats,
    ...product.variants.flatMap((variant) => [
      variant.code,
      variant.description,
      ...variant.dimensions.map((dimension) => `${dimension.label} ${dimension.value}`),
    ]),
  ]
    .join(" ")
    .toLowerCase();

  return haystack.includes(query);
}

export function CatalogBrowser({ products }: { products: Product[] }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const resolvedState = resolveInitialState(products, searchParams);
  const [searchQuery, setSearchQuery] = useState(resolvedState.query);
  const [selectedCategory, setSelectedCategory] = useState(resolvedState.category);
  const [selectedMaterial, setSelectedMaterial] = useState(resolvedState.material);
  const [sortValue, setSortValue] = useState<CatalogSort>(resolvedState.sort);
  const [compareSlugs, setCompareSlugs] = useState<string[]>(resolvedState.compareSlugs);
  const [shareMessage, setShareMessage] = useState<string>("");
  const deferredSearchQuery = useDeferredValue(searchQuery);

  const categories = Array.from(new Set(products.map((product) => product.category)));
  const materials = Array.from(new Set(products.map((product) => product.material)));
  const normalizedQuery = deferredSearchQuery.trim().toLowerCase();
  const catalogQueryString = buildCatalogQueryString({
    query: deferredSearchQuery,
    category: selectedCategory,
    material: selectedMaterial,
    sort: sortValue,
    compareSlugs,
  });

  const categorySummaries = categories
    .map((category) => {
      const categoryProducts = products.filter((product) => product.category === category);

      return {
        category,
        productCount: categoryProducts.length,
        variantCount: categoryProducts.reduce((total, product) => total + product.variants.length, 0),
        fastestLeadTime: Math.min(...categoryProducts.map((product) => product.standardLeadTimeDays)),
        materials: Array.from(new Set(categoryProducts.map((product) => product.material))).slice(0, 2),
      };
    })
    .sort((left, right) => right.productCount - left.productCount || left.category.localeCompare(right.category));
  const supportRoutes = publicNavigation.filter((route) => route.href !== "/products").slice(0, 3);

  useEffect(() => {
    const nextState = resolveInitialState(products, searchParams);

    setSearchQuery(nextState.query);
    setSelectedCategory(nextState.category);
    setSelectedMaterial(nextState.material);
    setSortValue(nextState.sort);
    setCompareSlugs(nextState.compareSlugs);
  }, [products, searchParams]);

  useEffect(() => {
    if (catalogQueryString === searchParams.toString()) {
      return;
    }

    startTransition(() => {
      const nextUrl = catalogQueryString ? `${pathname}?${catalogQueryString}` : pathname;
      window.history.replaceState(null, "", nextUrl);
    });
  }, [catalogQueryString, pathname, searchParams]);

  const filteredProducts = sortCatalogProducts(
    products.filter((product) => {
      if (selectedCategory !== allCategoriesLabel && product.category !== selectedCategory) {
        return false;
      }

      if (selectedMaterial !== allMaterialsLabel && product.material !== selectedMaterial) {
        return false;
      }

      return matchesSearch(product, normalizedQuery);
    }),
    sortValue,
    normalizedQuery,
  );

  const selectedProducts = compareSlugs
    .map((slug) => products.find((product) => product.slug === slug))
    .filter((product): product is Product => Boolean(product));
  const visibleVariants = filteredProducts.reduce((total, product) => total + product.variants.length, 0);

  const hasActiveFilters =
    normalizedQuery.length > 0 ||
    selectedCategory !== allCategoriesLabel ||
    selectedMaterial !== allMaterialsLabel ||
    sortValue !== "relevance";

  function clearFilters() {
    setSearchQuery("");
    setSelectedCategory(allCategoriesLabel);
    setSelectedMaterial(allMaterialsLabel);
    setSortValue("relevance");
  }

  function toggleCompare(slug: string) {
    setCompareSlugs((current) => {
      if (current.includes(slug)) {
        return current.filter((value) => value !== slug);
      }

      if (current.length >= maxComparedProducts) {
        return current;
      }

      return [...current, slug];
    });
  }

  async function copyCurrentView() {
    if (typeof window === "undefined") {
      return;
    }

    const shareUrl = catalogQueryString
      ? `${window.location.origin}${pathname}?${catalogQueryString}`
      : `${window.location.origin}${pathname}`;

    if (!navigator.clipboard) {
      setShareMessage("Copy is unavailable in this browser. Use the address bar URL instead.");
      return;
    }

    try {
      await navigator.clipboard.writeText(shareUrl);
      setShareMessage("Current catalog view copied to clipboard.");
    } catch {
      setShareMessage("Copy failed. Use the address bar URL instead.");
    }
  }

  const comparisonIsFull = compareSlugs.length >= maxComparedProducts;

  return (
    <div className="space-y-6">
      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <section className="panel rounded-[2.35rem] border border-white/65 p-5 md:p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <span className="eyebrow">Browse lanes</span>
              <h2 className="mt-4 display-title text-4xl font-semibold text-foreground md:text-5xl">
                Start with the right shelf before you open product cards.
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-muted">
                Large industrial catalogs work better when buyers can enter through a clear lane.
                These category tiles show product depth, variant volume, and the quickest lead time
                without forcing a full-card scan.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setSelectedCategory(allCategoriesLabel)}
              className="inline-flex items-center justify-center rounded-full border border-line bg-white/80 px-5 py-3 text-sm font-semibold text-foreground"
            >
              View all categories
            </button>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2 2xl:grid-cols-4">
            {categorySummaries.map((summary) => {
              const isActive = selectedCategory === summary.category;

              return (
                <button
                  key={summary.category}
                  type="button"
                  onClick={() => setSelectedCategory(summary.category)}
                  className={`text-left rounded-[1.8rem] border p-5 transition hover:-translate-y-0.5 ${
                    isActive
                      ? "border-accent bg-[rgba(222,240,204,0.78)] shadow-[0_18px_40px_-30px_rgba(47,125,58,0.45)]"
                      : "border-line bg-white/72 hover:border-accent"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-muted">
                        {formatCountLabel(summary.productCount, "family", "families")}
                      </p>
                      <h3 className="mt-3 text-2xl font-semibold text-foreground">
                        {summary.category}
                      </h3>
                    </div>
                    {isActive ? <span className="market-stamp">Active lane</span> : null}
                  </div>

                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-[1.25rem] border border-line bg-white/75 px-3 py-3">
                      <p className="text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-muted">
                        Variant sizes
                      </p>
                      <p className="mt-2 text-xl font-semibold text-foreground">
                        {summary.variantCount}
                      </p>
                    </div>
                    <div className="rounded-[1.25rem] border border-line bg-white/75 px-3 py-3">
                      <p className="text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-muted">
                        Fastest lead time
                      </p>
                      <p className="mt-2 text-xl font-semibold text-foreground">
                        {summary.fastestLeadTime} days
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {summary.materials.map((material) => (
                      <span
                        key={material}
                        className="rounded-full border border-[rgba(214,137,53,0.28)] bg-accent-warm-soft px-3 py-1 text-xs font-semibold text-accent-berry"
                      >
                        {material}
                      </span>
                    ))}
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        <section className="market-card-dark rounded-[2.35rem] p-6 md:p-7">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/60">
            Shortlist and share
          </p>
          <h2 className="mt-4 display-title text-4xl font-semibold text-white">
            Keep teams aligned while they narrow a large catalog.
          </h2>
          <p className="mt-4 text-sm leading-7 text-white/74">
            McMaster-style utility matters more than decoration at this stage. Keep the current
            slice visible, shortlist candidates, then move directly into RFQ.
          </p>

          <div className="mt-5 grid gap-3 sm:grid-cols-3 xl:grid-cols-1 2xl:grid-cols-3">
            <div className="rounded-[1.35rem] border border-white/10 bg-white/10 px-4 py-4">
              <p className="text-[0.68rem] uppercase tracking-[0.18em] text-white/58">
                Matching families
              </p>
              <p className="mt-2 text-3xl font-semibold text-white">{filteredProducts.length}</p>
            </div>
            <div className="rounded-[1.35rem] border border-white/10 bg-white/10 px-4 py-4">
              <p className="text-[0.68rem] uppercase tracking-[0.18em] text-white/58">
                Visible variants
              </p>
              <p className="mt-2 text-3xl font-semibold text-white">{visibleVariants}</p>
            </div>
            <div className="rounded-[1.35rem] border border-white/10 bg-white/10 px-4 py-4">
              <p className="text-[0.68rem] uppercase tracking-[0.18em] text-white/58">
                Shortlist tray
              </p>
              <p className="mt-2 text-3xl font-semibold text-white">
                {selectedProducts.length}/{maxComparedProducts}
              </p>
            </div>
          </div>

          <div className="mt-5 rounded-[1.6rem] border border-white/10 bg-white/8 p-4">
            <p className="text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-white/58">
              Current shortlist
            </p>
            {selectedProducts.length > 0 ? (
              <ul className="mt-3 grid gap-3 text-sm leading-7 text-white/78">
                {selectedProducts.map((product) => (
                  <li key={product.slug} className="flex items-center justify-between gap-3">
                    <span>{product.name}</span>
                    <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-white/78">
                      {product.category}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 text-sm leading-7 text-white/74">
                Add products to the compare tray and this board becomes a live shortlist for RFQ preparation.
              </p>
            )}
          </div>

          {shareMessage ? (
            <div className="mt-4 rounded-[1.3rem] border border-white/12 bg-white/10 px-4 py-3 text-sm text-white/82">
              {shareMessage}
            </div>
          ) : null}

          <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <button
              type="button"
              onClick={copyCurrentView}
              className="inline-flex items-center justify-center rounded-full border border-white/14 bg-white/10 px-5 py-3 text-sm font-semibold text-white"
            >
              Copy current view
            </button>
            <Link
              href="/rfq"
              className="brand-button inline-flex items-center justify-center rounded-full px-5 py-3 text-sm font-semibold"
            >
              Continue to RFQ
            </Link>
          </div>
        </section>
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.34fr_0.66fr]">
        <aside className="grid gap-6 self-start xl:sticky xl:top-36">
          <div className="panel rounded-[2.2rem] border border-white/65 p-5 md:p-6">
            <div className="flex flex-col gap-4">
              <div>
                <span className="eyebrow">Search the aisles</span>
                <p className="mt-4 text-sm leading-7 text-muted">
                  Search by product name, material, application, dimension, or variant code.
                </p>
              </div>

              <label className="grid gap-2">
                <span className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
                  Search catalog
                </span>
                <input
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="EPDM, gasket, 24 mm, O-ring..."
                  className="rounded-[1.35rem] border border-line bg-white/80 px-4 py-3 text-sm text-foreground outline-none transition focus:border-accent"
                />
              </label>

              <label className="grid gap-2">
                <span className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
                  Sort results
                </span>
                <select
                  value={sortValue}
                  onChange={(event) => setSortValue(event.target.value as CatalogSort)}
                  className="rounded-[1.35rem] border border-line bg-white/80 px-4 py-3 text-sm text-foreground outline-none transition focus:border-accent"
                >
                  {sortOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>

              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
                  Category
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {[allCategoriesLabel, ...categories].map((category) => {
                    const isActive = selectedCategory === category;

                    return (
                      <button
                        key={category}
                        type="button"
                        onClick={() => setSelectedCategory(category)}
                        className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                          isActive
                            ? "border-accent bg-[rgba(222,240,204,0.85)] text-accent-deep"
                            : "border-line bg-white/70 text-foreground hover:border-accent"
                        }`}
                      >
                        {category}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
                  Material
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {[allMaterialsLabel, ...materials].map((material) => {
                    const isActive = selectedMaterial === material;

                    return (
                      <button
                        key={material}
                        type="button"
                        onClick={() => setSelectedMaterial(material)}
                        className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                          isActive
                            ? "border-[rgba(214,137,53,0.32)] bg-accent-warm-soft text-accent-berry"
                            : "border-line bg-white/70 text-foreground hover:border-[rgba(214,137,53,0.32)]"
                        }`}
                      >
                        {material}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row xl:flex-col">
                <div className="rounded-[1.45rem] border border-line bg-white/70 px-4 py-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
                    Matching products
                  </p>
                  <p className="mt-2 text-3xl font-semibold text-foreground">
                    {filteredProducts.length}
                  </p>
                </div>

                <div className="rounded-[1.45rem] border border-line bg-white/70 px-4 py-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
                    Compare tray
                  </p>
                  <p className="mt-2 text-3xl font-semibold text-foreground">
                    {selectedProducts.length}/{maxComparedProducts}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={clearFilters}
                  disabled={!hasActiveFilters}
                  className="inline-flex items-center justify-center rounded-full border border-line bg-white/80 px-5 py-3 text-sm font-semibold text-foreground disabled:opacity-45"
                >
                  Clear filters
                </button>
              </div>
            </div>
          </div>

          <div className="market-card-dark rounded-[2.2rem] p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/60">
              Browse rules
            </p>
            <ul className="mt-5 grid gap-3 text-sm leading-7 text-white/78">
              <li>Public pages show dimensions, applications, and technical fit.</li>
              <li>Prices stay off the shelf and move through RFQ or owner workflow.</li>
              <li>Manufacturing chemistry and cost inputs remain owner-only.</li>
            </ul>

            <div className="mt-5 rounded-[1.6rem] border border-white/10 bg-white/8 p-4">
              <p className="text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-white/58">
                Need another route?
              </p>
              <div className="mt-3 grid gap-3">
                {supportRoutes.map((route) => (
                  <Link
                    key={route.href}
                    href={route.href}
                    className="rounded-[1.3rem] border border-white/10 bg-white/8 px-4 py-4 transition hover:bg-white/10"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-white/50">
                          {route.section}
                        </p>
                        <p className="mt-1 text-sm font-semibold text-white">{route.label}</p>
                      </div>
                      <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-white/78">
                        {route.badge}
                      </span>
                    </div>
                    <p className="mt-2 text-xs leading-6 text-white/70">{route.description}</p>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </aside>

        <div className="grid gap-5">
        <div className="panel flex flex-col gap-4 rounded-[2rem] border border-white/65 p-5 md:flex-row md:items-center md:justify-between md:px-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
              Live catalog results
            </p>
            <p className="mt-2 text-sm leading-7 text-muted">
              {formatCountLabel(
                filteredProducts.length,
                "matching product family",
                "matching product families",
              )}
              {normalizedQuery ? ` for “${deferredSearchQuery.trim()}”` : ""}.
            </p>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent-deep">
              {visibleVariants} visible variants across the current slice.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {sortValue !== "relevance" ? (
              <span className="market-stamp">
                {sortOptions.find((option) => option.value === sortValue)?.label}
              </span>
            ) : null}
            {selectedCategory !== allCategoriesLabel ? (
              <span className="market-stamp">{selectedCategory}</span>
            ) : null}
            {selectedMaterial !== allMaterialsLabel ? (
              <span className="market-stamp">{selectedMaterial}</span>
            ) : null}
            {selectedProducts.length > 0 ? (
              <span className="market-stamp">Compare {selectedProducts.length}</span>
            ) : null}
          </div>
        </div>

        {selectedProducts.length > 0 ? (
          <div className="panel rounded-[2.2rem] border border-white/65 p-5 md:p-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div>
                <span className="eyebrow">Compare selected products</span>
                <h3 className="mt-4 display-title text-4xl font-semibold text-foreground">
                  Side-by-side product snapshot.
                </h3>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-muted">
                  Select up to {maxComparedProducts} products to compare their material, lead time,
                  variants, and common commercial attributes before you request a quote.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={() => setCompareSlugs([])}
                  className="inline-flex items-center justify-center rounded-full border border-line bg-white/80 px-5 py-3 text-sm font-semibold text-foreground"
                >
                  Clear comparison
                </button>
              </div>
            </div>

            {selectedProducts.length < 2 ? (
              <div className="mt-6 rounded-[1.6rem] border border-line bg-white/70 px-5 py-5 text-sm leading-7 text-muted">
                Select at least one more product card to make the comparison more useful.
              </div>
            ) : null}

            <div className="mt-6 overflow-x-auto rounded-[1.7rem] border border-line bg-white/70">
              <table className="min-w-[52rem] w-full border-collapse text-left">
                <thead className="bg-surface-strong text-xs font-semibold uppercase tracking-[0.18em] text-muted">
                  <tr>
                    <th className="px-4 py-3">Attribute</th>
                    {selectedProducts.map((product) => (
                      <th key={product.slug} className="px-4 py-3">
                        {product.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    { label: "Category", key: "category" as const },
                    { label: "Material", key: "material" as const },
                    { label: "Lead time", key: "leadTime" as const },
                    { label: "Variant count", key: "variants" as const },
                    { label: "MOQ range", key: "minimumOrderQuantity" as const },
                    { label: "Applications", key: "applications" as const },
                    { label: "Supply formats", key: "supplyFormats" as const },
                    { label: "Certifications", key: "certifications" as const },
                  ].map((row) => (
                    <tr key={row.key} className="border-t border-line align-top">
                      <td className="px-4 py-4 text-sm font-semibold text-foreground">{row.label}</td>
                      {selectedProducts.map((product) => {
                        const comparisonRow = buildComparisonRows(product);

                        return (
                          <td key={`${product.slug}-${row.key}`} className="px-4 py-4 text-sm leading-7 text-muted">
                            {comparisonRow[row.key]}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : null}

        {filteredProducts.length > 0 ? (
          <div className="grid gap-5 lg:grid-cols-2">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.slug}
                product={product}
                footerExtras={
                  <button
                    type="button"
                    onClick={() => toggleCompare(product.slug)}
                    disabled={!compareSlugs.includes(product.slug) && comparisonIsFull}
                    className={`inline-flex items-center justify-center rounded-full border px-4 py-2 text-sm font-semibold transition disabled:opacity-45 ${
                      compareSlugs.includes(product.slug)
                        ? "border-accent bg-[rgba(222,240,204,0.85)] text-accent-deep"
                        : "border-line bg-white/80 text-foreground hover:border-accent"
                    }`}
                  >
                    {compareSlugs.includes(product.slug) ? "Remove from compare" : "Add to compare"}
                  </button>
                }
              />
            ))}
          </div>
        ) : (
          <div className="panel rounded-[2.2rem] border border-white/65 p-8 text-center">
            <span className="eyebrow">No matches</span>
            <h3 className="mt-5 display-title text-4xl font-semibold text-foreground">
              No product matches the current search.
            </h3>
            <p className="mt-4 text-sm leading-7 text-muted">
              Try a wider category, reset the material filter, or search with a broader term like
              the application, product family, or base material.
            </p>
          </div>
        )}
        </div>
      </div>
    </div>
  );
}