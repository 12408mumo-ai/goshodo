import { Link } from 'react-router-dom';
import { Clock, Mail, MapPin, Phone } from 'lucide-react';
import Logo from './Logo';
import { ADDRESS, EMAIL, PHONE_DISPLAY } from '../lib/api';
import { useShop } from '../lib/store';

export default function Footer() {
  const { categories } = useShop();

  return (
    <footer className="bg-forest-950 text-ivory-50">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-2 lg:grid-cols-4 lg:px-8">
        <div>
          <Logo light size="md" />
          <p className="mt-5 max-w-xs text-sm leading-relaxed text-ivory-50/70">
            Nairobi&apos;s trusted home for quality foam, fiber &amp; spring orthopaedic mattresses, premium bedding and
            household essentials.
          </p>
          <div className="mt-5 h-px w-16 bg-gold-500" />
        </div>

        <div>
          <h4 className="text-xs font-bold uppercase tracking-[0.24em] text-gold-300">Shop</h4>
          <ul className="mt-5 space-y-3 text-sm text-ivory-50/80">
            <li>
              <Link to="/shop" className="transition-colors hover:text-gold-300">
                All Products
              </Link>
            </li>
            {categories.slice(0, 6).map((c) => (
              <li key={c.id}>
                <Link to={`/shop?category=${encodeURIComponent(c.name)}`} className="transition-colors hover:text-gold-300">
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="text-xs font-bold uppercase tracking-[0.24em] text-gold-300">Our Promise</h4>
          <ul className="mt-5 space-y-3 text-sm leading-relaxed text-ivory-50/80">
            <li>Free delivery within Nairobi &amp; surroundings</li>
            <li>Countrywide delivery at affordable prices</li>
            <li>Pay on Delivery within Nairobi &amp; surroundings</li>
            <li>Genuine quality, shop pickup available</li>
          </ul>
        </div>

        <div>
          <h4 className="text-xs font-bold uppercase tracking-[0.24em] text-gold-300">Contact</h4>
          <ul className="mt-5 space-y-4 text-sm text-ivory-50/80">
            <li className="flex items-start gap-3">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gold-400" />
              <span>{ADDRESS}</span>
            </li>
            <li className="flex items-start gap-3">
              <Phone className="mt-0.5 h-4 w-4 shrink-0 text-gold-400" />
              <a href={`tel:${PHONE_DISPLAY.replace(/\s/g, '')}`} className="transition-colors hover:text-gold-300">
                {PHONE_DISPLAY} (Call / WhatsApp)
              </a>
            </li>
            <li className="flex items-start gap-3">
              <Mail className="mt-0.5 h-4 w-4 shrink-0 text-gold-400" />
              <a href={`mailto:${EMAIL}`} className="break-all transition-colors hover:text-gold-300">
                {EMAIL}
              </a>
            </li>
            <li className="flex items-start gap-3">
              <Clock className="mt-0.5 h-4 w-4 shrink-0 text-gold-400" />
              <span>Mon – Sat: 8:00am – 6:30pm</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-ivory-50/10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-5 text-xs tracking-wide text-ivory-50/50 sm:flex-row sm:px-6 lg:px-8">
          <span>© {new Date().getFullYear()} Rafna Investment. All rights reserved.</span>
          <span className="uppercase tracking-[0.2em]">Kamkunji • Nairobi • Kenya</span>
        </div>
      </div>
    </footer>
  );
}
