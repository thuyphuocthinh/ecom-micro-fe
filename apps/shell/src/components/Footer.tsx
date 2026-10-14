import { Link } from "react-router";

export function Footer() {
  return (
    <footer className="bg-ink text-white">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-10 py-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
        <div className="flex flex-col gap-3.5">
          <Link
            to="/"
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
            to="/search"
            className="inline-flex items-center min-h-9 text-[#c9d0dc] hover:text-white text-[14.5px] transition-colors"
          >
            Tất cả sản phẩm
          </Link>
          <Link
            to="/search?sale=true"
            className="inline-flex items-center min-h-9 text-[#c9d0dc] hover:text-white text-[14.5px] transition-colors"
          >
            Đang giảm giá
          </Link>
          <Link
            to="/cart"
            className="inline-flex items-center min-h-9 text-[#c9d0dc] hover:text-white text-[14.5px] transition-colors"
          >
            Giỏ hàng
          </Link>
        </nav>

        <nav aria-label="Hỗ trợ" className="flex flex-col">
          <h2 className="text-base font-bold text-white mb-2 tracking-normal">
            Hỗ trợ
          </h2>
          <Link
            to="/account/orders"
            className="inline-flex items-center min-h-9 text-[#c9d0dc] hover:text-white text-[14.5px] transition-colors"
          >
            Theo dõi đơn hàng
          </Link>
          <Link
            to="/"
            className="inline-flex items-center min-h-9 text-[#c9d0dc] hover:text-white text-[14.5px] transition-colors"
          >
            Chính sách đổi trả
          </Link>
          <Link
            to="/"
            className="inline-flex items-center min-h-9 text-[#c9d0dc] hover:text-white text-[14.5px] transition-colors"
          >
            Phương thức thanh toán
          </Link>
        </nav>

        <div className="flex flex-col gap-1.5">
          <h2 className="text-base font-bold text-white mb-2 tracking-normal">
            Liên hệ
          </h2>
          <p className="text-[#c9d0dc] text-[14.5px]">[Hotline của cửa hàng]</p>
          <p className="text-[#c9d0dc] text-[14.5px]">[Email hỗ trợ]</p>
          <p className="text-[#c9d0dc] text-[14.5px]">[Giờ làm việc]</p>
        </div>
      </div>

      <div className="max-w-[1280px] mx-auto px-4 sm:px-10 py-5 border-t border-[#2a3344] flex justify-between items-center gap-4 flex-wrap text-[#a6afbd] text-[13.5px]">
        <span>
          © <span translate="no">Ecom</span>. Dự án học tập.
        </span>
        <span>Thanh toán trực tuyến hoặc tiền mặt khi nhận hàng</span>
      </div>
    </footer>
  );
}
