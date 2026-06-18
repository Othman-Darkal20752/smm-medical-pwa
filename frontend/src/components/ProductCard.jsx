import { Heart, Package, ShoppingCart } from "lucide-react";

function ProductCard({ product, isFavorite, onAddToCart, onToggleFavorite }) {
  return (
    <article className="product-card">
      <span className={`badge ${product.tone}`}>{product.tag}</span>

      <div className={`product-visual ${product.tone}`}>
        <Package size={54} />
      </div>

      <h3>{product.name}</h3>
      <p>{product.category}</p>
      <strong>{product.price}</strong>

      <div className="product-actions">
        <button aria-label="إضافة للسلة" onClick={onAddToCart}>
          <ShoppingCart size={24} />
        </button>

        <button
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