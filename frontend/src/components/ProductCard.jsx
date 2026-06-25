import { Heart, Minus, Package, Plus, ShoppingCart } from "lucide-react";

const badgeLabels = {
  offer: "عرض",
  new: "جديد",
  best: "الأكثر طلباً",
  available: "متوفر",
};

function getProductBadges(product) {
  const badges = [];

  if (product.is_offer || product.tag === "عرض") badges.push("offer");
  if (product.is_new || product.tag === "جديد") badges.push("new");
  if (product.is_best_seller || product.tag === "الأكثر طلباً") badges.push("best");
  if (!badges.length) badges.push("available");

  return badges.slice(0, 2);
}

function getPriceParts(product, exchangeRate) {
  const priceValue =
    typeof product.priceValue === "number"
      ? product.priceValue
      : typeof product.price === "number"
        ? product.price
        : null;

  if (priceValue === null) {
    return {
      requestOnly: true,
      syp: "السعر عند الطلب",
      usd: "",
    };
  }

  const safeExchangeRate = exchangeRate > 0 ? exchangeRate : 13000;
  const usdValue = Math.max(priceValue / safeExchangeRate, 0.01);

  return {
    requestOnly: false,
    syp: `${priceValue.toLocaleString("en-US")} ل.س`,
    usd: `$${usdValue.toLocaleString("en-US", {
      minimumFractionDigits: usdValue < 10 ? 2 : 0,
      maximumFractionDigits: 2,
    })}`,
  };
}

function getVersionedImageUrl(product) {
  if (!product.image) return "";

  if (product.image.startsWith("data:") || product.image.startsWith("blob:")) {
    return product.image;
  }

  const version = product.updated_at || product.updatedAt || product.id || "1";
  const separator = product.image.includes("?") ? "&" : "?";

  return `${product.image}${separator}v=${encodeURIComponent(version)}`;
}

function ProductCard({
  product,
  isFavorite,
  isInCart,
  cartQuantity = 0,
  exchangeRate = 13000,
  onAddToCart,
  onIncreaseQuantity,
  onDecreaseQuantity,
  onToggleFavorite,
  onOpenProduct,
}) {
  const price = getPriceParts(product, exchangeRate);
  const badges = getProductBadges(product);
  const imageUrl = getVersionedImageUrl(product);

  return (
    <article
      className={`product-card premium-product-card tone-${product.tone} is-clickable`}
      role="link"
      tabIndex={0}
      aria-label={`عرض تفاصيل ${product.name}`}
      onClick={() => onOpenProduct?.(product)}
      onKeyDown={(event) => {
        if (
          event.target === event.currentTarget &&
          (event.key === "Enter" || event.key === " ")
        ) {
          event.preventDefault();
          onOpenProduct?.(product);
        }
      }}
    >
      <div className={`product-visual ${product.tone}`}>
        <div className="product-card-badges">
          {badges.map((badge) => (
            <span className={`premium-badge ${badge}`} key={badge}>
              {badgeLabels[badge]}
            </span>
          ))}
        </div>

        <button
          type="button"
          aria-label="المفضلة"
          className={isFavorite ? "favorite-button is-favorite" : "favorite-button"}
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            onToggleFavorite(product.id);
          }}
        >
          <Heart size={20} />
        </button>

        {imageUrl ? (
          <img src={imageUrl} alt={product.name} loading="lazy" />
        ) : (
          <Package size={62} />
        )}
      </div>

      <div className="product-card-body">
        <p className="product-category">{product.category}</p>
        <h3>{product.name}</h3>

        <div className={price.requestOnly ? "dual-price request-price" : "dual-price"}>
          {price.requestOnly ? (
            <strong>{price.syp}</strong>
          ) : (
            <>
              <strong>{price.usd}</strong>
              <span>{price.syp}</span>
            </>
          )}
        </div>

        {isInCart ? (
          <div
            className="add-cart-button is-added cart-quantity-control"
            role="group"
            aria-label={`تعديل كمية ${product.name}`}
          >
            <button
              type="button"
              className="quantity-control-button quantity-control-button--minus"
              aria-label="إنقاص الكمية"
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                onDecreaseQuantity?.(product.id);
              }}
            >
              <Minus size={18} />
            </button>

            <span className="quantity-control-value">{cartQuantity}</span>

            <button
              type="button"
              className="quantity-control-button quantity-control-button--plus"
              aria-label="زيادة الكمية"
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                if (onIncreaseQuantity) {
                  onIncreaseQuantity(product.id);
                  return;
                }

                onAddToCart(product);
              }}
            >
              <Plus size={18} />
            </button>
          </div>
        ) : (
          <button
            type="button"
            className="add-cart-button"
            aria-label="إضافة للسلة"
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              onAddToCart(product);
            }}
          >
            <ShoppingCart size={20} />
            <span>أضف للسلة</span>
          </button>
        )}
      </div>
    </article>
  );
}

export default ProductCard;
