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

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = getProductBySlug(slug);

  if (!product) {
    return { title: "Product not found | RRM Industrial Rubber" };
  }

  return {
    title: `${product.name} | RRM Industrial Rubber`,
    description: product.summary,
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

  return (
    <main className="min-h-screen w-full bg-[#F7FAFC]">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <ParametricProductDetail product={product} />
      </div>
    </main>
  );
}
