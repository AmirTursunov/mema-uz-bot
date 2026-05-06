import React from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { OrderProvider } from './context/OrderContext';
import Header from './components/Header';
import BottomNav from './components/BottomNav';
import TelegramRedirectModal from './components/TelegramRedirectModal';

import Home from './pages/Home';
import Customize from './pages/Customize';
import Preview from './pages/Preview';
import Order from './pages/Order';
import Confirmation from './pages/Confirmation';
import MyOrders from './pages/MyOrders';
import Profile from './pages/Profile';
import ScrollToTop from './components/ScrollToTop';

const AppContent = () => {
  const location = useLocation();

  return (
    <div className="app-container">
      <div className="app-bg" />
      <Header />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/customize" element={<Customize />} />
          <Route path="/preview" element={<Preview />} />
          <Route path="/order" element={<Order />} />
          <Route path="/confirmation" element={<Confirmation />} />
          <Route path="/orders" element={<MyOrders />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </main>
      <BottomNav />
      <TelegramRedirectModal />
    </div>
  );
};

function App() {
  React.useEffect(() => {
    if (window.Telegram && window.Telegram.WebApp) {
      window.Telegram.WebApp.ready();
      window.Telegram.WebApp.expand();
    }
  }, []);

  return (
    <OrderProvider>
      <BrowserRouter>
        <ScrollToTop />
        <AppContent />
      </BrowserRouter>
    </OrderProvider>
  );
}

export default App;
