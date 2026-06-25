import { useState } from "react";

import {
  ArrowRight,
  Heart,
  MessageCircle,
  Minus,
  Package,
  Plus,
  ShoppingCart,
  Truck,
} from "lucide-react";

import ProductCard from "../components/ProductCard";
import "../styles/product-details.css";

const DEFAULT_EXCHANGE_RATE = 13000;

function getPriceParts(product, exchangeRate) {
  const rawSypValue =
    typeof product?.priceValue === "number"
      ? product.priceValue
      : typeof product?.priceSyp === "number"
        ? product.priceSyp
        : typeof product?.price === "number"
          ? product.price
          : null;
  const safeExchangeRate =
    exchangeRate > 0 ? exchangeRate : DEFAULT_EXCHANGE_RATE;
  const rawUsdValue =
    typeof product?.priceUsd === "number"
      ? product.priceUsd
      : null;
  const sypValue =
    rawSypValue !== null
      ? rawSypValue
      : rawUsdValue !== null
        ? rawUsdValue * safeExchangeRate
        : null;
  const usdValue =
    rawUsdValue !== null
      ? rawUsdValue
      : sypValue !== null
        ? sypValue / safeExchangeRate
        : null;

  return {
    sypValue,
    usdValue,
    syp:
      sypValue !== null
        ? `${sypValue.toLocaleString("en-US")} ل.س`
        : "السعر عند الطلب",
    usd:
      usdValue !== null
        ? `$${usdValue.toLocaleString("en-US", {
            minimumFractionDigits: usdValue < 10 ? 2 : 0,
            maximumFractionDigits: 2,
          })}`
        : "",
  };
}

function getVersionedImageUrl(product) {
  const image = product?.image || product?.image_url;

  if (!image) return "";

  if (image.startsWith("data:") || image.startsWith("blob:")) {
    return image;
  }

  const version = product.updated_at || product.updatedAt || product.id || "1";
  const separator = image.includes("?") ? "&" : "?";

  return `${image}${separator}v=${encodeURIComponent(version)}`;
}

