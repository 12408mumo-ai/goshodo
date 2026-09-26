import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  HandCoins,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Truck,
} from "lucide-react";
import Logo from "./Logo";
import {
  BUSINESS_EMAIL,
  BUSINESS_LOCATION,
  DISPLAY_PHONE,
  TEL_LINK,
} from "../lib/env";
import { enquiryWhatsAppUrl } from "../lib/whatsapp";
import {
  CATEGORIES_CHANGED_EVENT,
  getCategories,
} from "../lib/categories";
import { DEFAULT_CATEGORIES } from "../lib/types";

export default function Footer() {
  // Live category links — identical source to the shop filters.
  const [categories, setCategories] = useState<string[]>(DEFAULT_CATEGORIES);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const list = await getCategories();
        if (active) setCategories(list.map((c) => c.name));
      } catch {
        /* silently keep the default collection links */
      }
    };
    void load();
    const handler = () => void load();
    window.addEventListener(CATEGORIES_CHANGED_EVENT, handler);
    return () => {
      active = false;
      window.removeEventListener(CATEGORIES_CHANGED_EVENT, handler);
    };
  }, []);

  return (
    <footer className="bg-forest-900 text-cream-100">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div>
            <Link to="/" aria-label="Rafna Investment — homepage">
              <Logo dark />
            </Link>
            <p className="mt-5 max-w-xs text-sm leading-relaxed text-cream-100/70">
              Quality foam, fibre &amp; spring orthopaedic mattresses, premium
              beddings and trusted household goods — proudly serving Nairobi
              and all of Kenya.
            </p>
            <div className="mt-6 flex flex-col gap-3 text-xs text-gold-300">
              <span className="flex items-center gap-2">
                <Truck className="h-4 w-4" aria-hidden /> Free delivery within
                Nairobi &amp; surroundings
              </span>
              <span className="flex items-center gap-2">
                <HandCoins className="h-4 w-4" aria-hidden /> Pay on Delivery
                available
              </span>
            </div>
          </div>

          {/* Explore */}
          <nav aria-label="Footer">
            <h3 className="text-xs font-semibold uppercase tracking-[0.3em] text-gold-400">
              Explore
            </h3>
            <ul className="mt-5 space-y-3 text-sm">
              <li>
                <Link to="/" className="transition-colors hover:text-gold-300">
                  Home
                </Link>
              </li>
              <li>
                <Link
                  to="/shop"
                  className="transition-colors hover:text-gold-300"
                >
                  Shop
                </Link>
              </li>
              <li>
                <Link
                  to="/admin"
                  className="transition-colors hover:text-gold-300"
                >
                  Admin
                </Link>
              </li>
            </ul>
          </nav>

          {/* Categories */}
          <nav aria-label="Categories">
            <h3 className="text-xs font-semibold uppercase tracking-[0.3em] text-gold-400">
              Collections
            </h3>
            <ul className="mt-5 space-y-3 text-sm">
              {categories.map((category) => (
                <li key={category}>
                  <Link
                    to={`/shop?category=${encodeURIComponent(category)}`}
                    className="transition-colors hover:text-gold-300"
                  >
                    {category}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Contact */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-[0.3em] text-gold-400">
              Contact Us
            </h3>
            <ul className="mt-5 space-y-4 text-sm">
              <li>
                <a
                  href={TEL_LINK}
                  className="flex items-center gap-3 transition-colors hover:text-gold-300"
                >
                  <Phone className="h-4 w-4 shrink-0 text-gold-400" aria-hidden />
                  {DISPLAY_PHONE}
                </a>
              </li>
              <li>
                <a
                  href={enquiryWhatsAppUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 transition-colors hover:text-gold-300"
                >
                  <MessageCircle
                    className="h-4 w-4 shrink-0 text-gold-400"
                    aria-hidden
                  />
                  Chat on WhatsApp
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${BUSINESS_EMAIL}`}
                  className="flex items-center gap-3 transition-colors hover:text-gold-300"
                >
                  <Mail className="h-4 w-4 shrink-0 text-gold-400" aria-hidden />
                  {BUSINESS_EMAIL}
                </a>
              </li>
              <li className="flex items-center gap-3">
                <MapPin className="h-4 w-4 shrink-0 text-gold-400" aria-hidden />
                {BUSINESS_LOCATION}, Kenya
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-cream-100/10 pt-8 text-xs text-cream-100/60 sm:flex-row">
          <p>
            © {new Date().getFullYear()} Rafna Investment · {BUSINESS_LOCATION}.
            All rights reserved.
          </p>
          <p>Country-wide delivery at affordable prices.</p>
        </div>
      </div>
    </footer>
  );
}
