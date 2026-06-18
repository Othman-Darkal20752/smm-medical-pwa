import { useEffect, useMemo, useRef, useState } from "react";
import {
  Bell,
  ChevronLeft,
  Heart,
  Home,
  Menu,
  MessageCircle,
  Package,
  Percent,
  Search,
  ShoppingCart,
  Stethoscope,
  Store,
  User,
  X,
} from "lucide-react";
import "./App.css";

const categories = [
  "الكل",
  "أجهزة الضغط",
  "أجهزة السكر",
  "مستهلكات طبية",
  "مستلزمات مشافي",
  "تعقيم",
  "عناية",
];

const tabs = ["المنتجات الطبية", "المستلزمات", "العروض"];

const products = [
  {
    id: 1,
    name: "جهاز قياس ضغط رقمي",
    category: "أجهزة الضغط",
    price: "285,000 ل.س",
    tag: "الأكثر مبيعاً",
    tone: "blue",
    isNew: false,
    isOffer: false,
    isBestSeller: true,
  },
  {
    id: 2,
    name: "جهاز قياس سكر مع الشرائح",
    category: "أجهزة السكر",
    price: "190,000 ل.س",
    tag: "جديد",
    tone: "red",
    isNew: true,
    isOffer: false,
    isBestSeller: true,
  },
  {
    id: 3,
    name: "كمامات طبية 50 قطعة",
    category: "مستهلكات طبية",
    price: "42,000 ل.س",
    tag: "عرض",
    tone: "cyan",
    isNew: false,
    isOffer: true,
    isBestSeller: false,
  },
  {
    id: 4,
    name: "معقم أسطح طبي",
    category: "تعقيم",
    price: "65,000 ل.س",
    tag: "متوفر",
    tone: "navy",
    isNew: false,
    isOffer: false,
    isBestSeller: true,
  },
  {
    id: 5,
    name: "قفازات طبية لاتكس",
    category: "مستهلكات طبية",
    price: "55,000 ل.س",
    tag: "جديد",
    tone: "blue",
    isNew: true,
    isOffer: false,
    isBestSeller: false,
  },
  {
    id: 6,
    name: "جهاز مساج علاجي",
    category: "عناية",
    price: "410,000 ل.س",
    tag: "متوفر",
    tone: "red",
    isNew: false,
    isOffer: false,
    isBestSeller: true,
  },
];

const offers = [
  {
    id: 1,
    name: "عرض خاص على أجهزة قياس الضغط",
    price: "خصم 15%",
    desc: "لفترة محدودة على أجهزة الضغط الرقمية.",
  },
  {
    id: 2,
    name: "باقة مستهلكات طبية للعيادات",
    price: "وفر أكثر",
    desc: "كمامات، قفازات، ومعقمات ضمن باقة واحدة.",
  },
  {
    id: 3,
    name: "تجهيزات مشافي مختارة",
    price: "حسب الطلب",
    desc: "منتجات مختارة للمراكز والعيادات الطبية.",
  },
  {
    id: 4,
    name: "عروض التعقيم والعناية",
    price: "وفر 10%",
    desc: "مختارات من المعقمات ومستلزمات العناية الطبية.",
  },
];

const navItems = [
  { id: "home", label: "الرئيسية", icon: Home },
  { id: "store", label: "المتجر", icon: Store },
  { id: "offers", label: "العروض", icon: Percent },
  { id: "cart", label: "السلة", icon: ShoppingCart },
  { id: "contact", label: "تواصل", icon: MessageCircle },
];

function useAutoHorizontalScroll(ref, enabled = true, resetKey = "") {
  useEffect(() => {
    const el = ref.current;
    if (!el || !enabled) return;

    let frameId;
    let paused = false;
    let position = 0;

    // السرعة الهادئة المناسبة
    const speed = 0.24;

    el.scrollLeft = 0;

    const step = () => {
      if (!paused && el.scrollWidth > el.clientWidth) {
        const loopPoint = el.scrollWidth / 2;

        position += speed;

        if (position >= loopPoint - 2) {
          position = 0;
          el.scrollLeft = 0;
        } else {
          el.scrollLeft = position;
        }
      }

      frameId = requestAnimationFrame(step);
    };

    const pause = () => {
      paused = true;
      position = el.scrollLeft;
    };

    const resume = () => {
      window.setTimeout(() => {
        position = el.scrollLeft;
        paused = false;
      }, 700);
    };

    el.addEventListener("touchstart", pause, { passive: true });
    el.addEventListener("touchend", resume);
    el.addEventListener("pointerdown", pause);
    el.addEventListener("pointerup", resume);

    frameId = requestAnimationFrame(step);

    return () => {
      cancelAnimationFrame(frameId);
      el.removeEventListener("touchstart", pause);
      el.removeEventListener("touchend", resume);
      el.removeEventListener("pointerdown", pause);
      el.removeEventListener("pointerup", resume);
    };
  }, [ref, enabled, resetKey]);
}

