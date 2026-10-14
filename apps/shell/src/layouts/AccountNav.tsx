import { Link, useLocation } from "react-router";
import { Card, Button } from "@ecom/ui";
import { useAuth } from "@/features/auth";
import { getUserDisplayName, getUserInitial } from "@/utils/user.ts";
import { Icon } from "@/components/common/Icon.tsx";

export interface AccountNavProps {
  className?: string;
}

export function AccountNav({ className }: AccountNavProps) {
  const { user, logout } = useAuth();
  const location = useLocation();

  const displayName = getUserDisplayName(user);
  const initial = getUserInitial(user);
  const email = user?.email || "";

  const isProfile = location.pathname.startsWith("/account/profile");
  const isOrders = location.pathname.startsWith("/account/orders");
  const isAddresses = location.pathname.startsWith("/account/addresses");

  return (
    <nav aria-label="Tài khoản" className={className}>
      <Card className="p-4 flex flex-col gap-1 bg-white">
        {/* User Info Header */}
        <div className="flex items-center gap-3 p-2 pb-4 border-b border-line mb-2">
          {user?.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt={displayName}
              className="size-12 rounded-full object-cover shrink-0 border border-line"
            />
          ) : (
            <span
              aria-hidden="true"
              className="size-12 rounded-full bg-brand text-white inline-flex items-center justify-center font-head font-bold text-xl shrink-0"
            >
              {initial}
            </span>
          )}
          <div className="min-w-0 flex-1">
            <p className="font-bold text-ink truncate leading-tight">
              {displayName}
            </p>
            <p className="text-muted text-[13.5px] truncate mt-0.5">{email}</p>
          </div>
        </div>

        {/* Nav links matching ecom-storefront.html .nv class */}
        <Link
          to="/account/profile"
          aria-current={isProfile ? "page" : undefined}
          className={`flex items-center gap-3 min-h-[46px] px-3.5 rounded-control font-medium text-[15px] transition-colors ${
            isProfile
              ? "bg-[#eaf0ff] text-brand-dark font-bold"
              : "text-ink-2 hover:bg-[#f1f3f6] hover:text-ink"
          }`}
        >
          <Icon name="user" size={20} className="shrink-0" />
          <span>Hồ sơ của tôi</span>
        </Link>

        <Link
          to="/account/orders"
          aria-current={isOrders ? "page" : undefined}
          className={`flex items-center gap-3 min-h-[46px] px-3.5 rounded-control font-medium text-[15px] transition-colors ${
            isOrders
              ? "bg-[#eaf0ff] text-brand-dark font-bold"
              : "text-ink-2 hover:bg-[#f1f3f6] hover:text-ink"
          }`}
        >
          <Icon name="orders" size={20} className="shrink-0" />
          <span>Đơn hàng của tôi</span>
        </Link>

        <Link
          to="/account/addresses"
          aria-current={isAddresses ? "page" : undefined}
          className={`flex items-center gap-3 min-h-[46px] px-3.5 rounded-control font-medium text-[15px] transition-colors ${
            isAddresses
              ? "bg-[#eaf0ff] text-brand-dark font-bold"
              : "text-ink-2 hover:bg-[#f1f3f6] hover:text-ink"
          }`}
        >
          <Icon name="addresses" size={20} className="shrink-0" />
          <span>Sổ địa chỉ</span>
        </Link>

        {/* Logout button */}
        <Button
          type="button"
          variant="ghost"
          onClick={logout}
          className="w-full justify-start gap-3 min-h-[46px] px-3.5 mt-2 pt-2 border-t border-line rounded-none text-ink-2 hover:text-ink font-medium text-[15px]"
        >
          <Icon name="logout" size={20} className="shrink-0" />
          <span>Đăng xuất</span>
        </Button>
      </Card>
    </nav>
  );
}
