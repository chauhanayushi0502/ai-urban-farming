import { ArrowRight, ArrowUpRight, Check, Sprout } from "lucide-react";
import { Link } from "react-router-dom";
import { ProductGrid } from "../components/ProductCard.jsx";
import { Loading } from "../components/Feedback.jsx";
import { useLoad } from "../hooks/useLoad.js";
import { imageSource } from "../lib/format.js";
import { useLanguage } from "../i18n/LanguageContext.jsx";

export default function HomePage() {
  const { t } = useLanguage();
  const { data: categories } = useLoad("/categories", []);
  const { data: products, loading } = useLoad("/products?limit=4&sort=newest", []);

  return (
    <>
      <section className="hero-band">
        <div className="hero-copy">
          <p className="eyebrow"><Sprout size={15} /> {t("hero_eyebrow", "A nursery for every kind of home")}</p>
          <h1>
            {t("hero_h1_line1", "Bring a little")}<br />
            <em>{t("hero_h1_line2", "green home.")}</em>
          </h1>
          <p>{t("hero_desc", "Thoughtful plants, simple care, and everything you need to help them thrive.")}</p>
          <Link to="/shop" className="button">
            {t("hero_explore", "Explore the collection")} <ArrowRight size={17} />
          </Link>
          <div className="hero-note">
            <span><Check size={15} /> {t("hero_note1", "Carefully grown")}</span>
            <span><Check size={15} /> {t("hero_note2", "Friendly guidance")}</span>
          </div>
        </div>
        <div className="hero-photo" role="img" aria-label="Plants banner">
          <span className="photo-stamp">{t("hero_stamp1", "GROW")}<br />{t("hero_stamp2", "SLOW")}</span>
        </div>
      </section>

      <main className="page home-content">
        <div className="section-heading">
          <div>
            <p className="eyebrow">{t("cat_eyebrow", "Find your corner of green")}</p>
            <h2>{t("cat_h2", "Shop by category")}</h2>
          </div>
          <Link className="text-link" to="/shop">
            {t("cat_view_all", "View all plants")} <ArrowUpRight size={16} />
          </Link>
        </div>

        <div className="category-row">
          {categories.map((category, index) => (
            <Link key={category._id} to={`/shop?category=${category._id}`} className={`category-tile tile-${index % 4}`}>
              <img src={imageSource(category.image || ["indoor.jpg", "outdoor.jpg", "floweringplant.jpg", "pots1.jpg"][index % 4])} alt={category.name} />
              <span>{category.name}<ArrowUpRight size={16} /></span>
            </Link>
          ))}
        </div>

        <div className="section-heading featured-heading">
          <div>
            <p className="eyebrow">{t("fresh_eyebrow", "Picked for your windowsill")}</p>
            <h2>{t("fresh_h2", "Fresh from the nursery")}</h2>
          </div>
          <Link className="text-link" to="/shop">
            {t("fresh_browse", "Browse everything")} <ArrowUpRight size={16} />
          </Link>
        </div>

        {loading ? <Loading /> : <ProductGrid products={products} />}

        <section className="care-strip">
          <div className="care-icon"><Sprout /></div>
          <div>
            <p className="eyebrow">{t("ai_banner_eyebrow", "Urban Gardening AI Assistant")}</p>
            <h2>{t("ai_banner_h2", "AI Disease Diagnosis & Smart Plant Care")}</h2>
            <p>{t("ai_banner_desc", "Upload leaf photo for instant plant disease identification, organic remedies, and daily weather care tips.")}</p>
          </div>
          <Link className="button button-dark" to="/garden">
            {t("ai_banner_btn", "Open AI Garden Doctor")} <ArrowRight size={17} />
          </Link>
        </section>
      </main>
    </>
  );
}