function App() {
  const [activeTab, setActiveTab] = useState(tabs[0]);
  const [activeCategory, setActiveCategory] = useState("الكل");
  const [activeNav, setActiveNav] = useState("store");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [favoriteIds, setFavoriteIds] = useState([]);

  const offerRowRef = useRef(null);
  const productRowRef = useRef(null);
  const bestSellerRowRef = useRef(null);
  const searchInputRef = useRef(null);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesCategory =
        activeCategory === "الكل" || product.category === activeCategory;

      const query = searchQuery.trim().toLowerCase();

      const matchesSearch =
        !query ||
        product.name.toLowerCase().includes(query) ||
        product.category.toLowerCase().includes(query) ||
        product.tag.toLowerCase().includes(query);

      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, searchQuery]);

  const newProducts = useMemo(() => {
    const list = filteredProducts.filter((product) => product.isNew);
    return list.length ? list : filteredProducts;
  }, [filteredProducts]);

  const bestSellerProducts = useMemo(() => {
    const list = products.filter((product) => product.isBestSeller);
    return list.length ? list : products;
  }, []);

  const autoScrollOffers = useMemo(() => {
    return [...offers, ...offers];
  }, []);

  const autoScrollProducts = useMemo(() => {
    if (newProducts.length === 0) return [];
    return [...newProducts, ...newProducts];
  }, [newProducts]);

  const autoScrollBestSellers = useMemo(() => {
    return [...bestSellerProducts, ...bestSellerProducts];
  }, [bestSellerProducts]);

  useAutoHorizontalScroll(offerRowRef, autoScrollOffers.length > 3, "offers");
  useAutoHorizontalScroll(
    productRowRef,
    autoScrollProducts.length > 3,
    `${activeCategory}-${searchQuery}-${autoScrollProducts.length}`
  );
  useAutoHorizontalScroll(bestSellerRowRef, autoScrollBestSellers.length > 3, "best-sellers");

  const scrollToSection = (id) => {
    const target = document.getElementById(id);
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleNavClick = (id) => {
    setActiveNav(id);

    if (id === "home") scrollToSection("home-section");
    if (id === "store") scrollToSection("store-section");
    if (id === "offers") scrollToSection("offers-section");
    if (id === "cart") scrollToSection("cart-section");
    if (id === "contact") scrollToSection("contact-section");
  };

  const handleAddToCart = () => {
    setCartCount((count) => count + 1);
  };

  const toggleFavorite = (productId) => {
    setFavoriteIds((ids) =>
      ids.includes(productId)
        ? ids.filter((id) => id !== productId)
        : [...ids, productId]
    );
  };

  const resetFilters = () => {
    setActiveCategory("الكل");
    setSearchQuery("");
  };

  return (
    <div className="app" dir="rtl">
      <header className="top-bar">
        <div className="top-actions">
          <button
            className="icon-button"
            aria-label="القائمة"
            onClick={() => setDrawerOpen(true)}
          >
            <Menu size={30} />
          </button>

          <div className="brand-mark">
            <span>SMM</span>
            <small>مول صحنايا الطبي</small>
          </div>

          <div className="header-icons">
            <button
              className="icon-button"
              aria-label="بحث"
              onClick={() => searchInputRef.current?.focus()}
            >
              <Search size={29} />
            </button>

            <button
              className="icon-button cart-icon"
              aria-label="السلة"
              onClick={() => handleNavClick("cart")}
            >
              <ShoppingCart size={29} />
              <b>{cartCount}</b>
            </button>
          </div>
        </div>

        <div className="search-box">
          <Search size={20} />
          <input
            ref={searchInputRef}
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="ابحث عن منتج طبي..."
          />
        </div>
      </header>

      <main className="content">
        <section className="tabs">
          {tabs.map((tab) => (
            <button
              key={tab}
              className={activeTab === tab ? "active" : ""}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </section>

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

        <section className="category-strip">
          {categories.map((category) => (
            <button
              key={category}
              className={activeCategory === category ? "active" : ""}
              onClick={() => setActiveCategory(category)}
            >
              {category}
            </button>
          ))}
        </section>

        <section className="section-block" id="offers-section">
          <div className="section-title">
            <h2>عروضنا</h2>
            <button onClick={() => setActiveTab("العروض")}>
              مشاهدة الكل
              <ChevronLeft size={19} />
            </button>
          </div>

          <div className="offer-row auto-scroll-row" ref={offerRowRef}>
            {autoScrollOffers.map((offer, index) => (
              <article className="offer-card" key={`${offer.id}-${index}`}>
                <div className="offer-visual">
                  <Percent size={42} />
                </div>

                <div>
                  <h3>{offer.name}</h3>
                  <p>{offer.desc}</p>
                  <strong>{offer.price}</strong>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="section-block" id="store-section">
          <div className="section-title">
            <h2>جديدنا</h2>
            <button onClick={resetFilters}>
              مشاهدة الكل
              <ChevronLeft size={19} />
            </button>
          </div>

          {autoScrollProducts.length > 0 ? (
            <div className="product-row auto-scroll-row" ref={productRowRef}>
              {autoScrollProducts.map((product, index) => (
                <article className="product-card" key={`${product.id}-${index}`}>
                  <span className={`badge ${product.tone}`}>{product.tag}</span>

                  <div className={`product-visual ${product.tone}`}>
                    <Package size={54} />
                  </div>

                  <h3>{product.name}</h3>
                  <p>{product.category}</p>
                  <strong>{product.price}</strong>

                  <div className="product-actions">
                    <button aria-label="إضافة للسلة" onClick={handleAddToCart}>
                      <ShoppingCart size={24} />
                    </button>

                    <button
                      aria-label="المفضلة"
                      className={favoriteIds.includes(product.id) ? "is-favorite" : ""}
                      onClick={() => toggleFavorite(product.id)}
                    >
                      <Heart size={24} />
                    </button>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <h3>لا توجد منتجات مطابقة</h3>
              <p>جرّب البحث باسم آخر أو اختر تصنيفاً مختلفاً.</p>
              <button onClick={resetFilters}>إظهار كل المنتجات</button>
            </div>
          )}
        </section>

        <section className="section-block" id="best-section">
          <div className="section-title">
            <h2>الأكثر مبيعاً</h2>
            <button onClick={resetFilters}>
              مشاهدة الكل
              <ChevronLeft size={19} />
            </button>
          </div>

          <div className="product-row auto-scroll-row" ref={bestSellerRowRef}>
            {autoScrollBestSellers.map((product, index) => (
              <article className="product-card" key={`best-${product.id}-${index}`}>
                <span className={`badge ${product.tone}`}>{product.tag}</span>

                <div className={`product-visual ${product.tone}`}>
                  <Package size={54} />
                </div>

                <h3>{product.name}</h3>
                <p>{product.category}</p>
                <strong>{product.price}</strong>

                <div className="product-actions">
                  <button aria-label="إضافة للسلة" onClick={handleAddToCart}>
                    <ShoppingCart size={24} />
                  </button>

                  <button
                    aria-label="المفضلة"
                    className={favoriteIds.includes(product.id) ? "is-favorite" : ""}
                    onClick={() => toggleFavorite(product.id)}
                  >
                    <Heart size={24} />
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="section-block" id="cart-section">
          <div className="section-title">
            <h2>السلة</h2>
            <button onClick={() => setCartCount(0)}>
              تفريغ السلة
              <ChevronLeft size={19} />
            </button>
          </div>

          <div className="contact-card">
            <ShoppingCart size={38} />
            <div>
              <h3>{cartCount} منتج في السلة</h3>
              <p>هذه نسخة تجريبية، لاحقاً سيتم عرض المنتجات المختارة بالتفصيل.</p>
            </div>
          </div>
        </section>

        <section className="section-block" id="contact-section">
          <div className="section-title">
            <h2>تواصل معنا</h2>
            <button>
              واتساب
              <ChevronLeft size={19} />
            </button>
          </div>

          <div className="contact-card">
            <MessageCircle size={38} />
            <div>
              <h3>مول صحنايا الطبي</h3>
              <p>أرسل طلبك أو استفسارك مباشرة عبر واتساب.</p>
            </div>
          </div>
        </section>
      </main>

      <nav className="bottom-nav">
        {navItems.map((item) => {
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              className={activeNav === item.id ? "active" : ""}
              onClick={() => handleNavClick(item.id)}
            >
              <Icon size={25} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {drawerOpen && (
        <div className="drawer-layer">
          <button
            className="drawer-backdrop"
            onClick={() => setDrawerOpen(false)}
            aria-label="إغلاق"
          />

          <aside className="drawer">
            <div className="drawer-head">
              <button onClick={() => setDrawerOpen(false)} aria-label="إغلاق">
                <X size={24} />
              </button>

              <div>
                <h2>Sahnaya Medical Mall</h2>
                <p>مول صحنايا الطبي</p>
              </div>
            </div>

            <a
              href="#store"
              onClick={(event) => {
                event.preventDefault();
                setDrawerOpen(false);
                handleNavClick("store");
              }}
            >
              <Store size={25} />
              المتجر
              <ChevronLeft size={20} />
            </a>

            <a
              href="#offers"
              onClick={(event) => {
                event.preventDefault();
                setDrawerOpen(false);
                handleNavClick("offers");
              }}
            >
              <Percent size={25} />
              العروض
              <ChevronLeft size={20} />
            </a>

            <a
              href="#new"
              onClick={(event) => {
                event.preventDefault();
                setDrawerOpen(false);
                handleNavClick("store");
              }}
            >
              <Bell size={25} />
              جديدنا
              <ChevronLeft size={20} />
            </a>

            <a
              href="#account"
              onClick={(event) => {
                event.preventDefault();
                setDrawerOpen(false);
              }}
            >
              <User size={25} />
              الحساب
              <ChevronLeft size={20} />
            </a>

            <a
              href="#contact"
              onClick={(event) => {
                event.preventDefault();
                setDrawerOpen(false);
                handleNavClick("contact");
              }}
            >
              <MessageCircle size={25} />
              تواصل معنا
              <ChevronLeft size={20} />
            </a>
          </aside>
        </div>
      )}
    </div>
  );
}

export default App;