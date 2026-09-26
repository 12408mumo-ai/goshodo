import type { Product } from "../lib/types";

/**
 * Seed catalogue — shown in demo mode (no Supabase env vars) so the
 * storefront is fully browsable out of the box. When Supabase is connected,
 * the live `products` table is the single source of truth.
 */
export const seedProducts: Product[] = [
  {
    id: "seed-m1",
    title: "Royal Rest Spring Orthopaedic Mattress 6×6",
    category: "Orthopaedic Mattresses",
    price: 48500,
    description:
      "Euro-top spring mattress engineered for firm orthopaedic support — deep, restorative sleep without pressure points.",
    image_url: "/images/products/mattress-royal.jpg",
    created_at: "2024-05-02T09:00:00.000Z",
  },
  {
    id: "seed-m2",
    title: "Imperial Euro-Top Spring Mattress 5×6",
    category: "Orthopaedic Mattresses",
    price: 56500,
    description:
      "Hotel-grade pocket springs beneath a plush quilted euro-top. The signature luxury sleep experience.",
    image_url: "/images/products/mattress-executive.jpg",
    created_at: "2024-05-08T09:00:00.000Z",
  },
  {
    id: "seed-m3",
    title: "Serengeti Fibre Orthopaedic Mattress 5×6",
    category: "Orthopaedic Mattresses",
    price: 34000,
    description:
      "Breathable fibre layers cradle the body while keeping your spine perfectly aligned through the night.",
    image_url: "/images/products/mattress-serene.jpg",
    created_at: "2024-05-14T09:00:00.000Z",
  },
  {
    id: "seed-m4",
    title: "PosturePlus High-Density Foam Mattress 4×6",
    category: "Orthopaedic Mattresses",
    price: 18900,
    description:
      "Firm, high-density foam that holds its shape for years — dependable everyday support at a fair price.",
    image_url: "/images/products/mattress-posture.jpg",
    created_at: "2024-05-20T09:00:00.000Z",
  },
  {
    id: "seed-b1",
    title: "Luxe Cotton Duvet Set",
    category: "Beddings",
    price: 6800,
    description:
      "Silky-soft cotton duvet cover with matching pillowcases in calm, neutral hotel tones.",
    image_url: "/images/products/bedding-duvet.jpg",
    created_at: "2024-06-02T09:00:00.000Z",
  },
  {
    id: "seed-b2",
    title: "Hotel White Bedsheet Set (4pc)",
    category: "Beddings",
    price: 4500,
    description:
      "Crisp 300-thread-count cotton sheets — that fresh boutique-hotel feeling, every single night.",
    image_url: "/images/products/bedding-sheets.jpg",
    created_at: "2024-06-08T09:00:00.000Z",
  },
  {
    id: "seed-b3",
    title: "CloudSoft Microfibre Pillows (Pair)",
    category: "Beddings",
    price: 2400,
    description:
      "Plush, supportive pillows that spring back to shape and stay fluffy night after night.",
    image_url: "/images/products/bedding-pillows.jpg",
    created_at: "2024-06-14T09:00:00.000Z",
  },
  {
    id: "seed-b4",
    title: "Cosy Knit Throw Blanket",
    category: "Beddings",
    price: 3200,
    description:
      "A warm, heavyweight knit throw — perfect for beds, sofas and slow Sunday mornings.",
    image_url: "/images/products/bedding-throw.jpg",
    created_at: "2024-06-20T09:00:00.000Z",
  },
  {
    id: "seed-h1",
    title: "Premium Stainless Cookware Set (10pc)",
    category: "Households",
    price: 13500,
    description:
      "Even-heating stainless pots and pans with tempered-glass lids — a kitchen upgrade that lasts.",
    image_url: "/images/products/household-cookware.jpg",
    created_at: "2024-07-02T09:00:00.000Z",
  },
  {
    id: "seed-h2",
    title: "Elegance Ceramic Dinner Set (24pc)",
    category: "Households",
    price: 9800,
    description:
      "A refined 24-piece ceramic collection that elevates every family dinner and celebration.",
    image_url: "/images/products/household-dinner.jpg",
    created_at: "2024-07-08T09:00:00.000Z",
  },
  {
    id: "seed-h3",
    title: "Turkish Cotton Towel Bale (6pc)",
    category: "Households",
    price: 3600,
    description:
      "Thick, absorbent long-staple cotton towels with a soft, spa-like hand feel.",
    image_url: "/images/products/household-towels.jpg",
    created_at: "2024-07-14T09:00:00.000Z",
  },
  {
    id: "seed-h4",
    title: "FreshLock Storage Container Set (12pc)",
    category: "Households",
    price: 4200,
    description:
      "Airtight, stackable containers that keep cereals and staples fresh — and shelves beautifully tidy.",
    image_url: "/images/products/household-storage.jpg",
    created_at: "2024-07-20T09:00:00.000Z",
  },
];
