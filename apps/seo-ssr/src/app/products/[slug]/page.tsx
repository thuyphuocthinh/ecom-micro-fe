import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  fetchProductByIdentifier,
  fetchCategoryByIdentifier,
  fetchSitemapData,
  fetchPublishedProducts,
} from "@/services/api";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

const SHELL_URL = process.env.NEXT_PUBLIC_SHELL_URL || "";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3003";

export async function generateStaticParams() {
  const sitemap = await fetchSitemapData();
  const productSlugs = sitemap
    .filter((item) => item.loc.startsWith("/products/"))
    .map((item) => ({
      slug: item.loc.replace("/products/", ""),
    }));

  return productSlugs;
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await fetchProductByIdentifier(slug);

  if (!product) {
    return {
      title: "Không tìm thấy sản phẩm",
      robots: { index: false, follow: false },
    };
  }

  const title = product.metaTitle || `${product.name} - Giá tốt, chính hãng`;
  const description =
    product.metaDescription ||
    product.description ||
    `Mua ngay ${product.name} chính hãng, giá ưu đãi tại Ecom Store. Giao hàng toàn quốc.`;
  const canonicalUrl =
    product.canonicalUrl ||
    `${SITE_URL}/products/${product.slug || product.id}`;
  const ogImage =
    product.ogImage || product.thumbnail || `${SITE_URL}/og-default.png`;

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      type: "website",
      locale: "vi_VN",
      url: canonicalUrl,
      title,
      description,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: product.name,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
  };
}

function formatVnd(amount: number): string {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
}

