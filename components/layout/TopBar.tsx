// components/layout/TopBar.tsx
import Link from "next/link";

// ── Placeholder content — replace these two things ─────────────────────
// TAGLINE_TEXT: your real store hours / promo message / shipping note.
// SOCIAL_LINKS: your real profile URLs. Left as "#" so nothing breaks,
// but they don't go anywhere until you fill them in.
//
// If you'd rather manage this from lib/config.ts alongside APP_NAME and
// LOGO_PATH instead of here, paste me that file and I'll move it there.
const TAGLINE_TEXT = "Open every day, 9:30am – 8pm, including holidays.";

const SOCIAL_LINKS = {
  facebook: "#",
  instagram: "#",
  tiktok: "#",
};

function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4" aria-hidden>
      <path d="M22 12.06C22 6.51 17.52 2 12 2S2 6.51 2 12.06c0 5 3.66 9.15 8.44 9.94v-7.03H7.9v-2.91h2.54V9.85c0-2.51 1.49-3.9 3.77-3.9 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56v1.87h2.78l-.44 2.91h-2.34V22c4.78-.79 8.44-4.94 8.44-9.94Z" />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="h-4 w-4"
      aria-hidden
    >
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function TikTokIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4" aria-hidden>
      <path d="M16.5 2h-3.1v13.6a2.9 2.9 0 1 1-2.06-2.78v-3.2a6.1 6.1 0 1 0 5.16 6.03V9.1a7.7 7.7 0 0 0 4.4 1.38V7.36A4.6 4.6 0 0 1 16.5 2Z" />
    </svg>
  );
}

export default function TopBar() {
  return (
    <div className="w-full bg-teal-700 text-white text-xs sm:text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-9 flex items-center justify-between gap-4">
        <p className="truncate">{TAGLINE_TEXT}</p>

        <div className="flex items-center gap-3 shrink-0">
          <Link
            href={SOCIAL_LINKS.facebook}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Facebook"
            className="hover:opacity-75 transition-opacity"
          >
            <FacebookIcon />
          </Link>
          <Link
            href={SOCIAL_LINKS.instagram}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram"
            className="hover:opacity-75 transition-opacity"
          >
            <InstagramIcon />
          </Link>
          <Link
            href={SOCIAL_LINKS.tiktok}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="TikTok"
            className="hover:opacity-75 transition-opacity"
          >
            <TikTokIcon />
          </Link>
        </div>
      </div>
    </div>
  );
}