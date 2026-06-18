import { useState } from "react";
import { ArrowRight, Edit3, Plus, Save, Trash2, X } from "lucide-react";

const toneOptions = [
  { value: "red", label: "أحمر" },
  { value: "blue", label: "أزرق" },
  { value: "cyan", label: "سماوي" },
  { value: "navy", label: "كحلي" },
];

const tagOptions = ["متوفر", "جديد", "عرض", "الأكثر مبيعاً"];

function createEmptyForm(defaultCategory) {
  return {
    name: "",
    category: defaultCategory || "أجهزة الضغط",
    price: "",
    tag: "متوفر",
    tone: "blue",
    is_new: false,
    is_offer: false,
    is_best_seller: false,
  };
}

function AdminDashboard({ products, setProducts, categoryOptions, onBackToApp }) {
  const [form, setForm] = useState(() => createEmptyForm(categoryOptions[0]));
  const [editingId, setEditingId] = useState(null);

  const stats = {
    total: products.length,
    newCount: products.filter((product) => product.is_new).length,
    offerCount: products.filter((product) => product.is_offer).length,
    bestCount: products.filter((product) => product.is_best_seller).length,
  };

  const updateField = (field, value) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const resetForm = () => {
    setForm(createEmptyForm(categoryOptions[0]));
    setEditingId(null);
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const cleanName = form.name.trim();
    const cleanPrice = form.price.trim();

    if (!cleanName || !cleanPrice) {
      alert("يرجى إدخال اسم المنتج والسعر.");
      return;
    }

    const payload = {
      ...form,
      name: cleanName,
      price: cleanPrice,
    };

    if (editingId) {
      setProducts((items) =>
        items.map((product) =>
          product.id === editingId ? { ...product, ...payload } : product
        )
      );
    } else {
      setProducts((items) => [
        {
          id: Date.now(),
          ...payload,
        },
        ...items,
      ]);
    }

    resetForm();
  };

  const handleEdit = (product) => {
    setEditingId(product.id);

    setForm({
      name: product.name,
      category: product.category,
      price: product.price,
      tag: product.tag,
      tone: product.tone,
      is_new: product.is_new,
      is_offer: product.is_offer,
      is_best_seller: product.is_best_seller,
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = (productId) => {
    const confirmed = window.confirm("هل تريد حذف هذا المنتج؟");

    if (!confirmed) return;

    setProducts((items) => items.filter((product) => product.id !== productId));

    if (editingId === productId) {
      resetForm();
    }
  };

  return (
    <div className="admin-shell" dir="rtl">
      <header className="admin-hero">
        <button className="admin-back-btn" onClick={onBackToApp}>
          <ArrowRight size={22} />
          رجوع للتطبيق
        </button>

        <div>
          <span>لوحة إدارة SMM</span>
          <h1>إدارة المنتجات والوسوم</h1>
          <p>
            هذه نسخة محلية مؤقتة قبل ربط الـ backend. أي تعديل يظهر مباشرة داخل
            واجهة التطبيق أثناء نفس الجلسة.
          </p>
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

      <section className="admin-card">
        <div className="admin-card-title">
          <h2>{editingId ? "تعديل منتج" : "إضافة منتج جديد"}</h2>

          {editingId && (
            <button type="button" onClick={resetForm}>
              <X size={18} />
              إلغاء التعديل
            </button>
          )}
        </div>

        <form className="admin-form" onSubmit={handleSubmit}>
          <label className="admin-field">
            <span>اسم المنتج</span>
            <input
              value={form.name}
              onChange={(event) => updateField("name", event.target.value)}
              placeholder="مثال: جهاز قياس ضغط رقمي"
            />
          </label>

          <label className="admin-field">
            <span>السعر</span>
            <input
              value={form.price}
              onChange={(event) => updateField("price", event.target.value)}
              placeholder="مثال: 285,000 ل.س"
            />
          </label>

          <label className="admin-field">
            <span>التصنيف</span>
            <select
              value={form.category}
              onChange={(event) => updateField("category", event.target.value)}
            >
              {categoryOptions.map((category) => (
                <option value={category} key={category}>
                  {category}
                </option>
              ))}
            </select>
          </label>

          <label className="admin-field">
            <span>الوسم الظاهر على الكرت</span>
            <select
              value={form.tag}
              onChange={(event) => updateField("tag", event.target.value)}
            >
              {tagOptions.map((tag) => (
                <option value={tag} key={tag}>
                  {tag}
                </option>
              ))}
            </select>
          </label>

          <label className="admin-field">
            <span>لون الكرت</span>
            <select
              value={form.tone}
              onChange={(event) => updateField("tone", event.target.value)}
            >
              {toneOptions.map((tone) => (
                <option value={tone.value} key={tone.value}>
                  {tone.label}
                </option>
              ))}
            </select>
          </label>

          <div className="admin-switches">
            <label>
              <input
                type="checkbox"
                checked={form.is_new}
                onChange={(event) => updateField("is_new", event.target.checked)}
              />
              جديدنا
            </label>

            <label>
              <input
                type="checkbox"
                checked={form.is_offer}
                onChange={(event) => updateField("is_offer", event.target.checked)}
              />
              عرض
            </label>

            <label>
              <input
                type="checkbox"
                checked={form.is_best_seller}
                onChange={(event) =>
                  updateField("is_best_seller", event.target.checked)
                }
              />
              الأكثر مبيعاً
            </label>
          </div>

          <button className="admin-submit" type="submit">
            {editingId ? <Save size={20} /> : <Plus size={20} />}
            {editingId ? "حفظ التعديل" : "إضافة المنتج"}
          </button>
        </form>
      </section>

      <section className="admin-card">
        <div className="admin-card-title">
          <h2>قائمة المنتجات</h2>
          <span>{products.length} منتج</span>
        </div>

        <div className="admin-product-list">
          {products.map((product) => (
            <article className="admin-product-item" key={product.id}>
              <div>
                <h3>{product.name}</h3>
                <p>
                  {product.category} · {product.price}
                </p>

                <div className="admin-flags">
                  {product.is_new && <span>جديدنا</span>}
                  {product.is_offer && <span>عرض</span>}
                  {product.is_best_seller && <span>الأكثر مبيعاً</span>}

                  {!product.is_new &&
                    !product.is_offer &&
                    !product.is_best_seller && <span>منتج عادي</span>}
                </div>
              </div>

              <div className="admin-product-actions">
                <button type="button" onClick={() => handleEdit(product)}>
                  <Edit3 size={18} />
                </button>

                <button type="button" onClick={() => handleDelete(product.id)}>
                  <Trash2 size={18} />
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

export default AdminDashboard;