import { ProductGrid } from "../components/ProductCard.jsx";
import { Loading } from "../components/Feedback.jsx";
import { useLoad } from "../hooks/useLoad.js";

export default function WishlistPage() {
  const { data: products, loading } = useLoad("/wishlist", []);
  return <main className="page"><div className="page-heading"><div><p className="eyebrow">Kept close</p><h1>Your wishlist</h1></div></div>{loading ? <Loading /> : <ProductGrid products={products} />}</main>;
}