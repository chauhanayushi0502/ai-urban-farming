import { Heart, Sprout, Truck } from "lucide-react";
import { Link } from "react-router-dom";
import { useLanguage } from "../i18n/LanguageContext.jsx";

export default function AboutPage() {
  const { t } = useLanguage();

  return (
    <main className="page story-page">
      <p className="eyebrow">{t("nav_story", "Our Story")}</p>
      <h1>{t("about_h1_1", "Good plants.")}<br /><em>{t("about_h1_2", "Thoughtful growing.")}</em></h1>
      <p className="story-lede">
        {t("about_lede", "We make it simple to bring nature closer to home with healthy indoor and outdoor plants, helpful care tools, and simple advice.")}
      </p>

      <div className="story-image" role="img" aria-label="Green nursery filled with thriving plants" />

      <div className="story-values">
        <article>
          <Sprout />
          <h2>{t("about_val1_title", "Thoughtfully Grown")}</h2>
          <p>{t("about_val1_desc", "Plants selected and cared for with their next home in mind.")}</p>
        </article>
        <article>
          <Heart />
          <h2>{t("about_val2_title", "Ready to Help")}</h2>
          <p>{t("about_val2_desc", "From first leaves to thriving garden beds, helpful guidance is part of the experience.")}</p>
        </article>
        <article>
          <Truck />
          <h2>{t("about_val3_title", "Nursery Packed")}</h2>
          <p>{t("about_val3_desc", "Carefully prepped plants and supplies, ready for a new corner of green.")}</p>
        </article>
      </div>

      <Link to="/shop" className="button">{t("hero_explore", "Explore collection")}</Link>
    </main>
  );
}