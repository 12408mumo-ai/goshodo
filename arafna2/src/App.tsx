import { useEffect } from 'react';
import { BrowserRouter, Link, Route, Routes, useLocation } from 'react-router-dom';
import { MessageCircle } from 'lucide-react';
import { ShopProvider } from './lib/store';
import { WHATSAPP_NUMBER } from './lib/api';
import Header from './components/Header';
import Footer from './components/Footer';
import ProductModal from './components/ProductModal';
import CheckoutModal from './components/CheckoutModal';
import Home from './pages/Home';
import Shop from './pages/Shop';
import Admin from './pages/Admin';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [pathname]);
  return null;
}

function NotFound() {
  return (
    <div className="mx-auto flex max-w-3xl flex-col items-center px-4 py-24 text-center">
      <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-gold-600">404</p>
      <h1 className="mt-2 font-display text-4xl font-bold text-forest-950">Page Not Found</h1>
      <p className="mt-3 text-sm text-forest-950/60">The page you&apos;re looking for doesn&apos;t exist.</p>
      <Link
        to="/"
        className="mt-6 rounded-xl bg-forest-950 px-8 py-3.5 text-sm font-bold uppercase tracking-[0.14em] text-ivory-50"
      >
        Back Home
      </Link>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ShopProvider>
        <ScrollToTop />
        <div className="flex min-h-screen flex-col bg-ivory-50 font-sans text-forest-950 antialiased">
          <Header />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/shop" element={<Shop />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
          <Footer />
          <ProductModal />
          <CheckoutModal />
          <a
            href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent('Hello Rafna Investment! I have an enquiry.')}`}
            target="_blank"
            rel="noreferrer"
            aria-label="Chat with Rafna Investment on WhatsApp"
            className="fixed bottom-5 right-5 z-40 inline-flex h-14 w-14 items-center justify-center rounded-full bg-[#1fa855] text-white shadow-2xl transition-transform hover:scale-110"
          >
            <MessageCircle className="h-6 w-6" />
          </a>
        </div>
      </ShopProvider>
    </BrowserRouter>
  );
}
