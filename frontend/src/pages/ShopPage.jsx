import { SlidersHorizontal } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { ProductGrid } from "../components/ProductCard.jsx";
import { Loading } from "../components/Feedback.jsx";
import { useLoad } from "../hooks/useLoad.js";

export default function ShopPage() {
  const [params, setParams] = useSearchParams();
  const selected = params.get("category") || "";
  const sort = params.get("sort") || "newest";
  const { data: categories } = useLoad("/categories", []);
  const { data: products, loading } = useLoad(`/products?category=${encodeURIComponent(selected)}&sort=${sort}`, []);
  const title = categories.find((item) => item._id === selected)?.name || "All plants";

  return <main className="page"><div className="page-heading"><div><p className="eyebrow">Made for growing</p><h1>{title}</h1><p className="muted">Find a new favorite for your space.</p></div><label className="sort-control"><SlidersHorizontal size={17} /><select value={sort} onChange={(event) => setParams((current) => { current.set("sort", event.target.value); return current; })}><option value="newest">Newest first</option><option value="low">Price: low to high</option><option value="high">Price: high to low</option><option value="name">Name: A to Z</option></select></label></div><div className="filter-row"><button className={!selected ? "filter-chip selected" : "filter-chip"} onClick={() => setParams({ sort })}>Everything</button>{categories.map((category) => <button key={category._id} className={selected === category._id ? "filter-chip selected" : "filter-chip"} onClick={() => setParams({ category: category._id, sort })}>{category.name}</button>)}</div>{loading ? <Loading /> : <ProductGrid products={products} />}</main>;
}