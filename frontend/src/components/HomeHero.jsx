import { Activity, MessageCircle } from "lucide-react";
import { storeInfo } from "../data/storeInfo";

function HomeHero() {
  const whatsappUrl = `https://wa.me/${storeInfo.whatsappRaw}`;

  return (
    <section className="hero-card" id="home-section">
      <div className="hero-content">
        <span className="eyebrow">مول صحنايا الطبي</span>

        <h1>{storeInfo.tagline}</h1>

        <p>
          أجهزة سكر وضغط، قثاطر، سرنغات، أجهزة تجميل، مشدات، نظارات،
          مواد سنية، وكافة المستلزمات الطبية.
        </p>

        <div className="hero-actions">
          <a href={whatsappUrl} target="_blank" rel="noreferrer">
            <MessageCircle size={18} />
            تواصل عبر واتساب
          </a>
        </div>
      </div>

      <div className="hero-icon">
        <img src={storeInfo.logo} alt={storeInfo.name} />
        <Activity size={42} />
      </div>
    </section>
  );
}

export default HomeHero;