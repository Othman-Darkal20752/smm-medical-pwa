import {
  Bell,
  ChevronLeft,
  Download,
  HeartPulse,
  Home,
  MessageCircle,
  Percent,
  Store,
  X,
} from "lucide-react";
import { storeInfo } from "../data/storeInfo";

function DrawerMenu({ onClose, onNavigate, onInstallApp, showInstallAction }) {
  const goTo = (id) => {
    onClose();
    onNavigate(id);
  };

  const handleInstallClick = (event) => {
    event.preventDefault();
    onClose();

    if (onInstallApp) {
      onInstallApp();
    }
  };

  const whatsappUrl = `https://wa.me/${storeInfo.whatsappRaw}`;

  return (
    <div className="drawer-layer">
      <button
        className="drawer-backdrop"
        type="button"
        onClick={onClose}
        aria-label="إغلاق"
      />

      <aside className="drawer">
        <div className="drawer-head">
          <button type="button" onClick={onClose} aria-label="إغلاق">
            <X size={24} />
          </button>

          <img
            src={storeInfo.logo}
            alt={storeInfo.name}
            className="drawer-logo"
          />

          <div>
            <h2>{storeInfo.englishName}</h2>
            <p>{storeInfo.name}</p>
          </div>
        </div>

        <a
          href="#home"
          onClick={(event) => {
            event.preventDefault();
            goTo("home");
          }}
        >
          <Home size={25} />
          الرئيسية
          <ChevronLeft size={20} />
        </a>

        <a
          href="#store"
          onClick={(event) => {
            event.preventDefault();
            goTo("store");
          }}
        >
          <Store size={25} />
          المنتجات
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
          href="#best"
          onClick={(event) => {
            event.preventDefault();
            goTo("store");
          }}
        >
          <HeartPulse size={25} />
          الأكثر طلباً
          <ChevronLeft size={20} />
        </a>

        {showInstallAction && (
          <a href="#install-app" onClick={handleInstallClick}>
            <Download size={25} />
            تثبيت التطبيق
            <ChevronLeft size={20} />
          </a>
        )}

        <a href={whatsappUrl} target="_blank" rel="noreferrer">
          <MessageCircle size={25} />
          <span className="drawer-phone" dir="ltr">
            {storeInfo.whatsapp}
          </span>
          <ChevronLeft size={20} />
        </a>
      </aside>
    </div>
  );
}

export default DrawerMenu;