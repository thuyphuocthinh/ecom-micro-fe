export function ProductGuaranteesCard() {
  return (
    <ul className="border border-line rounded-[14px] bg-white list-none m-0 px-5 py-1.5 flex flex-col shadow-2xs">
      {/* 1. Free Shipping */}
      <li className="flex gap-3.5 items-start py-3.5 border-b border-line">
        <svg
          aria-hidden="true"
          className="size-6 text-brand mt-0.5 shrink-0 stroke-current stroke-2 fill-none"
          viewBox="0 0 24 24"
        >
          <path
            d="M2 7h12v9H2zM14 10h4l3 3v3h-7z"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="7" cy="18" r="1.6" />
          <circle cx="17.5" cy="18" r="1.6" />
        </svg>
        <div>
          <div className="font-semibold text-[14.5px] text-ink">
            Miễn phí vận chuyển
          </div>
          <div className="text-muted text-[13.5px]">
            Cho mọi đơn hàng, giao tới tận nhà.
          </div>
        </div>
      </li>

      {/* 2. 7-Day Return */}
      <li className="flex gap-3.5 items-start py-3.5 border-b border-line">
        <svg
          aria-hidden="true"
          className="size-6 text-brand mt-0.5 shrink-0 stroke-current stroke-2 fill-none"
          viewBox="0 0 24 24"
        >
          <path
            d="M3 12a9 9 0 1 0 3-6.7L3 8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path d="M3 3v5h5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <div>
          <div className="font-semibold text-[14.5px] text-ink">
            Đổi trả trong 7 ngày
          </div>
          <div className="text-muted text-[13.5px]">
            Nếu hàng bị lỗi khi nhận.
          </div>
        </div>
      </li>

      {/* 3. 15-Minute Hold */}
      <li className="flex gap-3.5 items-start py-3.5">
        <svg
          aria-hidden="true"
          className="size-6 text-brand mt-0.5 shrink-0 stroke-current stroke-2 fill-none"
          viewBox="0 0 24 24"
        >
          <circle
            cx="12"
            cy="12"
            r="9"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path d="M12 7v5l3 2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <div>
          <div className="font-semibold text-[14.5px] text-ink">
            Hàng được giữ khi bạn thanh toán
          </div>
          <div className="text-muted text-[13.5px]">
            Giữ cho bạn 15 phút kể từ lúc bấm thanh toán.
          </div>
        </div>
      </li>
    </ul>
  );
}
