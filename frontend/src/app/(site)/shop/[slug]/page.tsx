import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { OfferingDetailShell } from "@/components/offerings/offering-detail-shell";
import { apiClient } from "@/lib/api";
import {
  catalogPath,
  formatOfferingPrice,
  loadRelatedOfferings,
  offeringCta,
  productStats,
  toGalleryImages,
} from "@/lib/offerings";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  try {
    const { data } = await apiClient.getShopProduct(slug);
    return {
      title: data.seo_title?.trim() || data.name,
      description: data.seo_description?.trim() || data.description || undefined,
    };
  } catch {
    return { title: "Product" };
  }
}

export default async function ShopProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  try {
    const [{ data: product }, related] = await Promise.all([
      apiClient.getShopProduct(slug),
      loadRelatedOfferings("shop", slug),
    ]);
    const cta = offeringCta("shop");

    return (
      <OfferingDetailShell
        vertical="shop"
        title={product.name}
        description={product.description}
        priceLabel={formatOfferingPrice(product.price, { prefix: false })}
        ctaLabel={product.stock > 0 ? cta.label : "Out of stock"}
        ctaHref={product.stock > 0 ? cta.href : catalogPath("shop")}
        backHref={catalogPath("shop")}
        backLabel="All products"
        heroImageUrl={toGalleryImages(product.images)[0]?.url}
        galleryImages={toGalleryImages(product.images)}
        stats={productStats(product)}
        related={related}
        showInlineGallery
      />
    );
  } catch {
    notFound();
  }
}
