import { Home, MessageCircle, Percent, ShoppingCart, Store } from "lucide-react";

const navItems = [
  { id: "home", label: "الرئيسية", icon: Home },
  { id: "store", label: "المتجر", icon: Store },
  { id: "offers", label: "العروض", icon: Percent },
  { id: "cart", label: "السلة", icon: ShoppingCart },
  { id: "contact", label: "تواصل", icon: MessageCircle },
];

function BottomNav({ activeNav, onNavigate }) {
  return (
    <nav className="bottom-nav">
      {navItems.map((item) => {
        const Icon = item.icon;

        return (
          <button
            key={item.id}
            className={activeNav === item.id ? "active" : ""}
            onClick={() => onNavigate(item.id)}
          >
            <Icon size={25} />
            <span>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}

export default BottomNav;