import {
  useEffect,
  useRef,
  useState,
  useMemo,
  useCallback,
  type PointerEvent,
  type DragEvent,
} from "react";
import { Button } from "@ecom/ui";
import { toast } from "sonner";

export interface AvatarCropModalProps {
  open: boolean;
  imageFile: File | null;
  onClose: () => void;
  onCropComplete: (croppedBlob: Blob) => Promise<void>;
  isUploading?: boolean;
}

const CROP_SIZE = 260; // diameter of the crop circle in px
const OUTPUT_SIZE = 400; // exported canvas size in px
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_RAW_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

interface AvatarCropModalDialogProps extends Omit<
  AvatarCropModalProps,
  "imageFile"
> {
  imageFile: File;
}

function AvatarCropModalDialog({
  imageFile,
  onClose,
  onCropComplete,
  isUploading = false,
}: AvatarCropModalDialogProps) {
  const [currentFile, setCurrentFile] = useState<File>(imageFile);
  const [imgNaturalSize, setImgNaturalSize] = useState<{
    width: number;
    height: number;
  }>({ width: 0, height: 0 });
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  const dragStartRef = useRef<{
    pointerX: number;
    pointerY: number;
    panX: number;
    panY: number;
  } | null>(null);
  const imageElementRef = useRef<HTMLImageElement | null>(null);

  const imageSrc = useMemo(
    () => URL.createObjectURL(currentFile),
    [currentFile],
  );

  useEffect(() => {
    return () => {
      URL.revokeObjectURL(imageSrc);
    };
  }, [imageSrc]);

  useEffect(() => {
    const img = new Image();
    img.src = imageSrc;
    img.onload = () => {
      setImgNaturalSize({ width: img.naturalWidth, height: img.naturalHeight });
    };
  }, [imageSrc]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isUploading) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isUploading, onClose]);

  // Validate and apply a new file (e.g. from Drag & Drop)
  const handleNewFile = useCallback((file: File) => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      toast.error("Chỉ chấp nhận file ảnh định dạng JPEG, PNG hoặc WebP");
      return;
    }
    if (file.size > MAX_RAW_SIZE_BYTES) {
      toast.error("Dung lượng ảnh tối đa 10 MB");
      return;
    }
    setCurrentFile(file);
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }, []);

  // Compute scale and clamping
  const minScale =
    imgNaturalSize.width && imgNaturalSize.height
      ? Math.max(
          CROP_SIZE / imgNaturalSize.width,
          CROP_SIZE / imgNaturalSize.height,
        )
      : 1;

  const currentScale = minScale * zoom;
  const imgDisplayWidth = imgNaturalSize.width * currentScale;
  const imgDisplayHeight = imgNaturalSize.height * currentScale;

  const maxPanX = Math.max(0, (imgDisplayWidth - CROP_SIZE) / 2);
  const maxPanY = Math.max(0, (imgDisplayHeight - CROP_SIZE) / 2);

  const clampedPanX = Math.min(maxPanX, Math.max(-maxPanX, pan.x));
  const clampedPanY = Math.min(maxPanY, Math.max(-maxPanY, pan.y));

  // Pointer drag handlers for panning
  const handlePointerDown = (e: PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
    dragStartRef.current = {
      pointerX: e.clientX,
      pointerY: e.clientY,
      panX: clampedPanX,
      panY: clampedPanY,
    };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: PointerEvent<HTMLDivElement>) => {
    if (!isDragging || !dragStartRef.current) return;
    const deltaX = e.clientX - dragStartRef.current.pointerX;
    const deltaY = e.clientY - dragStartRef.current.pointerY;
    setPan({
      x: dragStartRef.current.panX + deltaX,
      y: dragStartRef.current.panY + deltaY,
    });
  };

  const handlePointerUp = (e: PointerEvent<HTMLDivElement>) => {
    setIsDragging(false);
    dragStartRef.current = null;
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      // ignore
    }
  };

  // Drag & drop file replacement
  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleNewFile(e.dataTransfer.files[0]);
    }
  };

  // Crop image and call onCropComplete
  const handleCropAndSave = async () => {
    if (
      !imageElementRef.current ||
      !imgNaturalSize.width ||
      !imgNaturalSize.height
    )
      return;

    const canvas = document.createElement("canvas");
    canvas.width = OUTPUT_SIZE;
    canvas.height = OUTPUT_SIZE;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Fill white background for transparent PNGs
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, OUTPUT_SIZE, OUTPUT_SIZE);

    const ratio = OUTPUT_SIZE / CROP_SIZE;
    const destWidth = imgDisplayWidth * ratio;
    const destHeight = imgDisplayHeight * ratio;
    const destX = OUTPUT_SIZE / 2 + clampedPanX * ratio - destWidth / 2;
    const destY = OUTPUT_SIZE / 2 + clampedPanY * ratio - destHeight / 2;

    ctx.drawImage(imageElementRef.current, destX, destY, destWidth, destHeight);

    canvas.toBlob(
      async (blob) => {
        if (!blob) {
          toast.error("Không thể xử lý ảnh. Vui lòng thử lại.");
          return;
        }
        await onCropComplete(blob);
      },
      "image/jpeg",
      0.9,
    );
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="crop-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/60 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`bg-white rounded-2xl shadow-2xl max-w-[460px] w-full overflow-hidden flex flex-col border transition-all ${
          isDragOver ? "border-brand ring-4 ring-brand/20" : "border-line"
        }`}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-line">
          <h2 id="crop-modal-title" className="text-lg font-bold text-ink">
            Cắt ảnh đại diện
          </h2>
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            disabled={isUploading}
            aria-label="Đóng"
            className="size-8 min-h-0 p-0 rounded-lg text-muted hover:text-ink hover:bg-canvas inline-flex items-center justify-center transition-colors disabled:opacity-50"
          >
            <svg
              className="size-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </Button>
        </div>

        {/* Modal Body: Interactive Viewport */}
        <div className="p-6 flex flex-col items-center gap-4 bg-[#f8f9fa]">
          <div
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            className="relative size-[280px] bg-ink/90 rounded-xl overflow-hidden flex items-center justify-center select-none cursor-grab active:cursor-grabbing touch-none"
            aria-label="Khu vực kéo chỉnh ảnh đại diện"
          >
            <img
              ref={imageElementRef}
              src={imageSrc}
              alt="Xem trước ảnh cắt"
              draggable={false}
              style={{
                width: `${imgDisplayWidth}px`,
                height: `${imgDisplayHeight}px`,
                maxWidth: "none",
                maxHeight: "none",
                transform: `translate(${clampedPanX}px, ${clampedPanY}px)`,
                transition: isDragging ? "none" : "transform 0.05s ease-out",
              }}
              className="pointer-events-none select-none"
            />

            {/* Circular viewfinder overlay */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute size-[260px] rounded-full border-2 border-white/90 shadow-[0_0_0_9999px_rgba(16,24,40,0.6)]"
            />
          </div>

          <p className="text-xs text-muted text-center">
            Kéo chuột để di chuyển • Kéo thanh trượt để phóng to
          </p>

          {/* Zoom controls */}
          <div className="w-full max-w-[320px] flex items-center gap-3">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setZoom((z) => Math.max(1, +(z - 0.2).toFixed(2)))}
              disabled={zoom <= 1 || isUploading}
              aria-label="Thu nhỏ"
              className="size-8 min-h-0 p-0 rounded-md border border-line bg-white text-ink hover:bg-canvas disabled:opacity-40 inline-flex items-center justify-center text-base font-bold shrink-0"
            >
              −
            </Button>
            <input
              type="range"
              min="1"
              max="3"
              step="0.05"
              value={zoom}
              onChange={(e) => setZoom(parseFloat(e.target.value))}
              disabled={isUploading}
              aria-label="Độ phóng to ảnh"
              className="flex-1 accent-brand h-1.5 bg-line rounded-lg cursor-pointer"
            />
            <Button
              type="button"
              variant="secondary"
              onClick={() => setZoom((z) => Math.min(3, +(z + 0.2).toFixed(2)))}
              disabled={zoom >= 3 || isUploading}
              aria-label="Phóng to"
              className="size-8 min-h-0 p-0 rounded-md border border-line bg-white text-ink hover:bg-canvas disabled:opacity-40 inline-flex items-center justify-center text-base font-bold shrink-0"
            >
              +
            </Button>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 bg-white border-t border-line">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            disabled={isUploading}
          >
            Hủy
          </Button>
          <Button
            type="button"
            variant="primary"
            loading={isUploading}
            onClick={handleCropAndSave}
          >
            Cắt &amp; Lưu ảnh
          </Button>
        </div>
      </div>
    </div>
  );
}

export function AvatarCropModal(props: AvatarCropModalProps) {
  if (!props.open || !props.imageFile) return null;
  return (
    <AvatarCropModalDialog
      key={props.imageFile.name + props.imageFile.lastModified}
      {...props}
      imageFile={props.imageFile}
    />
  );
}
