import "../styles/install-prompt.css";

function isIOSDevice() {
  return /iphone|ipad|ipod/i.test(window.navigator.userAgent);
}

export default function InstallPrompt({ isOpen, onClose }) {
  const isIOS = isIOSDevice();

  if (!isOpen) {
    return null;
  }

  return (
    <div className="install-prompt" dir="rtl">
      <button
        type="button"
        className="install-prompt__close"
        onClick={onClose}
        aria-label="إغلاق تعليمات تثبيت التطبيق"
      >
        ×
      </button>

      <div className="install-prompt__icon">＋</div>

      <div className="install-prompt__content">
        <h3>تثبيت تطبيق SMM</h3>

        {isIOS ? (
          <p>
            من Safari اضغط زر المشاركة ثم اختر
            <strong> إضافة إلى الشاشة الرئيسية </strong>
            لتثبيت الكتالوج كتطبيق.
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
        onClick={onClose}
      >
        حسناً
      </button>
    </div>
  );
}