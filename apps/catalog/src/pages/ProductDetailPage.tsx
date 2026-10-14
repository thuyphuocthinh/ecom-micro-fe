import { useState, useMemo, useEffect, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router";
import { useCategoriesQuery } from "../features/products/hooks/useCategoriesQuery.ts";
import { useProductDetailQuery } from "../features/products/hooks/useProductDetailQuery.ts";
import { useRelatedProductsQuery } from "../features/products/hooks/useRelatedProductsQuery.ts";
import {
  getProductSpecs,
  getSkuDisplayName,
} from "../features/products/utils/product-detail-format.ts";
import { formatDiscountBadge } from "../features/products/utils/product-format.ts";
import {
  ProductGallery,
  type GalleryImage,
} from "../features/products/components/ProductGallery.tsx";
import { ProductBuyBox } from "../features/products/components/ProductBuyBox.tsx";
import { ProductSpecs } from "../features/products/components/ProductSpecs.tsx";
import { ProductRelatedSection } from "../features/products/components/ProductRelatedSection.tsx";
import { ProductDetailSkeleton } from "../features/products/components/ProductDetailSkeleton.tsx";
import { ProductNotFound } from "../features/products/components/ProductNotFound.tsx";
import { ProductToast } from "../features/products/components/ProductToast.tsx";

export function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Queries
  const { data: product, isLoading, isError } = useProductDetailQuery(id);
  const { data: categories } = useCategoriesQuery();
  const { data: relatedProducts } = useRelatedProductsQuery(
    product?.categoryId,
    product?.id,
  );

  // Local state
  const [selectedSkuIdOverride, setSelectedSkuIdOverride] = useState<
    string | null
  >(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Adjust state during render when ID changes (official React pattern)
  const [prevId, setPrevId] = useState(id);
  if (prevId !== id) {
    setPrevId(id);
    setActiveImageIndex(0);
    setQuantity(1);
    setSelectedSkuIdOverride(null);
  }

  // Scroll to top when product ID changes (external system sync)
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [id]);

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, []);

  // Compute selected SKU declaratively
  const defaultSku = useMemo(() => {
    if (!product?.skus || product.skus.length === 0) return undefined;
    return product.skus.find((s) => s.inStock !== false) || product.skus[0];
  }, [product]);

  const selectedSku = useMemo(() => {
    if (!product?.skus || product.skus.length === 0) return defaultSku;
    if (selectedSkuIdOverride) {
      const found = product.skus.find((s) => s.id === selectedSkuIdOverride);
      if (found) return found;
    }
    return defaultSku;
  }, [product, selectedSkuIdOverride, defaultSku]);

  // Category lookup
  const currentCategory = useMemo(() => {
    const categoryId = product?.categoryId;
    if (!categories || !categoryId) return undefined;
    return categories.find((c) => c.id === categoryId);
  }, [categories, product]);

  // Gallery images preparation
  const galleryImages: GalleryImage[] = useMemo(() => {
    if (!product) return [];
    const images: GalleryImage[] = [];

    // Main product thumbnail
    if (product.thumbnail) {
      images.push({ url: product.thumbnail, label: "Mặt trước" });
    }

    // Add extra angles or thumbnail variants
    images.push({ url: product.thumbnail, label: "Cận cảnh chi tiết" });
    images.push({ url: product.thumbnail, label: "Phụ kiện đi kèm" });
    images.push({ url: product.thumbnail, label: "Bao bì hộp đựng" });

    return images;
  }, [product]);

  // Specs
  const specs = useMemo(() => {
    if (!product) return [];
    return getProductSpecs(product);
  }, [product]);

  // Discount badge
  const discountBadge = useMemo(() => {
    if (!product) return null;
    const discount = selectedSku?.discountPercent || product.discountPercent;
    return formatDiscountBadge(discount);
  }, [product, selectedSku]);

  // Handler: Change SKU
  const handleSelectSku = (skuId: string) => {
    setSelectedSkuIdOverride(skuId);
    setQuantity(1);
  };

  // Handler: Show toast
  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Handler: Add to cart
  const handleAddToCart = () => {
    if (!product || !selectedSku) return;

    setIsAddingToCart(true);

    // Cross-app Add to cart events
    window.dispatchEvent(
      new CustomEvent("cart:add", {
        detail: {
          productId: product.id,
          skuId: selectedSku.id,
          quantity,
        },
      }),
    );
    window.dispatchEvent(new CustomEvent("cart:changed"));

    const skuName = getSkuDisplayName(selectedSku);
    triggerToast(
      `Đã thêm ${quantity} × ${product.name} (${skuName}) vào giỏ hàng`,
    );

    setTimeout(() => {
      setIsAddingToCart(false);
    }, 300);
  };

  // Handler: Buy now
  const handleBuyNow = () => {
    if (!product || !selectedSku) return;

    window.dispatchEvent(
      new CustomEvent("cart:add", {
        detail: {
          productId: product.id,
          skuId: selectedSku.id,
          quantity,
        },
      }),
    );
    window.dispatchEvent(new CustomEvent("cart:changed"));

    // Navigate to checkout or cart
    navigate("/checkout");
  };

  // Loading state
  if (isLoading) {
    return <ProductDetailSkeleton />;
  }

  // Error / Not found state
  if (isError || !product || !selectedSku) {
    return <ProductNotFound />;
  }

  const categoryName = currentCategory?.name || "Danh mục";
  const searchHref = `/search?category=${encodeURIComponent(product.categoryId)}`;

  return (
    <div className="min-h-screen bg-bg">
      <main
        id="main"
        className="max-w-[1280px] mx-auto px-4 sm:px-8 lg:px-10 py-6 sm:py-8 pb-20"
      >
        {/* Breadcrumb Navigation */}
        <nav
          aria-label="Đường dẫn"
          className="text-[14px] text-muted mb-6 flex items-center gap-2 flex-wrap"
        >
          <Link
            to="/"
            className="hover:text-brand transition-colors text-muted no-underline"
          >
            Trang chủ
          </Link>
          <span aria-hidden="true" className="text-muted/60">
            /
          </span>
          <Link
            to={searchHref}
            className="hover:text-brand transition-colors text-muted no-underline"
          >
            {categoryName}
          </Link>
          <span aria-hidden="true" className="text-muted/60">
            /
          </span>
          <span
            aria-current="page"
            className="text-ink font-medium truncate max-w-[280px] sm:max-w-[420px]"
          >
            {product.name}
          </span>
        </nav>

        {/* Main Two-Column Layout: Gallery + Buy Box */}
        <div className="flex gap-10 lg:gap-14 flex-wrap items-start">
          {/* Gallery Column */}
          <ProductGallery
            productName={product.name}
            images={galleryImages}
            activeIndex={activeImageIndex}
            onSelectImage={setActiveImageIndex}
            onSale={product.onSale || Boolean(selectedSku.discountPercent)}
            discountBadge={discountBadge}
          />

          {/* Buy Box Column */}
          <ProductBuyBox
            product={product}
            selectedSku={selectedSku}
            quantity={quantity}
            categoryName={categoryName}
            isAddingToCart={isAddingToCart}
            onSelectSku={handleSelectSku}
            onChangeQuantity={setQuantity}
            onAddToCart={handleAddToCart}
            onBuyNow={handleBuyNow}
          />
        </div>

        {/* Description & Specs Section */}
        <ProductSpecs description={product.description} specs={specs} />

        {/* Related Products Section */}
        <ProductRelatedSection
          products={relatedProducts ?? []}
          categoryId={product.categoryId}
          categoryName={categoryName}
        />
      </main>

      {/* Floating Bottom Toast Notification */}
      <ProductToast
        message={toastMessage}
        onClose={() => setToastMessage(null)}
      />
    </div>
  );
}

export default ProductDetailPage;
