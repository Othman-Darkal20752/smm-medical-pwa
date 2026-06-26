import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  Box,
  CreditCard,
  Edit3,
  ExternalLink,
  Image as ImageIcon,
  Layers3,
  LayoutDashboard,
  LogOut,
  Megaphone,
  Menu,
  Package,
  Plus,
  RefreshCw,
  Save,
  Search,
  Settings,
  Shield,
  Star,
  Tags,
  Trash2,
  TrendingUp,
  UploadCloud,
  X,
} from "lucide-react";

import {
  adminCreateCategory,
  adminCreateHeroSlide,
  adminCreateOfferBanner,
  adminCreateProduct,
  adminDeleteCategory,
  adminDeleteHeroSlide,
  adminDeleteOfferBanner,
  adminDeleteProduct,
  adminFetchCategories,
  adminFetchHeroSlides,
  adminFetchOfferBanners,
  adminFetchPaymentSettings,
  adminFetchProducts,
  adminFetchSettings,
  adminUpdateCategory,
  adminUpdateHeroSlide,
  adminUpdateOfferBanner,
  adminUpdatePaymentSettings,
  adminUpdateProduct,
  adminUpdateSettings,
  clearStoredAdminToken,
  getStoredAdminToken,
  saveStoredAdminToken,
} from "../services/api";

const tabs = [
  { value: "home", label: "الرئيسية", icon: LayoutDashboard },
  { value: "products", label: "المنتجات", icon: Package },
  { value: "categories", label: "التصنيفات", icon: Tags },
  { value: "settings", label: "إعدادات الموقع", icon: Settings },
  { value: "payments", label: "الدفع", icon: CreditCard },
  { value: "hero", label: "شرائح الواجهة الرئيسية", shortLabel: "شرائح الواجهة", icon: Layers3 },
  { value: "offers", label: "بنرات العروض", icon: Megaphone },
];

const stockOptions = [
  { value: "available", label: "متوفر" },
  { value: "request", label: "عند الطلب" },
  { value: "out_of_stock", label: "غير متوفر" },
];

const colorOptions = [
  { value: "red", label: "أحمر" },
  { value: "blue", label: "أزرق" },
  { value: "cyan", label: "سماوي" },
  { value: "navy", label: "كحلي" },
];

const PRODUCTS_VISIBLE_STEP = 10;
const DASHBOARD_LOGO = "/icons/smm-icon-512.png";

const productTagOptions = [
  { value: "", label: "الوسوم" },
  { value: "new", label: "جديد" },
  { value: "offer", label: "عرض" },
  { value: "best", label: "الأكثر مبيعاً" },
  { value: "active", label: "مفعل" },
  { value: "inactive", label: "غير مفعل" },
];

const emptyCategoryForm = {
  name: "",
  order: 0,
  is_active: true,
};

const emptySettingsForm = {
  site_name: "",
  english_name: "",
  short_name: "",
  tagline: "",
  whatsapp_number: "",
  facebook_url: "",
  location: "",
  address: "",
  map_url: "",
  shipping_note: "",
  exchange_rate: 13000,
  products_page_size: 12,
  show_hero_section: true,
  show_offers_section: true,
  show_new_products_section: true,
  show_best_sellers_section: true,
  show_categories_section: true,
  logoFile: null,
  appIconFile: null,
  staticHeroDesktopFile: null,
  staticHeroMobileFile: null,
};

const emptyPaymentForm = {
  cash_enabled: true,
  cash_description: "",
  sham_cash_enabled: true,
  sham_cash_label: "شام كاش",
  sham_cash_description: "",
  sham_cash_qrFile: null,
  whatsapp_enabled: true,
  whatsapp_description: "",
};

const emptyHeroForm = {
  eyebrow: "",
  title: "",
  text: "",
  order: 0,
  is_active: true,
  desktopImageFile: null,
  mobileImageFile: null,
};

const emptyOfferForm = {
  title: "",
  subtitle: "",
  link_label: "",
  link_url: "",
  order: 0,
  is_active: true,
  imageFile: null,
};

function createEmptyProductForm(defaultCategoryId = "") {
  return {
    category_id: defaultCategoryId,
    name: "",
    description: "",
    price_usd: "",
    is_price_visible: true,
    stock_status: "available",
    color: "blue",
    is_new: false,
    is_offer: false,
    is_best_seller: false,
    is_active: true,
    order: 0,
    imageFile: null,
  };
}

function asArray(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.results)) return data.results;
  return [];
}

function appendFormValue(formData, key, value) {
  if (value === undefined || value === null) return;

  if (typeof value === "boolean") {
    formData.append(key, value ? "true" : "false");
    return;
  }

  formData.append(key, value);
}

function productToFormData(form) {
  const formData = new FormData();
  appendFormValue(formData, "category_id", form.category_id);
  appendFormValue(formData, "name", form.name.trim());
  appendFormValue(formData, "description", form.description);
  if (String(form.price_usd).trim() !== "") {
    appendFormValue(formData, "price_usd", form.price_usd);
  }
  appendFormValue(formData, "is_price_visible", form.is_price_visible);
  appendFormValue(formData, "stock_status", form.stock_status);
  appendFormValue(formData, "color", form.color);
  appendFormValue(formData, "is_new", form.is_new);
  appendFormValue(formData, "is_offer", form.is_offer);
  appendFormValue(formData, "is_best_seller", form.is_best_seller);
  appendFormValue(formData, "is_active", form.is_active);
  appendFormValue(formData, "order", form.order || 0);
  if (form.imageFile) {
    formData.append("image", form.imageFile);
  }
  return formData;
}

function settingsToFormData(form) {
  const formData = new FormData();
  [
    "site_name",
    "english_name",
    "short_name",
    "tagline",
    "whatsapp_number",
    "facebook_url",
    "location",
    "address",
    "map_url",
    "shipping_note",
    "exchange_rate",
    "products_page_size",
    "show_hero_section",
    "show_offers_section",
    "show_new_products_section",
    "show_best_sellers_section",
    "show_categories_section",
  ].forEach((key) => appendFormValue(formData, key, form[key]));

  if (form.logoFile) formData.append("logo", form.logoFile);
  if (form.appIconFile) formData.append("app_icon", form.appIconFile);
  if (form.staticHeroDesktopFile) formData.append("static_hero_desktop", form.staticHeroDesktopFile);
  if (form.staticHeroMobileFile) formData.append("static_hero_mobile", form.staticHeroMobileFile);
  return formData;
}

function paymentToFormData(form) {
  const formData = new FormData();
  [
    "cash_enabled",
    "cash_description",
    "sham_cash_enabled",
    "sham_cash_label",
    "sham_cash_description",
    "whatsapp_enabled",
    "whatsapp_description",
  ].forEach((key) => appendFormValue(formData, key, form[key]));

  if (form.sham_cash_qrFile) formData.append("sham_cash_qr", form.sham_cash_qrFile);
  return formData;
}

function heroToFormData(form) {
  const formData = new FormData();
  ["eyebrow", "title", "text", "order", "is_active"].forEach((key) => appendFormValue(formData, key, form[key]));
  if (form.desktopImageFile) formData.append("desktop_image", form.desktopImageFile);
  if (form.mobileImageFile) formData.append("mobile_image", form.mobileImageFile);
  return formData;
}

function offerToFormData(form) {
  const formData = new FormData();
  ["title", "subtitle", "link_label", "link_url", "order", "is_active"].forEach((key) =>
    appendFormValue(formData, key, form[key])
  );
  if (form.imageFile) formData.append("image", form.imageFile);
  return formData;
}

