import { Suspense } from "react";
import { Outlet, Link } from "react-router";
import { SkipLink, Spinner } from "@ecom/ui";

function AuthFallback() {
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

export function AuthLayout({
  headline = "Giỏ hàng, địa chỉ và đơn hàng của bạn, ở mọi thiết bị.",
}: {
  headline?: string;
}) {
  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] bg-white text-ink font-body">
      <SkipLink />

      {/* Brand panel (hidden on mobile / narrow screen per AC-28) */}
      <div className="relative bg-ink text-white p-10 lg:p-14 hidden md:flex flex-col justify-between overflow-hidden min-h-screen">
        <Link
          to="/"
          aria-label="Ecom, về trang chủ"
          translate="no"
          className="font-head font-bold text-3xl tracking-tight text-white min-h-11 inline-flex items-center z-10"
        >
          ecom<span className="text-[#7d9bff]">.</span>
        </Link>

        {/* Decorative circular shapes from design */}
        <div
          aria-hidden="true"
          className="absolute -right-24 top-44 size-[340px] rounded-full bg-brand pointer-events-none opacity-90"
        />
        <div
          aria-hidden="true"
          className="absolute right-28 top-96 size-[150px] rounded-full bg-[#dce6ff] pointer-events-none opacity-90"
        />

        <h2 className="font-head text-3xl lg:text-[44px] font-bold leading-tight relative max-w-[420px] z-10">
          {headline}
        </h2>
      </div>

      {/* Form area */}
      <main
        id="main"
        className="flex items-center justify-center p-6 sm:p-12 bg-white"
      >
        <div className="w-full max-w-[420px] flex flex-col gap-6">
          <Suspense fallback={<AuthFallback />}>
            <Outlet />
          </Suspense>
        </div>
      </main>
    </div>
  );
}