export default async function ProductDetailPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await fetchProductByIdentifier(slug);

  if (!product) {
    notFound();
  }

  const category = product.categoryId
    ? await fetchCategoryByIdentifier(product.categoryId)
    : null;

  const related = await fetchPublishedProducts({
    categoryId: product.categoryId,
    limit: 4,
  });
  const relatedProducts = related.data.filter((p) => p.id !== product.id);

  // Default selected SKU is first in stock SKU or first SKU
  const activeSku = product.skus?.find((s) => s.inStock) || product.skus?.[0];
  const price = activeSku?.price ?? product.minPrice;
  const compareAtPrice = activeSku?.compareAtPrice;
  const discountPercent =
    compareAtPrice && compareAtPrice > price
      ? Math.round(((compareAtPrice - price) / compareAtPrice) * 100)
      : null;

  // Schema.org Product JSON-LD structured data
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    image: product.thumbnail ? [product.thumbnail] : [],
    description: product.description || product.name,
    sku: activeSku?.skuCode || product.id,
    offers: {
      "@type": "Offer",
      url: `${SITE_URL}/products/${product.slug || product.id}`,
      priceCurrency: "VND",
      price: price,
      availability: product.inStock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      itemCondition: "https://schema.org/NewCondition",
    },
  };

  return (
    <>
      {/* Structured Data (Schema.org) for Rich Snippet */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="max-w-[1280px] mx-auto px-4 sm:px-10 py-6 sm:py-8">
        {/* Breadcrumbs */}
        <nav
          aria-label="Đường dẫn"
          className="flex items-center gap-2 text-sm text-[#738096] mb-6 flex-wrap"
        >
          <Link href="/" className="hover:text-brand transition-colors">
            Trang chủ
          </Link>
          <span>/</span>
          {category ? (
            <>
              <Link
                href={`/categories/${category.slug || category.id}`}
                className="hover:text-brand transition-colors"
              >
                {category.name}
              </Link>
              <span>/</span>
            </>
          ) : (
            <>
              <Link
                href="/search"
                className="hover:text-brand transition-colors"
              >
                Sản phẩm
              </Link>
              <span>/</span>
            </>
          )}
          <span className="text-ink font-medium truncate max-w-[280px]">
            {product.name}
          </span>
        </nav>

        {/* Product Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Left: Product Images */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            <div className="aspect-square bg-white rounded-2xl border border-line overflow-hidden flex items-center justify-center p-6 relative">
              {product.thumbnail ? (
                <img
                  src={product.thumbnail}
                  alt={product.name}
                  className="max-h-full max-w-full object-contain"
                  loading="eager"
                />
              ) : (
                <div className="text-[#a0aec0] flex flex-col items-center gap-2">
                  <svg
                    className="w-16 h-16"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="1.5"
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <span>Chưa có ảnh</span>
                </div>
              )}

              {discountPercent && (
                <span className="absolute top-4 left-4 bg-[#ff4d4f] text-white text-xs font-bold px-2.5 py-1 rounded-md">
                  -{discountPercent}%
                </span>
              )}
            </div>
          </div>

          {/* Right: Buy Box */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            <div>
              <span className="text-xs uppercase tracking-wider font-semibold text-brand">
                {category?.name || "Chính hãng"}
              </span>
              <h1 className="text-2xl sm:text-3xl font-head font-bold text-ink mt-1">
                {product.name}
              </h1>
            </div>

            {/* Price Box */}
            <div className="p-4 rounded-xl bg-white border border-line flex items-baseline gap-3">
              <span className="text-2xl sm:text-3xl font-head font-bold text-brand">
                {formatVnd(price)}
              </span>
              {compareAtPrice && compareAtPrice > price && (
                <span className="text-sm sm:text-base text-[#8c94a3] line-through">
                  {formatVnd(compareAtPrice)}
                </span>
              )}
            </div>

            {/* In stock status */}
            <div className="flex items-center gap-2">
              <span
                className={`inline-block w-2.5 h-2.5 rounded-full ${
                  product.inStock ? "bg-[#52c41a]" : "bg-[#ff4d4f]"
                }`}
              />
              <span className="text-sm font-medium">
                {product.inStock ? "Còn hàng trong kho" : "Tạm hết hàng"}
              </span>
            </div>

            {/* SKUs Variant Display */}
            {product.skus && product.skus.length > 1 && (
              <div className="flex flex-col gap-2">
                <span className="text-xs font-semibold text-[#556070] uppercase tracking-wider">
                  Tùy chọn phiên bản:
                </span>
                <div className="flex flex-wrap gap-2">
                  {product.skus.map((sku) => {
                    const attrText =
                      Object.entries(sku.attributes || {})
                        .map(([k, v]) => `${k}: ${v}`)
                        .join(" - ") || sku.skuCode;
                    return (
                      <span
                        key={sku.id}
                        className={`text-xs px-3 py-1.5 rounded-lg border font-medium ${
                          sku.id === activeSku?.id
                            ? "border-brand bg-brand/5 text-brand"
                            : "border-line bg-white text-ink"
                        }`}
                      >
                        {attrText} ({formatVnd(sku.price)})
                      </span>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Call to Action Button (Transition Boundary to Shell SPA) */}
            <div className="flex flex-col gap-3 pt-2">
              <a
                href={`${SHELL_URL}/cart`}
                className="w-full h-12 rounded-xl bg-brand hover:bg-brand-hover text-white font-semibold flex items-center justify-center gap-2 transition-colors shadow-sm"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                  />
                </svg>
                <span>Thêm vào giỏ hàng</span>
              </a>

              <a
                href={`${SHELL_URL}/checkout`}
                className="w-full h-12 rounded-xl border border-brand text-brand hover:bg-brand/5 font-semibold flex items-center justify-center transition-colors"
              >
                Mua ngay
              </a>
            </div>

            {/* Shipping & Returns perks */}
            <div className="border-t border-line pt-4 grid grid-cols-2 gap-3 text-xs text-[#556070]">
              <div className="flex items-center gap-2">
                <svg
                  className="w-4 h-4 text-brand"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <span>Miễn phí vận chuyển</span>
              </div>
              <div className="flex items-center gap-2">
                <svg
                  className="w-4 h-4 text-brand"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                <span>Đổi trả trong 7 ngày</span>
              </div>
            </div>
          </div>
        </div>

        {/* Product Description */}
        {product.description && (
          <div className="mt-12 bg-white rounded-2xl border border-line p-6 sm:p-8">
            <h2 className="text-xl font-head font-bold text-ink mb-4">
              Mô tả sản phẩm
            </h2>
            <div className="prose max-w-none text-[#404b5a] text-sm sm:text-base leading-relaxed whitespace-pre-line">
              {product.description}
            </div>
          </div>
        )}

        {/* Related Products Section */}
        {relatedProducts.length > 0 && (
          <section className="mt-14">
            <h2 className="text-xl sm:text-2xl font-head font-bold text-ink mb-6">
              Sản phẩm liên quan
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {relatedProducts.map((rel) => (
                <Link
                  key={rel.id}
                  href={`/products/${rel.slug || rel.id}`}
                  className="bg-white rounded-xl border border-line p-4 flex flex-col gap-3 hover:shadow-md transition-shadow group"
                >
                  <div className="aspect-square rounded-lg bg-bg overflow-hidden flex items-center justify-center p-3">
                    {rel.thumbnail ? (
                      <img
                        src={rel.thumbnail}
                        alt={rel.name}
                        className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform"
                        loading="lazy"
                      />
                    ) : (
                      <span className="text-xs text-[#a0aec0]">
                        Chưa có ảnh
                      </span>
                    )}
                  </div>
                  <h3 className="font-semibold text-sm text-ink line-clamp-2 group-hover:text-brand transition-colors">
                    {rel.name}
                  </h3>
                  <div className="mt-auto font-bold text-brand text-sm">
                    {formatVnd(rel.minPrice)}
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  );
}
