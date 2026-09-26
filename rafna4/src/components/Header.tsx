import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { HandCoins, Menu, Phone, Truck, X } from "lucide-react";
import Logo from "./Logo";
import { DISPLAY_PHONE, TEL_LINK } from "../lib/env";

const desktopLink = ({ isActive }: { isActive: boolean }) =>
  `text-sm font-medium uppercase tracking-[0.18em] transition-colors ${
    isActive ? "text-gold-600" : "text-espresso-700 hover:text-espresso-900"
  }`;

const mobileLink = ({ isActive }: { isActive: boolean }) =>
  `block rounded-xl px-4 py-3 text-sm font-medium uppercase tracking-[0.18em] transition-colors ${
    isActive
      ? "bg-gold-100 text-gold-700"
      : "text-espresso-700 hover:bg-cream-100"
  }`;

export default function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      {/* Service announcement bar */}
      <div className="bg-forest-900 text-gold-300">
        <div className="mx-auto flex h-9 max-w-7xl items-center justify-center gap-6 px-4 text-[11px] font-medium uppercase tracking-[0.2em] sm:justify-between lg:px-8">
          <span className="flex items-center gap-2">
            <Truck className="h-3.5 w-3.5" aria-hidden />
            <span className="hidden sm:inline">
              Free delivery within Nairobi &amp; surroundings
            </span>
            <span className="sm:hidden">Free Nairobi delivery</span>
          </span>
          <span className="hidden items-center gap-2 lg:flex">
            <HandCoins className="h-3.5 w-3.5" aria-hidden />
            Pay on Delivery available
          </span>
          <a
            href={TEL_LINK}
            className="flex items-center gap-2 transition-colors hover:text-gold-100"
          >
            <Phone className="h-3.5 w-3.5" aria-hidden />
            {DISPLAY_PHONE}
          </a>
        </div>
      </div>

      {/* Primary navigation — intentionally minimal: logo, Home, Shop, Admin */}
      <div
        className={`border-b border-espresso-900/10 transition-all duration-300 ${
          scrolled
            ? "bg-cream-50/95 shadow-[0_14px_40px_-22px_rgba(29,24,17,0.35)] backdrop-blur-md"
            : "bg-cream-50"
        }`}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 md:h-20 lg:px-8">
          <Link to="/" aria-label="Rafna Investment — go to homepage">
            <Logo />
          </Link>

          <nav className="hidden items-center gap-10 md:flex" aria-label="Primary">
            <NavLink to="/" end className={desktopLink}>
              Home
            </NavLink>
            <NavLink to="/shop" className={desktopLink}>
              Shop
            </NavLink>
            <Link
              to="/admin"
              className="rounded-full border border-espresso-900/70 px-5 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-espresso-900 transition-all hover:bg-espresso-900 hover:text-cream-50"
            >
              Admin
            </Link>
          </nav>

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="grid h-10 w-10 place-items-center rounded-full border border-espresso-900/15 text-espresso-900 md:hidden"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.nav
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="border-b border-espresso-900/10 bg-cream-50 px-4 py-4 shadow-lift md:hidden"
            aria-label="Mobile"
          >
            <div className="mx-auto flex max-w-7xl flex-col gap-1">
              <NavLink to="/" end className={mobileLink}>
                Home
              </NavLink>
              <NavLink to="/shop" className={mobileLink}>
                Shop
              </NavLink>
              <Link
                to="/admin"
                className="mt-2 block rounded-xl border border-espresso-900/70 px-4 py-3 text-center text-xs font-semibold uppercase tracking-[0.2em] text-espresso-900"
              >
                Admin
              </Link>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
