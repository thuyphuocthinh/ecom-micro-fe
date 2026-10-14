import type { CategoryFacet } from "@/types";

export interface CategoryFacetListProps {
  facets: CategoryFacet[];
  selectedCategoryId?: string;
  onSelectCategory: (categoryId: string | undefined) => void;
  totalCount?: number;
}

export function CategoryFacetList({
  facets,
  selectedCategoryId,
  onSelectCategory,
  totalCount,
}: CategoryFacetListProps) {
  const isAllSelected = !selectedCategoryId;

  return (
    <div className="flex flex-col gap-1.5">
      <h3 className="text-sm font-bold text-ink uppercase tracking-wider mb-1">
        Danh mục
      </h3>

      <div className="flex flex-col gap-1">
        {/* All Categories Option */}
        <button
          type="button"
          onClick={() => onSelectCategory(undefined)}
          className={`flex items-center justify-between px-3 py-2 rounded-control text-sm font-medium transition-colors text-left cursor-pointer ${
            isAllSelected
              ? "bg-brand/10 text-brand font-bold"
              : "text-ink hover:bg-canvas"
          }`}
        >
          <span>Tất cả danh mục</span>
          {typeof totalCount === "number" && (
            <span
              className={`tnum text-xs px-2 py-0.5 rounded-full ${
                isAllSelected ? "bg-brand text-white" : "bg-canvas text-muted"
              }`}
            >
              {totalCount}
            </span>
          )}
        </button>

        {/* Facet Category Items */}
        {facets.map((facet) => {
          const isSelected = selectedCategoryId === facet.categoryId;

          return (
            <button
              key={facet.categoryId}
              type="button"
              onClick={() => onSelectCategory(facet.categoryId)}
              className={`flex items-center justify-between px-3 py-2 rounded-control text-sm transition-colors text-left cursor-pointer ${
                isSelected
                  ? "bg-brand/10 text-brand font-bold"
                  : "text-ink hover:bg-canvas"
              }`}
            >
              <span className="truncate pr-2">{facet.name}</span>
              <span
                className={`tnum text-xs px-2 py-0.5 rounded-full shrink-0 ${
                  isSelected ? "bg-brand text-white" : "bg-canvas text-muted"
                }`}
              >
                {facet.count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
