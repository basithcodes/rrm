"use client";

import { startTransition, useDeferredValue, useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { ProductCard } from "@/components/product-card";
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
  const deferredSearchQuery = useDeferredValue(searchQuery);

  const categories = Array.from(new Set(products.map((product) => product.category)));
  const materials = Array.from(new Set(products.map((product) => product.material)));
  const normalizedQuery = deferredSearchQuery.trim().toLowerCase();

  useEffect(() => {
    const nextState = resolveInitialState(products, searchParams);

    setSearchQuery(nextState.query);
    setSelectedCategory(nextState.category);
    setSelectedMaterial(nextState.material);
    setSortValue(nextState.sort);
    setCompareSlugs(nextState.compareSlugs);
  }, [products, searchParams]);

  useEffect(() => {
    const nextQueryString = buildCatalogQueryString({
      query: deferredSearchQuery,
      category: selectedCategory,
      material: selectedMaterial,
      sort: sortValue,
      compareSlugs,
    });

    if (nextQueryString === searchParams.toString()) {
      return;
    }

    startTransition(() => {
      const nextUrl = nextQueryString ? `${pathname}?${nextQueryString}` : pathname;
      window.history.replaceState(null, "", nextUrl);
    });
  }, [compareSlugs, deferredSearchQuery, pathname, searchParams, selectedCategory, selectedMaterial, sortValue]);

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

  const comparisonIsFull = compareSlugs.length >= maxComparedProducts;

  return (
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
            Launch rules
          </p>
          <ul className="mt-5 grid gap-3 text-sm leading-7 text-white/78">
            <li>Public pages show dimensions, applications, and technical fit.</li>
            <li>Prices stay off the shelf and move through RFQ or owner workflow.</li>
            <li>Manufacturing chemistry and cost inputs remain owner-only.</li>
          </ul>
        </div>
      </aside>

      <div className="grid gap-5">
        <div className="panel flex flex-col gap-4 rounded-[2rem] border border-white/65 p-5 md:flex-row md:items-center md:justify-between md:px-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
              Live catalog results
            </p>
            <p className="mt-2 text-sm leading-7 text-muted">
              {filteredProducts.length} matching product family{filteredProducts.length === 1 ? "" : "ies"}
              {normalizedQuery ? ` for “${deferredSearchQuery.trim()}”` : ""}.
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
  );
}