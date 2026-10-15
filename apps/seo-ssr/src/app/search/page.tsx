import type { Metadata } from "next";
import Link from "next/link";
import { fetchPublishedProducts } from "@/services/api";

interface SearchPageProps {
  searchParams: Promise<{
    search?: string;
    page?: string;
    sort?: string;
    minPrice?: string;
    maxPrice?: string;
  }>;
}

export async function generateMetadata({
  searchParams,
}: SearchPageProps): Promise<Metadata> {
  const { search } = await searchParams;
  const title = search
    ? `Tìm kiếm: "${search}" | Ecom`
    : "Tất cả sản phẩm | Ecom";
  const description = search
    ? `Danh sách kết quả tìm kiếm cho từ khóa "${search}" tại Ecom Store.`
    : "Khám phá hàng ngàn sản phẩm công nghệ, phụ kiện và đời sống tại Ecom Store.";

  return {
    title,
    description,
    robots: {
      index: !search, // Don't index duplicate search results pages per SEO best practices
      follow: true,
    },
  };
}

function formatVnd(amount: number): string {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { search = "", page = "1", sort = "newest" } = await searchParams;
  const currentPage = Math.max(1, parseInt(page, 10) || 1);

  const { data: products, meta } = await fetchPublishedProducts({
    search: search.trim() || undefined,
    page: currentPage,
    limit: 16,
    sort,
  });

  return (
    <div className="max-w-[1280px] mx-auto px-4 sm:px-10 py-6 sm:py-8">
      {/* Search Header */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-head font-bold text-ink">
          {search ? `Kết quả tìm kiếm cho "${search}"` : "Tất cả sản phẩm"}
        </h1>
        <p className="text-sm text-[#738096] mt-1">
          {products.length > 0
            ? `Hiển thị ${products.length} sản phẩm phù hợp`
            : "Không tìm thấy sản phẩm nào"}
        </p>
      </div>

      {/* Product Grid */}
      {products.length === 0 ? (
        <div className="bg-white rounded-2xl border border-line p-12 text-center text-[#738096]">
          <p className="text-base">
            Không tìm thấy sản phẩm phù hợp với từ khóa của bạn.
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
                  href={`/search?search=${encodeURIComponent(search)}&page=${currentPage - 1}&sort=${sort}`}
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
                  href={`/search?search=${encodeURIComponent(search)}&page=${currentPage + 1}&sort=${sort}`}
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
