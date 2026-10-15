import { Link } from "react-router";
import { useRootCategoriesQuery } from "@/hooks/common/useRootCategoriesQuery.ts";
import {
  ALL_PRODUCTS_HREF,
  SALE_HREF,
  searchHrefForCategory,
} from "@/utils/category-link.ts";
import { prefetchOnIntent } from "@/libs/remote-loaders.ts";

const LINK_CLASSES =
  "inline-flex items-center min-h-11 px-1 text-ink-2 hover:text-brand font-medium text-[14.5px] border-b-2 border-transparent hover:border-brand transition-colors whitespace-nowrap";

/**
 * The row of categories under the header. "Tất cả sản phẩm" and "Đang giảm giá" are always there. The
 * categories in between are the API's (the same query as the home page, so one call for both); while they
 * load, or if the API fails, only the two fixed links show: no link is made up.
 */
export function CategoryNav() {
  const { data: categories = [] } = useRootCategoriesQuery();

  return (
    <nav
      aria-label="Danh mục"
      className="max-w-[1280px] mx-auto px-4 sm:px-10 flex gap-7 flex-wrap border-t border-line/60 overflow-x-auto"
    >
      <Link
        to={ALL_PRODUCTS_HREF}
        {...prefetchOnIntent(ALL_PRODUCTS_HREF)}
        className={LINK_CLASSES}
      >
        Tất cả sản phẩm
      </Link>
      {categories.map((category) => (
        <Link
          key={category.id}
          to={searchHrefForCategory(category.id)}
          {...prefetchOnIntent(ALL_PRODUCTS_HREF)}
          className={LINK_CLASSES}
        >
          {category.name}
        </Link>
      ))}
      <Link
        to={SALE_HREF}
        {...prefetchOnIntent(SALE_HREF)}
        className="inline-flex items-center min-h-11 px-1 text-sale hover:text-sale/80 font-medium text-[14.5px] border-b-2 border-transparent hover:border-sale transition-colors ml-auto whitespace-nowrap"
      >
        Đang giảm giá
      </Link>
    </nav>
  );
}
