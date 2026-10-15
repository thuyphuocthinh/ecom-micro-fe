import {
  useState,
  useEffect,
  type ComponentProps,
  type ReactNode,
  type SyntheticEvent,
} from "react";
import { cx } from "./cx";

export interface ImageProps extends Omit<ComponentProps<"img">, "src"> {
  src?: string | null;
  alt?: string;
  /** URL ảnh dự phòng nếu src chính bị lỗi 404 hoặc không tải được */
  fallbackSrc?: string;
  /** Node hiển thị tùy biến khi ảnh lỗi hoặc không có src */
  fallback?: ReactNode;
  /** Cho phép chèn link rel="preload" vào document head để tải trước */
  preload?: boolean;
}

/**
 * Image component hỗ trợ fallback khi ảnh lỗi hoặc thiếu src,
 * hỗ trợ fallbackSrc và tùy chọn preload ảnh vào document head.
 * Mặc định tải lười (`loading="lazy"`, `decoding="async"`); trang có thể đè bằng thuộc tính của riêng nó.
 */
export function Image({
  src,
  alt = "",
  fallbackSrc,
  fallback,
  preload = false,
  className,
  onLoad,
  onError,
  ...props
}: ImageProps) {
  const [currentSrc, setCurrentSrc] = useState<string | null>(src ?? null);
  const [hasError, setHasError] = useState(!src);
  const [attemptedFallbackSrc, setAttemptedFallbackSrc] = useState(false);

  useEffect(() => {
    setCurrentSrc(src ?? null);
    setHasError(!src);
    setAttemptedFallbackSrc(false);
  }, [src]);

  // Preload ảnh vào document.head nếu được yêu cầu
  useEffect(() => {
    if (!preload || !src || typeof document === "undefined") return;
    const link = document.createElement("link");
    link.setAttribute("rel", "preload");
    link.setAttribute("as", "image");
    link.setAttribute("href", src);
    document.head.appendChild(link);
    return () => {
      document.head.removeChild(link);
    };
  }, [preload, src]);

  const handleError = (e: SyntheticEvent<HTMLImageElement>) => {
    onError?.(e);
    if (fallbackSrc && !attemptedFallbackSrc) {
      setAttemptedFallbackSrc(true);
      setCurrentSrc(fallbackSrc);
    } else {
      setHasError(true);
    }
  };

  const handleLoad = (e: SyntheticEvent<HTMLImageElement>) => {
    setHasError(false);
    onLoad?.(e);
  };

  if (!currentSrc || hasError) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <div
        role="img"
        aria-label={alt || "Ảnh không khả dụng"}
        className={cx(
          "w-full h-full bg-[#f1f3f6] text-muted flex items-center justify-center select-none overflow-hidden",
          className,
        )}
      >
        <svg
          className="size-1/2 max-size-8 opacity-60"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="1.5"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"
          />
        </svg>
      </div>
    );
  }

  return (
    <img
      // Lazy by default: a picture outside the screen is not fetched until the customer scrolls near it.
      // A page that must show it at once (the main photo of a product) passes loading="eager".
      loading="lazy"
      decoding="async"
      src={currentSrc}
      alt={alt}
      className={className}
      onError={handleError}
      onLoad={handleLoad}
      {...props}
    />
  );
}
