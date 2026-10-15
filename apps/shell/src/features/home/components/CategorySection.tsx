import { Link } from "react-router";
import { SectionStatus } from "@/features/home/components/SectionStatus.tsx";
import { useHomeCategoriesQuery } from "@/features/home/hooks/useHomeCatalog.ts";
import { searchHrefForCategory } from "@/utils/category-link.ts";
import { prefetchOnIntent } from "@/libs/remote-loaders.ts";
import type { HomeCategory } from "@/features/home/types/home.ts";

function renderCategoryDecoration(cat: HomeCategory, index: number) {
  switch (index) {
    case 0:
      return (
        <div
          aria-hidden="true"
          className="absolute -right-8 -top-8 w-64 h-64 rounded-full pointer-events-none transition-transform duration-300 group-hover:scale-105"
          style={{ backgroundColor: cat.shapeBackground }}
        />
      );
    case 1:
      return (
        <div
          aria-hidden="true"
          className="absolute right-9 top-8 w-36 h-20 rounded-2xl -rotate-6 pointer-events-none transition-transform duration-300 group-hover:scale-105"
          style={{ backgroundColor: cat.shapeBackground }}
        />
      );
    case 2:
      return (
        <div
          aria-hidden="true"
          className="absolute right-6 top-6 w-14 h-20 rounded-t-xl rounded-b-sm pointer-events-none transition-transform duration-300 group-hover:scale-105"
          style={{ backgroundColor: cat.shapeBackground }}
        />
      );
    case 3:
      return (
        <div
          aria-hidden="true"
          className="absolute right-7 top-5 w-12 h-24 rounded-t-3xl rounded-b-lg pointer-events-none transition-transform duration-300 group-hover:scale-105"
          style={{ backgroundColor: cat.shapeBackground }}
        />
      );
    default:
      return (
        <div
          aria-hidden="true"
          className="absolute -right-8 -top-8 w-48 h-48 rounded-full pointer-events-none transition-transform duration-300 group-hover:scale-105"
          style={{ backgroundColor: cat.shapeBackground }}
        />
      );
  }
}

function getCategoryLayoutClass(index: number): string {
  switch (index) {
    case 0:
      return "md:col-span-2 md:row-span-2";
    case 1:
      return "md:col-span-2 md:row-span-1";
    case 2:
      return "col-span-1";
    case 3:
      return "col-span-1";
    default:
      return "";
  }
}

export function CategorySection() {
  const { categories, isLoading, isError, refetch } = useHomeCategoriesQuery();

  return (
    <section
      aria-labelledby="cat-title"
      className="max-w-[1280px] mx-auto px-4 sm:px-10 py-8 sm:py-10"
    >
      <h2
        id="cat-title"
        className="font-head text-2xl sm:text-3xl font-bold text-ink mb-6"
      >
        Mua theo nhóm
      </h2>

      {isLoading ? (
        <div
          aria-hidden="true"
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 auto-rows-[190px] sm:auto-rows-[210px]"
        >
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="rounded-[20px] bg-canvas-sunken animate-pulse"
            />
          ))}
        </div>
      ) : isError ? (
        <SectionStatus
          kind="error"
          emptyText=""
          errorText="Không tải được danh mục."
          onRetry={() => void refetch()}
        />
      ) : categories.length === 0 ? (
        <SectionStatus kind="empty" emptyText="Chưa có danh mục nào" />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 md:grid-rows-2 gap-4 auto-rows-[190px] sm:auto-rows-[210px]">
          {categories.map((cat, index) => {
            const layoutClass = getCategoryLayoutClass(index);

            return (
              <Link
                key={cat.id}
                to={searchHrefForCategory(cat.id)}
                {...prefetchOnIntent("/search")}
                className={`group relative flex flex-col justify-end gap-1 p-6 rounded-[20px] overflow-hidden text-ink transition-transform duration-200 hover:-translate-y-1 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-brand ${layoutClass}`}
                style={{ backgroundColor: cat.tint }}
              >
                {renderCategoryDecoration(cat, index)}

                <h3 className="font-head text-2xl sm:text-[26px] font-bold text-ink relative z-10">
                  {cat.name}
                </h3>
                {cat.description && (
                  <p className="text-sm sm:text-[14.5px] text-ink-2 relative z-10">
                    {cat.description}
                  </p>
                )}
              </Link>
            );
          })}
        </div>
      )}
    </section>
  );
}
