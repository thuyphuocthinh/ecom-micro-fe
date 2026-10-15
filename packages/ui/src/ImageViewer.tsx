import { lazy, Suspense, useState } from "react";

export interface ImageViewerImage {
  src: string;
  alt: string;
}

export interface ImageViewerProps {
  /** The pictures, in the order they are shown. Empty means there is nothing to show. */
  images: ImageViewerImage[];
  open: boolean;
  /** The picture to open at (position in `images`). Inside the popup the person moves on their own. */
  index: number;
  /** Called when the person moves to another picture, so the page can follow. */
  onIndexChange: (index: number) => void;
  onClose: () => void;
}

// The library is big (about 17 KB gzipped plus its styles) and nobody needs it until a picture is clicked.
const ImageViewerDialog = /* @__PURE__ */ lazy(
  () => import("./ImageViewerDialog"),
);

/**
 * A popup to look at pictures big: zoom in and out (buttons, mouse wheel, double click, pinch), drag to
 * move around, previous and next (buttons, arrow keys, swipe), a strip of small pictures, Esc to close.
 * Controlled from outside: the page holds `open` and `index`.
 *
 * Nothing is loaded or drawn until the first time `open` is true.
 */
export function ImageViewer(props: ImageViewerProps) {
  const [wasOpened, setWasOpened] = useState(props.open);
  if (props.open && !wasOpened) setWasOpened(true);

  if (!wasOpened || props.images.length === 0) return null;

  return (
    <Suspense fallback={null}>
      <ImageViewerDialog {...props} />
    </Suspense>
  );
}
