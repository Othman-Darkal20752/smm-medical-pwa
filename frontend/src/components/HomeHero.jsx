import { useEffect, useState } from "react";
import { ChevronLeft, MessageCircle, PackageSearch } from "lucide-react";
import { storeInfo } from "../data/storeInfo";

const fallbackSlides = [
  {
    eyebrow: "نظارات طبية وشمسية",
    title: "نظارات طبية وشمسية بتصاميم موثوقة",
    text: "اختيارات أنيقة وعملية للنظارات الطبية والشمسية ضمن مول صحنايا الطبي.",
    desktopImage: "/hero/hero-1-desktop.webp",
    mobileImage: "/hero/hero-1-mobile.webp",
  },
  {
    eyebrow: "SAHNAYA MEDICAL MALL",
    title: "كل ما يلزم الطبيب والمريض تجده هنا",
    text: "أجهزة طبية، مستلزمات، مواد سنية، دعامات، نظارات ومنتجات عناية تحت سقف واحد.",
    desktopImage: "/hero/hero-2-desktop.webp",
    mobileImage: "/hero/hero-2-mobile.webp",
  },
  {
    eyebrow: "منتجات موثوقة ومرخصة",
    title: "تجربة تصفح طبية حديثة وسريعة",
    text: "تصفح التصنيفات والعروض، وأرسل طلبك مباشرة عبر واتساب لتأكيد التوفر والسعر النهائي.",
    desktopImage: "/hero/hero-3-desktop.webp",
    mobileImage: "/hero/hero-3-mobile.webp",
  },
];

function normalizeHeroSlide(item) {
  return {
    eyebrow: item.eyebrow || "",
    title: item.title || "",
    text: item.text || "",
    desktopImage: item.desktop_image || item.mobile_image || "/hero/hero-1-desktop.webp",
    mobileImage: item.mobile_image || item.desktop_image || "/hero/hero-1-mobile.webp",
  };
}

function HomeHero({ onBrowseProducts }) {
  const whatsappUrl = `https://wa.me/${storeInfo.whatsappRaw}`;
  const [slides, setSlides] = useState(fallbackSlides);
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    let ignore = false;

    async function loadHeroSlides() {
      try {
        const response = await fetch("/api/hero-slides/", {
          headers: { Accept: "application/json" },
        });

        if (!response.ok) {
          throw new Error("Failed to load hero slides");
        }

        const data = await response.json();

        if (!ignore && Array.isArray(data) && data.length > 0) {
          setSlides(data.map(normalizeHeroSlide));
          setActiveSlide(0);
        }
      } catch (error) {
        console.warn("Using fallback hero slides:", error);
      }
    }

    loadHeroSlides();

    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    if (slides.length <= 1) return undefined;

    const timer = window.setInterval(() => {
      setActiveSlide((index) => (index + 1) % slides.length);
    }, 5200);

    return () => window.clearInterval(timer);
  }, [slides.length]);

  const slide = slides[activeSlide] || fallbackSlides[0];

  return (
    <section className="hero-carousel hero-image-carousel" id="home-section">
      <div
        className="hero-slide-bg"
        aria-hidden="true"
        style={{
          "--hero-desktop-image": `url("${slide.desktopImage}")`,
          "--hero-mobile-image": `url("${slide.mobileImage}")`,
        }}
      />

      <div className="hero-carousel-content hero-image-content">
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

      {slides.length > 1 && (
        <div className="hero-dots" aria-label="شرائح العرض">
          {slides.map((item, index) => (
            <button
              key={`${item.desktopImage}-${index}`}
              type="button"
              className={index === activeSlide ? "active" : ""}
              onClick={() => setActiveSlide(index)}
              aria-label={`الشريحة ${index + 1}`}
            />
          ))}
        </div>
      )}
    </section>
  );
}

export default HomeHero;
