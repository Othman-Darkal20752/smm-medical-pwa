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
        aria-label="تذكيري لاحقاً"
      >
        ×
      </button>

      <div className="install-prompt__icon">＋</div>

      <div className="install-prompt__content">
        <h3>ثبّت تطبيق SMM على جهازك</h3>

        {isIOS ? (
          <p>
            من Safari اضغط زر المشاركة ثم اختر
            <strong> إضافة إلى الشاشة الرئيسية </strong>
            لاستخدام الكتالوج كتطبيق.
          </p>
        ) : canInstall ? (
          <p>
            ثبّت الكتالوج على الشاشة الرئيسية لتفتحه بسرعة مثل التطبيق بدون
            الحاجة للبحث عن الموقع كل مرة.
          </p>
        ) : (
          <p>
            من قائمة Chrome <strong>⋮</strong> اختر
            <strong> تثبيت التطبيق </strong>
            أو <strong> إضافة إلى الشاشة الرئيسية </strong>.
          </p>
        )}
      </div>

      <button
        type="button"
        className="install-prompt__button"
        onClick={handlePrimaryAction}
      >
        {canInstall ? "تثبيت" : "حسناً"}
      </button>
    </div>
  );
}
