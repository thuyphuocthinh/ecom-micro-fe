import { Outlet } from "react-router";
import { SkipLink } from "@ecom/ui";
import { Header } from "../components/Header.tsx";
import { Footer } from "../components/Footer.tsx";

export function StoreLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-bg text-ink font-body">
      <SkipLink />
      <Header />
      <main id="main" className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