function getStockLabel(value) {
  return stockOptions.find((option) => option.value === value)?.label || "غير محدد";
}

function formatUsd(value) {
  if (value === undefined || value === null || value === "") return "السعر عند الطلب";
  return `$${Number(value).toLocaleString("en-US", { maximumFractionDigits: 2 })}`;
}

function formatSyp(value, exchangeRate) {
  if (value === undefined || value === null || value === "") return "—";
  const rate = Number(exchangeRate) || 0;
  if (!rate) return "—";
  return `${Math.round(Number(value) * rate).toLocaleString("ar-SY")} ل.س`;
}

function getProductImage(product) {
  return product.image_url || product.image || product.imageUrl || product.thumbnail_url || "";
}

function getPreviewImage(item) {
  return item.image_url || item.image || item.desktop_image_url || item.mobile_image_url || item.desktop_image || item.mobile_image || "";
}

function Field({ label, children, className = "" }) {
  return (
    <label className={`admin-field ${className}`.trim()}>
      <span>{label}</span>
      {children}
    </label>
  );
}

function FileField({ label, hint = "PNG, JPG, WebP", onChange }) {
  return (
    <label className="admin-upload-field">
      <span>{label}</span>
      <input accept="image/*" onChange={onChange} type="file" />
      <div className="admin-upload-box">
        <UploadCloud size={24} />
        <strong>اسحب وأفلت أو انقر للرفع</strong>
        <small>{hint}</small>
      </div>
    </label>
  );
}

function BooleanField({ label, checked, onChange, hint = "" }) {
  return (
    <label className="admin-switch-field">
      <input type="checkbox" checked={Boolean(checked)} onChange={(event) => onChange(event.target.checked)} />
      <span className="admin-switch-track" aria-hidden="true" />
      <span className="admin-switch-copy">
        <strong>{label}</strong>
        {hint && <small>{hint}</small>}
      </span>
    </label>
  );
}

function AdminActionButton({ children, icon: Icon, variant = "primary", ...props }) {
  return (
    <button className={`admin-action-btn admin-action-btn--${variant}`} type="button" {...props}>
      {Icon && <Icon size={18} />}
      {children}
    </button>
  );
}

function AdminIconButton({ children, icon: Icon, variant = "soft", ...props }) {
  return (
    <button className={`admin-icon-btn admin-icon-btn--${variant}`} type="button" aria-label={children} {...props}>
      {Icon && <Icon size={17} />}
    </button>
  );
}

function AdminPanel({ title, subtitle, actions, children, className = "" }) {
  return (
    <section className={`admin-panel ${className}`.trim()}>
      {(title || actions) && (
        <div className="admin-panel-head">
          <div>
            {title && <h2>{title}</h2>}
            {subtitle && <p>{subtitle}</p>}
          </div>
          {actions && <div className="admin-panel-actions">{actions}</div>}
        </div>
      )}
      {children}
    </section>
  );
}

function AdminFormSheet({ open, title, subtitle, onClose, children }) {
  if (!open) return null;

  return (
    <div className="admin-sheet-layer" role="presentation">
      <button className="admin-sheet-backdrop" type="button" aria-label="إغلاق" onClick={onClose} />
      <section className="admin-sheet" role="dialog" aria-modal="true" aria-label={title}>
        <header className="admin-sheet-head">
          <div>
            <h2>{title}</h2>
            {subtitle && <p>{subtitle}</p>}
          </div>
          <button type="button" onClick={onClose} aria-label="إغلاق">
            <X size={20} />
          </button>
        </header>
        <div className="admin-sheet-body">{children}</div>
      </section>
    </div>
  );
}

function StatusBadge({ children, variant = "neutral" }) {
  return <span className={`admin-badge admin-badge--${variant}`}>{children}</span>;
}

