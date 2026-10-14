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
    <fieldset className="border-0 p-0 m-0 flex flex-col">
      <legend className="font-head font-bold text-lg text-ink mb-1.5 p-0">
        Nhóm hàng
      </legend>

      <div className="flex flex-col">
        {/* All Categories Option */}
        <button
          type="button"
          onClick={() => onSelectCategory(undefined)}
          className="flex items-center gap-3 min-h-[44px] cursor-pointer text-[15px] group text-left w-full transition-colors"
        >
          <span
            className={`size-5 rounded flex items-center justify-center border transition-colors ${
              isAllSelected
                ? "bg-brand border-brand text-white"
                : "border-line group-hover:border-brand/60 bg-white"
            }`}
          >
            {isAllSelected && (
              <svg
                className="size-3.5 stroke-white fill-none stroke-[2.5]"
                viewBox="0 0 24 24"
              >
                <path d="M20 6L9 17l-5-5" />
              </svg>
            )}
          </span>
          <span
            className={`flex-1 text-ink group-hover:text-brand transition-colors ${
              isAllSelected ? "font-semibold text-brand" : ""
            }`}
          >
            Tất cả danh mục
          </span>
          {typeof totalCount === "number" && (
            <span className="tnum text-[#5b6472] text-[13.5px]">
              {totalCount}
            </span>
          )}
        </button>

        {/* Category Items */}
        {facets.map((facet) => {
          const isSelected = selectedCategoryId === facet.categoryId;

          return (
            <button
              key={facet.categoryId}
              type="button"
              onClick={() =>
                onSelectCategory(isSelected ? undefined : facet.categoryId)
              }
              className="flex items-center gap-3 min-h-[44px] cursor-pointer text-[15px] group text-left w-full transition-colors"
            >
              <span
                className={`size-5 rounded flex items-center justify-center border transition-colors ${
                  isSelected
                    ? "bg-brand border-brand text-white"
                    : "border-line group-hover:border-brand/60 bg-white"
                }`}
              >
                {isSelected && (
                  <svg
                    className="size-3.5 stroke-white fill-none stroke-[2.5]"
                    viewBox="0 0 24 24"
                  >
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                )}
              </span>
              <span
                className={`flex-1 text-ink group-hover:text-brand transition-colors truncate pr-2 ${
                  isSelected ? "font-semibold text-brand" : ""
                }`}
              >
                {facet.name}
              </span>
              <span className="tnum text-[#5b6472] text-[13.5px] shrink-0">
                {facet.count}
              </span>
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
