import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, MessageCircle, ShoppingCart } from "lucide-react";

import "./App.css";

import { categories, tabs } from "./data/categories";
import { offers } from "./data/offers";
import { products as initialProducts } from "./data/products";

import { useAutoHorizontalScroll } from "./hooks/useAutoHorizontalScroll";

import AppHeader from "./components/AppHeader";
import AppTabs from "./components/AppTabs";
import HomeHero from "./components/HomeHero";
import CategoryStrip from "./components/CategoryStrip";
import OfferCard from "./components/OfferCard";
import ProductCard from "./components/ProductCard";
import BottomNav from "./components/BottomNav";
import DrawerMenu from "./components/DrawerMenu";
import EmptyState from "./components/EmptyState";
import AdminDashboard from "./pages/AdminDashboard";

function App() {
  const [currentPath, setCurrentPath] = useState(() => window.location.pathname);

  const [productList, setProductList] = useState(initialProducts);
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

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  const navigateToPath = (path) => {
    window.history.pushState(null, "", path);
    setCurrentPath(path);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const categoryOptions = useMemo(() => {
    return categories.filter((category) => category !== "الكل");
  }, []);

  const filteredProducts = useMemo(() => {
    return productList.filter((product) => {
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
  }, [activeCategory, searchQuery, productList]);

  const newProducts = useMemo(() => {
    const list = filteredProducts.filter((product) => product.is_new);
    return list.length ? list : filteredProducts;
  }, [filteredProducts]);

  const bestSellerProducts = useMemo(() => {
    const list = productList.filter((product) => product.is_best_seller);
    return list.length ? list : productList;
  }, [productList]);

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

  useAutoHorizontalScroll(
    bestSellerRowRef,
    autoScrollBestSellers.length > 3,
    "best-sellers"
  );

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

  if (currentPath.startsWith("/admin")) {
    return (
      <AdminDashboard
        products={productList}
        setProducts={setProductList}
        categoryOptions={categoryOptions}
        onBackToApp={() => navigateToPath("/")}
      />
    );
  }

  return (
    <div className="app" dir="rtl">
      <AppHeader
        cartCount={cartCount}
        searchQuery={searchQuery}
        searchInputRef={searchInputRef}
        onSearchChange={setSearchQuery}
        onOpenDrawer={() => setDrawerOpen(true)}
        onCartClick={() => handleNavClick("cart")}
      />

      <main className="content">
        <AppTabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

        <HomeHero />

        <CategoryStrip
          categories={categories}
          activeCategory={activeCategory}
          onChange={setActiveCategory}
        />

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
              <OfferCard offer={offer} key={`${offer.id}-${index}`} />
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
                <ProductCard
                  product={product}
                  key={`${product.id}-${index}`}
                  isFavorite={favoriteIds.includes(product.id)}
                  onAddToCart={handleAddToCart}
                  onToggleFavorite={toggleFavorite}
                />
              ))}
            </div>
          ) : (
            <EmptyState onReset={resetFilters} />
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
              <ProductCard
                product={product}
                key={`best-${product.id}-${index}`}
                isFavorite={favoriteIds.includes(product.id)}
                onAddToCart={handleAddToCart}
                onToggleFavorite={toggleFavorite}
              />
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

      <BottomNav activeNav={activeNav} onNavigate={handleNavClick} />

     {drawerOpen && (
  <DrawerMenu
    onClose={() => setDrawerOpen(false)}
    onNavigate={handleNavClick}
  />
)}  
    </div>
  );
}

export default App;