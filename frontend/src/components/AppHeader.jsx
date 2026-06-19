import {
  Menu,
  MessageCircle,
  Moon,
  Search,
  ShoppingCart,
  Sun,
} from "lucide-react";
import { storeInfo } from "../data/storeInfo";

const navItems = [
  { id: "home", label: "الرئيسية" },
  { id: "products", label: "المنتجات" },
  { id: "offers", label: "العروض" },
  { id: "contact", label: "تواصل معنا" },
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
  return (
    <header className="site-header">
      <div className="header-service-strip">
        <span>منتجات موثوقة ومرخصة</span>
        <span>توصيل سريع</span>
        <span>خدمة 7 أيام</span>
        <span className="header-service-location">{storeInfo.location}</span>
      </div>

      <div className="top-bar">
        <button
          className="icon-button mobile-menu-button"
          type="button"
          aria-label="القائمة"
          onClick={onOpenDrawer}
        >
          <Menu size={30} />
        </button>

        <button
          className="brand-logo-button"
          type="button"
          aria-label="العودة للرئيسية"
          onClick={() => onNavigate("home")}
        >
          <img src={storeInfo.logo} alt={storeInfo.name} />
          <span>
            <strong>{storeInfo.shortName}</strong>
            <small>{storeInfo.name}</small>
          </span>
        </button>

        <nav className="desktop-nav" aria-label="التنقل الرئيسي">
          {navItems.map((item) => (
            <button
              key={item.id}
              type="button"
              className={activePage === item.id ? "active" : ""}
              onClick={() => onNavigate(item.id)}
            >
              {item.label}
            </button>
          ))}
        </nav>

        <div className="search-box">
          <Search size={20} />

          <input
            ref={searchInputRef}
            value={searchQuery}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="ابحث عن جهاز، مستلزم، مادة سنية..."
          />
        </div>

        <div className="header-actions">
          <button
            className="theme-toggle-button"
            type="button"
            aria-label="تبديل الوضع"
            onClick={onToggleTheme}
          >
            {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          <a
            className="desktop-whatsapp-button"
            href={whatsappUrl}
            target="_blank"
            rel="noreferrer"
          >
            <MessageCircle size={19} />
            واتساب
          </a>

          <button
            className="cart-header-button"
            type="button"
            aria-label="السلة"
            onClick={onCartClick}
          >
            <ShoppingCart size={25} />
            <span>السلة</span>
            <b>{cartCount}</b>
          </button>
        </div>
      </div>
    </header>
  );
}

export default AppHeader;
