import { useEffect, useState } from "react";
import { storeInfo } from "../data/storeInfo";
import { fetchHeroSlides } from "../services/api";

const FALLBACK_HERO_SLIDES = [
  {
    eyebrow: "\u0645\u0648\u0644 \u0635\u062d\u0646\u0627\u064a\u0627 \u0627\u0644\u0637\u0628\u064a\u000a",
    title: "\u0643\u0644 \u0645\u0627 \u064a\u0644\u0632\u0645 \u0627\u0644\u0637\u0628\u064a\u0628 \u0648\u0627\u0644\u0645\u0631\u064a\u0636 \u062a\u062c\u062f\u0647 \u0647\u0646\u0627",
    text: "\u0623\u062c\u0647\u0632\u0629 \u0637\u0628\u064a\u0629\u060c \u0645\u0633\u062a\u0647\u0644\u0643\u0627\u062a\u060c \u0645\u0633\u062a\u0644\u0632\u0645\u0627\u062a \u0648\u0639\u0631\u0648\u0636 \u0645\u062a\u062c\u062f\u062f\u0629.",
    desktopImage: "/hero/hero-1-desktop.webp?v=7",
    mobileImage: "/hero/hero-1-mobile.webp?v=7",
  },
  {
    eyebrow: "\u062a\u062c\u0647\u064a\u0632\u0627\u062a \u0637\u0628\u064a\u0629 \u0645\u0648\u062b\u0648\u0642\u0629",
    title: "\u0645\u0646\u062a\u062c\u0627\u062a \u0645\u062e\u062a\u0627\u0631\u0629 \u0644\u0644\u0639\u064a\u0627\u062f\u0627\u062a \u0648\u0627\u0644\u0645\u0646\u0627\u0632\u0644",
    text: "\u062a\u0635\u0641\u062d \u0627\u0644\u062a\u0635\u0646\u064a\u0641\u0627\u062a \u0648\u0627\u0644\u0639\u0631\u0648\u0636 \u0628\u0633\u0647\u0648\u0644\u0629 \u0645\u0646 \u0627\u0644\u062c\u0648\u0627\u0644.",
    desktopImage: "/hero/hero-2-desktop.webp?v=7",
    mobileImage: "/hero/hero-2-mobile.webp?v=7",
  },
  {
    eyebrow: "\u0639\u0631\u0648\u0636 \u0648\u0645\u0646\u062a\u062c\u0627\u062a \u0645\u062a\u062c\u062f\u062f\u0629",
    title: "\u062a\u062c\u0631\u0628\u0629 \u062a\u0633\u0648\u0642 \u0637\u0628\u064a\u0629 \u0623\u0633\u0631\u0639 \u0648\u0623\u0648\u0636\u062d",
    text: "\u0635\u0645\u0645\u0646\u0627 \u0627\u0644\u0648\u0627\u062c\u0647\u0629 \u0644\u062a\u0643\u0648\u0646 \u062e\u0641\u064a\u0641\u0629\u060c \u0648\u0627\u0636\u062d\u0629\u060c \u0648\u0645\u0646\u0627\u0633\u0628\u0629 \u0644\u0644\u0640 PWA.",
    desktopImage: "/hero/hero-3-desktop.webp?v=7",
    mobileImage: "/hero/hero-3-mobile.webp?v=7",
  },
];

function normalizeHeroSlide(item) {
  if (!item || item.is_active === false || item.active === false) {
    return null;
  }

  const desktopImage =
    item.desktop_image_url ||
    item.desktop_image ||
    item.desktopImage ||
    item.image ||
    item.mobile_image_url ||
    item.mobile_image ||
    item.mobileImage ||
    "";

  const mobileImage =
    item.mobile_image_url ||
    item.mobile_image ||
    item.mobileImage ||
    desktopImage;

  if (!desktopImage && !mobileImage) {
    return null;
  }

  return {
    eyebrow: item.eyebrow || "",
    title: item.title || "",
    text: item.text || item.description || "",
    desktopImage,
    mobileImage,
  };
}

function extractHeroSlides(payload) {
  const list = Array.isArray(payload?.results)
    ? payload.results
    : Array.isArray(payload)
      ? payload
      : [];

  return list.map(normalizeHeroSlide).filter(Boolean);
}

function HomeHero() {
  const [slides, setSlides] = useState([]);
  const [isHeroReady, setIsHeroReady] = useState(false);
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    async function loadHeroSlides() {
      try {
        const data = await fetchHeroSlides({ signal: controller.signal });
        const apiSlides = extractHeroSlides(data);

        if (apiSlides.length > 0) {
          setSlides(apiSlides);
        } else {
          setSlides(FALLBACK_HERO_SLIDES);
        }

        setActiveSlide(0);
      } catch (error) {
        if (error.name !== "AbortError") {
          console.warn("Hero slides API unavailable, using local fallback images.", error);
          setSlides(FALLBACK_HERO_SLIDES);
          setActiveSlide(0);
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsHeroReady(true);
        }
      }
    }

    loadHeroSlides();

    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (slides.length <= 1) return undefined;

    const timer = window.setInterval(() => {
      setActiveSlide((index) => (index + 1) % slides.length);
    }, 5200);

    return () => window.clearInterval(timer);
  }, [slides.length]);

  const slide = slides[activeSlide] || slides[0];

  if (!isHeroReady || !slide) {
    return null;
  }

  return (
    <section className="hero-carousel hero-image-carousel" id="home-section" aria-label="\u0627\u0644\u0639\u0631\u0648\u0636 \u0627\u0644\u0631\u0626\u064a\u0633\u064a\u0629">
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

        {slide.eyebrow && <span className="hero-eyebrow">{slide.eyebrow}</span>}
        {slide.title && <h1>{slide.title}</h1>}
        {slide.text && <p>{slide.text}</p>}
      </div>

      {slides.length > 1 && (
        <div className="hero-dots" aria-label="\u0634\u0631\u0627\u0626\u062d \u0627\u0644\u0647\u064a\u0631\u0648">
          {slides.map((item, index) => (
            <button
              key={`${item.desktopImage}-${index}`}
              type="button"
              className={index === activeSlide ? "active" : ""}
              onClick={() => setActiveSlide(index)}
              aria-label={`\u0627\u0644\u0634\u0631\u064a\u062d\u0629 ${index + 1}`}
            />
          ))}
        </div>
      )}
    </section>
  );
}

export default HomeHero;
