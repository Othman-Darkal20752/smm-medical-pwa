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

const desktopNavItems = [
  { id: "products", label: "المنتجات", icon: PackageSearch },
  { id: "offers", label: "العروض", icon: BadgePercent },
  { id: "contact", label: "تواصل معنا", icon: Phone },
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
    <header className="site-header smm-stage5-navbar">
      <div className="header-service-strip">
        <span>شحن لكافة المحافظات السورية</span>
        <span>أسعار بالدولار والليرة السورية</span>
        <span className="header-service-location">صحنايا، سوريا</span>
      </div>

      <div className="top-bar smm-stage5-topbar">
        <button
          className="icon-button mobile-menu-button"
          type="button"
          onClick={onOpenDrawer}
          aria-label="فتح القائمة"
        >
          <Menu size={25} />
        </button>

        <button
          className="brand-logo-button smm-stage5-brand"
          type="button"
          onClick={() => onNavigate("home")}
          aria-label="العودة للرئيسية"
        >
          <img src={storeInfo.logo} alt={storeInfo.name} />
          <span>
            <strong>SMM</strong>
            <small>مول صحنايا الطبي</small>
          </span>
        </button>

        <div className="search-box smm-stage5-search">
          <Search size={20} />
          <input
            ref={searchInputRef}
            type="search"
            value={searchQuery}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="ابحث عن منتج طبي..."
            aria-label="بحث عن المنتجات"
          />
        </div>

        <nav className="desktop-nav smm-stage5-desktop-nav" aria-label="روابط الموقع الرئيسية">
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
            aria-label="تواصل عبر واتساب"
          >
            <MessageCircle size={19} />
            <span>واتساب</span>
          </a>

          <button
            className="cart-header-button"
            type="button"
            onClick={onCartClick}
            aria-label={`السلة تحتوي على ${cartCount} منتج`}
          >
            <ShoppingCart size={20} />
            <span>السلة</span>
            {cartCount > 0 && <b>{cartCount}</b>}
          </button>

          <button
            className="theme-toggle-button"
            type="button"
            onClick={onToggleTheme}
            aria-label={isDark ? "تفعيل الوضع الفاتح" : "تفعيل الوضع الداكن"}
          >
            <ThemeIcon size={20} />
          </button>
        </div>

        <button
          className="icon-button mobile-theme-toggle"
          type="button"
          onClick={onToggleTheme}
          aria-label={isDark ? "تفعيل الوضع الفاتح" : "تفعيل الوضع الداكن"}
        >
          <ThemeIcon size={21} />
        </button>
      </div>
    </header>
  );
}

export default AppHeader;
