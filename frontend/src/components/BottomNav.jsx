import {
  BadgePercent,
  Home,
  MessageCircle,
  PackageSearch,
  ShoppingCart,
} from "lucide-react";

const navItems = [
  { id: "home", label: "الرئيسية", icon: Home },
  { id: "products", label: "المنتجات", icon: PackageSearch },
  { id: "offers", label: "العروض", icon: BadgePercent },
  { id: "cart", label: "السلة", icon: ShoppingCart },
  { id: "contact", label: "تواصل", icon: MessageCircle },
];

function BottomNav({ activeNav, onNavigate }) {
  return (
    <nav className="bottom-nav smm-stage5-bottom-nav" aria-label="التنقل السفلي">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = activeNav === item.id;

        return (
          <button
            key={item.id}
            type="button"
            className={isActive ? "active" : ""}
            onClick={() => onNavigate(item.id)}
            aria-current={isActive ? "page" : undefined}
          >
            <span className="bottom-nav-icon">
              <Icon size={21} />
            </span>
            <span>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}

export default BottomNav;
