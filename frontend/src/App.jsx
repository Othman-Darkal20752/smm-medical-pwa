import { useEffect, useMemo, useRef, useState } from "react";
import {
  ChevronLeft,
  CreditCard,
  MessageCircle,
  Minus,
  Plus,
  ShoppingCart,
  Trash2,
} from "lucide-react";

import "./App.css";

import { storeInfo } from "./data/storeInfo";
import { categories } from "./data/categories";
import { offers } from "./data/offers";
import { products as initialProducts } from "./data/products";

import { useAutoHorizontalScroll } from "./hooks/useAutoHorizontalScroll";

import AppHeader from "./components/AppHeader";
import HomeHero from "./components/HomeHero";
import CategoryStrip from "./components/CategoryStrip";
import OfferCard from "./components/OfferCard";
import ProductCard from "./components/ProductCard";
import BottomNav from "./components/BottomNav";
import DrawerMenu from "./components/DrawerMenu";
import EmptyState from "./components/EmptyState";
import InstallPrompt from "./components/InstallPrompt";

import AdminDashboard from "./pages/AdminDashboard";

const paymentMethods = [
  "نقداً عند الاستلام",
  "شام كاش",
  "اتفاق عبر واتساب",
];

function getProductPriceValue(product) {
  if (typeof product.priceValue === "number") return product.priceValue;
  if (typeof product.price === "number") return product.price;

  return null;
}

function getProductPriceLabel(product) {
  if (product.priceLabel) return product.priceLabel;
  if (typeof product.price === "string") return product.price;

  const priceValue = getProductPriceValue(product);

  if (priceValue !== null) {
    return `${priceValue.toLocaleString("en-US")} ل.س`;
  }

  return "السعر عند الطلب";
}

function formatPrice(value) {
  return `${value.toLocaleString("en-US")} ل.س`;
}
function isStandaloneMode() {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    window.navigator.standalone === true
  );
}

function isInstallSupportedDevice() {
  return (
    /android|iphone|ipad|ipod/i.test(window.navigator.userAgent) ||
    window.matchMedia("(max-width: 768px)").matches
  );
}

