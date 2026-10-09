import { ProductGrid } from "../components/ProductCard.jsx";
import { Loading } from "../components/Feedback.jsx";
import { useLoad } from "../hooks/useLoad.js";
import { useLanguage } from "../i18n/LanguageContext.jsx";

export default function WishlistPage() {
  const { t } = useLanguage();
  const { data: products, loading } = useLoad("/wishlist", []);

  return (
    <main className="page">
      <div className="page-heading">
        <div>
          <p className="eyebrow">{t("kept_close", "Kept Close")}</p>
          <h1>{t("nav_wishlist", "Your Wishlist")}</h1>
        </div>
      </div>
      {loading ? <Loading /> : <ProductGrid products={products} />}
    </main>
  );
}