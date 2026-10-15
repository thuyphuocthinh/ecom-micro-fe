import { Suspense } from "react";
import { Outlet } from "react-router";
import { SkipLink, Spinner, ErrorBoundary } from "@ecom/ui";
import { Header } from "@/components/Header.tsx";
import { Footer } from "@/components/Footer.tsx";

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

export function StoreLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-bg text-ink font-body">
      <SkipLink />
      <Header />
      <main id="main" className="flex-1">
        <ErrorBoundary>
          <Suspense fallback={<PageFallback />}>
            <Outlet />
          </Suspense>
        </ErrorBoundary>
      </main>
      <Footer />
    </div>
  );
}
