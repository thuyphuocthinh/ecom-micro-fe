import { Outlet } from "react-router";
import { RequireAuth } from "@/components/RequireAuth.tsx";
import { AccountNav } from "./AccountNav.tsx";

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
          <Outlet />
        </div>
      </div>
    </RequireAuth>
  );
}
