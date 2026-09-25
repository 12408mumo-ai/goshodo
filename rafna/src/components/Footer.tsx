import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, Truck, HandCoins, Globe } from 'lucide-react';
import Logo from './Logo';
import { PHONE_DISPLAY, EMAIL, LOCATION, waChatLink } from '../lib/config';

export default function Footer() {
  return (
    <footer className="bg-espresso text-cream/80">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:px-8">
        <div>
          <div className="flex items-center gap-3">
            <Logo size={44} />
            <span className="font-display text-lg font-semibold text-cream">Rafna Investment</span>
          </div>
          <p className="mt-4 text-sm leading-relaxed text-cream/60">
            Quality Foam, Fiber &amp; Spring Orthopaedic Mattresses, Beddings and Households —
            crafted comfort delivered to your door from the heart of Nairobi.
          </p>
        </div>

        <div>
          <h4 className="font-display text-sm font-semibold uppercase tracking-[0.18em] text-brass">Explore</h4>
          <ul className="mt-4 space-y-2.5 text-sm">
            <li><Link to="/" className="transition-colors hover:text-brass">Home</Link></li>
            <li><Link to="/shop" className="transition-colors hover:text-brass">Shop All Products</Link></li>
            <li><Link to="/shop?category=Orthopaedic%20Mattresses" className="transition-colors hover:text-brass">Orthopaedic Mattresses</Link></li>
            <li><Link to="/shop?category=Beddings" className="transition-colors hover:text-brass">Beddings</Link></li>
            <li><Link to="/shop?category=Households" className="transition-colors hover:text-brass">Households</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-display text-sm font-semibold uppercase tracking-[0.18em] text-brass">Our Promise</h4>
          <ul className="mt-4 space-y-3 text-sm">
            <li className="flex items-start gap-2.5">
              <Truck size={16} className="mt-0.5 shrink-0 text-brass" />
              Free delivery within Nairobi &amp; surroundings
            </li>
            <li className="flex items-start gap-2.5">
              <Globe size={16} className="mt-0.5 shrink-0 text-brass" />
              Country-wide delivery at affordable prices
            </li>
            <li className="flex items-start gap-2.5">
              <HandCoins size={16} className="mt-0.5 shrink-0 text-brass" />
              Pay on delivery within Nairobi &amp; surroundings
            </li>
          </ul>
        </div>

        <div>
          <h4 className="font-display text-sm font-semibold uppercase tracking-[0.18em] text-brass">Get In Touch</h4>
          <ul className="mt-4 space-y-3 text-sm">
            <li>
              <a href={waChatLink()} target="_blank" rel="noreferrer" className="flex items-center gap-2.5 transition-colors hover:text-brass">
                <Phone size={16} className="shrink-0 text-brass" />
                {PHONE_DISPLAY} <span className="text-cream/40">(WhatsApp)</span>
              </a>
            </li>
            <li>
              <a href={`mailto:${EMAIL}`} className="flex items-center gap-2.5 transition-colors hover:text-brass">
                <Mail size={16} className="shrink-0 text-brass" />
                {EMAIL}
              </a>
            </li>
            <li className="flex items-center gap-2.5">
              <MapPin size={16} className="shrink-0 text-brass" />
              {LOCATION}
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-cream/10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-5 text-xs text-cream/40 sm:flex-row sm:px-6 lg:px-8">
          <p>© {new Date().getFullYear()} Rafna Investment. All rights reserved.</p>
          <p>Kamkunji, Nairobi · Quality you can rest on.</p>
        </div>
      </div>
    </footer>
  );
}
