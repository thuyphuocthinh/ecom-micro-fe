import { useState, type FormEvent } from "react";
import { Link, useNavigate, useSearchParams, useLocation } from "react-router";
import {
  Button,
  SearchInput,
  Avatar,
  DropdownMenu,
  DropdownMenuHeader,
  DropdownMenuItem,
  DropdownMenuDivider,
} from "@ecom/ui";
import { useAuth } from "@/features/auth";
import { getUserAvatarInfo } from "@/utils/user.ts";
import { formatCartAriaLabel } from "@/utils/cart.ts";
import { Icon } from "@/components/common/Icon.tsx";

export function Header() {
  const { status, user, cartCount, logout } = useAuth();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();

  const urlQ =
    location.pathname === "/search" ? searchParams.get("q") || "" : "";
  const [searchQuery, setSearchQuery] = useState(urlQ);
  const [prevUrlQ, setPrevUrlQ] = useState(urlQ);

  // Synchronize search input with URL query param `q` during render without cascading renders
  if (prevUrlQ !== urlQ) {
    setPrevUrlQ(urlQ);
    setSearchQuery(urlQ);
  }

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = searchQuery.trim();
    if (trimmed) {
      navigate(`/search?q=${encodeURIComponent(trimmed)}`);
    } else if (location.pathname === "/search") {
      navigate("/search");
    }
  };

  const { displayName, initial, avatarUrl } = getUserAvatarInfo(user);
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
          {/* Giỏ hàng to the LEFT */}
          <Link
            to="/cart"
            aria-label={cartAriaLabel}
            className="inline-flex items-center gap-2 min-h-11 px-3 rounded-control text-ink font-semibold text-[14.5px] hover:bg-ink/6 transition-colors"
          >
            <Icon name="cart" size={20} className="size-5" />
            <span className="hidden sm:inline">Giỏ hàng</span>
            {cartCount > 0 && (
              <span
                aria-hidden="true"
                className="tnum min-w-[22px] h-[22px] px-1.5 rounded-full bg-brand text-white text-xs font-bold inline-flex items-center justify-center"
              >
                {cartCount}
              </span>
            )}
          </Link>

          {/* Account Section to the RIGHT */}
          {status === "checking" ? (
            <div
              data-testid="auth-skeleton"
              className="h-9 w-24 animate-pulse rounded bg-slate-200"
            />
          ) : status === "signedIn" ? (
            <DropdownMenu
              align="right"
              trigger={({ isOpen }) => (
                <div
                  aria-label={`Tài khoản của ${displayName}`}
                  role="button"
                  tabIndex={0}
                  className="inline-flex items-center gap-2 min-h-11 px-2.5 rounded-control text-ink font-semibold text-[14.5px] hover:bg-ink/6 transition-colors cursor-pointer select-none"
                >
                  <Avatar
                    src={avatarUrl}
                    alt={displayName}
                    fallback={initial}
                    size="sm"
                  />
                  <span className="max-w-[120px] truncate hidden md:inline">
                    {displayName}
                  </span>
                  <Icon
                    name="chevron-down"
                    size={16}
                    className={`text-muted transition-transform duration-200 ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                </div>
              )}
            >
              <DropdownMenuHeader>
                <p className="text-sm font-bold text-ink truncate">
                  {displayName}
                </p>
                <p className="text-xs text-muted truncate">{user?.email}</p>
              </DropdownMenuHeader>

              <DropdownMenuItem onClick={() => navigate("/account/profile")}>
                <Icon name="user" size={18} className="text-muted shrink-0" />
                <span>Hồ sơ của tôi</span>
              </DropdownMenuItem>

              <DropdownMenuItem onClick={() => navigate("/account/orders")}>
                <Icon name="orders" size={18} className="text-muted shrink-0" />
                <span>Đơn hàng của tôi</span>
              </DropdownMenuItem>

              <DropdownMenuDivider />

              <DropdownMenuItem danger onClick={logout}>
                <Icon name="logout" size={18} className="shrink-0" />
                <span>Đăng xuất</span>
              </DropdownMenuItem>
            </DropdownMenu>
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
