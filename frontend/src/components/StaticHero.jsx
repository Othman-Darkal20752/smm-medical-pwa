import { useEffect, useState } from "react";
import { fetchSiteSettings } from "../services/api";

const FALLBACK_STATIC_HERO = {
  desktopImage: "/hero/hero-1-desktop.webp?v=9",
  mobileImage: "/hero/hero-1-mobile.webp?v=9",
};

function extractStaticHero(payload) {
  const store = payload?.store || payload || {};

  const desktopImage =
    store.static_hero_desktop_url ||
    store.static_hero_desktop ||
    store.staticHeroDesktop ||
    store.static_hero_mobile_url ||
    store.static_hero_mobile ||
    "";

  const mobileImage =
    store.static_hero_mobile_url ||
    store.static_hero_mobile ||
    store.staticHeroMobile ||
    desktopImage;

  if (!desktopImage && !mobileImage) {
    return FALLBACK_STATIC_HERO;
  }

  return {
    desktopImage: desktopImage || mobileImage,
    mobileImage: mobileImage || desktopImage,
  };
}

function StaticHero() {
  const [hero, setHero] = useState(FALLBACK_STATIC_HERO);

  useEffect(() => {
    const controller = new AbortController();

    async function loadStaticHero() {
      try {
        const data = await fetchSiteSettings({ signal: controller.signal });
        const nextHero = extractStaticHero(data);

        if (!controller.signal.aborted) {
          setHero(nextHero);
        }
      } catch (error) {
        if (error.name !== "AbortError") {
          console.warn("Static hero settings unavailable, using local fallback image.", error);
        }
      }
    }

    loadStaticHero();

    return () => controller.abort();
  }, []);

  if (!hero?.desktopImage && !hero?.mobileImage) {
    return null;
  }

  return (
    <section className="static-hero-banner" aria-label="?????? ???????? ???????">
      <div
        className="static-hero-image"
        aria-hidden="true"
        style={{
          "--static-hero-desktop": `url("${hero.desktopImage}")`,
          "--static-hero-mobile": `url("${hero.mobileImage}")`,
        }}
      />
    </section>
  );
}

export default StaticHero;
