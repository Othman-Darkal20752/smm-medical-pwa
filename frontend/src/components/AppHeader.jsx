import {
  BadgePercent,
  Menu,
  MessageCircle,
  Moon,
  PackageSearch,
  Phone,
  Search,
  ShoppingCart,
  Sun,
} from "lucide-react";

import { storeInfo } from "../data/storeInfo";

const labels = {
  products: "\u0627\u0644\u0645\u0646\u062a\u062c\u0627\u062a",
  categories: "\u0627\u0644\u062a\u0635\u0646\u064a\u0641\u0627\u062a",
  offers: "\u0627\u0644\u0639\u0631\u0648\u0636",
  contact: "\u062a\u0648\u0627\u0635\u0644 \u0645\u0639\u0646\u0627",
  shipping: "\u0634\u062d\u0646 \u0644\u0643\u0627\u0641\u0629 \u0627\u0644\u0645\u062d\u0627\u0641\u0638\u0627\u062a \u0627\u0644\u0633\u0648\u0631\u064a\u0629",
  currency: "\u0623\u0633\u0639\u0627\u0631 \u0628\u0627\u0644\u062f\u0648\u0644\u0627\u0631 \u0648\u0627\u0644\u0644\u064a\u0631\u0629",
  location: "\u0635\u062d\u0646\u0627\u064a\u0627",
  home: "\u0627\u0644\u0631\u0626\u064a\u0633\u064a\u0629",
  menu: "\u0641\u062a\u062d \u0627\u0644\u0642\u0627\u0626\u0645\u0629",
  searchPlaceholder: "\u0627\u0628\u062d\u062b \u0639\u0646 \u0645\u0646\u062a\u062c \u0637\u0628\u064a...",
  searchAria: "\u0628\u062d\u062b \u0639\u0646 \u0627\u0644\u0645\u0646\u062a\u062c\u0627\u062a",
  whatsapp: "\u0648\u0627\u062a\u0633\u0627\u0628",
  cart: "\u0627\u0644\u0633\u0644\u0629",
  light: "\u062a\u0641\u0639\u064a\u0644 \u0627\u0644\u0648\u0636\u0639 \u0627\u0644\u0641\u0627\u062a\u062d",
  dark: "\u062a\u0641\u0639\u064a\u0644 \u0627\u0644\u0648\u0636\u0639 \u0627\u0644\u062f\u0627\u0643\u0646",
};

const desktopNavItems = [
  { id: "products", label: labels.products, icon: PackageSearch },
  { id: "offers", label: labels.offers, icon: BadgePercent },
  { id: "contact", label: labels.contact, icon: Phone },
];

function AppHeader({
  cartCount,
  searchQuery,
  searchInputRef,
  onSearchChange,
  onOpenDrawer,
  onCartClick,
  onNavigate,
  activePage,
  whatsappUrl,
  theme,
  onToggleTheme,
}) {
  const isDark = theme === "dark";
  const ThemeIcon = isDark ? Sun : Moon;

  return (
    <header className="site-header smm-stage5-navbar smm-g4-navbar">
      <div className="header-service-strip">
        <span>{labels.shipping}</span>
        <span>{labels.currency}</span>
        <span className="header-service-location">{labels.location}</span>
      </div>

      <div className="mobile-g4-shell" dir="rtl">
        <button
          className="mobile-g4-brand"
          type="button"
          onClick={() => onNavigate("home")}
          aria-label={labels.home}
        >
          <img src={storeInfo.logo} alt={storeInfo.name} />
          <span>
            <strong>SMM</strong>
            <small>{storeInfo.name}</small>
          </span>
        </button>

        <div className="mobile-g4-search">
          <Search size={15} />
          <input
            ref={searchInputRef}
            type="search"
            value={searchQuery}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder={labels.searchPlaceholder}
            aria-label={labels.searchAria}
          />
        </div>

        <button
          className="mobile-g4-cart-button"
          type="button"
          onClick={onCartClick}
          aria-label={`${labels.cart}: ${cartCount}`}
        >
          <ShoppingCart size={19} />
          {cartCount > 0 && <b>{cartCount}</b>}
        </button>

        <button
          className="mobile-g4-theme-button"
          type="button"
          onClick={onToggleTheme}
          aria-label={isDark ? labels.light : labels.dark}
        >
          <ThemeIcon size={18} />
        </button>

        <button
          className="mobile-g4-menu-button"
          type="button"
          onClick={onOpenDrawer}
          aria-label={labels.menu}
        >
          <Menu size={21} />
        </button>
      </div>

      <div className="top-bar smm-stage5-topbar">
        <button
          className="icon-button mobile-menu-button"
          type="button"
          onClick={onOpenDrawer}
          aria-label={labels.menu}
        >
          <Menu size={25} />
        </button>

        <button
          className="brand-logo-button smm-stage5-brand"
          type="button"
          onClick={() => onNavigate("home")}
          aria-label={labels.home}
        >
          <img src={storeInfo.logo} alt={storeInfo.name} />
          <span>
            <strong>SMM</strong>
            <small>{storeInfo.name}</small>
          </span>
        </button>

        <div className="search-box smm-stage5-search">
          <Search size={20} />
          <input
            type="search"
            value={searchQuery}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder={labels.searchPlaceholder}
            aria-label={labels.searchAria}
          />
        </div>

        <nav className="desktop-nav smm-stage5-desktop-nav" aria-label="????? ?????? ????????">
          {desktopNavItems.map((item) => {
            const Icon = item.icon;

            return (
              <button
                key={item.id}
                type="button"
                className={activePage === item.id ? "active" : ""}
                onClick={() => onNavigate(item.id)}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="header-actions smm-stage5-actions">
          <a
            className="desktop-whatsapp-button"
            href={whatsappUrl}
            target="_blank"
            rel="noreferrer"
            aria-label={labels.whatsapp}
          >
            <MessageCircle size={19} />
            <span>{labels.whatsapp}</span>
          </a>

          <button
            className="cart-header-button"
            type="button"
            onClick={onCartClick}
            aria-label={`${labels.cart}: ${cartCount}`}
          >
            <ShoppingCart size={20} />
            <span>{labels.cart}</span>
            {cartCount > 0 && <b>{cartCount}</b>}
          </button>

          <button
            className="theme-toggle-button"
            type="button"
            onClick={onToggleTheme}
            aria-label={isDark ? labels.light : labels.dark}
          >
            <ThemeIcon size={20} />
          </button>
        </div>

        <button
          className="icon-button mobile-theme-toggle"
          type="button"
          onClick={onToggleTheme}
          aria-label={isDark ? labels.light : labels.dark}
        >
          <ThemeIcon size={21} />
        </button>
      </div>
    </header>
  );
}

export default AppHeader;
