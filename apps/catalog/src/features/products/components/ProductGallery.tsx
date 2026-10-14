import { Image, Tag } from "@ecom/ui";

export interface GalleryImage {
  url?: string | null;
  label: string;
}

export interface ProductGalleryProps {
  productName: string;
  images: GalleryImage[];
  activeIndex: number;
  onSelectImage: (index: number) => void;
  onSale?: boolean;
  discountBadge?: string | null;
}

export function ProductGallery({
  productName,
  images,
  activeIndex,
  onSelectImage,
  onSale,
  discountBadge,
}: ProductGalleryProps) {
  // Ensure we have at least 1 image
  const displayImages =
    images.length > 0 ? images : [{ url: null, label: "Mặt trước" }];
  const currentImage = displayImages[activeIndex] ?? displayImages[0];

  return (
    <section
      aria-label="Hình ảnh sản phẩm"
      className="flex flex-col gap-4 flex-1 min-w-[280px] sm:min-w-[400px] lg:max-w-[560px]"
    >
      {/* Big Main Image Container */}
      <div className="relative aspect-square w-full rounded-[24px] overflow-hidden border border-line bg-canvas/60 shadow-xs flex items-center justify-center">
        {onSale && discountBadge && (
          <Tag
            tone="sale"
            className="absolute top-4 left-4 z-10 font-semibold px-3 py-1 shadow-xs"
          >
            {discountBadge}
          </Tag>
        )}

        <Image
          src={currentImage.url || undefined}
          alt={`${productName} - ${currentImage.label}`}
          className="size-full object-cover transition-opacity duration-200"
        />
      </div>

      {/* Thumbnails Navigation */}
      {displayImages.length > 1 && (
        <div
          role="group"
          aria-label="Chọn ảnh"
          className="flex gap-3 flex-wrap"
        >
          {displayImages.map((img, idx) => {
            const isSelected = activeIndex === idx;
            return (
              <button
                key={idx}
                type="button"
                aria-pressed={isSelected}
                aria-label={`Xem ảnh: ${img.label}`}
                onClick={() => onSelectImage(idx)}
                className={`size-[76px] sm:size-[84px] rounded-[16px] overflow-hidden border-2 transition-all p-0 cursor-pointer bg-white relative ${
                  isSelected
                    ? "border-brand ring-2 ring-brand/30 shadow-xs"
                    : "border-line/70 hover:border-ink/40 opacity-80 hover:opacity-100"
                }`}
              >
                <Image
                  src={img.url || undefined}
                  alt={img.label}
                  className="size-full object-cover"
                />
              </button>
            );
          })}
        </div>
      )}

      <p className="text-[13px] text-muted">
        Ảnh minh hoạ. Ảnh thật của sản phẩm sẽ thay vào đây.
      </p>
    </section>
  );
}
