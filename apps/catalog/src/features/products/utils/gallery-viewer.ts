import type { ImageViewerImage } from "@ecom/ui";
import type { GalleryImage } from "../components/ProductGallery.tsx";

/** A picture of the gallery that the popup can show, with its place in the gallery. */
export interface ViewableImage extends ImageViewerImage {
  galleryIndex: number;
}

/**
 * The pictures the popup can show: those of the gallery that have an address, in the same order.
 * A picture without an address (the grey placeholder) is left out; `galleryIndex` remembers where each
 * one sits in the gallery, because the gallery and the popup count their pictures differently then.
 */
export function viewableImages(
  images: GalleryImage[],
  productName: string,
): ViewableImage[] {
  const viewable: ViewableImage[] = [];
  images.forEach((image, galleryIndex) => {
    if (!image.url) return;
    viewable.push({
      src: image.url,
      alt: `${productName} - ${image.label}`,
      galleryIndex,
    });
  });
  return viewable;
}

/** Where the picture at `galleryIndex` is in the popup, or -1 when the popup does not show it. */
export function viewerIndexOf(
  viewable: ViewableImage[],
  galleryIndex: number,
): number {
  return viewable.findIndex((image) => image.galleryIndex === galleryIndex);
}

/** Where the picture at `viewerIndex` of the popup is in the gallery, or -1 when there is none. */
export function galleryIndexOf(
  viewable: ViewableImage[],
  viewerIndex: number,
): number {
  return viewable[viewerIndex]?.galleryIndex ?? -1;
}
