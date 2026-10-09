import { Route, Routes } from "react-router-dom";
import { Protected, AdminProtected } from "./components/Access.jsx";
import { Footer, Header, ToastMessage } from "./components/SiteLayout.jsx";
import { NotFound } from "./components/Feedback.jsx";
import { AppProvider, useApp } from "./context/AppContext.jsx";
import AboutPage from "./pages/AboutPage.jsx";
import AuthPage from "./pages/AuthPage.jsx";
import CartPage from "./pages/CartPage.jsx";
import CheckoutPage from "./pages/CheckoutPage.jsx";
import ContactPage from "./pages/ContactPage.jsx";
import ForgotPasswordPage from "./pages/ForgotPasswordPage.jsx";
import HomePage from "./pages/HomePage.jsx";
import OrdersPage from "./pages/OrdersPage.jsx";
import PlantReviewPage from "./pages/PlantReviewPage.jsx";
import GardenPage from "./pages/GardenPage.jsx";
import ProductPage from "./pages/ProductPage.jsx";
import ProfilePage from "./pages/ProfilePage.jsx";
import ResetPasswordPage from "./pages/ResetPasswordPage.jsx";
import SearchPage from "./pages/SearchPage.jsx";
import ShopPage from "./pages/ShopPage.jsx";
import WishlistPage from "./pages/WishlistPage.jsx";
import VerifyEmailPage from "./pages/VerifyEmailPage.jsx";
import AdminCategories from "./pages/admin/AdminCategories.jsx";
import AdminDashboard from "./pages/admin/AdminDashboard.jsx";
import AdminInventory from "./pages/admin/AdminInventory.jsx";
import AdminMessages from "./pages/admin/AdminMessages.jsx";
import AdminOrders from "./pages/admin/AdminOrders.jsx";
import AdminProducts from "./pages/admin/AdminProducts.jsx";
import AdminSettings from "./pages/admin/AdminSettings.jsx";

function AppRoutes() {
  const { toast } = useApp();
  return <div className="app-frame"><Header /><Routes>
    <Route path="/" element={<HomePage />} />
    <Route path="/shop" element={<ShopPage />} />
    <Route path="/search" element={<SearchPage />} />
    <Route path="/products/:id" element={<ProductPage />} />
    <Route path="/login" element={<AuthPage mode="login" />} />
    <Route path="/register" element={<AuthPage mode="register" />} />
    <Route path="/forgot-password" element={<ForgotPasswordPage />} />
    <Route path="/reset-password" element={<ResetPasswordPage />} />
    <Route path="/verify-email" element={<VerifyEmailPage />} />
    <Route path="/about" element={<AboutPage />} />
    <Route path="/contact" element={<ContactPage />} />
    <Route path="/cart" element={<Protected><CartPage /></Protected>} />
    <Route path="/checkout" element={<Protected><CheckoutPage /></Protected>} />
    <Route path="/wishlist" element={<Protected><WishlistPage /></Protected>} />
    <Route path="/profile" element={<Protected><ProfilePage /></Protected>} />
    <Route path="/orders" element={<Protected><OrdersPage /></Protected>} />
    <Route path="/garden" element={<GardenPage />} />
    <Route path="/plant-review" element={<GardenPage />} />
    <Route path="/admin" element={<AdminProtected><AdminDashboard /></AdminProtected>} />
    <Route path="/admin/products" element={<AdminProtected><AdminProducts /></AdminProtected>} />
    <Route path="/admin/categories" element={<AdminProtected><AdminCategories /></AdminProtected>} />
    <Route path="/admin/orders" element={<AdminProtected><AdminOrders /></AdminProtected>} />
    <Route path="/admin/inventory" element={<AdminProtected><AdminInventory /></AdminProtected>} />
    <Route path="/admin/settings" element={<AdminProtected><AdminSettings /></AdminProtected>} />
    <Route path="/admin/messages" element={<AdminProtected><AdminMessages /></AdminProtected>} />
    <Route path="*" element={<NotFound />} />
  </Routes><Footer /><ToastMessage toast={toast} /></div>;
}

export default function AppRouter() {
  return <AppProvider><AppRoutes /></AppProvider>;
}