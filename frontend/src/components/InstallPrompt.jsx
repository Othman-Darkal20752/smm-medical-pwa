import "../styles/install-prompt.css";

function isIOSDevice() {
  return /iphone|ipad|ipod/i.test(window.navigator.userAgent);
}

export default function InstallPrompt({
  isOpen,
  canInstall = false,
  onInstall,
  onClose,
}) {
  const isIOS = isIOSDevice();

  if (!isOpen) {
    return null;
  }

  const handlePrimaryAction = () => {
    if (canInstall && typeof onInstall === "function") {
      onInstall();
      return;
    }

    onClose();
  };

  return (
    <div className="install-prompt" dir="rtl" role="dialog" aria-live="polite">
      <button
        type="button"
        className="install-prompt__close"
        onClick={onClose}
        aria-label="إغلاق تذكير التثبيت"
      >
        ×
      </button>

      <div className="install-prompt__icon" aria-hidden="true">
        SMM
      </div>

      <div className="install-prompt__content">
        <h3>ثبّت تطبيق مول صحنايا الطبي</h3>

        {isIOS ? (
          <p>
            من Safari اضغط زر المشاركة ثم اختر
            <strong> إضافة إلى الشاشة الرئيسية </strong>
            لاستخدام الموقع كتطبيق.
          </p>
        ) : canInstall ? (
          <p>
            ثبّت التطبيق لتصفح أسرع والوصول للمنتجات مباشرة من شاشة جوالك.
          </p>
        ) : (
          <p>
            من قائمة Chrome <strong>⋮</strong> اختر
            <strong> تثبيت التطبيق </strong>
            أو <strong> إضافة إلى الشاشة الرئيسية </strong>.
          </p>
        )}
      </div>

      {canInstall && (
        <button
          type="button"
          className="install-prompt__button"
          onClick={handlePrimaryAction}
        >
          تثبيت
        </button>
      )}
    </div>
  );
}
