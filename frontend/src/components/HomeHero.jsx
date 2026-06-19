import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, MessageCircle, PackageSearch, ShieldCheck } from "lucide-react";
import { storeInfo } from "../data/storeInfo";

function HomeHero({ onBrowseProducts }) {
  const whatsappUrl = `https://wa.me/${storeInfo.whatsappRaw}`;
  const slides = useMemo(
    () => [
      {
        eyebrow: "SAHNAYA MEDICAL MALL",
        title: storeInfo.tagline,
        text:
          "أجهزة طبية، مستلزمات، مواد سنية، دعامات، نظارات ومنتجات عناية — تحت سقف واحد موثوق.",
        background:
          "radial-gradient(circle at 12% 25%, rgba(255,255,255,0.12), transparent 26%), radial-gradient(circle at 82% 78%, rgba(217,36,58,0.22), transparent 28%), linear-gradient(135deg, #06192f, #123b70)",
      },
      {
        eyebrow: "منتجات موثوقة ومرخصة",
        title: "حلول طبية للعيادات والمرضى",
        text:
          "تصفح التصنيفات والعروض، وأرسل طلبك مباشرة عبر واتساب لتأكيد التوفر والسعر النهائي.",
        background:
          "radial-gradient(circle at 18% 72%, rgba(29,143,227,0.26), transparent 30%), radial-gradient(circle at 82% 22%, rgba(255,255,255,0.12), transparent 26%), linear-gradient(135deg, #071a33, #0f4c81)",
      },
      {
        eyebrow: "جاهز كتالوج وتطبيق PWA",
        title: "تجربة تصفح سريعة ومريحة",
        text:
          "تصميم مناسب للموبايل كتطبيق قابل للتثبيت، وعلى الديسكتوب كموقع طبي احترافي.",
        background:
          "radial-gradient(circle at 20% 20%, rgba(217,36,58,0.24), transparent 26%), radial-gradient(circle at 76% 72%, rgba(234,247,255,0.18), transparent 30%), linear-gradient(135deg, #0b2140, #071a33)",
      },
    ],
    []
  );

  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveSlide((index) => (index + 1) % slides.length);
    }, 5200);

    return () => window.clearInterval(timer);
  }, [slides.length]);

  const slide = slides[activeSlide];

  return (
    <section className="hero-carousel" id="home-section">
      <div className="hero-slide-bg" style={{ background: slide.background }} />

      <div className="hero-carousel-content">
        <div className="hero-brand-panel">
          <img src={storeInfo.logo} alt={storeInfo.name} />
          <div>
            <strong>{storeInfo.shortName}</strong>
            <span>{storeInfo.englishName}</span>
          </div>
        </div>

        <span className="hero-eyebrow">{slide.eyebrow}</span>
        <h1>{slide.title}</h1>
        <p>{slide.text}</p>

        <div className="hero-actions">
          <button type="button" onClick={onBrowseProducts}>
            <PackageSearch size={19} />
            تصفح المنتجات
            <ChevronLeft size={18} />
          </button>

          <a href={whatsappUrl} target="_blank" rel="noreferrer">
            <MessageCircle size={18} />
            اطلب الآن
          </a>
        </div>

        <div className="hero-metrics">
          <article>
            <strong>+20</strong>
            <span>منتج طبي</span>
          </article>
          <article>
            <strong>11</strong>
            <span>تصنيف</span>
          </article>
          <article>
            <strong>100%</strong>
            <span>منتجات موثوقة</span>
          </article>
        </div>
      </div>

      <div className="hero-logo-watermark" aria-hidden="true">
        <img src={storeInfo.logo} alt="" />
        <ShieldCheck size={42} />
      </div>

      <div className="hero-dots" aria-label="شرائح العرض">
        {slides.map((item, index) => (
          <button
            key={item.eyebrow}
            type="button"
            className={index === activeSlide ? "active" : ""}
            onClick={() => setActiveSlide(index)}
            aria-label={`الشريحة ${index + 1}`}
          />
        ))}
      </div>
    </section>
  );
}

export default HomeHero;