function ProductDetailsPage({
  product,
  similarProducts,
  exchangeRate,
  cartQuantity,
  isFavorite,
  onAddToCart,
  onIncreaseQuantity,
  onDecreaseQuantity,
  onToggleFavorite,
  onOpenProduct,
  getCartQuantity,
  favoriteIds,
  whatsappRaw,
  storeName,
  onBackToProducts,
}) {
  const [isImagePreviewOpen, setIsImagePreviewOpen] = useState(false);

  if (!product) {
    return (
      <section className="product-details-not-found">
        <Package size={58} />
        <h1>المنتج غير موجود</h1>
        <p>قد يكون المنتج حُذف أو تغيّر رابطه.</p>
        <button type="button" onClick={onBackToProducts}>
          العودة إلى المنتجات
        </button>
      </section>
    );
  }

  const price = getPriceParts(product, exchangeRate);
  const imageUrl = getVersionedImageUrl(product);
  const description =
    product.description?.trim() ||
    `منتج طبي ضمن تصنيف ${product.category}. تواصل معنا للتأكد من المواصفات والتوفر قبل الطلب.`;
  const productUrl = `${window.location.origin}/products/${encodeURIComponent(
    String(product.id)
  )}`;
  const priceLine = price.usd
    ? `${price.usd} (${price.syp})`
    : "السعر عند الطلب";
  const whatsappMessage = `مرحباً، أريد الاستفسار عن المنتج التالي من ${storeName}:

${product.name}
التصنيف: ${product.category}
السعر: ${priceLine}
الرابط: ${productUrl}

الرجاء تأكيد التوفر والمواصفات والسعر النهائي.`;
  const productWhatsappUrl = `https://wa.me/${whatsappRaw}?text=${encodeURIComponent(
    whatsappMessage
  )}`;

  return (
    <div className="product-details-page">
      <button
        type="button"
        className="product-details-back"
        onClick={onBackToProducts}
      >
        <ArrowRight size={19} />
        العودة إلى المنتجات
      </button>

      <section className="product-details-card">
        <div className={`product-details-visual ${product.tone || "navy"}`}>
          <button
            type="button"
            className={
              isFavorite
                ? "product-details-favorite is-favorite"
                : "product-details-favorite"
            }
            aria-label="المفضلة"
            onClick={() => onToggleFavorite(product.id)}
          >
            <Heart size={23} />
          </button>

          {imageUrl ? (
            <button
              type="button"
              className="product-details-image-button"
              aria-label={`تكبير صورة ${product.name}`}
              onClick={() => setIsImagePreviewOpen(true)}
            >
              <img src={imageUrl} alt={product.name} />
            </button>
          ) : (
            <Package size={76} />
          )}
        </div>

        <div className="product-details-info">
          <span className="product-details-category">{product.category}</span>
          <h1>{product.name}</h1>

          <div className="product-details-price">
            {price.usd ? (
              <>
                <strong>{price.usd}</strong>
                <span>{price.syp}</span>
              </>
            ) : (
              <strong className="is-request-price">{price.syp}</strong>
            )}
          </div>

          <div className="product-details-description">
            <h2>وصف المنتج</h2>
            <p>{description}</p>
          </div>

          <div className="product-details-shipping">
            <Truck size={21} />
            <span>شحن لكافة المحافظات السورية</span>
          </div>

          <div className="product-details-actions">
            {cartQuantity > 0 ? (
              <div
                className="product-details-quantity"
                role="group"
                aria-label={`تعديل كمية ${product.name}`}
              >
                <button
                  type="button"
                  aria-label="إنقاص الكمية"
                  onClick={() => onDecreaseQuantity(product.id)}
                >
                  <Minus size={20} />
                </button>
                <span>{cartQuantity}</span>
                <button
                  type="button"
                  aria-label="زيادة الكمية"
                  onClick={() => onIncreaseQuantity(product.id)}
                >
                  <Plus size={20} />
                </button>
              </div>
            ) : (
              <button
                type="button"
                className="product-details-add"
                onClick={() => onAddToCart(product)}
              >
                <ShoppingCart size={21} />
                أضف إلى السلة
              </button>
            )}

            <a
              className="product-details-whatsapp"
              href={productWhatsappUrl}
              target="_blank"
              rel="noreferrer"
            >
              <MessageCircle size={21} />
              استفسار عبر واتساب
            </a>
          </div>
        </div>
      </section>

      {similarProducts.length > 0 && (
        <section className="product-details-similar section-block">
          <div className="section-title">
            <h2>منتجات مشابهة</h2>
            <button type="button" onClick={onBackToProducts}>
              كل المنتجات
              <ArrowRight size={18} />
            </button>
          </div>

          <div className="page-product-grid">
            {similarProducts.map((similarProduct) => {
              const similarQuantity = getCartQuantity(similarProduct.id);

              return (
                <ProductCard
                  key={similarProduct.id}
                  product={similarProduct}
                  isFavorite={favoriteIds.includes(similarProduct.id)}
                  isInCart={similarQuantity > 0}
                  cartQuantity={similarQuantity}
                  exchangeRate={exchangeRate}
                  onAddToCart={onAddToCart}
                  onIncreaseQuantity={onIncreaseQuantity}
                  onDecreaseQuantity={onDecreaseQuantity}
                  onToggleFavorite={onToggleFavorite}
                  onOpenProduct={onOpenProduct}
                />
              );
            })}
          </div>
        </section>
      )}

      {isImagePreviewOpen && imageUrl && (
        <button
          type="button"
          className="product-details-lightbox"
          aria-label="إغلاق صورة المنتج"
          onClick={() => setIsImagePreviewOpen(false)}
        >
          <img src={imageUrl} alt={product.name} />
        </button>
      )}
    </div>
  );
}

export default ProductDetailsPage;
