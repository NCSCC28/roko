interface RokoLogoProps {
  className?: string;
}

export default function RokoLogo({ className = '' }: RokoLogoProps) {
  return (
    <svg
      viewBox="0 0 760 220"
      role="img"
      aria-label="ROKO logo"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="roko-logo-bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fff7ed" />
          <stop offset="55%" stopColor="#fef3c7" />
          <stop offset="100%" stopColor="#e0f2fe" />
        </linearGradient>
        <linearGradient id="roko-logo-ring" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#0ea5e9" />
        </linearGradient>
      </defs>

      <rect x="8" y="8" width="744" height="204" rx="32" fill="url(#roko-logo-bg)" />
      <rect x="8" y="8" width="744" height="204" rx="32" fill="none" stroke="#f8d9aa" strokeWidth="2" />

      <g transform="translate(48 30)">
        <circle cx="78" cy="80" r="58" fill="none" stroke="url(#roko-logo-ring)" strokeWidth="10" />
        <circle cx="78" cy="80" r="34" fill="#0f172a" />
        <path
          d="M78 38 C88 53 92 61 92 72 C92 85 86 96 78 104 C70 96 64 85 64 72 C64 61 68 53 78 38 Z"
          fill="#fbbf24"
          opacity="0.95"
        />
        <circle cx="78" cy="80" r="9" fill="#fff7ed" />
        <path d="M20 80 C30 55 48 40 64 34" stroke="#0ea5e9" strokeWidth="5" fill="none" strokeLinecap="round" />
        <path d="M136 80 C126 55 108 40 92 34" stroke="#f59e0b" strokeWidth="5" fill="none" strokeLinecap="round" />
        <path d="M28 123 C45 142 65 148 78 150 C91 148 111 142 128 123" stroke="#10b981" strokeWidth="5" fill="none" strokeLinecap="round" />
      </g>

      <g transform="translate(200 74)">
        <text
          x="0"
          y="44"
          fill="#0f172a"
          fontSize="86"
          fontWeight="700"
          letterSpacing="8"
          fontFamily="'Merriweather', 'Times New Roman', serif"
        >
          ROKO
        </text>
        <text
          x="4"
          y="86"
          fill="#334155"
          fontSize="26"
          letterSpacing="1.8"
          fontFamily="'Merriweather', 'Times New Roman', serif"
        >
          Realm of Knowledge and Oneness
        </text>
      </g>

      <g transform="translate(682 30)">
        <circle cx="18" cy="26" r="8" fill="#f59e0b" />
        <circle cx="34" cy="44" r="7" fill="#0ea5e9" />
        <circle cx="18" cy="62" r="6" fill="#10b981" />
      </g>
    </svg>
  );
}
