import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router";
import { Button } from "@ecom/ui";
import { useAuth } from "../features/auth";

export function Header() {
  const { status, user, cartCount, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const displayName =
    user?.displayName || (user?.email ? user.email.split("@")[0] : "Tài khoản");
  const words = displayName.trim().split(/\s+/);
  const initial = (
    words[words.length - 1]?.charAt(0) ||
    displayName.charAt(0) ||
    "U"
  ).toUpperCase();

  const cartAriaLabel =
    cartCount > 0 ? `Giỏ hàng, ${cartCount} sản phẩm` : "Giỏ hàng, đang trống";

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
          to="/"
          aria-label="Ecom, về trang chủ"
          translate="no"
          className="font-head font-bold text-3xl tracking-tight text-ink min-h-11 inline-flex items-center"
        >
          ecom<span className="text-brand">.</span>
        </Link>

        {/* Search */}
        <form
          role="search"
          onSubmit={handleSearch}
          className="flex-1 max-w-[500px] min-w-[240px] flex gap-2 order-last md:order-none w-full md:w-auto"
        >
          <div className="relative flex-1">
            <label htmlFor="q" className="sr-only">
              Tìm sản phẩm
            </label>
            <svg
              className="absolute left-3.5 top-3.5 size-5 text-muted pointer-events-none"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.5-3.5" />
            </svg>
            <input
              id="q"
              type="search"
              name="q"
              autoComplete="off"
              spellCheck="false"
              placeholder="Tìm tai nghe, balo, áo thun…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full min-h-[44px] pl-11 pr-3.5 border border-line rounded-control bg-white text-ink placeholder:text-muted focus-visible:outline-none focus-visible:border-brand focus-visible:ring-3 focus-visible:ring-brand/25"
            />
          </div>
          <Button type="submit" variant="primary">
            Tìm kiếm
          </Button>
        </form>

        {/* Account & Cart Nav */}
        <nav
          aria-label="Tài khoản và giỏ hàng"
          className="flex items-center gap-1 sm:gap-2"
        >
          {status === "checking" ? (
            <div
              data-testid="auth-skeleton"
              className="h-9 w-24 animate-pulse rounded bg-slate-200"
            />
          ) : status === "signedIn" ? (
            <>
              <Link
                to="/account/orders"
                className="inline-flex items-center gap-2 min-h-11 px-3 rounded-control text-ink font-semibold text-[14.5px] hover:bg-ink/6 transition-colors"
              >
                <svg
                  className="size-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path d="M21 8 12 3 3 8v8l9 5 9-5z" />
                  <path d="m3 8 9 5 9-5M12 13v8" />
                </svg>
                <span className="hidden sm:inline">Đơn hàng</span>
              </Link>

              <Link
                to="/account/profile"
                aria-label={`Tài khoản của ${displayName}`}
                className="inline-flex items-center gap-2 min-h-11 px-2.5 rounded-control text-ink font-semibold text-[14.5px] hover:bg-ink/6 transition-colors"
              >
                <span
                  aria-hidden="true"
                  className="size-[30px] rounded-full bg-brand text-white inline-flex items-center justify-center text-xs font-bold"
                >
                  {initial}
                </span>
                <span className="max-w-[120px] truncate hidden md:inline">
                  {displayName}
                </span>
              </Link>

              <button
                type="button"
                onClick={logout}
                className="inline-flex items-center min-h-11 px-2.5 rounded-control text-muted hover:text-ink hover:bg-ink/6 text-sm font-medium transition-colors"
              >
                Đăng xuất
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className="inline-flex items-center gap-2 min-h-11 px-3 rounded-control text-ink font-semibold text-[14.5px] hover:bg-ink/6 transition-colors"
            >
              <svg
                className="size-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.75"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <circle cx="12" cy="8" r="4" />
                <path d="M4 21c0-4 3.6-7 8-7s8 3 8 7" />
              </svg>
              <span>Đăng nhập</span>
            </Link>
          )}

          <Link
            to="/cart"
            aria-label={cartAriaLabel}
            className="inline-flex items-center gap-2 min-h-11 px-3 rounded-control text-ink font-semibold text-[14.5px] hover:bg-ink/6 transition-colors"
          >
            <svg
              className="size-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path d="M3 4h2.2l2.1 11.2a2 2 0 0 0 2 1.6h7.6a2 2 0 0 0 2-1.5L20.5 8H6.2" />
              <circle cx="10" cy="20" r="1.2" />
              <circle cx="17" cy="20" r="1.2" />
            </svg>
            <span className="hidden sm:inline">Giỏ hàng</span>
            {status === "signedIn" && cartCount > 0 && (
              <span
                aria-hidden="true"
                className="tnum min-w-[22px] h-[22px] px-1.5 rounded-full bg-brand text-white text-xs font-bold inline-flex items-center justify-center"
              >
                {cartCount}
              </span>
            )}
          </Link>
        </nav>
      </div>

      {/* Category Nav */}
      <nav
        aria-label="Danh mục"
        className="max-w-[1280px] mx-auto px-4 sm:px-10 flex gap-7 flex-wrap border-t border-line/60 overflow-x-auto"
      >
        <Link
          to="/search"
          className="inline-flex items-center min-h-11 px-1 text-ink-2 hover:text-brand font-medium text-[14.5px] border-b-2 border-transparent hover:border-brand transition-colors whitespace-nowrap"
        >
          Tất cả sản phẩm
        </Link>
        <Link
          to="/search?category=audio"
          className="inline-flex items-center min-h-11 px-1 text-ink-2 hover:text-brand font-medium text-[14.5px] border-b-2 border-transparent hover:border-brand transition-colors whitespace-nowrap"
        >
          Âm thanh
        </Link>
        <Link
          to="/search?category=tech"
          className="inline-flex items-center min-h-11 px-1 text-ink-2 hover:text-brand font-medium text-[14.5px] border-b-2 border-transparent hover:border-brand transition-colors whitespace-nowrap"
        >
          Phụ kiện công nghệ
        </Link>
        <Link
          to="/search?category=fashion"
          className="inline-flex items-center min-h-11 px-1 text-ink-2 hover:text-brand font-medium text-[14.5px] border-b-2 border-transparent hover:border-brand transition-colors whitespace-nowrap"
        >
          Thời trang
        </Link>
        <Link
          to="/search?category=lifestyle"
          className="inline-flex items-center min-h-11 px-1 text-ink-2 hover:text-brand font-medium text-[14.5px] border-b-2 border-transparent hover:border-brand transition-colors whitespace-nowrap"
        >
          Đời sống
        </Link>
        <Link
          to="/search?sale=true"
          className="inline-flex items-center min-h-11 px-1 text-sale hover:text-sale/80 font-medium text-[14.5px] border-b-2 border-transparent hover:border-sale transition-colors ml-auto whitespace-nowrap"
        >
          Đang giảm giá
        </Link>
      </nav>
    </header>
  );
}
