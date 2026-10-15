import Link from "next/link";
import { fetchCategories, fetchPublishedProducts } from "@/services/api";

function formatVnd(amount: number): string {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
}

export default async function HomePage() {
  const [categories, productsResult] = await Promise.all([
    fetchCategories(),
    fetchPublishedProducts({ limit: 8, sort: "newest" }),
  ]);

  const products = productsResult.data;

  return (
    <div className="flex flex-col gap-12 sm:gap-16 pb-16">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-[#1e293b] via-[#0f172a] to-[#020617] text-white py-16 sm:py-24">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-10 flex flex-col items-center text-center gap-6">
          <span className="text-xs uppercase font-bold tracking-widest px-3 py-1 bg-brand/20 text-[#a5b4fc] rounded-full border border-brand/30">
            Cửa hàng trực tuyến chính hãng
          </span>
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-head font-extrabold tracking-tight max-w-[850px] leading-tight">
            Công nghệ đỉnh cao, đời sống tiện nghi mỗi ngày
          </h1>
          <p className="text-[#94a3b8] text-base sm:text-lg max-w-[600px]">
            Hàng ngàn sản phẩm điện thoại, máy tính, phụ kiện chính hãng với mức
            giá cạnh tranh nhất và dịch vụ hậu mãi uy tín.
          </p>
          <div className="flex items-center gap-4 flex-wrap justify-center mt-2">
            <Link
              href="/search"
              className="px-6 py-3 rounded-xl bg-brand hover:bg-brand-hover text-white font-semibold transition-colors shadow-lg"
            >
              Khám phá sản phẩm
            </Link>
            <Link
              href="/search?onSale=true"
              className="px-6 py-3 rounded-xl border border-[#475569] hover:bg-white/10 text-white font-medium transition-colors"
            >
              Ưu đãi hôm nay
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Categories */}
      {categories.length > 0 && (
        <section className="max-w-[1280px] mx-auto px-4 sm:px-10 w-full">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl sm:text-2xl font-head font-bold text-ink">
              Danh mục nổi bật
            </h2>
            <Link
              href="/search"
              className="text-sm font-semibold text-brand hover:underline"
            >
              Xem tất cả →
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/categories/${cat.slug || cat.id}`}
                className="bg-white rounded-xl border border-line p-4 flex flex-col items-center text-center gap-2 hover:border-brand hover:shadow-sm transition-all group"
              >
                <div className="w-12 h-12 rounded-full bg-brand/5 flex items-center justify-center text-brand group-hover:scale-110 transition-transform">
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="1.75"
                      d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                    />
                  </svg>
                </div>
                <span className="text-sm font-medium text-ink group-hover:text-brand transition-colors">
                  {cat.name}
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Value Props Banner */}
      <section className="max-w-[1280px] mx-auto px-4 sm:px-10 w-full">
        <div className="bg-white rounded-2xl border border-line p-6 sm:p-8 grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="flex items-center gap-4">
            <div className="size-12 rounded-xl bg-[#e6f4ff] text-brand flex items-center justify-center shrink-0">
              <svg
                className="w-6 h-6"
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
            </div>
            <div>
              <h3 className="font-bold text-sm text-ink">100% Chính Hãng</h3>
              <p className="text-xs text-[#738096] mt-0.5">
                Cam kết nguồn gốc xuất xứ rõ ràng
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="size-12 rounded-xl bg-[#f6ffed] text-[#52c41a] flex items-center justify-center shrink-0">
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div>
              <h3 className="font-bold text-sm text-ink">Giao Hàng Siêu Tốc</h3>
              <p className="text-xs text-[#738096] mt-0.5">
                Nhanh chóng trong 2-3 ngày làm việc
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="size-12 rounded-xl bg-[#fff7e6] text-[#fa8c16] flex items-center justify-center shrink-0">
              <svg
                className="w-6 h-6"
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
            </div>
            <div>
              <h3 className="font-bold text-sm text-ink">Đổi Trả Dễ Dàng</h3>
              <p className="text-xs text-[#738096] mt-0.5">
                7 ngày miễn phí đổi trả nếu phát hiện lỗi
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="max-w-[1280px] mx-auto px-4 sm:px-10 w-full">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-head font-bold text-ink">
              Sản phẩm mới nhất
            </h2>
            <p className="text-sm text-[#738096] mt-0.5">
              Được cập nhật liên tục từ các thương hiệu hàng đầu
            </p>
          </div>
          <Link
            href="/search"
            className="text-sm font-semibold text-brand hover:underline"
          >
            Xem tất cả →
          </Link>
        </div>

        {products.length === 0 ? (
          <div className="bg-white rounded-2xl border border-line p-12 text-center text-[#738096]">
            Chưa có sản phẩm nào được đăng bán.
          </div>
        ) : (
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
        )}
      </section>
    </div>
  );
}
