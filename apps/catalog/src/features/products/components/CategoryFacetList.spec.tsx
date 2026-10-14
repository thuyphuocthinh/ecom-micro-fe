import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CategoryFacetList } from "./CategoryFacetList.tsx";
import type { CategoryFacet } from "@/types";

describe("CategoryFacetList Component", () => {
  const sampleFacets: CategoryFacet[] = [
    { categoryId: "cat_books", name: "Sách", count: 0 },
    { categoryId: "cat_fashion", name: "Thời trang", count: 0 },
    { categoryId: "cat_electronics", name: "Điện tử", count: 452 },
    { categoryId: "cat_lifestyle", name: "Đời sống", count: 0 },
  ];

  it("calculates 'Tất cả danh mục' count from the sum of facet counts (452)", () => {
    render(
      <CategoryFacetList
        facets={sampleFacets}
        selectedCategoryId={undefined}
        onSelectCategory={vi.fn()}
        totalCount={12} // Simulates misleading page-size totalCount
      />,
    );

    // Should display the true sum of facets (0 + 0 + 452 + 0 = 452), not 12
    const allCatBtn = screen.getByRole("button", {
      name: /tất cả danh mục/i,
    });
    expect(allCatBtn).toHaveTextContent("452");
    expect(allCatBtn).not.toHaveTextContent("12");

    // Each individual category count should also be rendered
    expect(screen.getByRole("button", { name: /điện tử/i })).toHaveTextContent(
      "452",
    );
    expect(screen.getByRole("button", { name: /sách/i })).toHaveTextContent(
      "0",
    );
  });

  it("falls back to totalCount when facets list is empty", () => {
    render(
      <CategoryFacetList
        facets={[]}
        selectedCategoryId={undefined}
        onSelectCategory={vi.fn()}
        totalCount={99}
      />,
    );

    const allCatBtn = screen.getByRole("button", {
      name: /tất cả danh mục/i,
    });
    expect(allCatBtn).toHaveTextContent("99");
  });

  it("invokes onSelectCategory with undefined when clicking 'Tất cả danh mục'", async () => {
    const user = userEvent.setup();
    const handleSelect = vi.fn();

    render(
      <CategoryFacetList
        facets={sampleFacets}
        selectedCategoryId="cat_electronics"
        onSelectCategory={handleSelect}
      />,
    );

    const allCatBtn = screen.getByRole("button", {
      name: /tất cả danh mục/i,
    });
    await user.click(allCatBtn);

    expect(handleSelect).toHaveBeenCalledWith(undefined);
  });

  it("invokes onSelectCategory with categoryId when clicking a category", async () => {
    const user = userEvent.setup();
    const handleSelect = vi.fn();

    render(
      <CategoryFacetList
        facets={sampleFacets}
        selectedCategoryId={undefined}
        onSelectCategory={handleSelect}
      />,
    );

    const electronicsBtn = screen.getByRole("button", {
      name: /điện tử/i,
    });
    await user.click(electronicsBtn);

    expect(handleSelect).toHaveBeenCalledWith("cat_electronics");
  });

  it("unselects category when clicking already selected category", async () => {
    const user = userEvent.setup();
    const handleSelect = vi.fn();

    render(
      <CategoryFacetList
        facets={sampleFacets}
        selectedCategoryId="cat_electronics"
        onSelectCategory={handleSelect}
      />,
    );

    const electronicsBtn = screen.getByRole("button", {
      name: /điện tử/i,
    });
    await user.click(electronicsBtn);

    expect(handleSelect).toHaveBeenCalledWith(undefined);
  });
});
