import { useSearchParams } from "react-router-dom";
import { ProductGrid } from "../components/ProductCard.jsx";
import { Loading } from "../components/Feedback.jsx";
import { useLoad } from "../hooks/useLoad.js";

export default function SearchPage() {
  const [params] = useSearchParams();
  const query = params.get("q") || "";
  const { data: products, loading } = useLoad(`/products?q=${encodeURIComponent(query)}`, []);

  return <main className="page"><div className="page-heading"><div><p className="eyebrow">Nursery search</p><h1>Results for “{query}”</h1><p className="muted">{products.length} plants and growing essentials</p></div></div>{loading ? <Loading /> : <ProductGrid products={products} />}</main>;
}