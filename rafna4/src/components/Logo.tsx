interface LogoProps {
  /** Light wordmark for dark backgrounds (footer, admin hero panel). */
  dark?: boolean;
}

export default function Logo({ dark = false }: LogoProps) {
  return (
    <span className="flex items-center gap-3">
      <svg
        viewBox="0 0 64 64"
        role="img"
        aria-label="Rafna Investment logo"
        className="h-10 w-10 shrink-0"
      >
        <rect width="64" height="64" rx="12" className="fill-forest-900" />
        <rect
          x="6"
          y="6"
          width="52"
          height="52"
          rx="8"
          fill="none"
          strokeWidth="1.6"
          className="stroke-gold-500"
        />
        <text
          x="32"
          y="42"
          textAnchor="middle"
          fontSize="30"
          fontWeight="600"
          className="fill-gold-400"
          style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
        >
          R
        </text>
      </svg>
      <span className="leading-tight">
        <span
          className={`block font-display text-xl font-semibold tracking-wide ${
            dark ? "text-cream-50" : "text-espresso-900"
          }`}
        >
          Rafna
        </span>
        <span
          className={`block text-[10px] font-medium uppercase tracking-[0.34em] ${
            dark ? "text-gold-300" : "text-espresso-500"
          }`}
        >
          Investment
        </span>
      </span>
    </span>
  );
}
