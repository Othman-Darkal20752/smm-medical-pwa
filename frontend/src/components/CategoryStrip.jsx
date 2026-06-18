function CategoryStrip({ categories, activeCategory, onChange }) {
  return (
    <section className="category-strip">
      {categories.map((category) => (
        <button
          key={category}
          className={activeCategory === category ? "active" : ""}
          onClick={() => onChange(category)}
        >
          {category}
        </button>
      ))}
    </section>
  );
}

export default CategoryStrip;