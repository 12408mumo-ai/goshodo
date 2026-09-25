import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Lock } from 'lucide-react';
import Logo from './Logo';

export default function Header() {
  const navigate = useNavigate();

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `text-[15px] tracking-wide transition-colors duration-200 ${
      isActive ? 'text-brass font-medium' : 'text-espresso/80 hover:text-espresso'
    }`;

  return (
    <header className="sticky top-0 z-40 border-b border-line/70 bg-ivory/90 backdrop-blur-md">
      <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-3 text-left"
          aria-label="Rafna Investment — home"
        >
          <Logo size={42} />
          <span className="leading-tight">
            <span className="block font-display text-lg font-semibold tracking-wide text-espresso sm:text-xl">
              Rafna Investment
            </span>
            <span className="hidden text-[10.5px] uppercase tracking-[0.22em] text-brass sm:block">
              Mattresses · Beddings · Households
            </span>
          </span>
        </button>

        <nav className="flex items-center gap-5 sm:gap-8">
          <NavLink to="/" end className={navLinkClass}>
            Home
          </NavLink>
          <NavLink to="/shop" className={navLinkClass}>
            Shop
          </NavLink>
          <Link
            to="/admin"
            className="flex items-center gap-1.5 rounded-full border border-espresso/25 px-3.5 py-1.5 text-[13px] font-medium tracking-wide text-espresso transition-all duration-200 hover:border-brass hover:bg-brass hover:text-white sm:px-4 sm:py-2"
          >
            <Lock size={13} strokeWidth={2.2} />
            Admin
          </Link>
        </nav>
      </div>
    </header>
  );
}
