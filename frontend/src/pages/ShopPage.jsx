import { SlidersHorizontal } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { ProductGrid } from "../components/ProductCard.jsx";
import { Loading } from "../components/Feedback.jsx";
import { useLoad } from "../hooks/useLoad.js";
import { useLanguage } from "../i18n/LanguageContext.jsx";

export default function ShopPage() {
  const { t } = useLanguage();
  const [params, setParams] = useSearchParams();
  const selected = params.get("category") || "";
  const sort = params.get("sort") || "newest";
  const { data: categories } = useLoad("/categories", []);
  const { data: products, loading } = useLoad(`/products?category=${encodeURIComponent(selected)}&sort=${sort}`, []);
  
  const title = categories.find((item) => item._id === selected)?.name || t("shop_all_plants", "All plants");

  return (
    <main className="page">
      <div className="page-heading">
        <div>
          <p className="eyebrow">{t("shop_eyebrow", "Grown with care")}</p>
          <h1>{title}</h1>
          <p className="muted">{t("shop_subtitle", "Find your new favorite plant for your space.")}</p>
        </div>
        <label className="sort-control">
          <SlidersHorizontal size={17} />
          <select 
            value={sort} 
            onChange={(event) => setParams((current) => { current.set("sort", event.target.value); return current; })}
          >
            <option value="newest">{t("sort_newest", "Newest first")}</option>
            <option value="low">{t("sort_price_low", "Price: Low to High")}</option>
            <option value="high">{t("sort_price_high", "Price: High to Low")}</option>
            <option value="name">{t("sort_name", "Name: A to Z")}</option>
          </select>
        </label>
      </div>

      <div className="filter-row">
        <button 
          className={!selected ? "filter-chip selected" : "filter-chip"} 
          onClick={() => setParams({ sort })}
        >
          {t("shop_all", "All")}
        </button>
        {categories.map((category) => (
          <button 
            key={category._id} 
            className={selected === category._id ? "filter-chip selected" : "filter-chip"} 
            onClick={() => setParams({ category: category._id, sort })}
          >
            {category.name}
          </button>
        ))}
      </div>

      {loading ? <Loading /> : <ProductGrid products={products} />}
    </main>
  );
}