import { useSearchParams } from "react-router-dom";
import { ProductGrid } from "../components/ProductCard.jsx";
import { Loading } from "../components/Feedback.jsx";
import { useLoad } from "../hooks/useLoad.js";
import { useLanguage } from "../i18n/LanguageContext.jsx";

export default function SearchPage() {
  const [params] = useSearchParams();
  const { t } = useLanguage();
  const query = params.get("q") || "";
  const { data: products, loading } = useLoad(`/products?q=${encodeURIComponent(query)}`, []);

  return (
    <main className="page">
      <div className="page-heading">
        <div>
          <p className="eyebrow">{t("nursery_search", "Nursery Search")}</p>
          <h1>{t("results_for", "Results for")} “{query}”</h1>
          <p className="muted">{products.length} {t("plants_found_sub", "plants and growing supplies found")}</p>
        </div>
      </div>
      {loading ? <Loading /> : <ProductGrid products={products} />}
    </main>
  );
}