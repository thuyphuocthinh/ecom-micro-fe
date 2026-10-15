import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  fetchCategoryByIdentifier,
  fetchPublishedProducts,
} from "@/services/api";

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string; sort?: string }>;
}

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3003";

export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = await fetchCategoryByIdentifier(slug);

  if (!category) {
    return {
      title: "Không tìm thấy danh mục",
      robots: { index: false, follow: false },
    };
  }

  const title = `${category.name} - Sản phẩm chính hãng giá tốt`;
  const description = `Khám phá các sản phẩm thuộc danh mục ${category.name} chính hãng, giá ưu đãi tại Ecom Store. Giao hàng nhanh toàn quốc.`;
  const canonicalUrl = `${SITE_URL}/categories/${category.slug || category.id}`;

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
    },
  };
}

function formatVnd(amount: number): string {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
}

export default async function CategoryPage({
  params,
  searchParams,
}: CategoryPageProps) {
  const { slug } = await params;
  const { page = "1", sort = "newest" } = await searchParams;

  const category = await fetchCategoryByIdentifier(slug);
  if (!category) {
    notFound();
  }

  const currentPage = Math.max(1, parseInt(page, 10) || 1);
  const productsResult = await fetchPublishedProducts({
    categoryId: category.id,
    page: currentPage,
    limit: 12,
    sort,
  });

  const products = productsResult.data;
  const meta = productsResult.meta;

  return (
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
        <span className="text-ink font-medium">{category.name}</span>
      </nav>

      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-line p-6 sm:p-8 mb-8 flex flex-col gap-2">
        <h1 className="text-2xl sm:text-3xl font-head font-bold text-ink">
          {category.name}
        </h1>
        <p className="text-[#556070] text-sm sm:text-base">
          Tuyển chọn các sản phẩm chất lượng cao, chính hãng với giá cả hợp lý
          nhất.
        </p>
      </div>

      {/* Product List */}
      {products.length === 0 ? (
        <div className="bg-white rounded-2xl border border-line p-12 text-center text-[#738096]">
          <p className="text-base">
            Hiện chưa có sản phẩm nào trong danh mục này.
          </p>
          <Link
            href="/search"
            className="inline-block mt-4 px-6 py-2.5 rounded-xl bg-brand text-white font-medium hover:bg-brand-hover transition-colors"
          >
            Xem tất cả sản phẩm
          </Link>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {products.map((product) => (
              <Link
                key={product.id}
                href={`/products/${product.slug || product.id}`}
                className="bg-white rounded-xl border border-line p-4 flex flex-col gap-3 hover:shadow-md transition-shadow group"
              >
                <div className="aspect-square rounded-lg bg-bg overflow-hidden flex items-center justify-center p-3 relative">
                  {product.thumbnail ? (
                    <img
                      src={product.thumbnail}
                      alt={product.name}
                      className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform"
                      loading="lazy"
                    />
                  ) : (
                    <span className="text-xs text-[#a0aec0]">Chưa có ảnh</span>
                  )}
                  {!product.inStock && (
                    <span className="absolute top-2 left-2 bg-[#ff4d4f] text-white text-[11px] font-bold px-2 py-0.5 rounded">
                      Hết hàng
                    </span>
                  )}
                </div>

                <h3 className="font-semibold text-sm text-ink line-clamp-2 group-hover:text-brand transition-colors">
                  {product.name}
                </h3>

                <div className="mt-auto flex items-baseline justify-between gap-2">
                  <span className="font-bold text-brand text-sm sm:text-base">
                    {formatVnd(product.minPrice)}
                  </span>
                </div>
              </Link>
            ))}
          </div>

          {/* Pagination */}
          {meta && (meta.totalPages > 1 || meta.hasMore) && (
            <div className="mt-10 flex items-center justify-center gap-3">
              {currentPage > 1 && (
                <Link
                  href={`/categories/${slug}?page=${currentPage - 1}&sort=${sort}`}
                  className="px-4 py-2 rounded-lg border border-line bg-white hover:bg-bg text-sm font-medium transition-colors"
                >
                  ← Trang trước
                </Link>
              )}
              <span className="text-sm font-medium text-[#738096]">
                Trang {currentPage}
              </span>
              {meta.hasMore && (
                <Link
                  href={`/categories/${slug}?page=${currentPage + 1}&sort=${sort}`}
                  className="px-4 py-2 rounded-lg border border-line bg-white hover:bg-bg text-sm font-medium transition-colors"
                >
                  Trang sau →
                </Link>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
