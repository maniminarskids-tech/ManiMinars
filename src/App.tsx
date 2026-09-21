import React, { useEffect, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { ProductProvider } from './context/ProductContext';
import { CartProvider } from './context/CartContext';
import CartDrawer from './components/CartDrawer';
import FloatingWhatsApp from './components/FloatingWhatsApp';
import { ProtectedRoute } from './components/ProtectedRoute';

// Eagerly load primary storefront
import HomePage from './pages/HomePage';
import KidsPage from './pages/KidsPage';
import JuniorsPage from './pages/JuniorsPage';

// Lazy load secondary routes for high performance and low initial bundle size
const NewArrivalsPage = lazy(() => import('./pages/NewArrivalsPage'));
const SalePage = lazy(() => import('./pages/SalePage'));
const ProductDetailPage = lazy(() => import('./pages/ProductDetailPage'));
const CartPage = lazy(() => import('./pages/CartPage'));
const CheckoutPage = lazy(() => import('./pages/CheckoutPage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));
const MyOrdersPage = lazy(() => import('./pages/MyOrdersPage'));
const AdminPage = lazy(() => import('./pages/AdminPage'));

// Fallback spinner for lazy routes
function RouteLoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAF9F6]">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-3 border-neutral-200 border-t-[#E84D3D] rounded-full animate-spin" />
        <p className="text-xs font-semibold text-neutral-500 uppercase tracking-widest">
          Loading Mani Minars...
        </p>
      </div>
    </div>
  );
}

// Scroll to top helper when navigating routes
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

export default function App() {
  return (
    <ProductProvider>
      <CartProvider>
        <Router>
          <ScrollToTop />
          <Suspense fallback={<RouteLoadingFallback />}>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/kids" element={<KidsPage />} />
              <Route path="/juniors" element={<JuniorsPage />} />
              <Route path="/new-arrivals" element={<NewArrivalsPage />} />
              <Route path="/sale" element={<SalePage />} />
              <Route path="/product/:id" element={<ProductDetailPage />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/my-orders" element={<MyOrdersPage />} />
              <Route path="/orders" element={<MyOrdersPage />} />
              <Route path="/track-order" element={<MyOrdersPage />} />

              {/* Protected Admin Management Portal */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute>
                    <AdminPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/secret-admin"
                element={
                  <ProtectedRoute>
                    <AdminPage />
                  </ProtectedRoute>
                }
              />

              {/* Catch-all fallback */}
              <Route path="*" element={<HomePage />} />
            </Routes>
          </Suspense>
          <CartDrawer />
          <FloatingWhatsApp />
        </Router>
      </CartProvider>
    </ProductProvider>
  );
}
