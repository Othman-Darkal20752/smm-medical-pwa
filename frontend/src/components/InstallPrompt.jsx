import { useEffect, useState } from "react";
import "../styles/install-prompt.css";

const DISMISS_UNTIL_KEY = "smm-install-dismissed-until";

const DISMISS_DAYS = 7;
const ONE_DAY_MS = 24 * 60 * 60 * 1000;

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

function isDismissedByCooldown() {
  const dismissedUntil = Number(localStorage.getItem(DISMISS_UNTIL_KEY) || 0);
  return dismissedUntil > Date.now();
}

function markDismissed() {
  const dismissedUntil = Date.now() + DISMISS_DAYS * ONE_DAY_MS;
  localStorage.setItem(DISMISS_UNTIL_KEY, String(dismissedUntil));
}

function cleanupOldInstallStorage() {
  localStorage.removeItem("smm-install-dismissed");
  localStorage.removeItem("smm-install-completed");
  sessionStorage.removeItem("smm-install-dismissed-session");
}

export default function InstallPrompt() {
  const [installEvent, setInstallEvent] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isInstalled, setIsInstalled] = useState(() => isStandaloneMode());

  const [isIOS] = useState(() => isIOSDevice());
  const [isMobile] = useState(() => isMobileBrowser());

  useEffect(() => {
    cleanupOldInstallStorage();

    if (isInstalled || isAdminPath() || !isMobile || isDismissedByCooldown()) {
      return;
    }

    const handleBeforeInstallPrompt = (event) => {
      event.preventDefault();

      if (isStandaloneMode() || isDismissedByCooldown()) {
        return;
      }

      setInstallEvent(event);
      setIsVisible(true);
    };

    const handleAppInstalled = () => {
      cleanupOldInstallStorage();
      setIsInstalled(true);
      setIsVisible(false);
      setInstallEvent(null);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    let iosTimer = null;

    if (isIOS) {
      iosTimer = window.setTimeout(() => {
        if (!isStandaloneMode() && !isDismissedByCooldown()) {
          setIsVisible(true);
        }
      }, 1600);
    }

    return () => {
      if (iosTimer) {
        window.clearTimeout(iosTimer);
      }

      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, [isInstalled, isIOS, isMobile]);

  const handleInstall = async () => {
    if (!installEvent) return;

    installEvent.prompt();

    const result = await installEvent.userChoice;

    if (result.outcome === "accepted") {
      cleanupOldInstallStorage();
      setIsInstalled(true);
      setIsVisible(false);
      setInstallEvent(null);
      return;
    }

    markDismissed();
    setIsVisible(false);
  };

  const handleDismiss = () => {
    markDismissed();
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
            افتح زر المشاركة في Safari ثم اختر
            <strong> إضافة إلى الشاشة الرئيسية </strong>
            لاستخدام الكتالوج كتطبيق.
          </p>
        ) : (
          <p>
            أضف مول صحنايا الطبي إلى الشاشة الرئيسية لتصفّح المنتجات الطبية بسرعة.
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