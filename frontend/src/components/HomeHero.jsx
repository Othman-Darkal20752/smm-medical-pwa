import { Stethoscope } from "lucide-react";

function HomeHero() {
  return (
    <section className="hero-card" id="home-section">
      <div>
        <span className="eyebrow">كتالوج طبي ذكي</span>
        <h1>كل مستلزماتك الطبية في مكان واحد</h1>
        <p>تصفح الأجهزة والمستهلكات والعروض، وأرسل طلبك مباشرة عبر واتساب.</p>
      </div>

      <div className="hero-icon">
        <Stethoscope size={58} />
      </div>
    </section>
  );
}

export default HomeHero;