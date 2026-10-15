import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { fetchCategories } from "@/services/api";

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3003",
  ),
  title: {
    default: "Ecom — Mua sắm thông minh, chính hãng & giao nhanh",
    template: "%s | Ecom",
  },
  description:
    "Nền tảng thương mại điện tử chuyên đồ dùng công nghệ, thời trang và đời sống hàng ngày với dịch vụ giao hàng tận nơi.",
  openGraph: {
    type: "website",
    locale: "vi_VN",
    siteName: "Ecom Store",
    title: "Ecom — Mua sắm thông minh, chính hãng & giao nhanh",
    description:
      "Nền tảng thương mại điện tử chuyên đồ dùng công nghệ, thời trang và đời sống hàng ngày với dịch vụ giao hàng tận nơi.",
  },
  twitter: {
    card: "summary_large_image",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const categories = await fetchCategories();

  return (
    <html lang="vi">
      <body className="min-h-screen flex flex-col bg-bg text-ink font-body antialiased">
        <Header categories={categories} />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
