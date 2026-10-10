import { lazy, Suspense } from "react";
import { Route, Routes } from "react-router-dom";
import { Protected, AdminProtected } from "./components/Access.jsx";
import { Footer, Header, ToastMessage } from "./components/SiteLayout.jsx";
import { Loading, NotFound } from "./components/Feedback.jsx";
import AIAssistantChatbot from "./components/AIAssistantChatbot.jsx";
import { AppProvider, useApp } from "./context/AppContext.jsx";

const HomePage = lazy(() => import("./pages/HomePage.jsx"));
const ShopPage = lazy(() => import("./pages/ShopPage.jsx"));
const SearchPage = lazy(() => import("./pages/SearchPage.jsx"));
const ProductPage = lazy(() => import("./pages/ProductPage.jsx"));
const AuthPage = lazy(() => import("./pages/AuthPage.jsx"));
const ForgotPasswordPage = lazy(() => import("./pages/ForgotPasswordPage.jsx"));
const ResetPasswordPage = lazy(() => import("./pages/ResetPasswordPage.jsx"));
const VerifyEmailPage = lazy(() => import("./pages/VerifyEmailPage.jsx"));
const AboutPage = lazy(() => import("./pages/AboutPage.jsx"));
const ContactPage = lazy(() => import("./pages/ContactPage.jsx"));
const CartPage = lazy(() => import("./pages/CartPage.jsx"));
const CheckoutPage = lazy(() => import("./pages/CheckoutPage.jsx"));
const WishlistPage = lazy(() => import("./pages/WishlistPage.jsx"));
const ProfilePage = lazy(() => import("./pages/ProfilePage.jsx"));
const OrdersPage = lazy(() => import("./pages/OrdersPage.jsx"));
const GardenPage = lazy(() => import("./pages/GardenPage.jsx"));

const AdminCategories = lazy(() => import("./pages/admin/AdminCategories.jsx"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard.jsx"));
const AdminInventory = lazy(() => import("./pages/admin/AdminInventory.jsx"));
const AdminMessages = lazy(() => import("./pages/admin/AdminMessages.jsx"));
const AdminOrders = lazy(() => import("./pages/admin/AdminOrders.jsx"));
const AdminCoupons = lazy(() => import("./pages/admin/AdminCoupons.jsx"));
const AdminProducts = lazy(() => import("./pages/admin/AdminProducts.jsx"));
const AdminSettings = lazy(() => import("./pages/admin/AdminSettings.jsx"));

function AppRoutes() {
  const { toast } = useApp();
  return (
    <div className="app-frame">
      <Header />
      <Suspense fallback={<Loading />}>
        <Routes>
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
          <Route path="/garden" element={<GardenPage />} />
          <Route path="/calendar" element={<GardenPage initialTab="calendar" />} />
          <Route path="/care-calendar" element={<GardenPage initialTab="calendar" />} />
          <Route path="/admin" element={<AdminProtected><AdminDashboard /></AdminProtected>} />
          <Route path="/admin/products" element={<AdminProtected><AdminProducts /></AdminProtected>} />
          <Route path="/admin/categories" element={<AdminProtected><AdminCategories /></AdminProtected>} />
          <Route path="/admin/orders" element={<AdminProtected><AdminOrders /></AdminProtected>} />
          <Route path="/admin/coupons" element={<AdminProtected><AdminCoupons /></AdminProtected>} />
          <Route path="/admin/inventory" element={<AdminProtected><AdminInventory /></AdminProtected>} />
          <Route path="/admin/settings" element={<AdminProtected><AdminSettings /></AdminProtected>} />
          <Route path="/admin/messages" element={<AdminProtected><AdminMessages /></AdminProtected>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
      <Footer />
      <AIAssistantChatbot />
      <ToastMessage toast={toast} />
    </div>
  );
}

export default function AppRouter() {
  return <AppProvider><AppRoutes /></AppProvider>;
}