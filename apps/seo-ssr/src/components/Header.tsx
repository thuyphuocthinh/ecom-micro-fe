import Link from "next/link";

const SHELL_URL = process.env.NEXT_PUBLIC_SHELL_URL || "";

interface HeaderProps {
  categories?: Array<{ id: string; name: string; slug?: string | null }>;
}

export function Header({ categories = [] }: HeaderProps) {
  return (
    <header className="bg-white border-b border-line text-ink">
      {/* Announcement Bar */}
      <div className="bg-ink text-white text-[13.5px]">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-10 py-2.5 flex justify-between items-center gap-6 flex-wrap">
          <span>Miễn phí vận chuyển cho mọi đơn hàng</span>
          <span className="text-[#c9d3ff] hidden sm:inline">
            Đổi trả trong 7 ngày nếu hàng lỗi
          </span>
        </div>
      </div>

      {/* Main Bar */}
      <div className="max-w-[1280px] mx-auto px-4 sm:px-10 py-4 flex items-center justify-between gap-6 sm:gap-8 flex-wrap">
        <Link
          href="/"
          className="font-head font-bold text-3xl tracking-tight text-ink hover:opacity-90 transition-opacity"
        >
          ecom<span className="text-brand">.</span>
        </Link>

        {/* Search Bar */}
        <div className="flex-1 max-w-[560px] min-w-[240px] order-3 sm:order-2 w-full sm:w-auto">
          <form
            action="/search"
            method="GET"
            className="relative flex items-center w-full"
          >
            <input
              type="search"
              name="search"
              placeholder="Tìm kiếm sản phẩm, thương hiệu..."
              aria-label="Tìm kiếm sản phẩm"
              className="w-full h-11 pl-4 pr-11 text-sm bg-bg rounded-lg border border-line focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand text-ink placeholder:text-[#8c94a3]"
            />
            <button
              type="submit"
              aria-label="Tìm kiếm"
              className="absolute right-0 top-0 h-11 w-11 flex items-center justify-center text-ink hover:text-brand"
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
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </button>
          </form>
        </div>

        {/* Action Buttons (Transition Boundary to Shell SPA) */}
        <div className="flex items-center gap-4 sm:gap-6 order-2 sm:order-3">
          <a
            href={`${SHELL_URL}/login`}
            className="text-sm font-medium hover:text-brand transition-colors hidden sm:inline"
          >
            Đăng nhập
          </a>

          <a
            href={`${SHELL_URL}/cart`}
            className="relative inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-bg hover:bg-[#edf0f5] text-ink transition-colors"
            aria-label="Giỏ hàng"
          >
            <svg
              className="w-5 h-5 text-ink"
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
            <span className="text-sm font-semibold hidden md:inline">
              Giỏ hàng
            </span>
          </a>
        </div>
      </div>

      {/* Category Nav Bar */}
      {categories.length > 0 && (
        <nav
          aria-label="Danh mục nổi bật"
          className="border-t border-line/60 bg-[#fafbfc] overflow-x-auto scrollbar-none"
        >
          <div className="max-w-[1280px] mx-auto px-4 sm:px-10 flex items-center gap-6 py-2.5 text-sm font-medium">
            <Link
              href="/search"
              className="whitespace-nowrap hover:text-brand transition-colors text-ink"
            >
              Tất cả sản phẩm
            </Link>
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/categories/${cat.slug || cat.id}`}
                className="whitespace-nowrap text-[#556070] hover:text-brand transition-colors"
              >
                {cat.name}
              </Link>
            ))}
          </div>
        </nav>
      )}
    </header>
  );
}
