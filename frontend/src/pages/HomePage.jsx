import { ArrowRight, ArrowUpRight, Check, Sprout } from "lucide-react";
import { Link } from "react-router-dom";
import { ProductGrid } from "../components/ProductCard.jsx";
import { Loading } from "../components/Feedback.jsx";
import { useLoad } from "../hooks/useLoad.js";
import { imageSource } from "../lib/format.js";

export default function HomePage() {
  const { data: categories } = useLoad("/categories", []);
  const { data: products, loading } = useLoad("/products?limit=4&sort=newest", []);

  return <>
    <section className="hero-band"><div className="hero-copy"><p className="eyebrow"><Sprout size={15} /> A nursery for every kind of home</p><h1>Bring a little<br /><em>green</em> home.</h1><p>Thoughtful plants, simple care, and everything you need to help them thrive.</p><Link to="/shop" className="button">Explore the collection <ArrowRight size={17} /></Link><div className="hero-note"><span><Check size={15} /> Carefully grown</span><span><Check size={15} /> Friendly guidance</span></div></div><div className="hero-photo" role="img" aria-label="Colorful healthy tropical plants"><span className="photo-stamp">GROW<br />SLOW</span></div></section>
    <main className="page home-content">
      <div className="section-heading"><div><p className="eyebrow">Find your corner of green</p><h2>Shop by category</h2></div><Link className="text-link" to="/shop">View all plants <ArrowUpRight size={16} /></Link></div>
      <div className="category-row">{categories.map((category, index) => <Link key={category._id} to={`/shop?category=${category._id}`} className={`category-tile tile-${index % 4}`}><img src={imageSource(category.image || ["indoor.jpg", "outdoor.jpg", "floweringplant.jpg", "pots1.jpg"][index % 4])} alt="" /><span>{category.name}<ArrowUpRight size={16} /></span></Link>)}</div>
      <div className="section-heading featured-heading"><div><p className="eyebrow">Picked for your windowsill</p><h2>Fresh from the nursery</h2></div><Link className="text-link" to="/shop">Browse everything <ArrowUpRight size={16} /></Link></div>
      {loading ? <Loading /> : <ProductGrid products={products} />}
      <section className="care-strip"><div className="care-icon"><Sprout /></div><div><p className="eyebrow">Urban Gardening AI Assistant</p><h2>AI Disease Diagnosis & Smart Care</h2><p>Upload a leaf photo for instant disease detection, organic remedies, and weather-aware watering guidance.</p></div><Link className="button button-dark" to="/garden">Open AI Garden Doctor <ArrowRight size={17} /></Link></section>
    </main>
  </>;
}