import { useEffect, useState } from "react";
import { fetchSiteSettings } from "../services/api";

const DEFAULT_PROMO = {
  title: "\u0634\u062d\u0646 \u0644\u0643\u0627\u0641\u0629 \u0627\u0644\u0645\u062d\u0627\u0641\u0638\u0627\u062a \u0627\u0644\u0633\u0648\u0631\u064a\u0629",
  subtitle: "\u062a\u0648\u0635\u064a\u0644 \u0633\u0631\u064a\u0639 \u0648\u0622\u0645\u0646 \u062d\u062a\u0649 \u0628\u0627\u0628 \u0645\u0646\u0632\u0644\u0643",
};

function extractPromo(payload) {
  const store = payload?.store || payload || {};

  return {
    title: store.shipping_note || DEFAULT_PROMO.title,
    subtitle:
      store.address ||
      store.location ||
      DEFAULT_PROMO.subtitle,
  };
}

function StaticHero() {
  const [promo, setPromo] = useState(DEFAULT_PROMO);

  useEffect(() => {
    const controller = new AbortController();

    async function loadPromo() {
      try {
        const data = await fetchSiteSettings({ signal: controller.signal });
        const nextPromo = extractPromo(data);

        if (!controller.signal.aborted) {
          setPromo(nextPromo);
        }
      } catch (error) {
        if (error.name !== "AbortError") {
          console.warn("Static promo settings unavailable, using default promo.", error);
        }
      }
    }

    loadPromo();

    return () => controller.abort();
  }, []);

  return (
    <section className="static-hero-banner static-promo-strip" aria-label="\u0628\u0627\u0646\u0631 \u062b\u0627\u0628\u062a">
      <div className="static-promo-visual" aria-hidden="true">
        <span className="static-promo-box">SMM</span>
        <span className="static-promo-pin">?</span>
      </div>

      <div className="static-promo-copy">
        <strong>{promo.title}</strong>
        <span>{promo.subtitle}</span>
      </div>

      <span className="static-promo-divider" aria-hidden="true" />

      <div className="static-promo-icon" aria-hidden="true">
        <svg viewBox="0 0 48 48" role="img">
          <path d="M7 14h22v19H7z" />
          <path d="M29 20h7l5 6v7H29z" />
          <circle cx="16" cy="35" r="4" />
          <circle cx="35" cy="35" r="4" />
          <path d="M12 20h11M12 25h9" />
        </svg>
      </div>
    </section>
  );
}

export default StaticHero;
