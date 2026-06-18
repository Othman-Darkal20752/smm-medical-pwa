import {
  Bell,
  ChevronLeft,
  MessageCircle,
  Percent,
  Store,
  User,
  X,
} from "lucide-react";

function DrawerMenu({ onClose, onNavigate }) {
  const goTo = (id) => {
    onClose();
    onNavigate(id);
  };

  return (
    <div className="drawer-layer">
      <button className="drawer-backdrop" onClick={onClose} aria-label="إغلاق" />

      <aside className="drawer">
        <div className="drawer-head">
          <button onClick={onClose} aria-label="إغلاق">
            <X size={24} />
          </button>

          <div>
            <h2>Sahnaya Medical Mall</h2>
            <p>مول صحنايا الطبي</p>
          </div>
        </div>

        <a
          href="#store"
          onClick={(event) => {
            event.preventDefault();
            goTo("store");
          }}
        >
          <Store size={25} />
          المتجر
          <ChevronLeft size={20} />
        </a>

        <a
          href="#offers"
          onClick={(event) => {
            event.preventDefault();
            goTo("offers");
          }}
        >
          <Percent size={25} />
          العروض
          <ChevronLeft size={20} />
        </a>

        <a
          href="#new"
          onClick={(event) => {
            event.preventDefault();
            goTo("store");
          }}
        >
          <Bell size={25} />
          جديدنا
          <ChevronLeft size={20} />
        </a>

        <a
          href="#account"
          onClick={(event) => {
            event.preventDefault();
            onClose();
          }}
        >
          <User size={25} />
          الحساب
          <ChevronLeft size={20} />
        </a>

        <a
          href="#contact"
          onClick={(event) => {
            event.preventDefault();
            goTo("contact");
          }}
        >
          <MessageCircle size={25} />
          تواصل معنا
          <ChevronLeft size={20} />
        </a>
      </aside>
    </div>
  );
}

export default DrawerMenu;