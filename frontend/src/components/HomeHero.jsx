import { useEffect, useState } from "react";
import { storeInfo } from "../data/storeInfo";

function normalizeHeroSlide(item) {
  const desktopImage = item.desktop_image || item.desktopImage || item.mobile_image || "";
  const mobileImage = item.mobile_image || item.mobileImage || item.desktop_image || desktopImage;

  if (!desktopImage && !mobileImage) {
    return null;
  }

  return {
    eyebrow: item.eyebrow || "",
    title: item.title || "",
    text: item.text || "",
    desktopImage,
    mobileImage,
  };
}

function HomeHero() {
  const [slides, setSlides] = useState([]);
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    let ignore = false;

    async function loadHeroSlides() {
      try {
        const response = await fetch("/api/hero-slides/", {
          headers: { Accept: "application/json" },
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("Failed to load hero slides");
        }

        const data = await response.json();

        if (!ignore && Array.isArray(data)) {
          const normalizedSlides = data
            .map(normalizeHeroSlide)
            .filter(Boolean);

          setSlides(normalizedSlides);
          setActiveSlide(0);
        }
      } catch (error) {
        console.warn("Hero slides unavailable:", error);
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

  const slide = slides[activeSlide];

  if (!slides.length || !slide) {
    return null;
  }

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

        {slide.eyebrow && <span className="hero-eyebrow">{slide.eyebrow}</span>}
        {slide.title && <h1>{slide.title}</h1>}
        {slide.text && <p>{slide.text}</p>}
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