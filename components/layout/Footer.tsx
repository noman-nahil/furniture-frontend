import Link from "next/link";
import Image from "next/image";
import { APP_NAME, LOGO_PATH } from "@/lib/config";

// ─────────────────────────────────────────────
// Icons — small inline SVGs, no extra dependency
// ─────────────────────────────────────────────

function IconMapPin({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 21s-7-6.373-7-11a7 7 0 1 1 14 0c0 4.627-7 11-7 11z" />
      <circle cx="12" cy="10" r="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconPhone({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L14 13l5 2v4a2 2 0 0 1-2 2C9.163 21 3 14.837 3 7a2 2 0 0 1 2-2z" />
    </svg>
  );
}

function IconMail({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24" aria-hidden>
      <rect x="3" y="5" width="18" height="14" rx="2" strokeLinecap="round" strokeLinejoin="round" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 7l9 6 9-6" />
    </svg>
  );
}

function IconDiamond({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 8l6-5 6 5-6 12-6-12z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 8h12M9.5 8l2.5 12M14.5 8L12 20" />
    </svg>
  );
}

function IconBadgeCheck({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3l2.09 1.26L16.5 4l.64 2.36L19.5 7l-.64 2.36L19.5 12l-1.64 2.64L18.5 17l-2.41-.36L14.09 19 12 17.74 9.91 19l-1.5-2.36L6 17l.64-2.36L5 12l1.64-2.64L6 7l2.41.36L10.09 4.26 12 3z" />
    </svg>
  );
}

function IconReceipt({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 3h12v18l-2.5-1.5L13 21l-2.5-1.5L8 21l-2-1.5V3z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 8h6M9 12h6" />
    </svg>
  );
}

// ─────────────────────────────────────────────
// Data
// ─────────────────────────────────────────────

const BRANCHES = [
  {
    name: "Première branche",
    address: "160 Avenue Paul Vaillant Couturier, 93120 La Courneuve, France",
    phones: [
      { display: "+33 7 53 30 51 09", href: "+33753305109" },
      { display: "01 88 50 23 94", href: "+33188502394" },
    ],
    email: "meublesdeparis@gmail.com",
  },
  {
    name: "Deuxième branche",
    address: "2 Ter Bd Paul Vaillant Couturier 93100, Montreuil",
    phones: [
      { display: "+33 6 09 45 88 54", href: "+33609458854" },
      { display: "01 48 38 22 24", href: "+33148382224" },
    ],
    email: "meublesdeparis@gmail.com",
  },
  {
    name: "Troisième branche",
    address: "94 Bd Félix Faure, 93300 Aubervilliers",
    phones: [
      { display: "+33 6 10 84 61 33", href: "+33610846133" },
      { display: "+33 6 10 84 61 14", href: "+33610846114" },
    ],
    email: "meublesdeparis@gmail.com",
  },
] as const;

const BRAND_FACTS = [
  { icon: IconDiamond, label: "Votre marque de mobilier de confiance en France" },
  { icon: IconBadgeCheck, label: "SIRET : 40252501800030" },
  { icon: IconReceipt, label: "TVA : FR21979521135" },
] as const;

const INFO_LINKS = [
  { name: "Maison", href: "/" },
  { name: "Boutique", href: "/shop" },
  { name: "À propos de nous", href: "/about" },
  { name: "Contactez-nous", href: "/contact" },
  { name: "Politique de confidentialité", href: "/privacy-policy" },
  { name: "Livraison et expédition", href: "/shipping-delivery" },
  { name: "Retours et échanges", href: "/returns-exchanges" },
] as const;

const CATEGORY_LINKS = [
  { name: "Canapés", href: "/product-category/sofas" },
  { name: "Les Chambres", href: "/product-category/bedrooms" },
  { name: "Lits", href: "/product-category/beds" },
  { name: "Table", href: "/product-category/tables" },
  { name: "Chambre Meubles", href: "/product-category/bedrooms/bedroom-furniture-sets" },
  { name: "Lits Coffre", href: "/product-category/beds/storage-bed" },
  { name: "Table Manger", href: "/product-category/tables/dining-table" },
] as const;

const SOCIAL_LINKS = [
  {
    name: "Facebook",
    href: "https://www.facebook.com/BangladeshFurnitureParis",
    icon: (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
    ),
  },
  {
    name: "Instagram",
    href: "https://www.instagram.com/meubles_de_paris/",
    icon: (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
      </svg>
    ),
  },
  {
    name: "TikTok",
    href: "https://www.tiktok.com/@meublesdeparis",
    icon: (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
        <path d="M16.6 5.82c-1.05-.9-1.72-2.19-1.79-3.62h-3.35v13.66c0 1.68-1.36 3.04-3.04 3.04a3.04 3.04 0 0 1-3.04-3.04 3.04 3.04 0 0 1 3.04-3.04c.31 0 .61.05.89.13v-3.4a6.4 6.4 0 0 0-.89-.06A6.44 6.44 0 0 0 2 15.9a6.44 6.44 0 0 0 6.42 6.44 6.44 6.44 0 0 0 6.42-6.44V8.83a9.6 9.6 0 0 0 5.61 1.8V6.83a5.94 5.94 0 0 1-3.85-1.01z" />
      </svg>
    ),
  },
] as const;