function App() {
  const [currentPath, setCurrentPath] = useState(() => window.location.pathname);

  const [productList, setProductList] = useState(initialProducts);
  const [activePage, setActivePage] = useState("home");
  const [activeCategory, setActiveCategory] = useState("الكل");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [favoriteIds, setFavoriteIds] = useState([]);
  const [cartItems, setCartItems] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState(paymentMethods[0]);
  const [installEvent, setInstallEvent] = useState(null);
  const [installHelpOpen, setInstallHelpOpen] = useState(false);
  const [isStandaloneApp, setIsStandaloneApp] = useState(() => isStandaloneMode());

  const offerRowRef = useRef(null);
  const productRowRef = useRef(null);
  const bestSellerRowRef = useRef(null);
  const searchInputRef = useRef(null);

  const whatsappUrl = `https://wa.me/${storeInfo.whatsappRaw}`;

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);
  useEffect(() => {
  const cleanupOldInstallStorage = () => {
    localStorage.removeItem("smm-install-dismissed");
    localStorage.removeItem("smm-install-dismissed-until");
    localStorage.removeItem("smm-install-completed");
    sessionStorage.removeItem("smm-install-dismissed-session");
  };

  cleanupOldInstallStorage();

  const handleBeforeInstallPrompt = (event) => {
    event.preventDefault();

    if (isStandaloneMode()) {
      return;
    }

    setInstallEvent(event);
  };

  const handleAppInstalled = () => {
    setInstallEvent(null);
    setInstallHelpOpen(false);
    setIsStandaloneApp(true);
  };

  const displayModeQuery = window.matchMedia("(display-mode: standalone)");

  const handleDisplayModeChange = () => {
    setIsStandaloneApp(isStandaloneMode());
  };

  window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
  window.addEventListener("appinstalled", handleAppInstalled);

  if (displayModeQuery.addEventListener) {
    displayModeQuery.addEventListener("change", handleDisplayModeChange);
  }

  return () => {
    window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.removeEventListener("appinstalled", handleAppInstalled);

    if (displayModeQuery.removeEventListener) {
      displayModeQuery.removeEventListener("change", handleDisplayModeChange);
    }
  };
}, []);

  const navigateToPath = (path) => {
    window.history.pushState(null, "", path);
    setCurrentPath(path);

    if (!path.startsWith("/admin")) {
      setActivePage("home");
    }

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
    const list = productList.filter((product) => product.is_new);
    return list.length ? list : productList;
  }, [productList]);

  const bestSellerProducts = useMemo(() => {
    const list = productList.filter((product) => product.is_best_seller);
    return list.length ? list : productList;
  }, [productList]);

  const offerProducts = useMemo(() => {
    const list = filteredProducts.filter((product) => product.is_offer);
    return list.length ? list : filteredProducts.filter((product) => product.tag === "عرض");
  }, [filteredProducts]);

  const autoScrollOffers = useMemo(() => {
    return [...offers, ...offers];
  }, []);

  const autoScrollProducts = useMemo(() => {
    return [...newProducts, ...newProducts];
  }, [newProducts]);

  const autoScrollBestSellers = useMemo(() => {
    return [...bestSellerProducts, ...bestSellerProducts];
  }, [bestSellerProducts]);

  useAutoHorizontalScroll(
    offerRowRef,
    activePage === "home" && autoScrollOffers.length > 3,
    "offers"
  );

  useAutoHorizontalScroll(
    productRowRef,
    activePage === "home" && autoScrollProducts.length > 3,
    `new-products-${autoScrollProducts.length}`
  );

  useAutoHorizontalScroll(
    bestSellerRowRef,
    activePage === "home" && autoScrollBestSellers.length > 3,
    "best-sellers"
  );

  const cartCount = useMemo(() => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  }, [cartItems]);

  const cartProducts = useMemo(() => {
    return cartItems
      .map((item) => {
        const product = productList.find((entry) => entry.id === item.productId);

        if (!product) return null;

        const priceValue = getProductPriceValue(product);

        return {
          ...item,
          product,
          priceValue,
          lineTotal: priceValue !== null ? priceValue * item.quantity : null,
        };
      })
      .filter(Boolean);
  }, [cartItems, productList]);

  const cartTotal = useMemo(() => {
    return cartProducts.reduce((total, item) => {
      return item.lineTotal !== null ? total + item.lineTotal : total;
    }, 0);
  }, [cartProducts]);

  const hasUnpricedItems = cartProducts.some((item) => item.priceValue === null);

  const cartWhatsappUrl = useMemo(() => {
    const orderLines = cartProducts
      .map((item, index) => {
        const priceLine =
          item.priceValue !== null
            ? `السعر: ${formatPrice(item.priceValue)}\nالمجموع: ${formatPrice(
                item.lineTotal
              )}`
            : "السعر: يتم تأكيده عبر واتساب";

        return `${index + 1}. ${item.product.name}\nالكمية: ${
          item.quantity
        }\n${priceLine}`;
      })
      .join("\n\n");

    const totalLine =
      cartTotal > 0
        ? `الإجمالي التقريبي: ${formatPrice(cartTotal)}`
        : "الإجمالي: يتم تأكيده عبر واتساب";

    const message = `مرحباً، أريد طلب المنتجات التالية من ${storeInfo.name}:

${orderLines}

${totalLine}
طريقة الدفع: ${paymentMethod}

الرجاء تأكيد التوفر والسعر النهائي.`;

    return `https://wa.me/${storeInfo.whatsappRaw}?text=${encodeURIComponent(
      message
    )}`;
  }, [cartProducts, cartTotal, paymentMethod]);


  const handleInstallApp = async () => {
  if (isStandaloneMode() || isStandaloneApp) {
    setInstallHelpOpen(false);
    return;
  }

  if (!installEvent) {
    setInstallHelpOpen(true);
    return;
  }

  try {
    installEvent.prompt();

    const result = await installEvent.userChoice;

    setInstallEvent(null);

    if (result.outcome === "accepted") {
      setIsStandaloneApp(true);
      setInstallHelpOpen(false);
      return;
    }

    setInstallHelpOpen(true);
  } catch {
    setInstallEvent(null);
    setInstallHelpOpen(true);
  }
};

  const handlePageChange = (page) => {
    setActivePage(page);
    setDrawerOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleNavClick = (id) => {
    const aliases = {
      store: "products",
      new: "home",
      best: "home",
    };

    handlePageChange(aliases[id] || id);
  };

  const handleSearchChange = (value) => {
    setSearchQuery(value);

    if (value.trim()) {
      setActivePage("products");
    }
  };

  const handleCategoryChange = (category) => {
    setActiveCategory(category);
    setActivePage("products");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleAddToCart = (product) => {
    setCartItems((items) => {
      const existingItem = items.find((item) => item.productId === product.id);

      if (existingItem) {
        return items.map((item) =>
          item.productId === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      return [...items, { productId: product.id, quantity: 1 }];
    });
  };

  const increaseQuantity = (productId) => {
    setCartItems((items) =>
      items.map((item) =>
        item.productId === productId
          ? { ...item, quantity: item.quantity + 1 }
          : item
      )
    );
  };

  const decreaseQuantity = (productId) => {
    setCartItems((items) =>
      items
        .map((item) =>
          item.productId === productId
            ? { ...item, quantity: item.quantity - 1 }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const removeFromCart = (productId) => {
    setCartItems((items) => items.filter((item) => item.productId !== productId));
  };

  const clearCart = () => {
    setCartItems([]);
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

  const getCartQuantity = (productId) => {
    return cartItems.find((item) => item.productId === productId)?.quantity || 0;
  };

  const renderProductCards = (products) => {
    if (products.length === 0) {
      return <EmptyState onReset={resetFilters} />;
    }

    return (
      <div className="page-product-grid">
        {products.map((product) => {
          const cartQuantity = getCartQuantity(product.id);

          return (
            <ProductCard
              product={product}
              key={product.id}
              isFavorite={favoriteIds.includes(product.id)}
              isInCart={cartQuantity > 0}
              cartQuantity={cartQuantity}
              onAddToCart={handleAddToCart}
              onToggleFavorite={toggleFavorite}
            />
          );
        })}
      </div>
    );
  };

  const renderHomePage = () => (
    <>
      <HomeHero />

      <CategoryStrip
        categories={categories}
        activeCategory={activeCategory}
        onChange={handleCategoryChange}
      />

      <section className="section-block">
        <div className="section-title">
          <h2>عروضنا</h2>
          <button type="button" onClick={() => handlePageChange("offers")}>
            عرض العروض
            <ChevronLeft size={19} />
          </button>
        </div>

        <div className="offer-row auto-scroll-row" ref={offerRowRef}>
          {autoScrollOffers.map((offer, index) => (
            <OfferCard offer={offer} key={`${offer.id}-${index}`} />
          ))}
        </div>
      </section>

      <section className="section-block">
        <div className="section-title">
          <h2>جديدنا</h2>
          <button type="button" onClick={() => handlePageChange("products")}>
            عرض المنتجات
            <ChevronLeft size={19} />
          </button>
        </div>

        <div className="product-row auto-scroll-row" ref={productRowRef}>
          {autoScrollProducts.map((product, index) => {
            const cartQuantity = getCartQuantity(product.id);

            return (
              <ProductCard
                product={product}
                key={`${product.id}-${index}`}
                isFavorite={favoriteIds.includes(product.id)}
                isInCart={cartQuantity > 0}
                cartQuantity={cartQuantity}
                onAddToCart={handleAddToCart}
                onToggleFavorite={toggleFavorite}
              />
            );
          })}
        </div>
      </section>

      <section className="section-block">
        <div className="section-title">
          <h2>الأكثر طلباً</h2>
          <button type="button" onClick={() => handlePageChange("products")}>
            عرض المنتجات
            <ChevronLeft size={19} />
          </button>
        </div>

        <div className="product-row auto-scroll-row" ref={bestSellerRowRef}>
          {autoScrollBestSellers.map((product, index) => {
            const cartQuantity = getCartQuantity(product.id);

            return (
              <ProductCard
                product={product}
                key={`best-${product.id}-${index}`}
                isFavorite={favoriteIds.includes(product.id)}
                isInCart={cartQuantity > 0}
                cartQuantity={cartQuantity}
                onAddToCart={handleAddToCart}
                onToggleFavorite={toggleFavorite}
              />
            );
          })}
        </div>
      </section>
    </>
  );

  const renderProductsPage = () => (
    <>
      <section className="page-head">
        <span>كتالوج المنتجات</span>
        <h1>المنتجات الطبية</h1>
        <p>اختر التصنيف المناسب وشاهد المنتجات المتوفرة في مول صحنايا الطبي.</p>
      </section>

      <CategoryStrip
        categories={categories}
        activeCategory={activeCategory}
        onChange={setActiveCategory}
      />

      <section className="section-block products-list-section">
        <div className="section-title">
          <h2>
            {activeCategory === "الكل" ? "كل المنتجات" : activeCategory}
          </h2>

          {(activeCategory !== "الكل" || searchQuery) && (
            <button type="button" onClick={resetFilters}>
              مسح الفلترة
              <ChevronLeft size={19} />
            </button>
          )}
        </div>

        {renderProductCards(filteredProducts)}
      </section>
    </>
  );

  const renderOffersPage = () => (
    <>
      <section className="page-head">
        <span>عروض مول صحنايا الطبي</span>
        <h1>العروض والخصومات</h1>
        <p>تابع العروض المتوفرة على المستلزمات والأجهزة الطبية.</p>
      </section>

      <section className="section-block">
        <div className="offer-row">
          {offers.map((offer) => (
            <OfferCard offer={offer} key={offer.id} />
          ))}
        </div>
      </section>

      <section className="section-block products-list-section">
        <div className="section-title">
          <h2>منتجات ضمن العروض</h2>
          <button type="button" onClick={() => handlePageChange("products")}>
            كل المنتجات
            <ChevronLeft size={19} />
          </button>
        </div>

        {renderProductCards(offerProducts)}
      </section>
    </>
  );

  const renderCartPage = () => (
    <>
      <section className="page-head">
        <span>طلب المنتجات</span>
        <h1>السلة</h1>
        <p>راجع المنتجات والكميات، ثم اختر طريقة الدفع وأرسل الطلب عبر واتساب.</p>
      </section>

      <section className="section-block">
        <div className="section-title">
          <h2>{cartCount} منتج في السلة</h2>

          {cartItems.length > 0 && (
            <button type="button" onClick={clearCart}>
              تفريغ السلة
              <ChevronLeft size={19} />
            </button>
          )}
        </div>

        {cartProducts.length === 0 ? (
          <div className="cart-empty-card">
            <ShoppingCart size={44} />
            <h3>السلة فارغة</h3>
            <p>أضف المنتجات المطلوبة من صفحة المنتجات أو العروض.</p>
            <button type="button" onClick={() => handlePageChange("products")}>
              تصفح المنتجات
            </button>
          </div>
        ) : (
          <div className="cart-list">
            {cartProducts.map((item) => (
              <article className="cart-item-card" key={item.productId}>
                <div className={`cart-item-visual ${item.product.tone}`}>
                  {item.product.image ? (
                    <img src={item.product.image} alt={item.product.name} />
                  ) : (
                    <ShoppingCart size={28} />
                  )}
                </div>

                <div className="cart-item-info">
                  <h3>{item.product.name}</h3>
                  <p>{item.product.category}</p>
                  <strong>{getProductPriceLabel(item.product)}</strong>
                </div>

                <div className="cart-item-controls">
                  <button
                    type="button"
                    onClick={() => increaseQuantity(item.productId)}
                    aria-label="زيادة الكمية"
                  >
                    <Plus size={18} />
                  </button>

                  <span>{item.quantity}</span>

                  <button
                    type="button"
                    onClick={() => decreaseQuantity(item.productId)}
                    aria-label="إنقاص الكمية"
                  >
                    <Minus size={18} />
                  </button>
                </div>

                <button
                  type="button"
                  className="cart-remove-button"
                  onClick={() => removeFromCart(item.productId)}
                  aria-label="حذف المنتج"
                >
                  <Trash2 size={19} />
                </button>
              </article>
            ))}
          </div>
        )}
      </section>

      {cartProducts.length > 0 && (
        <section className="section-block checkout-card">
          <div className="checkout-row">
            <span>الإجمالي التقريبي</span>
            <strong>{cartTotal > 0 ? formatPrice(cartTotal) : "حسب الطلب"}</strong>
          </div>

          {hasUnpricedItems && (
            <p className="checkout-note">
              يوجد منتجات بدون سعر ثابت، وسيتم تأكيد السعر النهائي عبر واتساب.
            </p>
          )}

          <div className="payment-box">
            <div className="payment-title">
              <CreditCard size={21} />
              <h3>طريقة الدفع</h3>
            </div>

            <div className="payment-options">
              {paymentMethods.map((method) => (
                <button
                  key={method}
                  type="button"
                  className={paymentMethod === method ? "active" : ""}
                  onClick={() => setPaymentMethod(method)}
                >
                  {method}
                </button>
              ))}
            </div>
          </div>

          <a
            className="whatsapp-order-button"
            href={cartWhatsappUrl}
            target="_blank"
            rel="noreferrer"
          >
            <MessageCircle size={19} />
            إرسال الطلب عبر واتساب
          </a>
        </section>
      )}
    </>
  );

  const renderContactPage = () => (
    <>
      <section className="page-head">
        <span>تواصل معنا</span>
        <h1>{storeInfo.name}</h1>
        <p>{storeInfo.description}</p>
      </section>

      <section className="section-block">
        <div className="contact-card contact-page-card">
          <MessageCircle size={42} />
          <div>
            <h3>واتساب مباشر</h3>
            <p>
              أرسل طلبك أو استفسارك مباشرة عبر واتساب.
              <span className="inline-phone" dir="ltr">
                {storeInfo.whatsapp}
              </span>
            </p>

            <a
              className="whatsapp-order-button contact-whatsapp-button"
              href={whatsappUrl}
              target="_blank"
              rel="noreferrer"
            >
              <MessageCircle size={18} />
              تواصل عبر واتساب
            </a>
          </div>
        </div>
      </section>

      <section className="section-block">
        <div className="contact-card">
          <div>
            <h3>العنوان</h3>
            <p>{storeInfo.location}</p>
          </div>
        </div>
      </section>
    </>
  );

  const renderPage = () => {
    if (activePage === "products") return renderProductsPage();
    if (activePage === "offers") return renderOffersPage();
    if (activePage === "cart") return renderCartPage();
    if (activePage === "contact") return renderContactPage();

    return renderHomePage();
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
        onSearchChange={handleSearchChange}
        onOpenDrawer={() => setDrawerOpen(true)}
        onCartClick={() => handlePageChange("cart")}
      />

      <main className="content app-page-content">{renderPage()}</main>

      <BottomNav activeNav={activePage} onNavigate={handleNavClick} />

      {drawerOpen && (
        <DrawerMenu
  onClose={() => setDrawerOpen(false)}
  onNavigate={handleNavClick}
  onInstallApp={handleInstallApp}
  showInstallAction={!isStandaloneApp && isInstallSupportedDevice()}
/>
      )}

      <InstallPrompt />
    </div>
  );
}

export default App;