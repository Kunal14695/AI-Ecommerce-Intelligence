import React, { useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { CompareProvider } from './context/CompareContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import CompareTray from './components/CompareTray';
import AuthModal from './components/AuthModal';

// Pages
import HomePage from './pages/HomePage';
import ProductListPage from './pages/ProductListPage';
import ProductDetailPage from './pages/ProductDetailPage';
import ComparePage from './pages/ComparePage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderConfirmationPage from './pages/OrderConfirmationPage';
import OrdersPage from './pages/OrdersPage';
import AdminDashboardPage from './pages/AdminDashboardPage';

function AppContent() {
  const [currentPage, setCurrentPage] = useState('home');
  const [pageParams, setPageParams] = useState({});
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState(null);

  const navigateTo = (page, params = {}) => {
    setCurrentPage(page);
    setPageParams(params);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectProduct = (productId) => {
    navigateTo('detail', { productId });
  };

  const handleOrderPlaced = (orderData) => {
    setConfirmedOrder(orderData);
    navigateTo('order-confirmation');
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar
        activePage={currentPage}
        onNavigate={navigateTo}
        onOpenAuth={() => setAuthModalOpen(true)}
      />

      <main style={{ flex: 1 }}>
        {currentPage === 'home' && (
          <HomePage
            onNavigate={navigateTo}
            onSelectProduct={handleSelectProduct}
          />
        )}

        {currentPage === 'products' && (
          <ProductListPage
            initialCategory={pageParams.category_id}
            searchQuery={pageParams.q}
            onSelectProduct={handleSelectProduct}
          />
        )}

        {currentPage === 'search' && (
          <ProductListPage
            searchQuery={pageParams.q}
            onSelectProduct={handleSelectProduct}
          />
        )}

        {currentPage === 'detail' && (
          <ProductDetailPage
            productId={pageParams.productId}
            onNavigate={navigateTo}
          />
        )}

        {currentPage === 'compare' && (
          <ComparePage
            onSelectProduct={handleSelectProduct}
          />
        )}

        {currentPage === 'cart' && (
          <CartPage
            onNavigate={navigateTo}
          />
        )}

        {currentPage === 'checkout' && (
          <CheckoutPage
            onNavigate={navigateTo}
            onOrderPlaced={handleOrderPlaced}
          />
        )}

        {currentPage === 'order-confirmation' && (
          <OrderConfirmationPage
            order={confirmedOrder}
            onNavigate={navigateTo}
          />
        )}

        {currentPage === 'orders' && (
          <OrdersPage
            onNavigate={navigateTo}
          />
        )}

        {currentPage === 'admin' && (
          <AdminDashboardPage />
        )}
      </main>

      {/* Floating Bottom Compare Tray */}
      <CompareTray
        onNavigateToCompare={() => navigateTo('compare')}
      />

      {/* Login / Register Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
      />

      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <CompareProvider>
          <AppContent />
        </CompareProvider>
      </CartProvider>
    </AuthProvider>
  );
}
