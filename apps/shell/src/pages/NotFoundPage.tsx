import { Link } from "react-router";
import { Button } from "@ecom/ui";

export function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[500px] px-4 py-16 text-center">
      <h1 className="font-head text-4xl sm:text-6xl font-bold text-ink mb-4">
        404
      </h1>
      <p className="text-lg text-ink-2 mb-8 max-w-md">
        Trang bạn đang tìm kiếm không tồn tại hoặc đã được chuyển đi nơi khác.
      </p>
      <Link to="/">
        <Button variant="primary">Về trang chủ</Button>
      </Link>
    </div>
  );
}
