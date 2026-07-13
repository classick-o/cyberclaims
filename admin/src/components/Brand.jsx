// The site's mark + wordmark. /logo-mark.webp is served from public/ at the root, so
// the absolute path resolves from /admin too.
export default function Brand({ className = '', size = '2.1rem' }) {
  return (
    <div className={`brand ${className}`}>
      <img src="/logo-mark.webp" alt="" width="40" height="40" style={{ width: size, height: size }} />
      <span className="brand-word">
        Cyber<span>claims</span>
      </span>
    </div>
  );
}

/* Stroke icons in the site's idiom — 1.75 weight, round caps, currentColor. */
const Svg = ({ children }) => (
  <svg
    width="17"
    height="17"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.75"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    {children}
  </svg>
);

export const Icons = {
  articles: (
    <Svg>
      <path d="M4 4h11a2 2 0 0 1 2 2v13H6a2 2 0 0 1-2-2V4Z" />
      <path d="M17 8h1a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2h-1" />
      <path d="M8 8h5M8 12h5M8 16h3" />
    </Svg>
  ),
  media: (
    <Svg>
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <circle cx="8.5" cy="9.5" r="1.5" />
      <path d="m3 16 4.5-4.5a2 2 0 0 1 2.8 0L15 16" />
      <path d="m14 14 1.5-1.5a2 2 0 0 1 2.8 0L21 15" />
    </Svg>
  ),
  taxonomy: (
    <Svg>
      <path d="M3 6h4M3 12h4M3 18h4" />
      <path d="M11 6h10M11 12h10M11 18h6" />
    </Svg>
  ),
  leads: (
    <Svg>
      <path d="M16 20v-1.5a3.5 3.5 0 0 0-3.5-3.5h-5A3.5 3.5 0 0 0 4 18.5V20" />
      <circle cx="10" cy="8" r="3.5" />
      <path d="M17 11h4M19 9v4" />
    </Svg>
  ),
  newsletter: (
    <Svg>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3.5 7 7.4 5.3a2 2 0 0 0 2.2 0L20.5 7" />
    </Svg>
  ),
};
