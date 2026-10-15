declare module "catalog/SearchPage" {
  import type { ComponentType } from "react";
  const SearchPage: ComponentType;
  export default SearchPage;
  export { SearchPage };
}

declare module "catalog/ProductDetailPage" {
  import type { ComponentType } from "react";
  const ProductDetailPage: ComponentType;
  export default ProductDetailPage;
  export { ProductDetailPage };
}

declare module "catalog/ProductCard" {
  import type { ComponentType } from "react";
  export const ProductCard: ComponentType<{
    product: any;
    categoryName?: string;
    onAddToCart?: (product: any) => void;
    className?: string;
  }>;
}

declare module "catalog/ProductGrid" {
  import type { ComponentType } from "react";
  export const ProductGrid: ComponentType<{
    products: any[];
    categoryNames?: Record<string, string>;
    isLoading?: boolean;
    onAddToCart?: (product: any) => void;
    onClearFilters?: () => void;
    className?: string;
  }>;
}

declare module "checkout/CartPage" {
  import type { ComponentType } from "react";
  const CartPage: ComponentType;
  export default CartPage;
  export { CartPage };
}

declare module "checkout/CheckoutPage" {
  import type { ComponentType } from "react";
  const CheckoutPage: ComponentType;
  export default CheckoutPage;
  export { CheckoutPage };
}

declare module "checkout/PaymentPage" {
  import type { ComponentType } from "react";
  const PaymentPage: ComponentType;
  export default PaymentPage;
  export { PaymentPage };
}

declare module "checkout/OrderSuccessPage" {
  import type { ComponentType } from "react";
  const OrderSuccessPage: ComponentType;
  export default OrderSuccessPage;
  export { OrderSuccessPage };
}
