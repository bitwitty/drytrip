export function LogoSymbol({ className = "size-8" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 80 50"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Horizon line */}
      <line
        x1="0"
        y1="40"
        x2="80"
        y2="40"
        stroke="currentColor"
        strokeWidth="2.5"
      />
      {/* Rising sun semicircle */}
      <path
        d="M 16 40 A 24 24 0 0 1 64 40"
        stroke="currentColor"
        strokeWidth="2.5"
        fill="none"
      />
    </svg>
  );
}

export function Logo() {
  return (
    <div className="flex items-center gap-3">
      <LogoSymbol className="h-7 w-auto" />
      <span className="text-lg tracking-[0.25em] font-light uppercase text-forest">
        Dry Trip
      </span>
    </div>
  );
}
