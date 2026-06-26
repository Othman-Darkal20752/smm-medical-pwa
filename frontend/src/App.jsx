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

import {
  fetchCategories,
  fetchProduct,
  fetchProducts,
  fetchSiteSettings,
} from "./services/api";

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
import ProductDetailsPage from "./pages/ProductDetailsPage";


const CART_STORAGE_KEY = "smm_medical_cart";
const SHAM_CASH_QR_SRC = "/payments/sham-cash-qr.png";
const DEFAULT_EXCHANGE_RATE = 13000;
const STORE_MAP_URL = "https://maps.app.goo.gl/ven1Hxt3oZudRRtD7?g_st=aw";
const STORE_FACEBOOK_URL =
  "https://www.facebook.com/share/1Hv7jgUZFW/";
const STORE_LOCATION_TEXT = "صحنايا، سوريا - C6FF+2MG";
const STORE_SHIPPING_TEXT = "شحن لكافة المحافظات السورية";
const STORE_FOOTER_DESCRIPTION =
  "مول صحنايا الطبي يوفر مستلزمات طبية متنوعة للطبيب والمريض، تشمل أجهزة السكر والضغط، القثاطر، السرنجات، أجهزة التجميل، المشدات، النظارات، المواد السنية، وكافة التجهيزات الطبية.";


const paymentMethods = [
  {
    id: "cash",
    label: "نقداً عند الاستلام",
    description: "الدفع عند استلام الطلب بعد تأكيد التوفر والسعر النهائي.",
  },
  {
    id: "sham_cash",
    label: "شام كاش",
    description: "امسح رمز QR، ثم أرسل صورة الإشعار مع الطلب عبر واتساب.",
    qr: SHAM_CASH_QR_SRC,
  },
  {
    id: "whatsapp",
    label: "اتفاق عبر واتساب",
    description: "اتفق مع المتجر على طريقة الدفع المناسبة قبل تأكيد الطلب.",
  },
];

const DEFAULT_PAYMENT_METHOD = paymentMethods[0].id;
const HOME_PRODUCTS_PRELOAD_SIZE = 24;
const PRODUCTS_PAGE_SEARCH_DELAY = 350;


function getProductIdFromPath(pathname) {
  const match = pathname.match(/^\/products\/([^/]+)\/?$/);

  if (!match) return null;

  try {
    return decodeURIComponent(match[1]);
  } catch {
    return match[1];
  }
}

const getProductsPageSize = () => {
  return window.matchMedia("(min-width: 900px)").matches ? 20 : 8;
};

function getProductPriceValue(product) {
  if (typeof product.priceValue === "number") return product.priceValue;
  if (typeof product.priceSyp === "number") return product.priceSyp;
  if (typeof product.price === "number") return product.price;

  return null;
}

function getProductUsdValue(product, exchangeRate = DEFAULT_EXCHANGE_RATE) {
  if (typeof product.priceUsd === "number") return product.priceUsd;

  const priceValue = getProductPriceValue(product);

  if (priceValue !== null) {
    const safeRate = exchangeRate > 0 ? exchangeRate : DEFAULT_EXCHANGE_RATE;
    return priceValue / safeRate;
  }

  return null;
}

function getProductPriceLabel(product, exchangeRate = DEFAULT_EXCHANGE_RATE) {
  const priceValue = getProductPriceValue(product);
  const usdValue = getProductUsdValue(product, exchangeRate);

  if (usdValue !== null && priceValue !== null) {
    return `${usdValue.toLocaleString("en-US", {
      minimumFractionDigits: usdValue < 10 ? 2 : 0,
      maximumFractionDigits: 2,
    })} · ${priceValue.toLocaleString("en-US")} ل.س`;
  }

  if (usdValue !== null) {
    return `${usdValue.toLocaleString("en-US", {
      minimumFractionDigits: usdValue < 10 ? 2 : 0,
      maximumFractionDigits: 2,
    })}`;
  }

  if (product.priceLabel) return product.priceLabel;
  if (typeof product.price === "string") return product.price;

  return "السعر عند الطلب";
}

function formatPrice(value) {
  return `${value.toLocaleString("en-US")} ل.س`;
}

