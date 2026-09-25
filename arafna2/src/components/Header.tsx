import { useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Menu, ShieldCheck, Truck, X } from 'lucide-react';
import Logo from './Logo';

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `relative px-1 py-2 text-[13px] font-semibold uppercase tracking-[0.18em] transition-colors ${isActive ? 'text-gold-600' : 'text-forest-950/80 hover:text-forest-950'}`;

export default function Header() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');

  return (
    <header className="sticky top-0 z-40">
      <div className="bg-forest-950 text-ivory-50">
        <div className="mx-auto flex max-w-7xl items-center justify-center gap-2 px-4 py-2 text-center text-[11px] font-medium uppercase tracking-[0.2em] sm:text-xs">
          <Truck className="h-3.5 w-3.5 shrink-0 text-gold-400" />
          <span className="truncate">Free delivery within Nairobi &amp; surroundings &nbsp;•&nbsp; Pay on Delivery</span>
        </div>
      </div>

      <div className="border-b border-forest-950/10 bg-ivory-50/95 backdrop-blur-md">
        <div className="mx-auto flex h-[76px] max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link to="/" aria-label="Rafna Investment home">
            <Logo />
          </Link>

          <nav className="hidden items-center gap-8 md:flex" aria-label="Primary">
            <NavLink to="/" end className={linkClass}>
              Home
            </NavLink>
            <NavLink to="/shop" className={linkClass}>
              Shop
            </NavLink>
            <Link
              to="/admin"
              className={`inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-[13px] font-semibold uppercase tracking-[0.16em] transition-all ${isAdmin
                ? 'bg-gold-500 text-forest-950 shadow-md'
                : 'border border-forest-950/25 text-forest-950 hover:border-gold-500 hover:bg-gold-500 hover:text-forest-950'
                }`}
            >
              <ShieldCheck className="h-4 w-4" />
              Admin
            </Link>
          </nav>

          <button
            type="button"
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-forest-950/15 text-forest-950 md:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? 'Close menu' : 'Open menu'}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.nav
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.22 }}
            className="overflow-hidden border-b border-forest-950/10 bg-ivory-50 md:hidden"
            aria-label="Mobile"
          >
            <div className="flex flex-col gap-1 px-4 py-4">
              <NavLink
                to="/"
                end
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `rounded-lg px-4 py-3 text-sm font-semibold uppercase tracking-[0.16em] ${isActive ? 'bg-forest-950 text-gold-300' : 'text-forest-950 hover:bg-forest-950/5'}`
                }
              >
                Home
              </NavLink>
              <NavLink
                to="/shop"
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `rounded-lg px-4 py-3 text-sm font-semibold uppercase tracking-[0.16em] ${isActive ? 'bg-forest-950 text-gold-300' : 'text-forest-950 hover:bg-forest-950/5'}`
                }
              >
                Shop
              </NavLink>
              <Link
                to="/admin"
                onClick={() => setOpen(false)}
                className="mt-1 inline-flex items-center justify-center gap-2 rounded-lg bg-gold-500 px-4 py-3 text-sm font-semibold uppercase tracking-[0.16em] text-forest-950"
              >
                <ShieldCheck className="h-4 w-4" />
                Admin
              </Link>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
