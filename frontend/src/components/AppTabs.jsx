function AppTabs({ tabs, activeTab, onChange }) {
  return (
    <section className="tabs">
      {tabs.map((tab) => (
        <button
          key={tab}
          className={activeTab === tab ? "active" : ""}
          onClick={() => onChange(tab)}
        >
          {tab}
        </button>
      ))}
    </section>
  );
}

export default AppTabs;