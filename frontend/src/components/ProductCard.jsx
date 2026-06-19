import { Check, Heart, Package, ShoppingCart } from "lucide-react";

function formatPrice(product) {
  if (product.priceLabel) return product.priceLabel;
  if (typeof product.price === "string") return product.price;
  if (typeof product.priceValue === "number") {
    return `${product.priceValue.toLocaleString("en-US")} ل.س`;
  }

  return "السعر عند الطلب";
}

function ProductCard({
  product,
  isFavorite,
  isInCart,
  cartQuantity = 0,
  onAddToCart,
  onToggleFavorite,
}) {
  return (
    <article className="product-card">
      <span className={`badge ${product.tone}`}>{product.tag}</span>

      <div className={`product-visual ${product.tone}`}>
        {product.image ? (
          <img src={product.image} alt={product.name} />
        ) : (
          <Package size={54} />
        )}
      </div>

      <h3>{product.name}</h3>
      <p>{product.category}</p>
      <strong>{formatPrice(product)}</strong>

      <div className="product-actions">
        <button
          type="button"
          className={isInCart ? "add-cart-button is-added" : "add-cart-button"}
          aria-label="إضافة للسلة"
          onClick={() => onAddToCart(product)}
        >
          {isInCart ? <Check size={22} /> : <ShoppingCart size={22} />}
          <span>{isInCart ? `مضاف ${cartQuantity}` : "إضافة"}</span>
        </button>

        <button
          type="button"
          aria-label="المفضلة"
          className={isFavorite ? "is-favorite" : ""}
          onClick={() => onToggleFavorite(product.id)}
        >
          <Heart size={24} />
        </button>
      </div>
    </article>
  );
}

export default ProductCard;