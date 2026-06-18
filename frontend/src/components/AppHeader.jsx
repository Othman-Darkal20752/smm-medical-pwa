import { Menu, Search, ShoppingCart } from "lucide-react";

function AppHeader({
  cartCount,
  searchQuery,
  searchInputRef,
  onSearchChange,
  onOpenDrawer,
  onCartClick,
}) {
  return (
    <header className="top-bar">
      <div className="top-actions">
        <button className="icon-button" aria-label="القائمة" onClick={onOpenDrawer}>
          <Menu size={30} />
        </button>

        <div className="brand-mark">
          <span>SMM</span>
          <small>مول صحنايا الطبي</small>
        </div>

        <div className="header-icons">
          <button
            className="icon-button"
            aria-label="بحث"
            onClick={() => searchInputRef.current?.focus()}
          >
            <Search size={29} />
          </button>

          <button className="icon-button cart-icon" aria-label="السلة" onClick={onCartClick}>
            <ShoppingCart size={29} />
            <b>{cartCount}</b>
          </button>
        </div>
      </div>

      <div className="search-box">
        <Search size={20} />

        <input
          ref={searchInputRef}
          value={searchQuery}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="ابحث عن منتج طبي..."
        />
      </div>
    </header>
  );
}

export default AppHeader;