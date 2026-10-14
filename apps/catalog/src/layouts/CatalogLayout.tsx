import { Suspense } from "react";
import { Outlet } from "react-router";
import { Spinner, SkipLink } from "@ecom/ui";

function PageFallback() {
  return (
    <div
      className="flex min-h-[50vh] items-center justify-center p-8"
      role="status"
      aria-label="Đang tải..."
    >
      <Spinner className="size-8 text-brand" />
    </div>
  );
}

export function CatalogLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-bg text-ink font-body">
      <SkipLink />
      <main id="main" className="flex-1">
        <Suspense fallback={<PageFallback />}>
          <Outlet />
        </Suspense>
      </main>
    </div>
  );
}

export default CatalogLayout;
