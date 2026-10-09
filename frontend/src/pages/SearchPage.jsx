import { useSearchParams } from "react-router-dom";
import { ProductGrid } from "../components/ProductCard.jsx";
import { Loading } from "../components/Feedback.jsx";
import { useLoad } from "../hooks/useLoad.js";

export default function SearchPage() {
  const [params] = useSearchParams();
  const query = params.get("q") || "";
  const { data: products, loading } = useLoad(`/products?q=${encodeURIComponent(query)}`, []);

  return <main className="page"><div className="page-heading"><div><p className="eyebrow">નર્સરી શોધો</p><h1>“{query}” માટે પરિણામો</h1><p className="muted">{products.length} છોડ અને ઉછેર માટે જરૂરી વસ્તુઓ</p></div></div>{loading ? <Loading /> : <ProductGrid products={products} />}</main>;
}