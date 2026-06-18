function EmptyState({ onReset }) {
  return (
    <div className="empty-state">
      <h3>لا توجد منتجات مطابقة</h3>
      <p>جرّب البحث باسم آخر أو اختر تصنيفاً مختلفاً.</p>
      <button onClick={onReset}>إظهار كل المنتجات</button>
    </div>
  );
}

export default EmptyState;