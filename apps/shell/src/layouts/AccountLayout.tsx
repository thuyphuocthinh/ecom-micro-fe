import { Suspense } from "react";
import { Outlet } from "react-router";
import { Spinner } from "@ecom/ui";
import { RequireAuth } from "@/components/RequireAuth.tsx";
import { AccountNav } from "./AccountNav.tsx";

function AccountFallback() {
  return (
    <div
      className="flex min-h-[300px] items-center justify-center p-8"
      role="status"
      aria-label="Đang tải..."
    >
      <Spinner className="size-8 text-brand" />
    </div>
  );
}

export function AccountLayout() {
  return (
    <RequireAuth>
      <div className="max-w-[1280px] mx-auto px-4 sm:px-10 py-8 pb-18 flex flex-col md:flex-row gap-8 lg:gap-10 items-start">
        <aside
          className="w-full md:w-[280px] shrink-0"
          aria-label="Menu tài khoản"
        >
          <AccountNav />
        </aside>
        <div className="flex-1 min-w-0 w-full flex flex-col gap-6">
          <Suspense fallback={<AccountFallback />}>
            <Outlet />
          </Suspense>
        </div>
      </div>
    </RequireAuth>
  );
}
