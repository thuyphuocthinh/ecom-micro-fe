import { Link } from "react-router";
import { HOME_CATEGORIES } from "../data/home-data";
import type { HomeCategory } from "../types/home";

function renderCategoryDecoration(cat: HomeCategory) {
  switch (cat.slug) {
    case "audio":
      return (
        <div
          aria-hidden="true"
          className="absolute -right-8 -top-8 w-64 h-64 rounded-full pointer-events-none transition-transform duration-300 group-hover:scale-105"
          style={{ backgroundColor: cat.shapeBackground }}
        />
      );
    case "tech":
      return (
        <div
          aria-hidden="true"
          className="absolute right-9 top-8 w-36 h-20 rounded-2xl -rotate-6 pointer-events-none transition-transform duration-300 group-hover:scale-105"
          style={{ backgroundColor: cat.shapeBackground }}
        />
      );
    case "fashion":
      return (
        <div
          aria-hidden="true"
          className="absolute right-6 top-6 w-14 h-20 rounded-t-xl rounded-b-sm pointer-events-none transition-transform duration-300 group-hover:scale-105"
          style={{ backgroundColor: cat.shapeBackground }}
        />
      );
    case "life":
      return (
        <div
          aria-hidden="true"
          className="absolute right-7 top-5 w-12 h-24 rounded-t-3xl rounded-b-lg pointer-events-none transition-transform duration-300 group-hover:scale-105"
          style={{ backgroundColor: cat.shapeBackground }}
        />
      );
  }
}

export function CategorySection() {
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

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 md:grid-rows-2 gap-4 auto-rows-[190px] sm:auto-rows-[210px]">
        {HOME_CATEGORIES.map((cat) => {
          let layoutClass = "";
          if (cat.slug === "audio") {
            layoutClass = "md:col-span-2 md:row-span-2";
          } else if (cat.slug === "tech") {
            layoutClass = "md:col-span-2";
          }

          return (
            <Link
              key={cat.id}
              to={`/search?category=${encodeURIComponent(cat.slug)}`}
              className={`group relative flex flex-col justify-end gap-1 p-6 rounded-[20px] overflow-hidden text-ink transition-transform duration-200 hover:-translate-y-1 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-brand ${layoutClass}`}
              style={{ backgroundColor: cat.tint }}
            >
              {renderCategoryDecoration(cat)}

              <h3 className="font-head text-2xl sm:text-[26px] font-bold text-ink relative z-10">
                {cat.name}
              </h3>
              <p className="text-sm sm:text-[14.5px] text-ink-2 relative z-10">
                {cat.description}
              </p>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