function formatUsd(value) {
  return `$${value.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function readStoredCartItems() {
  try {
    const storedCart = JSON.parse(localStorage.getItem(CART_STORAGE_KEY) || "[]");

    if (!Array.isArray(storedCart)) {
      return [];
    }

    return storedCart
      .map((item) => ({
        productId: item.productId,
        quantity: Number(item.quantity) || 0,
      }))
      .filter((item) => item.productId && item.quantity > 0);
  } catch {
    return [];
  }
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

function upsertProductById(products, product) {
  if (!product?.id) return products;

  const productId = String(product.id);
  const existingIndex = products.findIndex(
    (entry) => String(entry.id) === productId
  );

  if (existingIndex === -1) {
    return [product, ...products];
  }

  return products.map((entry, index) =>
    index === existingIndex ? { ...entry, ...product } : entry
  );
}

function upsertProductsById(products, nextProducts) {
  return nextProducts.reduce(upsertProductById, products);
}


function App() {
  const [currentPath, setCurrentPath] = useState(() => window.location.pathname);

  const [categoryList, setCategoryList] = useState(categories);
  const [productList, setProductList] = useState(initialProducts);
  const [activePage, setActivePage] = useState(() =>
    getProductIdFromPath(window.location.pathname) ? "products" : "home"
  );
  const [activeCategory, setActiveCategory] = useState("الكل");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [favoriteIds, setFavoriteIds] = useState([]);
  const [cartItems, setCartItems] = useState(() => readStoredCartItems());
  const [paymentMethod, setPaymentMethod] = useState(DEFAULT_PAYMENT_METHOD);
  const [exchangeRate, setExchangeRate] = useState(() => {
    const storedRate = Number(localStorage.getItem("smm_exchange_rate"));
    return Number.isFinite(storedRate) && storedRate > 0
      ? storedRate
      : DEFAULT_EXCHANGE_RATE;
  });
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("smm_theme") || "light";
  });
  const [catalogProducts, setCatalogProducts] = useState(() =>
    initialProducts.slice(0, getProductsPageSize())
  );
  const [catalogCount, setCatalogCount] = useState(initialProducts.length);
  const [catalogPage, setCatalogPage] = useState(1);
  const [catalogNext, setCatalogNext] = useState(null);
  const [catalogLoading, setCatalogLoading] = useState(false);
  const [catalogLoadingMore, setCatalogLoadingMore] = useState(false);
  const [catalogError, setCatalogError] = useState("");
  const [productDetailsById, setProductDetailsById] = useState({});
  const [productDetailsStatus, setProductDetailsStatus] = useState({});

  const [installEvent, setInstallEvent] = useState(null);
  const [installHelpOpen, setInstallHelpOpen] = useState(false);
  const [isStandaloneApp, setIsStandaloneApp] = useState(() =>
    isStandaloneMode()
  );

  const offerRowRef = useRef(null);
  const productRowRef = useRef(null);
  const bestSellerRowRef = useRef(null);
  const searchInputRef = useRef(null);
  const productsLoadMoreRef = useRef(null);
  const productsRequestIdRef = useRef(0);
  const productListRef = useRef(productList);

  const whatsappUrl = `https://wa.me/${storeInfo.whatsappRaw}`;

  useEffect(() => {
    let cancelled = false;

    async function loadBackendCatalog() {
      try {
        const [settingsData, backendCategories, backendProducts] =
          await Promise.all([
            fetchSiteSettings(),
            fetchCategories(),
            fetchProducts({ page_size: HOME_PRODUCTS_PRELOAD_SIZE }),
          ]);

        if (cancelled) return;

        if (Array.isArray(backendCategories) && backendCategories.length > 0) {
          setCategoryList(backendCategories);
        }

        if (
          backendProducts &&
          Array.isArray(backendProducts.products) &&
          backendProducts.products.length > 0
        ) {
          setProductList(backendProducts.products);
        }

        const backendExchangeRate = Number(settingsData?.store?.exchange_rate);

        if (
          Number.isFinite(backendExchangeRate) &&
          backendExchangeRate > 0
        ) {
          setExchangeRate(backendExchangeRate);
        }
      } catch (error) {
        console.warn("Using local fallback catalog data:", error);
      }
    }

    loadBackendCatalog();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const handlePopState = (event) => {
      setCurrentPath(window.location.pathname);
      setActivePage(
        getProductIdFromPath(window.location.pathname)
          ? "products"
          : event.state?.activePage || "home"
      );
      window.scrollTo({ top: 0, behavior: "auto" });
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
    } else if (displayModeQuery.addListener) {
      displayModeQuery.addListener(handleDisplayModeChange);
    }

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );
      window.removeEventListener("appinstalled", handleAppInstalled);

      if (displayModeQuery.removeEventListener) {
        displayModeQuery.removeEventListener("change", handleDisplayModeChange);
      } else if (displayModeQuery.removeListener) {
        displayModeQuery.removeListener(handleDisplayModeChange);
      }
    };
  }, []);

  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
  }, [cartItems]);

  useEffect(() => {
    localStorage.setItem("smm_exchange_rate", String(exchangeRate));
  }, [exchangeRate]);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("smm_theme", theme);
  }, [theme]);

  useEffect(() => {
    productListRef.current = productList;
  }, [productList]);

  const navigateToPath = (path, nextPage = "home") => {
    window.history.replaceState(
      { activePage },
      "",
      window.location.pathname
    );
    window.history.pushState({ activePage: nextPage }, "", path);
    setCurrentPath(path);
    setActivePage(nextPage);

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const categoryOptions = useMemo(() => {
    return categoryList.filter((category) => category !== "الكل");
  }, [categoryList]);

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

  const isProductsCatalogPage =
    activePage === "products" && getProductIdFromPath(currentPath) === null;
  const hasMoreCatalogProducts =
    Boolean(catalogNext) || catalogProducts.length < catalogCount;

  useEffect(() => {
    if (!isProductsCatalogPage) return;

    let cancelled = false;
    const requestId = productsRequestIdRef.current + 1;
    productsRequestIdRef.current = requestId;
    const search = searchQuery.trim();
    const delay = search ? PRODUCTS_PAGE_SEARCH_DELAY : 0;

    const timeoutId = window.setTimeout(async () => {
      setCatalogLoading(true);
      setCatalogLoadingMore(false);
      setCatalogError("");

      try {
        const response = await fetchProducts({
          page: 1,
          page_size: getProductsPageSize(),
          search,
          category: activeCategory,
        });

        if (cancelled || productsRequestIdRef.current !== requestId) return;

        setCatalogProducts(response.products);
        setCatalogCount(response.count);
        setCatalogPage(1);
        setCatalogNext(response.next);

        if (response.products.length > 0) {
          setProductList((products) =>
            upsertProductsById(products, response.products)
          );
        }
      } catch (error) {
        if (cancelled || productsRequestIdRef.current !== requestId) return;

        console.warn("Using local fallback products page data:", error);

        const fallbackProducts = productListRef.current.filter((product) => {
          const matchesCategory =
            activeCategory === "الكل" || product.category === activeCategory;
          const query = search.toLowerCase();
          const matchesSearch =
            !query ||
            product.name.toLowerCase().includes(query) ||
            product.category.toLowerCase().includes(query) ||
            product.tag.toLowerCase().includes(query);

          return matchesCategory && matchesSearch;
        });

        setCatalogProducts(fallbackProducts.slice(0, getProductsPageSize()));
        setCatalogCount(fallbackProducts.length);
        setCatalogPage(1);
        setCatalogNext(null);
        setCatalogError(
          "تعذر الاتصال بقاعدة البيانات حالياً، لذلك تم عرض نسخة محلية مؤقتة."
        );
      } finally {
        if (!cancelled && productsRequestIdRef.current === requestId) {
          setCatalogLoading(false);
        }
      }
    }, delay);

    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
    };
  }, [activeCategory, isProductsCatalogPage, searchQuery]);

  useEffect(() => {
    if (
      !isProductsCatalogPage ||
      !hasMoreCatalogProducts ||
      catalogLoading ||
      catalogLoadingMore ||
      !("IntersectionObserver" in window)
    ) {
      return undefined;
    }

    const target = productsLoadMoreRef.current;

    if (!target) return undefined;

    let cancelled = false;
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting || cancelled) return;

        const nextPage = catalogPage + 1;

        async function loadNextPage() {
          setCatalogLoadingMore(true);

          try {
            const response = await fetchProducts({
              page: nextPage,
              page_size: getProductsPageSize(),
              search: searchQuery.trim(),
              category: activeCategory,
            });

            if (cancelled) return;

            setCatalogProducts((products) => {
              const existingIds = new Set(
                products.map((product) => String(product.id))
              );
              const nextProducts = response.products.filter(
                (product) => !existingIds.has(String(product.id))
              );

              return [...products, ...nextProducts];
            });
            setCatalogCount(response.count);
            setCatalogPage(nextPage);
            setCatalogNext(response.next);

            if (response.products.length > 0) {
              setProductList((products) =>
                upsertProductsById(products, response.products)
              );
            }
          } catch (error) {
            if (!cancelled) {
              console.warn("Failed to load next products page:", error);
              setCatalogNext(null);
              setCatalogError(
                "تعذر تحميل المزيد من قاعدة البيانات. جرّب تحديث الصفحة لاحقاً."
              );
            }
          } finally {
            if (!cancelled) {
              setCatalogLoadingMore(false);
            }
          }
        }

        observer.unobserve(target);
        loadNextPage();
      },
      { rootMargin: "520px 0px" }
    );

    observer.observe(target);

    return () => {
      cancelled = true;
      observer.disconnect();
    };
  }, [
    activeCategory,
    catalogLoading,
    catalogLoadingMore,
    catalogPage,
    hasMoreCatalogProducts,
    isProductsCatalogPage,
    searchQuery,
  ]);

  useEffect(() => {
    const productId = getProductIdFromPath(currentPath);

    if (productId === null) return;

    const productKey = String(productId);
    const existingProduct =
      productList.find((entry) => String(entry.id) === productKey) ||
      productDetailsById[productKey];

    if (existingProduct) return;

    let cancelled = false;

    setProductDetailsStatus((statuses) => ({
      ...statuses,
      [productKey]: "loading",
    }));

    async function loadProductDetails() {
      try {
        const product = await fetchProduct(productKey);

        if (cancelled) return;

        setProductDetailsById((products) => ({
          ...products,
          [productKey]: product,
        }));
        setProductList((products) => upsertProductById(products, product));
        setProductDetailsStatus((statuses) => ({
          ...statuses,
          [productKey]: "ready",
        }));
      } catch (error) {
        if (!cancelled) {
          console.warn("Failed to load product details:", error);
          setProductDetailsStatus((statuses) => ({
            ...statuses,
            [productKey]: "error",
          }));
        }
      }
    }

    loadProductDetails();

    return () => {
      cancelled = true;
    };
  }, [currentPath, productDetailsById, productList]);

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
    return newProducts;
  }, [newProducts]);

  const autoScrollBestSellers = useMemo(() => {
    return bestSellerProducts;
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
        const product = productList.find((entry) => String(entry.id) === String(item.productId));

        if (!product) return null;

        const priceValue = getProductPriceValue(product);
        const usdValue = getProductUsdValue(product, exchangeRate);

        return {
          ...item,
          product,
          priceValue,
          usdValue,
          lineTotal: priceValue !== null ? priceValue * item.quantity : null,
          lineTotalUsd: usdValue !== null ? usdValue * item.quantity : null,
        };
      })
      .filter(Boolean);
  }, [cartItems, productList, exchangeRate]);

  const cartTotal = useMemo(() => {
    return cartProducts.reduce((total, item) => {
      return item.lineTotal !== null ? total + item.lineTotal : total;
    }, 0);
  }, [cartProducts]);

  const cartTotalUsd = useMemo(() => {
    return cartProducts.reduce((total, item) => {
      return item.lineTotalUsd !== null ? total + item.lineTotalUsd : total;
    }, 0);
  }, [cartProducts]);

  const hasUnpricedItems = cartProducts.some((item) => item.priceValue === null);

  const selectedPaymentMethod =
    paymentMethods.find((method) => method.id === paymentMethod) ||
    paymentMethods[0];

  const isShamCashSelected = selectedPaymentMethod.id === "sham_cash";

  const cartWhatsappUrl = useMemo(() => {
    const orderLines = cartProducts
      .map((item, index) => {
        const priceLine =
          item.usdValue !== null
            ? `السعر: ${formatUsd(item.usdValue)}\nالمجموع: ${formatUsd(
                item.lineTotalUsd
              )}`
            : "السعر: يتم تأكيده عبر واتساب";

        return `${index + 1}. ${item.product.name}\nالكمية: ${
          item.quantity
        }\n${priceLine}`;
      })
      .join("\n\n");

    const totalLine =
      cartTotalUsd > 0
        ? `الإجمالي التقريبي: ${formatUsd(cartTotalUsd)}`
        : "الإجمالي: يتم تأكيده عبر واتساب";

    const message = `مرحباً، أريد طلب المنتجات التالية من ${storeInfo.name}:

${orderLines}

${totalLine}
طريقة الدفع: ${selectedPaymentMethod.label}
${STORE_SHIPPING_TEXT}${
      selectedPaymentMethod.id === "sham_cash"
        ? "\nملاحظة: تم اختيار الدفع عبر شام كاش، وسيتم إرسال إشعار التحويل بعد تأكيد الطلب."
        : ""
    }

الرجاء تأكيد التوفر والسعر النهائي.`;

    return `https://wa.me/${storeInfo.whatsappRaw}?text=${encodeURIComponent(
      message
    )}`;
  }, [cartProducts, cartTotalUsd, selectedPaymentMethod]);

  const handleThemeToggle = () => {
    setTheme((currentTheme) => (currentTheme === "dark" ? "light" : "dark"));
  };

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
    if (getProductIdFromPath(currentPath)) {
      navigateToPath("/", page);
      setDrawerOpen(false);
      return;
    }

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

  const handleOpenProduct = (product) => {
    if (product?.id === undefined || product?.id === null) return;

    setDrawerOpen(false);
    navigateToPath(
      `/products/${encodeURIComponent(String(product.id))}`,
      "products"
    );
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
    return cartItems.find((item) => String(item.productId) === String(productId))?.quantity || 0;
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
              onIncreaseQuantity={increaseQuantity}
              onDecreaseQuantity={decreaseQuantity}
              onToggleFavorite={toggleFavorite}
              onOpenProduct={handleOpenProduct}
              exchangeRate={exchangeRate}
            />
          );
        })}
      </div>
    );
  };

  const renderHomePage = () => (
    <>
      <HomeHero onBrowseProducts={() => handlePageChange("products")} />

      <CategoryStrip
        categories={categoryList}
        activeCategory={activeCategory}
        onChange={handleCategoryChange}
      />

      <section className="home-categories-panel">
        <div className="section-title minimal-section-title">
          <h2>التصنيفات الطبية</h2>
          <button type="button" onClick={() => handlePageChange("products")}>
            عرض الكل
            <ChevronLeft size={19} />
          </button>
        </div>

        <div className="home-category-grid">
          {categoryOptions.slice(0, 10).map((category, index) => (
            <button
              type="button"
              key={category}
              className="home-category-card"
              onClick={() => handleCategoryChange(category)}
            >
              <span>{index + 1}</span>
              <strong>{category}</strong>
              <small>
                {productList.filter((product) => product.category === category).length} منتج
              </small>
            </button>
          ))}
        </div>
      </section>

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
                onIncreaseQuantity={increaseQuantity}
                onDecreaseQuantity={decreaseQuantity}
                onToggleFavorite={toggleFavorite}
                onOpenProduct={handleOpenProduct}
                exchangeRate={exchangeRate}
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
                onIncreaseQuantity={increaseQuantity}
                onDecreaseQuantity={decreaseQuantity}
                onToggleFavorite={toggleFavorite}
                onOpenProduct={handleOpenProduct}
                exchangeRate={exchangeRate}
              />
            );
          })}
        </div>
      </section>
    </>
  );

  const renderProductsPage = () => {
    const totalProductsCount = catalogCount || catalogProducts.length;
    const loadedProductsCount = catalogProducts.length;
    const hasActiveFilters =
      activeCategory !== "الكل" || Boolean(searchQuery.trim());
    const isInitialProductsLoading = catalogLoading && loadedProductsCount === 0;

    return (
      <>
        <section className="page-head">
          <span>كتالوج المنتجات</span>
          <h1>المنتجات الطبية</h1>
          <p>
            اختر التصنيف المناسب وشاهد المنتجات المتوفرة في مول صحنايا الطبي.
          </p>
        </section>

        <CategoryStrip
          categories={categoryList}
          activeCategory={activeCategory}
          onChange={handleCategoryChange}
        />

        <section className="products-summary-card">
          <div className="products-summary-main">
            <span className="products-status-pill">
              {activeCategory === "الكل" ? "كل التصنيفات" : activeCategory}
            </span>

            <h2>
              {activeCategory === "الكل" ? "كل المنتجات" : activeCategory}
            </h2>

            <p>
              {searchQuery.trim()
                ? `نتائج البحث من قاعدة البيانات عن: "${searchQuery.trim()}"`
                : "تصفح المنتجات من قاعدة البيانات حسب التصنيف أو استخدم البحث للوصول للمنتج المطلوب بسرعة."}
            </p>
          </div>

          <div className="products-summary-meta">
            <strong>{isInitialProductsLoading ? "..." : totalProductsCount}</strong>
            <span>منتج مطابق</span>
          </div>
        </section>

        <section className="section-block products-list-section">
          <div className="products-toolbar">
            <div>
              <span>المعروض حالياً</span>
              <strong>
                {loadedProductsCount} من {totalProductsCount}
              </strong>
            </div>

            {hasActiveFilters && (
              <button type="button" onClick={resetFilters}>
                مسح الفلترة
                <ChevronLeft size={19} />
              </button>
            )}
          </div>

          {catalogError && (
            <p className="products-api-note">{catalogError}</p>
          )}

          {isInitialProductsLoading ? (
            <div className="products-loading-card">
              <ShoppingCart size={28} />
              <strong>جاري تحميل المنتجات من قاعدة البيانات...</strong>
              <span>يتم جلب النتائج حسب البحث والتصنيف الحالي.</span>
            </div>
          ) : (
            renderProductCards(catalogProducts)
          )}

          {hasMoreCatalogProducts && !catalogError && (
            <div className="infinite-scroll-sentinel" ref={productsLoadMoreRef}>
              {catalogLoadingMore ? (
                <span>جاري تحميل المزيد من المنتجات...</span>
              ) : (
                <span>مرر للأسفل لتحميل المزيد تلقائياً</span>
              )}
            </div>
          )}

          {!hasMoreCatalogProducts && loadedProductsCount > 0 && !catalogLoading && (
            <div className="products-end-message">
              تم عرض كل المنتجات المطابقة.
            </div>
          )}
        </section>
      </>
    );
  };

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
                  <strong>{item.usdValue !== null ? formatUsd(item.usdValue) : "السعر عند الطلب"}</strong>
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
            <strong>{cartTotalUsd > 0 ? formatUsd(cartTotalUsd) : "حسب الطلب"}</strong>
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
                  key={method.id}
                  type="button"
                  className={paymentMethod === method.id ? "active" : ""}
                  onClick={() => setPaymentMethod(method.id)}
                >
                  <span className="payment-option-content">
                    <strong>{method.label}</strong>
                    <small>{method.description}</small>
                  </span>
                </button>
              ))}
            </div>

            {isShamCashSelected && (
              <div className="sham-cash-card">
                <div className="sham-cash-copy">
                  <h3>الدفع عبر شام كاش</h3>
                  <p>
                    امسح رمز QR ثم أرسل صورة إشعار التحويل عبر واتساب مع الطلب.
                  </p>
                </div>

                <div className="sham-cash-qr">
                  <img src={SHAM_CASH_QR_SRC} alt="QR Code شام كاش" />
                </div>
              </div>
            )}
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

      <section className="section-block contact-info-grid">
        <div className="contact-card">
          <div>
            <h3>العنوان</h3>
            <p>{STORE_LOCATION_TEXT}</p>
            <a href={STORE_MAP_URL} target="_blank" rel="noreferrer">
              الموقع على الخريطة
            </a>
          </div>
        </div>

        <div className="contact-card">
          <div>
            <h3>صفحتنا على فيسبوك</h3>
            <p>تابع أحدث المنتجات والعروض من مول صحنايا الطبي.</p>
            <a href={STORE_FACEBOOK_URL} target="_blank" rel="noreferrer">
              زيارة صفحة فيسبوك
            </a>
          </div>
        </div>

        <div className="contact-card">
          <div>
            <h3>الشحن</h3>
            <p>{STORE_SHIPPING_TEXT}</p>
          </div>
        </div>
      </section>
    </>
  );

  const renderPage = () => {
    const productId = getProductIdFromPath(currentPath);

    if (productId !== null) {
      const productKey = String(productId);
      const product =
        productList.find((entry) => String(entry.id) === productKey) ||
        productDetailsById[productKey];
      const productStatus = productDetailsStatus[productKey];
      const similarProducts = product
        ? productList
            .filter(
              (entry) =>
                entry.category === product.category &&
                String(entry.id) !== String(product.id)
            )
            .slice(0, 4)
        : [];

      if (!product && productStatus === "loading") {
        return (
          <section className="page-head product-detail-loading">
            <span>تفاصيل المنتج</span>
            <h1>جاري تحميل المنتج...</h1>
            <p>يتم جلب بيانات المنتج مباشرة من قاعدة البيانات.</p>
          </section>
        );
      }

      if (!product && productStatus === "error") {
        return (
          <section className="page-head product-detail-loading">
            <span>تفاصيل المنتج</span>
            <h1>تعذر تحميل المنتج</h1>
            <p>تأكد من الاتصال أو ارجع إلى صفحة المنتجات وحاول مرة أخرى.</p>
            <button type="button" onClick={() => handlePageChange("products")}>
              العودة للمنتجات
            </button>
          </section>
        );
      }

      return (
        <ProductDetailsPage
          product={product}
          similarProducts={similarProducts}
          exchangeRate={exchangeRate}
          cartQuantity={product ? getCartQuantity(product.id) : 0}
          isFavorite={product ? favoriteIds.includes(product.id) : false}
          onAddToCart={handleAddToCart}
          onIncreaseQuantity={increaseQuantity}
          onDecreaseQuantity={decreaseQuantity}
          onToggleFavorite={toggleFavorite}
          onOpenProduct={handleOpenProduct}
          getCartQuantity={getCartQuantity}
          favoriteIds={favoriteIds}
          whatsappRaw={storeInfo.whatsappRaw}
          storeName={storeInfo.name}
          onBackToProducts={() => handlePageChange("products")}
        />
      );
    }

    if (activePage === "products") return renderProductsPage();
    if (activePage === "offers") return renderOffersPage();
    if (activePage === "cart") return renderCartPage();
    if (activePage === "contact") return renderContactPage();

    return renderHomePage();
  };

