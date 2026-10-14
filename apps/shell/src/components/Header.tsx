import { useState, useRef, useEffect, type FormEvent } from "react";
import { Link, useNavigate } from "react-router";
import { Button, SearchInput } from "@ecom/ui";
import { useAuth } from "@/features/auth";
import { getUserDisplayName, getUserInitial } from "@/utils/user.ts";
import { formatCartAriaLabel } from "@/utils/cart.ts";
import { Icon } from "@/components/common/Icon.tsx";

export function Header() {
  const { status, user, cartCount, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const accountMenuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  useEffect(() => {
    if (!isAccountMenuOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (
        accountMenuRef.current &&
        !accountMenuRef.current.contains(e.target as Node)
      ) {
        setIsAccountMenuOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsAccountMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isAccountMenuOpen]);

  const displayName = getUserDisplayName(user);
  const initial = getUserInitial(user);
  const cartAriaLabel = formatCartAriaLabel(cartCount);

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
          <SearchInput
            id="q"
            name="q"
            autoComplete="off"
            spellCheck={false}
            placeholder="Tìm tai nghe, balo, áo thun…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Tìm sản phẩm"
            startAdornment={<Icon name="search" size={20} className="size-5" />}
          />
          <Button type="submit" variant="primary">
            Tìm kiếm
          </Button>
        </form>

        {/* Account & Cart Nav */}
        <nav
          aria-label="Tài khoản và giỏ hàng"
          className="flex items-center gap-2 sm:gap-3"
        >
          {/* Giỏ hàng placed to the LEFT of the account section */}
          <Link
            to="/cart"
            aria-label={cartAriaLabel}
            className="inline-flex items-center gap-2 min-h-11 px-3 rounded-control text-ink font-semibold text-[14.5px] hover:bg-ink/6 transition-colors"
          >
            <Icon name="cart" size={20} className="size-5" />
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

          {/* Account Section */}
          {status === "checking" ? (
            <div
              data-testid="auth-skeleton"
              className="h-9 w-24 animate-pulse rounded bg-slate-200"
            />
          ) : status === "signedIn" ? (
            <div className="relative" ref={accountMenuRef}>
              <Button
                type="button"
                variant="ghost"
                size="md"
                onClick={() => setIsAccountMenuOpen((prev) => !prev)}
                aria-haspopup="menu"
                aria-expanded={isAccountMenuOpen}
                aria-label={`Tài khoản của ${displayName}`}
                className="px-2.5 gap-2 text-ink hover:bg-ink/6"
              >
                {user?.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt={displayName}
                    className="size-[30px] rounded-full object-cover shrink-0 border border-line"
                  />
                ) : (
                  <span
                    aria-hidden="true"
                    className="size-[30px] rounded-full bg-brand text-white inline-flex items-center justify-center text-xs font-bold shrink-0"
                  >
                    {initial}
                  </span>
                )}
                <span className="max-w-[120px] truncate hidden md:inline">
                  {displayName}
                </span>
                <svg
                  className={`size-4 text-muted transition-transform duration-200 ${
                    isAccountMenuOpen ? "rotate-180" : ""
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </Button>

              {/* Account Dropdown Menu */}
              {isAccountMenuOpen && (
                <div
                  role="menu"
                  className="absolute right-0 top-full mt-2 w-60 rounded-xl border border-line bg-white shadow-xl py-2 z-50 animate-in fade-in zoom-in-95 duration-150"
                >
                  {/* User info preview */}
                  <div className="px-4 py-2 border-b border-line mb-1">
                    <p className="text-sm font-bold text-ink truncate">
                      {displayName}
                    </p>
                    <p className="text-xs text-muted truncate">{user?.email}</p>
                  </div>

                  {/* Hồ sơ của tôi */}
                  <Link
                    to="/account/profile"
                    role="menuitem"
                    onClick={() => setIsAccountMenuOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2 text-[14.5px] font-medium text-ink hover:bg-canvas hover:text-brand transition-colors"
                  >
                    <Icon
                      name="user"
                      size={18}
                      className="text-muted shrink-0"
                    />
                    <span>Hồ sơ của tôi</span>
                  </Link>

                  {/* Đơn hàng */}
                  <Link
                    to="/account/orders"
                    role="menuitem"
                    onClick={() => setIsAccountMenuOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2 text-[14.5px] font-medium text-ink hover:bg-canvas hover:text-brand transition-colors"
                  >
                    <Icon
                      name="orders"
                      size={18}
                      className="text-muted shrink-0"
                    />
                    <span>Đơn hàng</span>
                  </Link>

                  {/* Sổ địa chỉ */}
                  <Link
                    to="/account/addresses"
                    role="menuitem"
                    onClick={() => setIsAccountMenuOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2 text-[14.5px] font-medium text-ink hover:bg-canvas hover:text-brand transition-colors"
                  >
                    <Icon
                      name="addresses"
                      size={18}
                      className="text-muted shrink-0"
                    />
                    <span>Sổ địa chỉ</span>
                  </Link>

                  <div className="my-1 border-t border-line" />

                  {/* Đăng xuất */}
                  <Button
                    type="button"
                    variant="ghost"
                    size="md"
                    role="menuitem"
                    onClick={() => {
                      setIsAccountMenuOpen(false);
                      logout();
                    }}
                    className="w-full justify-start gap-2.5 px-4 py-2 text-[14.5px] font-medium text-err hover:bg-err/10 hover:text-err rounded-none"
                  >
                    <Icon name="logout" size={18} className="shrink-0" />
                    <span>Đăng xuất</span>
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <Link
              to="/login"
              className="inline-flex items-center gap-2 min-h-11 px-3 rounded-control text-ink font-semibold text-[14.5px] hover:bg-ink/6 transition-colors"
            >
              <Icon name="user" size={20} className="size-5" />
              <span>Đăng nhập</span>
            </Link>
          )}
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
