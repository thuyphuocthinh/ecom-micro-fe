import { Card } from "@ecom/ui";

export function HomePage() {
  return (
    <div className="max-w-[1280px] mx-auto px-4 sm:px-10 py-16">
      <Card className="p-8 sm:p-12 flex flex-col gap-4">
        <h1 className="font-head text-3xl sm:text-4xl font-bold text-ink">
          Chào mừng đến với Ecom
        </h1>
        <p className="text-ink-2 text-base max-w-xl">
          Đồ dùng công nghệ và đời sống hằng ngày, giao tới tận nhà. Nền tảng
          mua sắm hiện đại và an toàn.
        </p>
      </Card>
    </div>
  );
}
