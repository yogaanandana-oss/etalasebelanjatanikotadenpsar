import { lazy, Suspense } from 'react'
import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, Navigate, useLocation } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AnimatePresence, motion } from 'framer-motion';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import ScrollToTop from './components/ScrollToTop';
import PointerEventsGuard from './components/PointerEventsGuard';
// Add page imports here
import Home from '@/pages/Home';
import Checkout from '@/pages/Checkout';
const AdminOrders = lazy(() => import('@/pages/AdminOrders'));
const AdminProducts = lazy(() => import('@/pages/AdminProducts'));
const AdminSettings = lazy(() => import('@/pages/AdminSettings'));
const AdminCalendar = lazy(() => import('@/pages/AdminCalendar'));
const AdminReviews = lazy(() => import('@/pages/AdminReviews'));
const AdminVouchers = lazy(() => import('@/pages/AdminVouchers'));
const AdminStockManagement = lazy(() => import('@/pages/AdminStockManagement'));
const AdminReports = lazy(() => import('@/pages/AdminReports'));
const AdminUsers = lazy(() => import('@/pages/AdminUsers'));
import LoyaltyProgram from '@/pages/LoyaltyProgram';
import OrderHistory from '@/pages/OrderHistory';
import FarmerPartners from '@/pages/FarmerPartners';
import QualityGuide from '@/pages/QualityGuide';
import Profile from '@/pages/Profile';
import ProductDetail from '@/pages/ProductDetail';
import ShoppingGuide from '@/pages/ShoppingGuide';
import ProtectedRoute from '@/components/ProtectedRoute';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import ForgotPassword from '@/pages/ForgotPassword';
import ResetPassword from '@/pages/ResetPassword';
import { CartProvider } from '@/lib/cartContext';
import CartDrawer from '@/components/marketplace/CartDrawer';
import { WishlistProvider } from '@/lib/wishlistContext';
import { SettingsProvider } from '@/lib/settingsContext';
import { CategoriesProvider } from '@/lib/categoriesContext';
import OrderTracking from '@/pages/OrderTracking';
import About from '@/pages/About';
import FAQ from '@/pages/FAQ';
import Wishlist from '@/pages/Wishlist';
import DeliveryAreas from '@/pages/DeliveryAreas';
import Contact from '@/pages/Contact';
import ReturnsPolicy from '@/pages/ReturnsPolicy';
import PaymentGuide from '@/pages/PaymentGuide';
import PrivacyPolicy from '@/pages/PrivacyPolicy';
import Blog from '@/pages/Blog';
import FarmerAssistant from '@/components/marketplace/FarmerAssistant';
import InstallPrompt from '@/components/marketplace/InstallPrompt';
import Locations from '@/pages/Locations';

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking app public settings or auth
  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Handle authentication errors
  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      // Redirect to login automatically
      navigateToLogin();
      return null;
    }
  }

  // Render the main app
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.18, ease: 'easeOut' }}
      >
      <Suspense fallback={<div className="fixed inset-0 flex items-center justify-center"><div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin" /></div>}>
      <Routes location={location}>
      {/* Add your page Route elements here */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/" element={<Home />} />
      <Route path="/checkout" element={<Checkout />} />
      <Route path="/product-details" element={<ProductDetail />} />
      <Route path="/shopping-guide" element={<ShoppingGuide />} />
      <Route path="/farmers" element={<Navigate to="/farmer-partners" replace />} />
      <Route path="/order-tracking" element={<OrderTracking />} />
      <Route path="/about" element={<About />} />
      <Route path="/faq" element={<FAQ />} />
      <Route path="/wishlist" element={<Wishlist />} />
      <Route path="/delivery-areas" element={<DeliveryAreas />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/returns-policy" element={<ReturnsPolicy />} />
      <Route path="/payment-guide" element={<PaymentGuide />} />
      <Route path="/privacy-policy" element={<PrivacyPolicy />} />
      <Route path="/locations" element={<Locations />} />
      <Route path="/blog" element={<Blog />} />
      <Route path="/loyalty-program" element={<LoyaltyProgram />} />
      <Route path="/order-history" element={<OrderHistory />} />
      <Route path="/farmer-partners" element={<FarmerPartners />} />
      <Route path="/quality-guide" element={<QualityGuide />} />
      <Route path="/profile" element={<Profile />} />
      <Route element={<ProtectedRoute unauthenticatedElement={<Navigate to="/login" replace />} />}>
        <Route path="/admin/orders" element={<AdminOrders />} />
        <Route path="/admin/products" element={<AdminProducts />} />
        <Route path="/admin/settings" element={<AdminSettings />} />
        <Route path="/admin/analytics" element={<Navigate to="/admin/reports" replace />} />
        <Route path="/admin/calendar" element={<AdminCalendar />} />
        <Route path="/admin/harvest-calendar" element={<AdminCalendar />} />
        <Route path="/admin/reviews" element={<AdminReviews />} />
        <Route path="/admin/vouchers" element={<AdminVouchers />} />
        <Route path="/admin/stock-management" element={<AdminStockManagement />} />
        <Route path="/admin/reports" element={<AdminReports />} />
        <Route path="/admin/users" element={<AdminUsers />} />
      </Route>
      <Route path="*" element={<PageNotFound />} />
      </Routes>
      </Suspense>
      </motion.div>
    </AnimatePresence>
  );
};

function App() {

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <ScrollToTop />
          <PointerEventsGuard />
          <CartProvider>
            <CartDrawer />
            <WishlistProvider>
              <SettingsProvider>
                <CategoriesProvider>
                  <AuthenticatedApp />
                </CategoriesProvider>
                <FarmerAssistant />
                <InstallPrompt />
              </SettingsProvider>
            </WishlistProvider>
          </CartProvider>
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App