function AdminDashboard({ onBackToApp }) {
  const [adminToken, setAdminToken] = useState(() => getStoredAdminToken());
  const [tokenDraft, setTokenDraft] = useState(() => getStoredAdminToken());
  const [activeTab, setActiveTab] = useState("home");
  const [formPanel, setFormPanel] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const [settings, setSettings] = useState(null);
  const [paymentSettings, setPaymentSettings] = useState(null);
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [heroSlides, setHeroSlides] = useState([]);
  const [offerBanners, setOfferBanners] = useState([]);

  const [productForm, setProductForm] = useState(() => createEmptyProductForm());
  const [editingProductId, setEditingProductId] = useState(null);
  const [productSearch, setProductSearch] = useState("");
  const [productCategoryFilter, setProductCategoryFilter] = useState("");
  const [productStockFilter, setProductStockFilter] = useState("");
  const [productTagFilter, setProductTagFilter] = useState("");
  const [visibleProductsCount, setVisibleProductsCount] = useState(PRODUCTS_VISIBLE_STEP);

  const [categoryForm, setCategoryForm] = useState(emptyCategoryForm);
  const [editingCategoryId, setEditingCategoryId] = useState(null);

  const [settingsForm, setSettingsForm] = useState(emptySettingsForm);
  const [paymentForm, setPaymentForm] = useState(emptyPaymentForm);

  const [heroForm, setHeroForm] = useState(emptyHeroForm);
  const [editingHeroId, setEditingHeroId] = useState(null);

  const [offerForm, setOfferForm] = useState(emptyOfferForm);
  const [editingOfferId, setEditingOfferId] = useState(null);

  const defaultCategoryId = categories[0]?.id || "";
  const exchangeRate = settingsForm.exchange_rate || settings?.exchange_rate || 13000;

  const stats = useMemo(
    () => ({
      total: products.length,
      newCount: products.filter((product) => product.is_new).length,
      offerCount: products.filter((product) => product.is_offer).length,
      bestCount: products.filter((product) => product.is_best_seller).length,
      categoriesCount: categories.length,
      heroCount: heroSlides.length,
      bannerCount: offerBanners.length,
    }),
    [products, categories, heroSlides, offerBanners]
  );

  const filteredProducts = useMemo(() => {
    const searchTerm = productSearch.trim().toLowerCase();

    return products.filter((product) => {
      const categoryId = String(product.category?.id || product.category_id || "");
      const productName = String(product.name || "").toLowerCase();
      const productCategory = String(product.category?.name || "").toLowerCase();
      const matchesSearch = !searchTerm || productName.includes(searchTerm) || productCategory.includes(searchTerm);
      const matchesCategory = !productCategoryFilter || categoryId === String(productCategoryFilter);
      const matchesStock = !productStockFilter || product.stock_status === productStockFilter;
      const matchesTag =
        !productTagFilter ||
        (productTagFilter === "new" && product.is_new) ||
        (productTagFilter === "offer" && product.is_offer) ||
        (productTagFilter === "best" && product.is_best_seller) ||
        (productTagFilter === "active" && product.is_active) ||
        (productTagFilter === "inactive" && !product.is_active);

      return matchesSearch && matchesCategory && matchesStock && matchesTag;
    });
  }, [products, productSearch, productCategoryFilter, productStockFilter, productTagFilter]);

  const visibleProducts = useMemo(
    () => filteredProducts.slice(0, visibleProductsCount),
    [filteredProducts, visibleProductsCount]
  );

  const hasMoreProducts = visibleProducts.length < filteredProducts.length;

  useEffect(() => {
    setVisibleProductsCount(PRODUCTS_VISIBLE_STEP);
  }, [activeTab, productSearch, productCategoryFilter, productStockFilter, productTagFilter]);

  const activeTabMeta = tabs.find((tab) => tab.value === activeTab) || tabs[0];

  const loadDashboard = async () => {
    if (!adminToken) return;

    setLoading(true);
    setError("");

    try {
      const [settingsData, paymentData, categoryData, productData, heroData, offerData] = await Promise.all([
        adminFetchSettings({ token: adminToken }),
        adminFetchPaymentSettings({ token: adminToken }),
        adminFetchCategories({ token: adminToken }),
        adminFetchProducts({ page_size: 60 }, { token: adminToken }),
        adminFetchHeroSlides({ token: adminToken }),
        adminFetchOfferBanners({ token: adminToken }),
      ]);

      const categoryList = asArray(categoryData);
      const productList = asArray(productData);

      setSettings(settingsData);
      setPaymentSettings(paymentData);
      setCategories(categoryList);
      setProducts(productList);
      setHeroSlides(asArray(heroData));
      setOfferBanners(asArray(offerData));

      setSettingsForm({
        ...emptySettingsForm,
        ...settingsData,
        logoFile: null,
        appIconFile: null,
        staticHeroDesktopFile: null,
        staticHeroMobileFile: null,
      });
      setPaymentForm({
        ...emptyPaymentForm,
        ...paymentData,
        sham_cash_qrFile: null,
      });
      setProductForm((current) => ({
        ...current,
        category_id: current.category_id || categoryList[0]?.id || "",
      }));
    } catch (err) {
      setError(err.message || "تعذر تحميل بيانات الداشبورد.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [adminToken]);

  const handleTokenSubmit = (event) => {
    event.preventDefault();
    const cleanToken = tokenDraft.trim();
    if (!cleanToken) {
      setError("أدخل توكن الإدارة أولاً.");
      return;
    }
    saveStoredAdminToken(cleanToken);
    setAdminToken(cleanToken);
    setNotice("تم حفظ التوكن محلياً.");
  };

  const logout = () => {
    clearStoredAdminToken();
    setAdminToken("");
    setTokenDraft("");
    setProducts([]);
    setCategories([]);
    setSettings(null);
    setPaymentSettings(null);
  };

  const switchTab = (tabValue) => {
    setActiveTab(tabValue);
    setMobileMenuOpen(false);
  };

  const resetProductForm = () => {
    setEditingProductId(null);
    setProductForm(createEmptyProductForm(defaultCategoryId));
  };

  const openNewProduct = () => {
    resetProductForm();
    setActiveTab("products");
    setFormPanel("product");
  };

  const saveProduct = async (event) => {
    event.preventDefault();
    if (!productForm.name.trim() || !productForm.category_id) {
      alert("أدخل اسم المنتج والتصنيف.");
      return;
    }

    setSaving(true);
    setError("");
    try {
      const payload = productToFormData(productForm);
      if (editingProductId) {
        await adminUpdateProduct(editingProductId, payload, { token: adminToken });
      } else {
        await adminCreateProduct(payload, { token: adminToken });
      }
      setNotice(editingProductId ? "تم تعديل المنتج." : "تمت إضافة المنتج.");
      resetProductForm();
      setFormPanel(null);
      await loadDashboard();
    } catch (err) {
      setError(err.message || "تعذر حفظ المنتج.");
    } finally {
      setSaving(false);
    }
  };

  const editProduct = (product) => {
    setEditingProductId(product.id);
    setProductForm({
      category_id: product.category?.id || product.category_id || defaultCategoryId,
      name: product.name || "",
      description: product.description || "",
      price_usd: product.price_usd || "",
      is_price_visible: product.is_price_visible,
      stock_status: product.stock_status || "available",
      color: product.color || "blue",
      is_new: Boolean(product.is_new),
      is_offer: Boolean(product.is_offer),
      is_best_seller: Boolean(product.is_best_seller),
      is_active: Boolean(product.is_active),
      order: product.order || 0,
      imageFile: null,
    });
    setActiveTab("products");
    setFormPanel("product");
  };

  const removeProduct = async (productId) => {
    if (!window.confirm("هل تريد حذف هذا المنتج؟")) return;

    setSaving(true);
    setError("");
    try {
      await adminDeleteProduct(productId, { token: adminToken });
      setNotice("تم حذف المنتج.");
      if (editingProductId === productId) resetProductForm();
      await loadDashboard();
    } catch (err) {
      setError(err.message || "تعذر حذف المنتج.");
    } finally {
      setSaving(false);
    }
  };

  const resetCategoryForm = () => {
    setEditingCategoryId(null);
    setCategoryForm(emptyCategoryForm);
  };

  const openNewCategory = () => {
    resetCategoryForm();
    setActiveTab("categories");
    setFormPanel("category");
  };

  const saveCategory = async (event) => {
    event.preventDefault();
    if (!categoryForm.name.trim()) {
      alert("أدخل اسم التصنيف.");
      return;
    }

    setSaving(true);
    setError("");
    try {
      const payload = {
        name: categoryForm.name.trim(),
        order: Number(categoryForm.order) || 0,
        is_active: Boolean(categoryForm.is_active),
      };
      if (editingCategoryId) {
        await adminUpdateCategory(editingCategoryId, payload, { token: adminToken });
      } else {
        await adminCreateCategory(payload, { token: adminToken });
      }
      setNotice(editingCategoryId ? "تم تعديل التصنيف." : "تمت إضافة التصنيف.");
      resetCategoryForm();
      setFormPanel(null);
      await loadDashboard();
    } catch (err) {
      setError(err.message || "تعذر حفظ التصنيف.");
    } finally {
      setSaving(false);
    }
  };

  const editCategory = (category) => {
    setEditingCategoryId(category.id);
    setCategoryForm({
      name: category.name || "",
      order: category.order || 0,
      is_active: Boolean(category.is_active),
    });
    setActiveTab("categories");
    setFormPanel("category");
  };

  const removeCategory = async (categoryId) => {
    if (!window.confirm("هل تريد حذف هذا التصنيف؟ لن يتم الحذف إذا كان مرتبطاً بمنتجات.")) return;

    setSaving(true);
    setError("");
    try {
      await adminDeleteCategory(categoryId, { token: adminToken });
      setNotice("تم حذف التصنيف.");
      if (editingCategoryId === categoryId) resetCategoryForm();
      await loadDashboard();
    } catch (err) {
      setError(err.message || "تعذر حذف التصنيف. غالباً التصنيف مرتبط بمنتجات.");
    } finally {
      setSaving(false);
    }
  };

  const saveSettings = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      await adminUpdateSettings(settingsToFormData(settingsForm), { token: adminToken });
      setNotice("تم حفظ إعدادات الموقع.");
      await loadDashboard();
    } catch (err) {
      setError(err.message || "تعذر حفظ إعدادات الموقع.");
    } finally {
      setSaving(false);
    }
  };

  const savePaymentSettings = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      await adminUpdatePaymentSettings(paymentToFormData(paymentForm), { token: adminToken });
      setNotice("تم حفظ إعدادات الدفع.");
      await loadDashboard();
    } catch (err) {
      setError(err.message || "تعذر حفظ إعدادات الدفع.");
    } finally {
      setSaving(false);
    }
  };

  const resetHeroForm = () => {
    setEditingHeroId(null);
    setHeroForm(emptyHeroForm);
  };

  const openNewHeroSlide = () => {
    resetHeroForm();
    setActiveTab("hero");
    setFormPanel("hero");
  };

  const saveHeroSlide = async (event) => {
    event.preventDefault();
    if (!heroForm.title.trim()) {
      alert("أدخل عنوان الشريحة.");
      return;
    }

    setSaving(true);
    setError("");
    try {
      const payload = heroToFormData(heroForm);
      if (editingHeroId) {
        await adminUpdateHeroSlide(editingHeroId, payload, { token: adminToken });
      } else {
        await adminCreateHeroSlide(payload, { token: adminToken });
      }
      setNotice(editingHeroId ? "تم تعديل شريحة الهيرو." : "تمت إضافة شريحة الهيرو.");
      resetHeroForm();
      setFormPanel(null);
      await loadDashboard();
    } catch (err) {
      setError(err.message || "تعذر حفظ شريحة الهيرو.");
    } finally {
      setSaving(false);
    }
  };

  const editHeroSlide = (slide) => {
    setEditingHeroId(slide.id);
    setHeroForm({
      eyebrow: slide.eyebrow || "",
      title: slide.title || "",
      text: slide.text || "",
      order: slide.order || 0,
      is_active: Boolean(slide.is_active),
      desktopImageFile: null,
      mobileImageFile: null,
    });
    setActiveTab("hero");
    setFormPanel("hero");
  };

  const removeHeroSlide = async (slideId) => {
    if (!window.confirm("هل تريد حذف هذه الشريحة؟")) return;

    setSaving(true);
    setError("");
    try {
      await adminDeleteHeroSlide(slideId, { token: adminToken });
      setNotice("تم حذف شريحة الهيرو.");
      if (editingHeroId === slideId) resetHeroForm();
      await loadDashboard();
    } catch (err) {
      setError(err.message || "تعذر حذف الشريحة.");
    } finally {
      setSaving(false);
    }
  };

  const resetOfferForm = () => {
    setEditingOfferId(null);
    setOfferForm(emptyOfferForm);
  };

  const openNewOfferBanner = () => {
    resetOfferForm();
    setActiveTab("offers");
    setFormPanel("offer");
  };

  const saveOfferBanner = async (event) => {
    event.preventDefault();
    if (!offerForm.title.trim()) {
      alert("أدخل عنوان البنر.");
      return;
    }

    setSaving(true);
    setError("");
    try {
      const payload = offerToFormData(offerForm);
      if (editingOfferId) {
        await adminUpdateOfferBanner(editingOfferId, payload, { token: adminToken });
      } else {
        await adminCreateOfferBanner(payload, { token: adminToken });
      }
      setNotice(editingOfferId ? "تم تعديل بنر العرض." : "تمت إضافة بنر العرض.");
      resetOfferForm();
      setFormPanel(null);
      await loadDashboard();
    } catch (err) {
      setError(err.message || "تعذر حفظ بنر العرض.");
    } finally {
      setSaving(false);
    }
  };

  const editOfferBanner = (banner) => {
    setEditingOfferId(banner.id);
    setOfferForm({
      title: banner.title || "",
      subtitle: banner.subtitle || "",
      link_label: banner.link_label || "",
      link_url: banner.link_url || "",
      order: banner.order || 0,
      is_active: Boolean(banner.is_active),
      imageFile: null,
    });
    setActiveTab("offers");
    setFormPanel("offer");
  };

  const removeOfferBanner = async (bannerId) => {
    if (!window.confirm("هل تريد حذف هذا البنر؟")) return;

    setSaving(true);
    setError("");
    try {
      await adminDeleteOfferBanner(bannerId, { token: adminToken });
      setNotice("تم حذف بنر العرض.");
      if (editingOfferId === bannerId) resetOfferForm();
      await loadDashboard();
    } catch (err) {
      setError(err.message || "تعذر حذف البنر.");
    } finally {
      setSaving(false);
    }
  };

  const closeFormPanel = () => {
    if (formPanel === "product") resetProductForm();
    if (formPanel === "category") resetCategoryForm();
    if (formPanel === "hero") resetHeroForm();
    if (formPanel === "offer") resetOfferForm();
    setFormPanel(null);
  };

  const renderTabs = (className = "") => (
    <nav className={`admin-nav ${className}`.trim()} aria-label="أقسام لوحة التحكم">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        return (
          <button
            className={activeTab === tab.value ? "active" : ""}
            key={tab.value}
            onClick={() => switchTab(tab.value)}
            type="button"
          >
            <Icon size={18} />
            <span>{tab.shortLabel || tab.label}</span>
          </button>
        );
      })}
    </nav>
  );

  const renderProductForm = () => (
    <form className="admin-form admin-form-grid" onSubmit={saveProduct}>
      <Field label="اسم المنتج">
        <input
          value={productForm.name}
          onChange={(event) => setProductForm({ ...productForm, name: event.target.value })}
          placeholder="مثال: جهاز قياس ضغط"
        />
      </Field>

      <Field label="التصنيف">
        <select value={productForm.category_id} onChange={(event) => setProductForm({ ...productForm, category_id: event.target.value })}>
          <option value="">اختر التصنيف</option>
          {categories.map((category) => (
            <option value={category.id} key={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </Field>

      <Field label="السعر بالدولار">
        <input
          value={productForm.price_usd}
          onChange={(event) => setProductForm({ ...productForm, price_usd: event.target.value })}
          placeholder="مثال: 12.50"
          type="number"
          step="0.01"
          min="0"
        />
      </Field>

      <Field label="حالة التوفر">
        <select value={productForm.stock_status} onChange={(event) => setProductForm({ ...productForm, stock_status: event.target.value })}>
          {stockOptions.map((option) => (
            <option value={option.value} key={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </Field>

      <Field label="لون البطاقة">
        <select value={productForm.color} onChange={(event) => setProductForm({ ...productForm, color: event.target.value })}>
          {colorOptions.map((option) => (
            <option value={option.value} key={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </Field>

      <Field label="ترتيب المنتج">
        <input value={productForm.order} onChange={(event) => setProductForm({ ...productForm, order: event.target.value })} type="number" min="0" />
      </Field>

      <Field label="وصف المنتج" className="admin-field-wide">
        <textarea value={productForm.description} onChange={(event) => setProductForm({ ...productForm, description: event.target.value })} rows="3" />
      </Field>

      <FileField label="صورة المنتج" onChange={(event) => setProductForm({ ...productForm, imageFile: event.target.files?.[0] || null })} />

      <div className="admin-switch-grid admin-field-wide">
        <BooleanField label="إظهار السعر" checked={productForm.is_price_visible} onChange={(value) => setProductForm({ ...productForm, is_price_visible: value })} />
        <BooleanField label="جديد" checked={productForm.is_new} onChange={(value) => setProductForm({ ...productForm, is_new: value })} />
        <BooleanField label="عرض" checked={productForm.is_offer} onChange={(value) => setProductForm({ ...productForm, is_offer: value })} />
        <BooleanField label="الأكثر طلباً" checked={productForm.is_best_seller} onChange={(value) => setProductForm({ ...productForm, is_best_seller: value })} />
        <BooleanField label="مفعل" checked={productForm.is_active} onChange={(value) => setProductForm({ ...productForm, is_active: value })} />
      </div>

      <button className="admin-submit admin-field-wide" disabled={saving} type="submit">
        {editingProductId ? <Save size={20} /> : <Plus size={20} />}
        {editingProductId ? "حفظ التعديل" : "إضافة المنتج"}
      </button>
    </form>
  );

  const renderCategoryForm = () => (
    <form className="admin-form" onSubmit={saveCategory}>
      <Field label="اسم التصنيف">
        <input value={categoryForm.name} onChange={(event) => setCategoryForm({ ...categoryForm, name: event.target.value })} placeholder="مثال: أجهزة الضغط" />
      </Field>
      <Field label="الترتيب">
        <input value={categoryForm.order} onChange={(event) => setCategoryForm({ ...categoryForm, order: event.target.value })} type="number" min="0" />
      </Field>
      <BooleanField label="مفعل" checked={categoryForm.is_active} onChange={(value) => setCategoryForm({ ...categoryForm, is_active: value })} />
      <button className="admin-submit" disabled={saving} type="submit">
        {editingCategoryId ? <Save size={20} /> : <Plus size={20} />}
        {editingCategoryId ? "حفظ التصنيف" : "إضافة التصنيف"}
      </button>
    </form>
  );

  const renderHeroForm = () => (
    <form className="admin-form admin-form-grid" onSubmit={saveHeroSlide}>
      <Field label="النص الصغير">
        <input value={heroForm.eyebrow} onChange={(event) => setHeroForm({ ...heroForm, eyebrow: event.target.value })} />
      </Field>
      <Field label="العنوان">
        <input value={heroForm.title} onChange={(event) => setHeroForm({ ...heroForm, title: event.target.value })} />
      </Field>
      <Field label="النص" className="admin-field-wide">
        <textarea value={heroForm.text} onChange={(event) => setHeroForm({ ...heroForm, text: event.target.value })} rows="3" />
      </Field>
      <Field label="الترتيب">
        <input value={heroForm.order} onChange={(event) => setHeroForm({ ...heroForm, order: event.target.value })} type="number" min="0" />
      </Field>
      <BooleanField label="مفعلة" checked={heroForm.is_active} onChange={(value) => setHeroForm({ ...heroForm, is_active: value })} />
      <FileField label="صورة الديسكتوب" hint="يفضل 1920×800" onChange={(event) => setHeroForm({ ...heroForm, desktopImageFile: event.target.files?.[0] || null })} />
      <FileField label="صورة الجوال" hint="يفضل 1080×1350" onChange={(event) => setHeroForm({ ...heroForm, mobileImageFile: event.target.files?.[0] || null })} />
      <button className="admin-submit admin-field-wide" disabled={saving} type="submit">
        {editingHeroId ? <Save size={20} /> : <Plus size={20} />}
        {editingHeroId ? "حفظ الشريحة" : "إضافة الشريحة"}
      </button>
    </form>
  );

  const renderOfferForm = () => (
    <form className="admin-form admin-form-grid" onSubmit={saveOfferBanner}>
      <Field label="العنوان">
        <input value={offerForm.title} onChange={(event) => setOfferForm({ ...offerForm, title: event.target.value })} />
      </Field>
      <Field label="النص الفرعي">
        <input value={offerForm.subtitle} onChange={(event) => setOfferForm({ ...offerForm, subtitle: event.target.value })} />
      </Field>
      <Field label="نص الزر">
        <input value={offerForm.link_label} onChange={(event) => setOfferForm({ ...offerForm, link_label: event.target.value })} />
      </Field>
      <Field label="رابط الزر أو المسار الداخلي">
        <input value={offerForm.link_url} onChange={(event) => setOfferForm({ ...offerForm, link_url: event.target.value })} placeholder="مثال: /products أو https://..." />
      </Field>
      <Field label="الترتيب">
        <input value={offerForm.order} onChange={(event) => setOfferForm({ ...offerForm, order: event.target.value })} type="number" min="0" />
      </Field>
      <BooleanField label="مفعل" checked={offerForm.is_active} onChange={(value) => setOfferForm({ ...offerForm, is_active: value })} />
      <FileField label="صورة البنر" onChange={(event) => setOfferForm({ ...offerForm, imageFile: event.target.files?.[0] || null })} />
      <button className="admin-submit admin-field-wide" disabled={saving} type="submit">
        {editingOfferId ? <Save size={20} /> : <Plus size={20} />}
        {editingOfferId ? "حفظ البنر" : "إضافة البنر"}
      </button>
    </form>
  );

  if (!adminToken) {
    return (
      <div className="admin-login-shell" dir="rtl">
        <div className="admin-login-card">
          <div className="admin-login-brand">
            <span className="admin-logo-mark">
              <img src={DASHBOARD_LOGO} alt="??? ?????? ?????" />
            </span>
            <h1>مول صحنايا الطبي</h1>
            <p>لوحة إدارة المتجر</p>
          </div>

          <form className="admin-login-form" onSubmit={handleTokenSubmit}>
            <h2>تسجيل الدخول</h2>
            <Field label="توكن الإدارة">
              <input
                value={tokenDraft}
                onChange={(event) => setTokenDraft(event.target.value)}
                placeholder="أدخل توكن الإدارة"
                type="password"
              />
            </Field>
            {error && <p className="admin-error">{error}</p>}
            <button className="admin-submit" type="submit">
              <Shield size={18} />
              دخول إلى لوحة الإدارة
            </button>
          </form>

          {onBackToApp && (
            <button className="admin-login-back" onClick={onBackToApp} type="button">
              <ArrowRight size={18} />
              رجوع إلى الموقع
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="admin-shell admin-shell-v2" dir="rtl">
      <aside className={`admin-sidebar ${mobileMenuOpen ? "is-open" : ""}`}>
        <div className="admin-sidebar-brand">
          <span className="admin-logo-mark admin-logo-mark--small">
            <img src={DASHBOARD_LOGO} alt="??? ?????? ?????" />
          </span>
          <div>
            <strong>مول صحنايا الطبي</strong>
            <small>لوحة الإدارة</small>
          </div>
        </div>

        {renderTabs("admin-sidebar-nav")}

        <div className="admin-sidebar-foot">
          <button type="button" onClick={() => setMobileMenuOpen(false)} className="admin-sidebar-close">
            طي القائمة
            <Menu size={18} />
          </button>
          <button type="button" onClick={logout} className="admin-sidebar-logout">
            تسجيل الخروج
            <LogOut size={18} />
          </button>
        </div>
      </aside>

      {mobileMenuOpen && <button className="admin-sidebar-backdrop" type="button" aria-label="إغلاق القائمة" onClick={() => setMobileMenuOpen(false)} />}

      <main className="admin-main">
        <header className="admin-topbar">
          <div className="admin-topbar-title">
            <button className="admin-mobile-menu-btn" type="button" onClick={() => setMobileMenuOpen(true)} aria-label="فتح القائمة">
              <Menu size={20} />
            </button>
            <div>
              <strong>لوحة إدارة مول صحنايا الطبي</strong>
              <small>إدارة المنتجات والتصنيفات والإعدادات من مكان واحد</small>
            </div>
          </div>

          <div className="admin-topbar-actions">
            {onBackToApp && (
              <button type="button" onClick={onBackToApp}>
                رجوع للموقع
                <ExternalLink size={17} />
              </button>
            )}
            <button type="button" onClick={loadDashboard} disabled={loading || saving}>
              تحديث البيانات
              <RefreshCw size={17} />
            </button>
            <button type="button" onClick={logout} className="danger">
              خروج
              <LogOut size={17} />
            </button>
          </div>
        </header>

        {renderTabs("admin-mobile-tabs")}

        <section className="admin-page-title">
          <h1>{activeTabMeta.label}</h1>
          <p>
            {activeTab === "home" && "نظرة سريعة على حالة الكتالوج وآخر المنتجات."}
            {activeTab === "products" && "إدارة المنتجات، الصور، الأسعار، التوفر والوسوم."}
            {activeTab === "categories" && "تنظيم التصنيفات الظاهرة في الموقع."}
            {activeTab === "settings" && "هوية الموقع، التواصل، سعر الصرف وأقسام الصفحة الرئيسية."}
            {activeTab === "payments" && "طرق الدفع المتاحة للزبائن ومعلومات QR."}
            {activeTab === "hero" && "شرائح الواجهة الرئيسية للديسكتوب والجوال."}
            {activeTab === "offers" && "بنرات العروض والروابط الترويجية."}
          </p>
        </section>

        <div className="admin-alerts">
          {loading && <p className="admin-info">جار تحميل بيانات الداشبورد...</p>}
          {saving && <p className="admin-info">جار حفظ التغييرات...</p>}
          {notice && <p className="admin-success">{notice}</p>}
          {error && <p className="admin-error">{error}</p>}
        </div>

        {activeTab === "home" && (
          <>
            <section className="admin-stats-grid">
              <article>
                <span className="admin-stat-icon admin-stat-icon--navy"><Box size={22} /></span>
                <strong>{stats.total}</strong>
                <small>كل المنتجات</small>
              </article>
              <article>
                <span className="admin-stat-icon admin-stat-icon--blue"><Star size={22} /></span>
                <strong>{stats.newCount}</strong>
                <small>جديدنا</small>
              </article>
              <article>
                <span className="admin-stat-icon admin-stat-icon--red"><Tags size={22} /></span>
                <strong>{stats.offerCount}</strong>
                <small>العروض</small>
              </article>
              <article>
                <span className="admin-stat-icon admin-stat-icon--orange"><TrendingUp size={22} /></span>
                <strong>{stats.bestCount}</strong>
                <small>الأكثر مبيعاً</small>
              </article>
              <article>
                <span className="admin-stat-icon admin-stat-icon--purple"><Tags size={22} /></span>
                <strong>{stats.categoriesCount}</strong>
                <small>التصنيفات</small>
              </article>
              <article>
                <span className="admin-stat-icon admin-stat-icon--cyan"><Layers3 size={22} /></span>
                <strong>{stats.heroCount}</strong>
                <small>شرائح الواجهة</small>
              </article>
            </section>

            <AdminPanel title="آخر المنتجات المضافة" subtitle={`${products.slice(0, 5).length} منتجات`}>
              <div className="admin-recent-list">
                {products.slice(0, 5).map((product) => (
                  <article key={product.id}>
                    <span className="admin-product-mini-icon"><Package size={18} /></span>
                    <div>
                      <strong>{product.name}</strong>
                      <small>{product.category?.name || "بدون تصنيف"}</small>
                    </div>
                    <div className="admin-recent-flags">
                      {product.is_offer && <StatusBadge variant="danger">عرض</StatusBadge>}
                      {product.is_new && <StatusBadge variant="success">جديد</StatusBadge>}
                      {product.is_best_seller && <StatusBadge variant="warning">الأكثر مبيعاً</StatusBadge>}
                    </div>
                  </article>
                ))}
              </div>
            </AdminPanel>
          </>
        )}

        {activeTab === "products" && (
          <>
            <div className="admin-section-toolbar">
              <AdminActionButton icon={Plus} onClick={openNewProduct}>إضافة منتج</AdminActionButton>
            </div>

            <AdminPanel className="admin-filter-panel">
              <div className="admin-product-filters">
                <label className="admin-search-field">
                  <Search size={18} />
                  <input value={productSearch} onChange={(event) => setProductSearch(event.target.value)} placeholder="ابحث عن منتج..." />
                </label>
                <select value={productCategoryFilter} onChange={(event) => setProductCategoryFilter(event.target.value)}>
                  <option value="">كل التصنيفات</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>{category.name}</option>
                  ))}
                </select>
                <select value={productStockFilter} onChange={(event) => setProductStockFilter(event.target.value)}>
                  <option value="">حالة التوفر</option>
                  {stockOptions.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
                <select value={productTagFilter} onChange={(event) => setProductTagFilter(event.target.value)}>
                  {productTagOptions.map((option) => (
                    <option key={option.value || "all"} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>
            </AdminPanel>

            <AdminPanel className="admin-products-panel" title="قائمة المنتجات" subtitle={`${visibleProducts.length} من ${filteredProducts.length} منتج`}>
              <div className="admin-table-wrap">
                <table className="admin-table admin-products-table">
                  <thead>
                    <tr>
                      <th>الصورة</th>
                      <th>اسم المنتج</th>
                      <th>التصنيف</th>
                      <th>السعر $</th>
                      <th>السعر ل.س</th>
                      <th>التوفر</th>
                      <th>الوسوم</th>
                      <th>مفعل</th>
                      <th>إجراءات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visibleProducts.map((product) => (
                      <tr key={product.id}>
                        <td>
                          <span className="admin-product-thumb">
                            {getProductImage(product) ? <img src={getProductImage(product)} alt="" /> : <Package size={18} />}
                          </span>
                        </td>
                        <td><strong>{product.name}</strong></td>
                        <td><StatusBadge>{product.category?.name || "بدون تصنيف"}</StatusBadge></td>
                        <td>{product.is_price_visible ? formatUsd(product.price_usd) : "مخفي"}</td>
                        <td>{product.is_price_visible ? formatSyp(product.price_usd, exchangeRate) : "—"}</td>
                        <td><StatusBadge variant={product.stock_status === "available" ? "success" : product.stock_status === "out_of_stock" ? "danger" : "warning"}>{getStockLabel(product.stock_status)}</StatusBadge></td>
                        <td>
                          <div className="admin-badge-row">
                            {product.is_new && <StatusBadge variant="success">جديد</StatusBadge>}
                            {product.is_offer && <StatusBadge variant="danger">عرض</StatusBadge>}
                            {product.is_best_seller && <StatusBadge variant="warning">الأكثر مبيعاً</StatusBadge>}
                          </div>
                        </td>
                        <td><span className={`admin-fake-switch ${product.is_active ? "is-on" : ""}`} /></td>
                        <td>
                          <div className="admin-inline-actions">
                            <AdminIconButton icon={Edit3} onClick={() => editProduct(product)}>تعديل</AdminIconButton>
                            <AdminIconButton icon={Trash2} variant="danger" onClick={() => removeProduct(product.id)}>حذف</AdminIconButton>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="admin-product-card-list">
                {visibleProducts.map((product) => (
                  <article className="admin-mobile-product-card" key={product.id}>
                    <div className="admin-mobile-product-head">
                      <span className="admin-product-thumb">
                        {getProductImage(product) ? <img src={getProductImage(product)} alt="" /> : <Package size={18} />}
                      </span>
                      <div>
                        <h3>{product.name}</h3>
                        <p>{product.category?.name || "بدون تصنيف"}</p>
                      </div>
                    </div>
                    <div className="admin-badge-row">
                      <StatusBadge variant={product.stock_status === "available" ? "success" : product.stock_status === "out_of_stock" ? "danger" : "warning"}>{getStockLabel(product.stock_status)}</StatusBadge>
                      {product.is_offer && <StatusBadge variant="danger">عرض</StatusBadge>}
                      {product.is_new && <StatusBadge variant="success">جديد</StatusBadge>}
                      {product.is_best_seller && <StatusBadge variant="warning">الأكثر مبيعاً</StatusBadge>}
                    </div>
                    <div className="admin-mobile-product-price">
                      <strong>{product.is_price_visible ? formatUsd(product.price_usd) : "السعر مخفي"}</strong>
                      <small>{product.is_price_visible ? formatSyp(product.price_usd, exchangeRate) : "—"}</small>
                    </div>
                    <div className="admin-mobile-product-foot">
                      <span className={`admin-fake-switch ${product.is_active ? "is-on" : ""}`} />
                      <span>{product.is_active ? "مفعل" : "غير مفعل"}</span>
                      <div className="admin-inline-actions">
                        <AdminIconButton icon={Edit3} onClick={() => editProduct(product)}>تعديل</AdminIconButton>
                        <AdminIconButton icon={Trash2} variant="danger" onClick={() => removeProduct(product.id)}>حذف</AdminIconButton>
                      </div>
                    </div>
                  </article>
                ))}
              </div>

              {filteredProducts.length === 0 && (
                <div className="admin-empty-inline">لا توجد منتجات مطابقة للفلاتر الحالية.</div>
              )}

              {filteredProducts.length > PRODUCTS_VISIBLE_STEP && (
                <div className="admin-list-load-more">
                  <span>يتم عرض {visibleProducts.length} من {filteredProducts.length} منتج</span>
                  {hasMoreProducts ? (
                    <button type="button" onClick={() => setVisibleProductsCount((count) => count + PRODUCTS_VISIBLE_STEP)}>
                      عرض المزيد
                    </button>
                  ) : (
                    <button type="button" onClick={() => setVisibleProductsCount(PRODUCTS_VISIBLE_STEP)}>
                      عرض أقل
                    </button>
                  )}
                </div>
              )}
            </AdminPanel>
          </>
        )}

        {activeTab === "categories" && (
          <>
            <div className="admin-section-toolbar">
              <AdminActionButton icon={Plus} onClick={openNewCategory}>إضافة تصنيف</AdminActionButton>
            </div>
            <AdminPanel>
              <div className="admin-table-wrap admin-simple-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>الاسم</th>
                      <th>عدد المنتجات</th>
                      <th>الترتيب</th>
                      <th>الحالة</th>
                      <th>إجراءات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {categories.map((category) => (
                      <tr key={category.id}>
                        <td><strong>{category.name}</strong></td>
                        <td><StatusBadge>{category.products_count ?? 0}</StatusBadge></td>
                        <td>{category.order}</td>
                        <td><span className={`admin-fake-switch ${category.is_active ? "is-on" : ""}`} /></td>
                        <td>
                          <div className="admin-inline-actions">
                            <AdminIconButton icon={Edit3} onClick={() => editCategory(category)}>تعديل</AdminIconButton>
                            <AdminIconButton icon={Trash2} variant="danger" onClick={() => removeCategory(category.id)}>حذف</AdminIconButton>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </AdminPanel>
          </>
        )}

        {activeTab === "settings" && settings && (
          <form className="admin-stacked-form" onSubmit={saveSettings}>
            <div className="admin-section-toolbar">
              <button className="admin-submit admin-save-top" disabled={saving} type="submit">
                <Save size={18} />
                حفظ جميع الإعدادات
              </button>
            </div>

            <AdminPanel title="هوية الموقع">
              <div className="admin-form admin-form-grid">
                <Field label="اسم الموقع">
                  <input value={settingsForm.site_name} onChange={(event) => setSettingsForm({ ...settingsForm, site_name: event.target.value })} />
                </Field>
                <Field label="الاسم الإنكليزي">
                  <input value={settingsForm.english_name} onChange={(event) => setSettingsForm({ ...settingsForm, english_name: event.target.value })} />
                </Field>
                <Field label="الاسم المختصر">
                  <input value={settingsForm.short_name} onChange={(event) => setSettingsForm({ ...settingsForm, short_name: event.target.value })} />
                </Field>
                <Field label="الشعار النصي">
                  <input value={settingsForm.tagline} onChange={(event) => setSettingsForm({ ...settingsForm, tagline: event.target.value })} />
                </Field>
                <FileField label="شعار الموقع" hint="PNG شفاف، 400×120 بكسل" onChange={(event) => setSettingsForm({ ...settingsForm, logoFile: event.target.files?.[0] || null })} />
                <FileField label="أيقونة التطبيق" hint="مربع 512×512 بكسل" onChange={(event) => setSettingsForm({ ...settingsForm, appIconFile: event.target.files?.[0] || null })} />
              </div>
            </AdminPanel>

            <AdminPanel title="معلومات التواصل والكتالوج">
              <div className="admin-form admin-form-grid">
                <Field label="رقم الواتساب">
                  <input value={settingsForm.whatsapp_number} onChange={(event) => setSettingsForm({ ...settingsForm, whatsapp_number: event.target.value })} />
                </Field>
                <Field label="رابط فيسبوك">
                  <input value={settingsForm.facebook_url} onChange={(event) => setSettingsForm({ ...settingsForm, facebook_url: event.target.value })} />
                </Field>
                <Field label="الموقع المختصر">
                  <input value={settingsForm.location} onChange={(event) => setSettingsForm({ ...settingsForm, location: event.target.value })} />
                </Field>
                <Field label="رابط الخريطة">
                  <input value={settingsForm.map_url} onChange={(event) => setSettingsForm({ ...settingsForm, map_url: event.target.value })} />
                </Field>
                <Field label="سعر الصرف">
                  <input value={settingsForm.exchange_rate} onChange={(event) => setSettingsForm({ ...settingsForm, exchange_rate: event.target.value })} type="number" min="1" />
                </Field>
                <Field label="عدد المنتجات في الصفحة">
                  <input value={settingsForm.products_page_size} onChange={(event) => setSettingsForm({ ...settingsForm, products_page_size: event.target.value })} type="number" min="1" />
                </Field>
                <Field label="ملاحظة الشحن">
                  <input value={settingsForm.shipping_note} onChange={(event) => setSettingsForm({ ...settingsForm, shipping_note: event.target.value })} />
                </Field>
                <Field label="العنوان التفصيلي" className="admin-field-wide">
                  <textarea value={settingsForm.address} onChange={(event) => setSettingsForm({ ...settingsForm, address: event.target.value })} rows="3" />
                </Field>
              </div>
            </AdminPanel>

            <AdminPanel title="صور الواجهة الرئيسية">
              <div className="admin-form admin-form-grid">
                <FileField label="صورة هيرو ثابتة للديسكتوب" hint="يفضل 1920×800" onChange={(event) => setSettingsForm({ ...settingsForm, staticHeroDesktopFile: event.target.files?.[0] || null })} />
                <FileField label="صورة هيرو ثابتة للجوال" hint="يفضل 1080×1350" onChange={(event) => setSettingsForm({ ...settingsForm, staticHeroMobileFile: event.target.files?.[0] || null })} />
              </div>
            </AdminPanel>

            <AdminPanel title="إظهار أقسام الصفحة الرئيسية">
              <div className="admin-switch-grid">
                <BooleanField label="إظهار الهيرو" checked={settingsForm.show_hero_section} onChange={(value) => setSettingsForm({ ...settingsForm, show_hero_section: value })} />
                <BooleanField label="إظهار العروض" checked={settingsForm.show_offers_section} onChange={(value) => setSettingsForm({ ...settingsForm, show_offers_section: value })} />
                <BooleanField label="إظهار جديدنا" checked={settingsForm.show_new_products_section} onChange={(value) => setSettingsForm({ ...settingsForm, show_new_products_section: value })} />
                <BooleanField label="إظهار الأكثر طلباً" checked={settingsForm.show_best_sellers_section} onChange={(value) => setSettingsForm({ ...settingsForm, show_best_sellers_section: value })} />
                <BooleanField label="إظهار التصنيفات" checked={settingsForm.show_categories_section} onChange={(value) => setSettingsForm({ ...settingsForm, show_categories_section: value })} />
              </div>
            </AdminPanel>
          </form>
        )}

        {activeTab === "payments" && paymentSettings && (
          <form className="admin-stacked-form" onSubmit={savePaymentSettings}>
            <div className="admin-section-toolbar">
              <button className="admin-submit admin-save-top" disabled={saving} type="submit">
                <Save size={18} />
                حفظ الإعدادات
              </button>
            </div>

            <AdminPanel className="admin-payment-card">
              <div className="admin-payment-head">
                <h2>الدفع عند الاستلام (Cash on Delivery)</h2>
                <BooleanField label="" checked={paymentForm.cash_enabled} onChange={(value) => setPaymentForm({ ...paymentForm, cash_enabled: value })} />
              </div>
              <Field label="وصف طريقة الدفع">
                <input value={paymentForm.cash_description} onChange={(event) => setPaymentForm({ ...paymentForm, cash_description: event.target.value })} />
              </Field>
            </AdminPanel>

            <AdminPanel className="admin-payment-card">
              <div className="admin-payment-head">
                <h2>شام كاش</h2>
                <BooleanField label="" checked={paymentForm.sham_cash_enabled} onChange={(value) => setPaymentForm({ ...paymentForm, sham_cash_enabled: value })} />
              </div>
              <div className="admin-form admin-form-grid">
                <Field label="اسم طريقة الدفع">
                  <input value={paymentForm.sham_cash_label} onChange={(event) => setPaymentForm({ ...paymentForm, sham_cash_label: event.target.value })} />
                </Field>
                <Field label="الوصف" className="admin-field-wide">
                  <input value={paymentForm.sham_cash_description} onChange={(event) => setPaymentForm({ ...paymentForm, sham_cash_description: event.target.value })} />
                </Field>
                <FileField label="صورة QR كود الدفع" hint="صورة صريحة لـ QR كود" onChange={(event) => setPaymentForm({ ...paymentForm, sham_cash_qrFile: event.target.files?.[0] || null })} />
              </div>
            </AdminPanel>

            <AdminPanel className="admin-payment-card">
              <div className="admin-payment-head">
                <h2>الطلب عبر واتساب</h2>
                <BooleanField label="" checked={paymentForm.whatsapp_enabled} onChange={(value) => setPaymentForm({ ...paymentForm, whatsapp_enabled: value })} />
              </div>
              <Field label="وصف الطلب عبر واتساب">
                <input value={paymentForm.whatsapp_description} onChange={(event) => setPaymentForm({ ...paymentForm, whatsapp_description: event.target.value })} />
              </Field>
            </AdminPanel>
          </form>
        )}

        {activeTab === "hero" && (
          <>
            <div className="admin-section-toolbar">
              <AdminActionButton icon={Plus} onClick={openNewHeroSlide}>إضافة شريحة</AdminActionButton>
            </div>
            <div className="admin-preview-grid">
              {heroSlides.map((slide) => (
                <article className="admin-hero-preview-card" key={slide.id}>
                  <div className="admin-hero-preview-visual" style={getPreviewImage(slide) ? { backgroundImage: `linear-gradient(90deg, rgba(7,26,51,.2), rgba(7,26,51,.82)), url(${getPreviewImage(slide)})` } : undefined}>
                    <span className="admin-mobile-badge"><ImageIcon size={15} /> جوال</span>
                    <small>{slide.eyebrow || "وصل حديثاً"}</small>
                    <h3>{slide.title}</h3>
                  </div>
                  <p>{slide.text}</p>
                  <div className="admin-preview-foot">
                    <span className={`admin-fake-switch ${slide.is_active ? "is-on" : ""}`} />
                    <small>#{slide.order}</small>
                    <div className="admin-inline-actions">
                      <AdminIconButton icon={Edit3} onClick={() => editHeroSlide(slide)}>تعديل</AdminIconButton>
                      <AdminIconButton icon={Trash2} variant="danger" onClick={() => removeHeroSlide(slide.id)}>حذف</AdminIconButton>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </>
        )}

        {activeTab === "offers" && (
          <>
            <div className="admin-section-toolbar">
              <AdminActionButton icon={Plus} onClick={openNewOfferBanner}>إضافة بنر</AdminActionButton>
            </div>
            <div className="admin-preview-grid admin-banners-grid">
              {offerBanners.map((banner) => (
                <article className="admin-banner-preview-card" key={banner.id}>
                  <div className="admin-banner-preview-visual" style={getPreviewImage(banner) ? { backgroundImage: `linear-gradient(90deg, rgba(7,26,51,.22), rgba(7,26,51,.88)), url(${getPreviewImage(banner)})` } : undefined}>
                    <h3>{banner.title}</h3>
                    <p>{banner.subtitle}</p>
                    {banner.link_label && <span>{banner.link_label}</span>}
                  </div>
                  <div className="admin-preview-foot">
                    <span className={`admin-fake-switch ${banner.is_active ? "is-on" : ""}`} />
                    <small>{banner.link_url || "بدون رابط"}</small>
                    <div className="admin-inline-actions">
                      <AdminIconButton icon={Edit3} onClick={() => editOfferBanner(banner)}>تعديل</AdminIconButton>
                      <AdminIconButton icon={Trash2} variant="danger" onClick={() => removeOfferBanner(banner.id)}>حذف</AdminIconButton>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </>
        )}
      </main>

      <AdminFormSheet
        open={formPanel === "product"}
        title={editingProductId ? "تعديل منتج" : "إضافة منتج"}
        subtitle="املأ بيانات المنتج ثم اضغط حفظ. الصورة اختيارية عند التعديل."
        onClose={closeFormPanel}
      >
        {renderProductForm()}
      </AdminFormSheet>

      <AdminFormSheet
        open={formPanel === "category"}
        title={editingCategoryId ? "تعديل تصنيف" : "إضافة تصنيف"}
        subtitle="التصنيف يظهر في الموقع وفي صفحة المنتجات."
        onClose={closeFormPanel}
      >
        {renderCategoryForm()}
      </AdminFormSheet>

      <AdminFormSheet
        open={formPanel === "hero"}
        title={editingHeroId ? "تعديل شريحة الواجهة" : "إضافة شريحة واجهة"}
        subtitle="يفضل رفع صورة ديسكتوب وصورة جوال للحصول على أفضل نتيجة."
        onClose={closeFormPanel}
      >
        {renderHeroForm()}
      </AdminFormSheet>

      <AdminFormSheet
        open={formPanel === "offer"}
        title={editingOfferId ? "تعديل بنر عرض" : "إضافة بنر عرض"}
        subtitle="البنر يظهر ضمن أقسام العروض في الموقع."
        onClose={closeFormPanel}
      >
        {renderOfferForm()}
      </AdminFormSheet>
    </div>
  );
}

export default AdminDashboard;
