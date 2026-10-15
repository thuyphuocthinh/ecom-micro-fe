import { Button } from "@ecom/ui";

export interface SectionStatusProps {
  kind: "empty" | "error";
  /** Said when there is nothing to show: "Chưa có sản phẩm nào". */
  emptyText: string;
  /** Said when the API failed. The reason itself is shown once as a toast by @ecom/api. */
  errorText?: string;
  onRetry?: () => void;
}

/** What a section of the home page shows instead of invented content: it is empty, or it could not load. */
export function SectionStatus({
  kind,
  emptyText,
  errorText = "Không tải được nội dung này.",
  onRetry,
}: SectionStatusProps) {
  return (
    <div
      role="status"
      data-testid={`section-${kind}`}
      className="flex flex-col items-center gap-3 rounded-card border border-line bg-white px-6 py-10 text-center"
    >
      <p className="text-[15px] text-ink-2">
        {kind === "error" ? errorText : emptyText}
      </p>
      {kind === "error" && onRetry && (
        <Button type="button" variant="secondary" onClick={onRetry}>
          Thử lại
        </Button>
      )}
    </div>
  );
}
