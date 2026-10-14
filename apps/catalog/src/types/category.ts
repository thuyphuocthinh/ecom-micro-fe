export interface Category {
  id: string;
  name: string;
  slug?: string;
  parentId?: string | null;
}

export interface CategoryFacet {
  categoryId: string;
  name: string;
  count: number;
}