// ─────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────

function BranchCard({ branch }: { branch: (typeof BRANCHES)[number] }) {
  const mailHref = `mailto:${branch.email}`;

  return (
    <div>
      <h3 className="text-[13px] font-semibold text-white uppercase tracking-[0.1em] mb-3.5 pb-1.5 border-b border-white/25 inline-block">
        {branch.name}
      </h3>
      <ul className="space-y-2.5 text-sm text-white/70">
        <li className="flex gap-2.5">
          <IconMapPin className="w-4 h-4 mt-0.5 shrink-0 text-[#B8935A]" />
          <span className="leading-snug">{branch.address}</span>
        </li>
        <li className="flex gap-2.5 items-start flex-wrap">
          <IconPhone className="w-4 h-4 mt-0.5 shrink-0 text-[#B8935A]" />
          <span className="flex flex-wrap items-center gap-x-1.5">
            {branch.phones.map((phone, i) => (
              <span key={phone.href} className="flex items-center gap-1.5">
                {i > 0 && <span className="text-white/40">/</span>}
               <a 
                  href={`tel:${phone.href}`}
                  className="hover:text-white transition-colors duration-200"
                >
                  {phone.display}
                </a>
              </span>
            ))}
          </span>
        </li>
        <li className="flex gap-2.5 items-center">
          <IconMail className="w-4 h-4 shrink-0 text-[#B8935A]" />
          <a
            href={mailHref}
            className="hover:text-white transition-colors duration-200"
            aria-label={`Contacter ${branch.name} par e-mail`}
          >
            Contacter E-mail
          </a>
        </li>
      </ul>
    </div>
  );
}

function LinkColumn({
  title,
  links,
}: {
  title: string;
  links: readonly { name: string; href: string }[];
}) {
  return (
    <div>
      <h3 className="text-[11px] font-semibold text-[#1A1A1A] uppercase tracking-[0.12em] mb-4 pb-1.5 border-b border-[#B8935A]/40 inline-block">
        {title}
      </h3>
      <ul className="space-y-2.5">
        {links.map((link) => (
          <li key={link.name}>
            <Link href={link.href} className="text-sm text-[#6B6560] hover:text-[#B8935A] transition-colors duration-200">
              {link.name}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ─────────────────────────────────────────────
// Footer
// ─────────────────────────────────────────────

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#FAFAF8]">
      {/* Branch bar */}
      <div className="bg-[#1A1A1A]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10">
            {BRANCHES.map((branch) => (
              <BranchCard key={branch.name} branch={branch} />
            ))}
          </div>
        </div>
      </div>

      {/* Main grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-10">
          <div className="sm:col-span-2 lg:col-span-1">
            <h3 className="text-[11px] font-semibold text-[#1A1A1A] uppercase tracking-[0.12em] mb-4 pb-1.5 border-b border-[#B8935A]/40 inline-block">
              À propos de nous
            </h3>
            <p className="text-sm text-[#6B6560] leading-relaxed">
              <span className="font-semibold text-[#1A1A1A]">Meubles De Paris</span> est un spécialiste du mobilier moderne et abordable, proposant une large sélection de canapés, lits, salles à manger, armoires et meubles design importés de Turquie et d&rsquo;Italie. Forte de plus de 12 ans d&rsquo;expérience, l&rsquo;entreprise dispose de plusieurs magasins en région parisienne, dont un vaste showroom de 5 000 m² à La Courneuve.
            </p>
          </div>

          <div>
            <h3 className="text-[11px] font-semibold text-[#1A1A1A] uppercase tracking-[0.12em] mb-4 pb-1.5 border-b border-[#B8935A]/40 inline-block">
              {APP_NAME}
            </h3>
            <ul className="space-y-3">
              {BRAND_FACTS.map(({ icon: Icon, label }) => (
                <li key={label} className="flex items-start gap-2.5 text-sm text-[#6B6560]">
                  <Icon className="w-4 h-4 mt-0.5 shrink-0 text-[#B8935A]" />
                  <span className="leading-snug">{label}</span>
                </li>
              ))}
            </ul>
          </div>

          <LinkColumn title="Informations" links={INFO_LINKS} />
          <LinkColumn title="Catégories" links={CATEGORY_LINKS} />
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-[#E8E2D9]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <div className="relative w-6 h-6 shrink-0">
                <Image src={LOGO_PATH} alt={APP_NAME} fill className="object-contain" />
              </div>
              <p className="text-xs text-[#A09080]">
                Copyright © {currentYear} {APP_NAME}. Tous droits réservés.
              </p>
            </div>

            <div className="flex items-center gap-2">
              {SOCIAL_LINKS.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 flex items-center justify-center text-[#6B6560] hover:text-[#B8935A] hover:bg-[#F0EBE3] rounded-full transition-all duration-200"
                  aria-label={social.name}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}