if (currentPath.startsWith("/admin")) {
  return (
    <div className="admin-shell" dir="rtl">
      <header className="admin-hero">
        <button
          className="admin-back-btn"
          type="button"
          onClick={() => {
            window.location.href = "/";
          }}
        >
          رجوع للتطبيق
        </button>

        <div>
          <span>لوحة إدارة SMM</span>
          <h1>قيد الربط بالباكند</h1>
          <p>
            تم إيقاف لوحة الإدارة التجريبية مؤقتًا. سيتم استبدالها بلوحة حقيقية
            مرتبطة بقاعدة البيانات مثل G4.
          </p>
        </div>
      </header>
    </div>
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
        onNavigate={handleNavClick}
        activePage={activePage}
        whatsappUrl={whatsappUrl}
        theme={theme}
        onToggleTheme={handleThemeToggle}
      />

      <main className="content app-page-content">{renderPage()}</main>

      <footer className="site-footer">
        <div className="site-footer__brand">
          <img src={storeInfo.logo} alt={storeInfo.name} />
          <p>{STORE_FOOTER_DESCRIPTION}</p>
          <strong>{STORE_SHIPPING_TEXT}</strong>
        </div>

        <nav className="site-footer__nav">
          <strong>التصفح</strong>
          <button type="button" onClick={() => handlePageChange("home")}>
            الرئيسية
          </button>
          <button type="button" onClick={() => handlePageChange("products")}>
            المنتجات
          </button>
          <button type="button" onClick={() => handlePageChange("offers")}>
            العروض
          </button>
          <button type="button" onClick={() => handlePageChange("contact")}>
            تواصل معنا
          </button>
        </nav>

        <nav className="site-footer__contact">
          <strong>معلومات التواصل</strong>
          <span>{STORE_LOCATION_TEXT}</span>
          <span dir="ltr">{storeInfo.whatsapp}</span>
          <div className="site-footer__actions">
            <a href={STORE_MAP_URL} target="_blank" rel="noreferrer">
              الموقع على الخريطة
            </a>
            <a href={whatsappUrl} target="_blank" rel="noreferrer">
              واتساب
            </a>
            <a href={STORE_FACEBOOK_URL} target="_blank" rel="noreferrer">
              فيسبوك
            </a>
          </div>
        </nav>
      </footer>

      <BottomNav activeNav={activePage} onNavigate={handleNavClick} />

      {drawerOpen && (
        <DrawerMenu
          onClose={() => setDrawerOpen(false)}
          onNavigate={handleNavClick}
          onInstallApp={handleInstallApp}
          showInstallAction={!isStandaloneApp && isInstallSupportedDevice()}
        />
      )}

      <InstallPrompt
        isOpen={installHelpOpen}
        onClose={() => setInstallHelpOpen(false)}
      />
    </div>
  );
}

export default App;
