import { useMemo, useState } from "react";
import { Image, ImageViewer, Tag } from "@ecom/ui";
import {
  galleryIndexOf,
  viewableImages,
  viewerIndexOf,
} from "../utils/gallery-viewer.ts";

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
  const displayImages = useMemo<GalleryImage[]>(
    () => (images.length > 0 ? images : [{ url: null, label: "Mặt trước" }]),
    [images],
  );
  const currentIndex = displayImages[activeIndex] ? activeIndex : 0;
  const currentImage = displayImages[currentIndex];

  // The popup shows the pictures that have an address; clicking the big photo opens it at that photo.
  const [viewerOpen, setViewerOpen] = useState(false);
  const viewable = useMemo(
    () => viewableImages(displayImages, productName),
    [displayImages, productName],
  );
  const viewerIndex = viewerIndexOf(viewable, currentIndex);

  const mainImage = (
    <Image
      src={currentImage.url || undefined}
      alt={`${productName} - ${currentImage.label}`}
      loading="eager"
      fetchPriority="high"
      className="size-full object-cover transition-opacity duration-200"
    />
  );

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

        {/* The big photo is what the customer came for and is on the screen at once: load it first
            (see mainImage). The small ones below stay lazy (the default of Image). */}
        {viewerIndex >= 0 ? (
          <button
            type="button"
            aria-label="Phóng to ảnh"
            onClick={() => setViewerOpen(true)}
            className="size-full p-0 border-0 bg-transparent cursor-zoom-in"
          >
            {mainImage}
          </button>
        ) : (
          mainImage
        )}
      </div>

      <ImageViewer
        images={viewable}
        open={viewerOpen}
        index={Math.max(viewerIndex, 0)}
        onIndexChange={(next) => {
          const galleryIndex = galleryIndexOf(viewable, next);
          if (galleryIndex >= 0) onSelectImage(galleryIndex);
        }}
        onClose={() => setViewerOpen(false)}
      />

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
