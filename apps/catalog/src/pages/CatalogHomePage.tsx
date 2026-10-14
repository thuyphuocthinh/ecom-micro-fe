import { Card } from "@ecom/ui";

export function CatalogHomePage() {
  return (
    <div className="max-w-[1280px] mx-auto px-4 sm:px-10 py-12 flex flex-col gap-6">
      <Card className="p-8 sm:p-12 flex flex-col gap-4">
        <h1 className="font-head text-3xl sm:text-4xl font-bold text-ink tracking-tight">
          Danh mục sản phẩm
        </h1>
        <p className="text-ink-2 text-base max-w-xl">
          Chào mừng đến với ứng dụng Catalog. Khám phá các mặt hàng công nghệ và
          đời sống chất lượng cao.
        </p>
      </Card>
    </div>
  );
}

export default CatalogHomePage;
