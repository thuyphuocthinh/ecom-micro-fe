import { describe, it, expect } from "vitest";
import type { GalleryImage } from "../components/ProductGallery.tsx";
import {
  galleryIndexOf,
  viewableImages,
  viewerIndexOf,
} from "./gallery-viewer.ts";

const GALLERY: GalleryImage[] = [
  { url: "/front.jpg", label: "Mặt trước" },
  { url: null, label: "Không có ảnh" },
  { url: "/box.jpg", label: "Hộp đựng" },
  { url: "", label: "Ảnh rỗng" },
  { label: "Thiếu địa chỉ" },
  { url: "/side.jpg", label: "Cận cảnh" },
];

describe("viewableImages (AC-8)", () => {
  it("keeps the pictures that have an address, in order, with the product name in the text", () => {
    expect(viewableImages(GALLERY, "Tai nghe Aero 2")).toEqual([
      {
        src: "/front.jpg",
        alt: "Tai nghe Aero 2 - Mặt trước",
        galleryIndex: 0,
      },
      { src: "/box.jpg", alt: "Tai nghe Aero 2 - Hộp đựng", galleryIndex: 2 },
      { src: "/side.jpg", alt: "Tai nghe Aero 2 - Cận cảnh", galleryIndex: 5 },
    ]);
  });

  it("returns nothing when no picture has an address", () => {
    expect(
      viewableImages([{ url: null, label: "a" }, { label: "b" }], "X"),
    ).toEqual([]);
    expect(viewableImages([], "X")).toEqual([]);
  });
});

describe("index conversion (AC-6, AC-8)", () => {
  const viewable = viewableImages(GALLERY, "X");

  it("turns a gallery index into the popup index", () => {
    expect(viewerIndexOf(viewable, 0)).toBe(0);
    expect(viewerIndexOf(viewable, 2)).toBe(1);
    expect(viewerIndexOf(viewable, 5)).toBe(2);
  });

  it("says -1 for a gallery picture the popup does not show", () => {
    expect(viewerIndexOf(viewable, 1)).toBe(-1);
    expect(viewerIndexOf(viewable, 4)).toBe(-1);
    expect(viewerIndexOf(viewable, 99)).toBe(-1);
  });

  it("turns a popup index back into the gallery index", () => {
    expect(galleryIndexOf(viewable, 0)).toBe(0);
    expect(galleryIndexOf(viewable, 1)).toBe(2);
    expect(galleryIndexOf(viewable, 2)).toBe(5);
  });

  it("says -1 for a popup index that does not exist", () => {
    expect(galleryIndexOf(viewable, 3)).toBe(-1);
    expect(galleryIndexOf(viewable, -1)).toBe(-1);
  });

  it("the two conversions undo each other", () => {
    for (const image of viewable) {
      const inPopup = viewerIndexOf(viewable, image.galleryIndex);
      expect(galleryIndexOf(viewable, inPopup)).toBe(image.galleryIndex);
    }
  });
});
