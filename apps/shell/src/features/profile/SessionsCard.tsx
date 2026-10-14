import { useMemo } from "react";
import { Card, Tag } from "@ecom/ui";
import { Icon } from "@/components/common/Icon.tsx";

function getBrowserAndOS(): string {
  if (typeof window === "undefined" || !navigator.userAgent) {
    return "Trình duyệt hiện tại";
  }
  const ua = navigator.userAgent;
  let browser = "Trình duyệt Web";
  if (ua.includes("Chrome") && !ua.includes("Edg")) {
    browser = "Chrome";
  } else if (ua.includes("Edg")) {
    browser = "Microsoft Edge";
  } else if (ua.includes("Firefox")) {
    browser = "Firefox";
  } else if (ua.includes("Safari") && !ua.includes("Chrome")) {
    browser = "Safari";
  }

  let os = "Máy tính";
  if (ua.includes("Windows")) os = "Windows";
  else if (ua.includes("Mac OS")) os = "macOS";
  else if (ua.includes("Linux")) os = "Linux";
  else if (ua.includes("Android")) os = "Android";
  else if (ua.includes("iPhone") || ua.includes("iPad")) os = "iOS";

  return `${browser} trên ${os}`;
}

export function SessionsCard() {
  const currentDevice = useMemo(() => getBrowserAndOS(), []);

  return (
    <section aria-labelledby="ss-title">
      <Card className="p-6 sm:p-8 flex flex-col gap-5 bg-white">
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-line">
          <h2
            id="ss-title"
            className="text-[22px] font-bold text-ink flex items-center gap-3"
          >
            <span
              className="size-11 rounded-[12px] bg-[#e3f5ee] text-[#0b7a55] inline-flex items-center justify-center shrink-0"
              aria-hidden="true"
            >
              <Icon name="device" size={24} />
            </span>
            <span>Thiết bị đã đăng nhập</span>
          </h2>
        </div>

        {/* Sessions List */}
        <ul className="flex flex-col m-0 p-0 list-none">
          <li className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-3.5 border-b border-line first:border-t-0 last:border-b-0">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-ink">{currentDevice}</span>
                <Tag tone="ok">Thiết bị này</Tag>
              </div>
              <p className="text-[13.5px] text-muted">
                Việt Nam • Đang hoạt động
              </p>
            </div>
          </li>
        </ul>
      </Card>
    </section>
  );
}
