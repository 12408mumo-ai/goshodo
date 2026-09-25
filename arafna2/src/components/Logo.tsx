interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  light?: boolean;
  showWordmark?: boolean;
}

export default function Logo({ size = 'md', light = false, showWordmark = true }: LogoProps) {
  const mark = size === 'sm' ? 'h-9 w-9 text-lg' : size === 'lg' ? 'h-14 w-14 text-3xl' : 'h-11 w-11 text-2xl';
  return (
    <span className="flex items-center gap-3">
      <span
        className={`flex ${mark} items-center justify-center rounded-[6px] bg-gradient-to-br from-forest-800 via-forest-900 to-forest-950 font-display font-bold text-gold-400 shadow-[0_2px_12px_rgba(0,0,0,0.25)] ring-1 ring-gold-500/60`}
        aria-hidden="true"
      >
        R
      </span>
      {showWordmark && (
        <span className="flex flex-col leading-none">
          <span
            className={`font-display font-bold tracking-[0.14em] ${size === 'sm' ? 'text-base' : size === 'lg' ? 'text-2xl' : 'text-xl'} ${light ? 'text-ivory-50' : 'text-forest-950'}`}
          >
            RAFNA
          </span>
          <span
            className={`mt-1 font-sans font-medium uppercase ${size === 'sm' ? 'text-[9px]' : 'text-[10px]'} tracking-[0.32em] ${light ? 'text-gold-300' : 'text-gold-600'}`}
          >
            Investment
          </span>
        </span>
      )}
    </span>
  );
}
