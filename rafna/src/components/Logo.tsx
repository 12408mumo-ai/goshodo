interface LogoProps {
  size?: number;
  className?: string;
}

export default function Logo({ size = 44, className = '' }: LogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      className={className}
      aria-label="Rafna Investment logo"
    >
      <rect x="1" y="1" width="62" height="62" rx="12" fill="#211913" />
      <rect
        x="5.5"
        y="5.5"
        width="53"
        height="53"
        rx="8.5"
        fill="none"
        stroke="#B08D4C"
        strokeWidth="1.4"
        opacity="0.9"
      />
      <text
        x="32"
        y="40"
        textAnchor="middle"
        fontFamily="Fraunces, Georgia, serif"
        fontSize="31"
        fontWeight="600"
        fill="#EFE3CB"
      >
        R
      </text>
      <line x1="20" y1="48.5" x2="44" y2="48.5" stroke="#B08D4C" strokeWidth="2" strokeLinecap="round" />
      <line x1="26" y1="53" x2="38" y2="53" stroke="#B08D4C" strokeWidth="1.4" strokeLinecap="round" opacity="0.7" />
    </svg>
  );
}
