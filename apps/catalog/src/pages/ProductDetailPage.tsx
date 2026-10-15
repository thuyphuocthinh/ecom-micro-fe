import { useState, useMemo, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router";
import { toast } from "sonner";
import { useCategoriesQuery } from "@/features/products/hooks/useCategoriesQuery.ts";
import { useProductDetailQuery } from "@/features/products/hooks/useProductDetailQuery.ts";
import { useRelatedProductsQuery } from "@/features/products/hooks/useRelatedProductsQuery.ts";
import {
  getProductSpecs,
  getSkuDisplayName,
} from "@/features/products/utils/product-detail-format.ts";
import { formatDiscountBadge } from "@/features/products/utils/product-format.ts";
import {
  ProductGallery,
  type GalleryImage,
} from "@/features/products/components/ProductGallery.tsx";
import { ProductBuyBox } from "@/features/products/components/ProductBuyBox.tsx";
import { ProductSpecs } from "@/features/products/components/ProductSpecs.tsx";
import { ProductRelatedSection } from "@/features/products/components/ProductRelatedSection.tsx";
import { ProductDetailSkeleton } from "@/features/products/components/ProductDetailSkeleton.tsx";
import { ProductNotFound } from "@/features/products/components/ProductNotFound.tsx";
import { useAddToCart } from "@/features/cart/useAddToCart.ts";

export function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const addToCartMutation = useAddToCart();

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

  // Handler: Add to cart
  const handleAddToCart = async () => {
    if (!product || !selectedSku) return;

    const skuName = getSkuDisplayName(selectedSku);
    try {
      await addToCartMutation.mutateAsync({
        skuId: selectedSku.id,
        quantity,
        productId: product.id,
        productName: product.name,
        thumbnail: product.thumbnail,
        attributes:
          (selectedSku.attributes as Record<string, string> | null) ?? null,
        price: selectedSku.price ?? product.minPrice ?? 0,
        available: selectedSku.stock ?? 99,
      });

      toast.success(
        `Đã thêm ${quantity} × ${product.name} (${skuName}) vào giỏ hàng`,
        {
          action: {
            label: "Xem giỏ hàng",
            onClick: () => navigate("/cart"),
          },
        },
      );
    } catch {
      toast.error("Không thể thêm vào giỏ hàng, vui lòng thử lại");
    }
  };

  // Handler: Buy now
  const handleBuyNow = async () => {
    if (!product || !selectedSku) return;

    try {
      await addToCartMutation.mutateAsync({
        skuId: selectedSku.id,
        quantity,
        productId: product.id,
        productName: product.name,
        thumbnail: product.thumbnail,
        attributes:
          (selectedSku.attributes as Record<string, string> | null) ?? null,
        price: selectedSku.price ?? product.minPrice ?? 0,
        available: selectedSku.stock ?? 99,
      });
    } finally {
      navigate("/cart");
    }
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
      <div className="max-w-[1280px] mx-auto px-4 sm:px-8 lg:px-10 py-6 sm:py-8 pb-20">
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
            isAddingToCart={addToCartMutation.isPending}
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
      </div>
    </div>
  );
}

export default ProductDetailPage;
