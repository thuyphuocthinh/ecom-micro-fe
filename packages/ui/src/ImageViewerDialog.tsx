import Lightbox from "yet-another-react-lightbox";
import Counter from "yet-another-react-lightbox/plugins/counter";
import Thumbnails from "yet-another-react-lightbox/plugins/thumbnails";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import "yet-another-react-lightbox/styles.css";
import "yet-another-react-lightbox/plugins/counter.css";
import "yet-another-react-lightbox/plugins/thumbnails.css";
import "./image-viewer.css";
import type { ImageViewerProps } from "./ImageViewer";

/** Words of the popup, in Vietnamese (the library speaks English by default). */
const LABELS = {
  Close: "Đóng",
  Previous: "Ảnh trước",
  Next: "Ảnh sau",
  Lightbox: "Xem ảnh",
  Slide: "Ảnh",
  Carousel: "Danh sách ảnh",
  "Photo gallery": "Danh sách ảnh",
  "{index} of {total}": "Ảnh {index} trên {total}",
  "Zoom in": "Phóng to",
  "Zoom out": "Thu nhỏ",
  Thumbnails: "Ảnh nhỏ",
};

/**
 * The popup itself. It is only ever loaded through `React.lazy` by `ImageViewer`, so the code of the
 * library reaches the page when somebody first clicks a picture, not before.
 */
export default function ImageViewerDialog({
  images,
  open,
  index,
  onIndexChange,
  onClose,
}: ImageViewerProps) {
  const several = images.length > 1;

  return (
    <Lightbox
      className="ecom-image-viewer"
      open={open}
      close={onClose}
      index={index}
      slides={images.map(({ src, alt }) => ({ src, alt }))}
      labels={LABELS}
      // Arrows, thumbnails and the "2 / 4" counter mean nothing with one picture.
      plugins={several ? [Zoom, Thumbnails, Counter] : [Zoom]}
      on={{ view: ({ index: viewed }) => onIndexChange(viewed) }}
      controller={{ closeOnBackdropClick: true }}
      zoom={{ scrollToZoom: true, maxZoomPixelRatio: 3 }}
      thumbnails={{ vignette: false }}
      // The library still draws the two arrows (switched off) for a single picture: take them away.
      render={
        several ? undefined : { buttonPrev: () => null, buttonNext: () => null }
      }
    />
  );
}
