import { useEffect, useState } from "react";
import "../styles/install-prompt.css";

const SESSION_DISMISS_KEY = "smm-install-dismissed-session";

function isStandaloneMode() {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    window.navigator.standalone === true
  );
}

function isIOSDevice() {
  return /iphone|ipad|ipod/i.test(window.navigator.userAgent);
}

function isMobileBrowser() {
  return (
    /android|iphone|ipad|ipod/i.test(window.navigator.userAgent) ||
    window.matchMedia("(max-width: 768px)").matches
  );
}

function isAdminPath() {
  return window.location.pathname.startsWith("/admin");
}

function isDismissedForCurrentSession() {
  return sessionStorage.getItem(SESSION_DISMISS_KEY) === "true";
}

export default function InstallPrompt() {
  const [installEvent, setInstallEvent] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isInstalled, setIsInstalled] = useState(() => isStandaloneMode());
  const [isIOS] = useState(() => isIOSDevice());
  const [isMobile] = useState(() => isMobileBrowser());

  useEffect(() => {
    if (isInstalled || isAdminPath() || !isMobile || isDismissedForCurrentSession()) {
      return;
    }

    const handleBeforeInstallPrompt = (event) => {
      event.preventDefault();
      setInstallEvent(event);
      setIsVisible(true);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsVisible(false);
      setInstallEvent(null);
      sessionStorage.removeItem(SESSION_DISMISS_KEY);
      localStorage.removeItem("smm-install-dismissed");
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    const fallbackTimer = window.setTimeout(() => {
      if (!isStandaloneMode() && !isDismissedForCurrentSession()) {
        setIsVisible(true);
      }
    }, 1600);

    return () => {
      window.clearTimeout(fallbackTimer);
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, [isInstalled, isMobile]);

  const handleInstall = async () => {
    if (!installEvent) return;

    installEvent.prompt();

    const result = await installEvent.userChoice;

    if (result.outcome === "accepted") {
      setIsVisible(false);
      setInstallEvent(null);
    }
  };

  const handleDismiss = () => {
    sessionStorage.setItem(SESSION_DISMISS_KEY, "true");
    localStorage.removeItem("smm-install-dismissed");
    setIsVisible(false);
  };

  if (isInstalled || !isVisible) {
    return null;
  }

  return (
    <div className="install-prompt" dir="rtl">
      <button
        type="button"
        className="install-prompt__close"
        onClick={handleDismiss}
        aria-label="إغلاق رسالة تثبيت التطبيق"
      >
        ×
      </button>

      <div className="install-prompt__icon">＋</div>

      <div className="install-prompt__content">
        <h3>ثبّت تطبيق SMM</h3>

        {installEvent ? (
          <p>
            أضف مول صحنايا الطبي إلى الشاشة الرئيسية لتصفّح المنتجات الطبية بسرعة.
          </p>
        ) : isIOS ? (
          <p>
            افتح زر المشاركة في Safari ثم اختر
            <strong> إضافة إلى الشاشة الرئيسية </strong>
            لاستخدام الكتالوج كتطبيق.
          </p>
        ) : (
          <p>
            من قائمة المتصفح <strong>⋮</strong> اختر
            <strong> تثبيت التطبيق </strong>
            أو <strong>إضافة إلى الشاشة الرئيسية</strong>.
          </p>
        )}
      </div>

      {installEvent && (
        <button
          type="button"
          className="install-prompt__button"
          onClick={handleInstall}
        >
          تثبيت
        </button>
      )}
    </div>
  );
}