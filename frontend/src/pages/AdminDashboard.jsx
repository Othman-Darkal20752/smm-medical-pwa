import { useEffect, useMemo, useState } from "react";
import { ArrowRight, Edit3, Plus, RefreshCw, Save, Trash2, X } from "lucide-react";

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
  { value: "products", label: "المنتجات" },
  { value: "categories", label: "التصنيفات" },
  { value: "settings", label: "إعدادات الموقع" },
  { value: "payments", label: "الدفع" },
  { value: "hero", label: "الهيرو" },
  { value: "offers", label: "بنرات العروض" },
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

function Field({ label, children }) {
  return (
    <label className="admin-field">
      <span>{label}</span>
      {children}
    </label>
  );
}

function BooleanField({ label, checked, onChange }) {
  return (
    <label className="admin-check">
      <input type="checkbox" checked={Boolean(checked)} onChange={(event) => onChange(event.target.checked)} />
      <span>{label}</span>
    </label>
  );
}

function AdminDashboard({ onBackToApp }) {
  const [adminToken, setAdminToken] = useState(() => getStoredAdminToken());
  const [tokenDraft, setTokenDraft] = useState(() => getStoredAdminToken());
  const [activeTab, setActiveTab] = useState("products");
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

  const [categoryForm, setCategoryForm] = useState(emptyCategoryForm);
  const [editingCategoryId, setEditingCategoryId] = useState(null);

  const [settingsForm, setSettingsForm] = useState(emptySettingsForm);
  const [paymentForm, setPaymentForm] = useState(emptyPaymentForm);

  const [heroForm, setHeroForm] = useState(emptyHeroForm);
  const [editingHeroId, setEditingHeroId] = useState(null);

  const [offerForm, setOfferForm] = useState(emptyOfferForm);
  const [editingOfferId, setEditingOfferId] = useState(null);

  const defaultCategoryId = categories[0]?.id || "";

  const stats = useMemo(
    () => ({
      total: products.length,
      newCount: products.filter((product) => product.is_new).length,
      offerCount: products.filter((product) => product.is_offer).length,
      bestCount: products.filter((product) => product.is_best_seller).length,
    }),
    [products]
  );

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

  const resetProductForm = () => {
    setEditingProductId(null);
    setProductForm(createEmptyProductForm(defaultCategoryId));
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
    window.scrollTo({ top: 0, behavior: "smooth" });
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

  if (!adminToken) {
    return (
      <div className="admin-shell" dir="rtl">
        <header className="admin-hero">
          {onBackToApp && (
            <button className="admin-back-btn" onClick={onBackToApp} type="button">
              <ArrowRight size={22} />
              رجوع للتطبيق
            </button>
          )}
          <div>
            <span>لوحة إدارة SMM</span>
            <h1>تسجيل دخول مؤقت للداشبورد</h1>
            <p>أدخل توكن الإدارة المؤقت لربط اللوحة بالباكند.</p>
          </div>
        </header>

        <form className="admin-card admin-token-card" onSubmit={handleTokenSubmit}>
          <Field label="Admin API Token">
            <input
              value={tokenDraft}
              onChange={(event) => setTokenDraft(event.target.value)}
              placeholder="مثال: dev-smm-admin-token"
              type="password"
            />
          </Field>
          {error && <p className="admin-error">{error}</p>}
          <button className="admin-submit" type="submit">
            <Save size={20} />
            دخول
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="admin-shell" dir="rtl">
      <header className="admin-hero">
        {onBackToApp && (
          <button className="admin-back-btn" onClick={onBackToApp} type="button">
            <ArrowRight size={22} />
            رجوع للتطبيق
          </button>
        )}

        <div>
          <span>لوحة إدارة SMM</span>
          <h1>داشبورد حقيقي مربوط بالباكند</h1>
          <p>إدارة المنتجات والتصنيفات والإعدادات والهيرو والعروض من قاعدة البيانات.</p>
        </div>

        <div className="admin-hero-actions">
          <button type="button" onClick={loadDashboard} disabled={loading || saving}>
            <RefreshCw size={18} />
            تحديث
          </button>
          <button type="button" onClick={logout}>
            <X size={18} />
            خروج
          </button>
        </div>
      </header>

      <section className="admin-stats">
        <article>
          <strong>{stats.total}</strong>
          <span>كل المنتجات</span>
        </article>
        <article>
          <strong>{stats.newCount}</strong>
          <span>جديدنا</span>
        </article>
        <article>
          <strong>{stats.offerCount}</strong>
          <span>العروض</span>
        </article>
        <article>
          <strong>{stats.bestCount}</strong>
          <span>الأكثر مبيعاً</span>
        </article>
      </section>

      <nav className="admin-tabs" aria-label="أقسام لوحة التحكم">
        {tabs.map((tab) => (
          <button
            className={activeTab === tab.value ? "active" : ""}
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            type="button"
          >
            {tab.label}
          </button>
        ))}
      </nav>

      {loading && <p className="admin-info">جار تحميل بيانات الداشبورد...</p>}
      {saving && <p className="admin-info">جار حفظ التغييرات...</p>}
      {notice && <p className="admin-success">{notice}</p>}
      {error && <p className="admin-error">{error}</p>}

      {activeTab === "products" && (
        <div className="admin-grid-layout">
          <section className="admin-card">
            <div className="admin-card-title">
              <h2>{editingProductId ? "تعديل منتج" : "إضافة منتج"}</h2>
              {editingProductId && (
                <button type="button" onClick={resetProductForm}>
                  <X size={18} />
                  إلغاء
                </button>
              )}
            </div>

            <form className="admin-form" onSubmit={saveProduct}>
              <Field label="اسم المنتج">
                <input
                  value={productForm.name}
                  onChange={(event) => setProductForm({ ...productForm, name: event.target.value })}
                  placeholder="مثال: جهاز قياس ضغط"
                />
              </Field>

              <Field label="التصنيف">
                <select
                  value={productForm.category_id}
                  onChange={(event) => setProductForm({ ...productForm, category_id: event.target.value })}
                >
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
                <select
                  value={productForm.stock_status}
                  onChange={(event) => setProductForm({ ...productForm, stock_status: event.target.value })}
                >
                  {stockOptions.map((option) => (
                    <option value={option.value} key={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="لون البطاقة">
                <select
                  value={productForm.color}
                  onChange={(event) => setProductForm({ ...productForm, color: event.target.value })}
                >
                  {colorOptions.map((option) => (
                    <option value={option.value} key={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="ترتيب المنتج">
                <input
                  value={productForm.order}
                  onChange={(event) => setProductForm({ ...productForm, order: event.target.value })}
                  type="number"
                  min="0"
                />
              </Field>

              <Field label="وصف المنتج">
                <textarea
                  value={productForm.description}
                  onChange={(event) => setProductForm({ ...productForm, description: event.target.value })}
                  rows="3"
                />
              </Field>

              <Field label="صورة المنتج">
                <input
                  accept="image/*"
                  onChange={(event) => setProductForm({ ...productForm, imageFile: event.target.files?.[0] || null })}
                  type="file"
                />
              </Field>

              <div className="admin-switches">
                <BooleanField
                  label="إظهار السعر"
                  checked={productForm.is_price_visible}
                  onChange={(value) => setProductForm({ ...productForm, is_price_visible: value })}
                />
                <BooleanField
                  label="جديد"
                  checked={productForm.is_new}
                  onChange={(value) => setProductForm({ ...productForm, is_new: value })}
                />
                <BooleanField
                  label="عرض"
                  checked={productForm.is_offer}
                  onChange={(value) => setProductForm({ ...productForm, is_offer: value })}
                />
                <BooleanField
                  label="الأكثر طلباً"
                  checked={productForm.is_best_seller}
                  onChange={(value) => setProductForm({ ...productForm, is_best_seller: value })}
                />
                <BooleanField
                  label="مفعل"
                  checked={productForm.is_active}
                  onChange={(value) => setProductForm({ ...productForm, is_active: value })}
                />
              </div>

              <button className="admin-submit" disabled={saving} type="submit">
                {editingProductId ? <Save size={20} /> : <Plus size={20} />}
                {editingProductId ? "حفظ التعديل" : "إضافة المنتج"}
              </button>
            </form>
          </section>

          <section className="admin-card">
            <div className="admin-card-title">
              <h2>قائمة المنتجات</h2>
              <span>{products.length} منتج ظاهر في الداشبورد</span>
            </div>

            <div className="admin-product-list">
              {products.map((product) => (
                <article className="admin-product-item" key={product.id}>
                  <div>
                    <h3>{product.name}</h3>
                    <p>
                      {product.category?.name || "بدون تصنيف"} · {product.price_usd ? `$${product.price_usd}` : "السعر عند الطلب"}
                    </p>
                    <div className="admin-flags">
                      {product.is_new && <span>جديد</span>}
                      {product.is_offer && <span>عرض</span>}
                      {product.is_best_seller && <span>الأكثر طلباً</span>}
                      {!product.is_active && <span>مخفي</span>}
                    </div>
                  </div>

                  <div className="admin-product-actions">
                    <button type="button" onClick={() => editProduct(product)}>
                      <Edit3 size={18} />
                    </button>
                    <button type="button" onClick={() => removeProduct(product.id)}>
                      <Trash2 size={18} />
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </div>
      )}

      {activeTab === "categories" && (
        <div className="admin-grid-layout">
          <section className="admin-card">
            <div className="admin-card-title">
              <h2>{editingCategoryId ? "تعديل تصنيف" : "إضافة تصنيف"}</h2>
              {editingCategoryId && (
                <button type="button" onClick={resetCategoryForm}>
                  <X size={18} />
                  إلغاء
                </button>
              )}
            </div>

            <form className="admin-form" onSubmit={saveCategory}>
              <Field label="اسم التصنيف">
                <input
                  value={categoryForm.name}
                  onChange={(event) => setCategoryForm({ ...categoryForm, name: event.target.value })}
                  placeholder="مثال: أجهزة الضغط"
                />
              </Field>
              <Field label="الترتيب">
                <input
                  value={categoryForm.order}
                  onChange={(event) => setCategoryForm({ ...categoryForm, order: event.target.value })}
                  type="number"
                  min="0"
                />
              </Field>
              <BooleanField
                label="مفعل"
                checked={categoryForm.is_active}
                onChange={(value) => setCategoryForm({ ...categoryForm, is_active: value })}
              />
              <button className="admin-submit" disabled={saving} type="submit">
                {editingCategoryId ? <Save size={20} /> : <Plus size={20} />}
                {editingCategoryId ? "حفظ التصنيف" : "إضافة التصنيف"}
              </button>
            </form>
          </section>

          <section className="admin-card">
            <div className="admin-card-title">
              <h2>التصنيفات</h2>
              <span>{categories.length} تصنيف</span>
            </div>
            <div className="admin-table-list">
              {categories.map((category) => (
                <article className="admin-row-item" key={category.id}>
                  <div>
                    <strong>{category.name}</strong>
                    <span>
                      ترتيب {category.order} · {category.products_count ?? 0} منتج · {category.is_active ? "مفعل" : "مخفي"}
                    </span>
                  </div>
                  <div className="admin-product-actions">
                    <button type="button" onClick={() => editCategory(category)}>
                      <Edit3 size={18} />
                    </button>
                    <button type="button" onClick={() => removeCategory(category.id)}>
                      <Trash2 size={18} />
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </div>
      )}

      {activeTab === "settings" && settings && (
        <section className="admin-card">
          <div className="admin-card-title">
            <h2>إعدادات الموقع</h2>
            <span>واتساب، فيسبوك، سعر الصرف، أقسام الصفحة الرئيسية</span>
          </div>

          <form className="admin-form admin-wide-form" onSubmit={saveSettings}>
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
            <Field label="ملاحظة الشحن">
              <input value={settingsForm.shipping_note} onChange={(event) => setSettingsForm({ ...settingsForm, shipping_note: event.target.value })} />
            </Field>
            <Field label="سعر الصرف">
              <input
                value={settingsForm.exchange_rate}
                onChange={(event) => setSettingsForm({ ...settingsForm, exchange_rate: event.target.value })}
                type="number"
                min="1"
              />
            </Field>
            <Field label="عدد المنتجات في الصفحة">
              <input
                value={settingsForm.products_page_size}
                onChange={(event) => setSettingsForm({ ...settingsForm, products_page_size: event.target.value })}
                type="number"
                min="1"
              />
            </Field>
            <Field label="العنوان التفصيلي">
              <textarea value={settingsForm.address} onChange={(event) => setSettingsForm({ ...settingsForm, address: event.target.value })} rows="3" />
            </Field>
            <Field label="الشعار">
              <input accept="image/*" onChange={(event) => setSettingsForm({ ...settingsForm, logoFile: event.target.files?.[0] || null })} type="file" />
            </Field>
            <Field label="أيقونة التطبيق">
              <input accept="image/*" onChange={(event) => setSettingsForm({ ...settingsForm, appIconFile: event.target.files?.[0] || null })} type="file" />
            </Field>
            <Field label="صورة هيرو ثابتة للديسكتوب">
              <input accept="image/*" onChange={(event) => setSettingsForm({ ...settingsForm, staticHeroDesktopFile: event.target.files?.[0] || null })} type="file" />
            </Field>
            <Field label="صورة هيرو ثابتة للجوال">
              <input accept="image/*" onChange={(event) => setSettingsForm({ ...settingsForm, staticHeroMobileFile: event.target.files?.[0] || null })} type="file" />
            </Field>

            <div className="admin-switches admin-switches-wide">
              <BooleanField label="إظهار الهيرو" checked={settingsForm.show_hero_section} onChange={(value) => setSettingsForm({ ...settingsForm, show_hero_section: value })} />
              <BooleanField label="إظهار العروض" checked={settingsForm.show_offers_section} onChange={(value) => setSettingsForm({ ...settingsForm, show_offers_section: value })} />
              <BooleanField label="إظهار جديدنا" checked={settingsForm.show_new_products_section} onChange={(value) => setSettingsForm({ ...settingsForm, show_new_products_section: value })} />
              <BooleanField label="إظهار الأكثر طلباً" checked={settingsForm.show_best_sellers_section} onChange={(value) => setSettingsForm({ ...settingsForm, show_best_sellers_section: value })} />
              <BooleanField label="إظهار التصنيفات" checked={settingsForm.show_categories_section} onChange={(value) => setSettingsForm({ ...settingsForm, show_categories_section: value })} />
            </div>

            <button className="admin-submit" disabled={saving} type="submit">
              <Save size={20} />
              حفظ إعدادات الموقع
            </button>
          </form>
        </section>
      )}

      {activeTab === "payments" && paymentSettings && (
        <section className="admin-card">
          <div className="admin-card-title">
            <h2>إعدادات الدفع</h2>
            <span>الدفع عند الاستلام، شام كاش، واتساب</span>
          </div>

          <form className="admin-form admin-wide-form" onSubmit={savePaymentSettings}>
            <BooleanField label="تفعيل الدفع عند الاستلام" checked={paymentForm.cash_enabled} onChange={(value) => setPaymentForm({ ...paymentForm, cash_enabled: value })} />
            <Field label="وصف الدفع عند الاستلام">
              <input value={paymentForm.cash_description} onChange={(event) => setPaymentForm({ ...paymentForm, cash_description: event.target.value })} />
            </Field>
            <BooleanField label="تفعيل شام كاش" checked={paymentForm.sham_cash_enabled} onChange={(value) => setPaymentForm({ ...paymentForm, sham_cash_enabled: value })} />
            <Field label="اسم طريقة الدفع">
              <input value={paymentForm.sham_cash_label} onChange={(event) => setPaymentForm({ ...paymentForm, sham_cash_label: event.target.value })} />
            </Field>
            <Field label="وصف شام كاش">
              <input value={paymentForm.sham_cash_description} onChange={(event) => setPaymentForm({ ...paymentForm, sham_cash_description: event.target.value })} />
            </Field>
            <Field label="QR شام كاش">
              <input accept="image/*" onChange={(event) => setPaymentForm({ ...paymentForm, sham_cash_qrFile: event.target.files?.[0] || null })} type="file" />
            </Field>
            <BooleanField label="تفعيل الطلب عبر واتساب" checked={paymentForm.whatsapp_enabled} onChange={(value) => setPaymentForm({ ...paymentForm, whatsapp_enabled: value })} />
            <Field label="وصف واتساب">
              <input value={paymentForm.whatsapp_description} onChange={(event) => setPaymentForm({ ...paymentForm, whatsapp_description: event.target.value })} />
            </Field>
            <button className="admin-submit" disabled={saving} type="submit">
              <Save size={20} />
              حفظ إعدادات الدفع
            </button>
          </form>
        </section>
      )}

      {activeTab === "hero" && (
        <div className="admin-grid-layout">
          <section className="admin-card">
            <div className="admin-card-title">
              <h2>{editingHeroId ? "تعديل شريحة" : "إضافة شريحة هيرو"}</h2>
              {editingHeroId && (
                <button type="button" onClick={resetHeroForm}>
                  <X size={18} />
                  إلغاء
                </button>
              )}
            </div>
            <form className="admin-form" onSubmit={saveHeroSlide}>
              <Field label="النص الصغير">
                <input value={heroForm.eyebrow} onChange={(event) => setHeroForm({ ...heroForm, eyebrow: event.target.value })} />
              </Field>
              <Field label="العنوان">
                <input value={heroForm.title} onChange={(event) => setHeroForm({ ...heroForm, title: event.target.value })} />
              </Field>
              <Field label="النص">
                <textarea value={heroForm.text} onChange={(event) => setHeroForm({ ...heroForm, text: event.target.value })} rows="3" />
              </Field>
              <Field label="الترتيب">
                <input value={heroForm.order} onChange={(event) => setHeroForm({ ...heroForm, order: event.target.value })} type="number" min="0" />
              </Field>
              <Field label="صورة الديسكتوب">
                <input accept="image/*" onChange={(event) => setHeroForm({ ...heroForm, desktopImageFile: event.target.files?.[0] || null })} type="file" />
              </Field>
              <Field label="صورة الجوال">
                <input accept="image/*" onChange={(event) => setHeroForm({ ...heroForm, mobileImageFile: event.target.files?.[0] || null })} type="file" />
              </Field>
              <BooleanField label="مفعلة" checked={heroForm.is_active} onChange={(value) => setHeroForm({ ...heroForm, is_active: value })} />
              <button className="admin-submit" disabled={saving} type="submit">
                {editingHeroId ? <Save size={20} /> : <Plus size={20} />}
                {editingHeroId ? "حفظ الشريحة" : "إضافة الشريحة"}
              </button>
            </form>
          </section>

          <section className="admin-card">
            <div className="admin-card-title">
              <h2>شرائح الهيرو</h2>
              <span>{heroSlides.length} شريحة</span>
            </div>
            <div className="admin-table-list">
              {heroSlides.map((slide) => (
                <article className="admin-row-item" key={slide.id}>
                  <div>
                    <strong>{slide.title}</strong>
                    <span>ترتيب {slide.order} · {slide.is_active ? "مفعلة" : "مخفية"}</span>
                  </div>
                  <div className="admin-product-actions">
                    <button type="button" onClick={() => editHeroSlide(slide)}>
                      <Edit3 size={18} />
                    </button>
                    <button type="button" onClick={() => removeHeroSlide(slide.id)}>
                      <Trash2 size={18} />
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </div>
      )}

      {activeTab === "offers" && (
        <div className="admin-grid-layout">
          <section className="admin-card">
            <div className="admin-card-title">
              <h2>{editingOfferId ? "تعديل بنر" : "إضافة بنر عرض"}</h2>
              {editingOfferId && (
                <button type="button" onClick={resetOfferForm}>
                  <X size={18} />
                  إلغاء
                </button>
              )}
            </div>
            <form className="admin-form" onSubmit={saveOfferBanner}>
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
              <Field label="صورة البنر">
                <input accept="image/*" onChange={(event) => setOfferForm({ ...offerForm, imageFile: event.target.files?.[0] || null })} type="file" />
              </Field>
              <BooleanField label="مفعل" checked={offerForm.is_active} onChange={(value) => setOfferForm({ ...offerForm, is_active: value })} />
              <button className="admin-submit" disabled={saving} type="submit">
                {editingOfferId ? <Save size={20} /> : <Plus size={20} />}
                {editingOfferId ? "حفظ البنر" : "إضافة البنر"}
              </button>
            </form>
          </section>

          <section className="admin-card">
            <div className="admin-card-title">
              <h2>بنرات العروض</h2>
              <span>{offerBanners.length} بنر</span>
            </div>
            <div className="admin-table-list">
              {offerBanners.map((banner) => (
                <article className="admin-row-item" key={banner.id}>
                  <div>
                    <strong>{banner.title}</strong>
                    <span>ترتيب {banner.order} · {banner.is_active ? "مفعل" : "مخفي"}</span>
                  </div>
                  <div className="admin-product-actions">
                    <button type="button" onClick={() => editOfferBanner(banner)}>
                      <Edit3 size={18} />
                    </button>
                    <button type="button" onClick={() => removeOfferBanner(banner.id)}>
                      <Trash2 size={18} />
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;
