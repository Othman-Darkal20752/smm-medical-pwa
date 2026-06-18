import { useEffect, useState } from "react";
import "../styles/install-prompt.css";

function isStandaloneMode() {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    window.navigator.standalone === true
  );
}

function isIOSDevice() {
  return /iphone|ipad|ipod/i.test(window.navigator.userAgent);
}

function isAdminPath() {
  return window.location.pathname.startsWith("/admin");
}

function isInstallDismissed() {
  return localStorage.getItem("smm-install-dismissed") === "true";
}

export default function InstallPrompt() {
  const [installEvent, setInstallEvent] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isInstalled, setIsInstalled] = useState(() => isStandaloneMode());
  const [isIOS] = useState(() => isIOSDevice());

  useEffect(() => {
    if (isInstalled || isAdminPath() || isInstallDismissed()) {
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
      localStorage.removeItem("smm-install-dismissed");
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    let iosTimer = null;

    if (isIOS) {
      iosTimer = window.setTimeout(() => {
        setIsVisible(true);
      }, 1500);
    }

    return () => {
      if (iosTimer) {
        window.clearTimeout(iosTimer);
      }

      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, [isInstalled, isIOS]);

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
    localStorage.setItem("smm-install-dismissed", "true");
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

        {isIOS && !installEvent ? (
          <p>
            افتح زر المشاركة في المتصفح ثم اختر
            <strong> إضافة إلى الشاشة الرئيسية </strong>
            لاستخدام الكتالوج كتطبيق.
          </p>
        ) : (
          <p>
            أضف مول صحنايا الطبي إلى الشاشة الرئيسية لتصفّح المنتجات الطبية بسرعة.
          </p>
        )}
      </div>

      {!isIOS && installEvent && (
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