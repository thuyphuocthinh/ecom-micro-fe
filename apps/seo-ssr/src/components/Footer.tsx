import Link from "next/link";

const SHELL_URL = process.env.NEXT_PUBLIC_SHELL_URL || "";

export function Footer() {
  return (
    <footer className="bg-ink text-white">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-10 py-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
        <div className="flex flex-col gap-3.5">
          <Link
            href="/"
            translate="no"
            aria-label="Ecom, về trang chủ"
            className="font-head font-bold text-3xl tracking-tight text-white inline-flex items-center min-h-11"
          >
            ecom<span className="text-[#7d9bff]">.</span>
          </Link>
          <p className="text-[#c9d0dc] max-w-[280px] text-sm">
            Đồ dùng công nghệ và đời sống hằng ngày, giao tới tận nhà.
          </p>
        </div>

        <nav aria-label="Mua sắm" className="flex flex-col">
          <h2 className="text-base font-bold text-white mb-2 tracking-normal">
            Mua sắm
          </h2>
          <Link
            href="/search"
            className="inline-flex items-center min-h-9 text-[#c9d0dc] hover:text-white text-[14.5px] transition-colors"
          >
            Tất cả sản phẩm
          </Link>
          <Link
            href="/search?onSale=true"
            className="inline-flex items-center min-h-9 text-[#c9d0dc] hover:text-white text-[14.5px] transition-colors"
          >
            Đang giảm giá
          </Link>
          <a
            href={`${SHELL_URL}/cart`}
            className="inline-flex items-center min-h-9 text-[#c9d0dc] hover:text-white text-[14.5px] transition-colors"
          >
            Giỏ hàng
          </a>
        </nav>

        <nav aria-label="Hỗ trợ" className="flex flex-col">
          <h2 className="text-base font-bold text-white mb-2 tracking-normal">
            Hỗ trợ
          </h2>
          <a
            href={`${SHELL_URL}/account/orders`}
            className="inline-flex items-center min-h-9 text-[#c9d0dc] hover:text-white text-[14.5px] transition-colors"
          >
            Theo dõi đơn hàng
          </a>
          <Link
            href="/"
            className="inline-flex items-center min-h-9 text-[#c9d0dc] hover:text-white text-[14.5px] transition-colors"
          >
            Chính sách đổi trả
          </Link>
          <Link
            href="/"
            className="inline-flex items-center min-h-9 text-[#c9d0dc] hover:text-white text-[14.5px] transition-colors"
          >
            Phương thức thanh toán
          </Link>
        </nav>

        <div className="flex flex-col gap-1.5">
          <h2 className="text-base font-bold text-white mb-2 tracking-normal">
            Liên hệ
          </h2>
          <p className="text-[#c9d0dc] text-[14.5px]">Hotline: 1900 xxxx</p>
          <p className="text-[#c9d0dc] text-[14.5px]">Email: support@ecom.vn</p>
          <p className="text-[#c9d0dc] text-[14.5px]">
            Giờ làm việc: 8:00 - 21:00
          </p>
        </div>
      </div>

      <div className="max-w-[1280px] mx-auto px-4 sm:px-10 py-5 border-t border-[#2a3344] flex justify-between items-center gap-4 flex-wrap text-[#a6afbd] text-[13.5px]">
        <span>
          © <span translate="no">Ecom</span>. Dự án học tập & phát triển.
        </span>
        <span>Thanh toán trực tuyến hoặc tiền mặt khi nhận hàng</span>
      </div>
    </footer>
  );
}
