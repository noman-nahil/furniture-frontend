import type { Metadata } from "next";
import Link from "next/link";
import { ContactForm } from "@/features/contact/components/ContactForm";
import { APP_NAME } from "@/lib/config";
import { breadcrumbJsonLd, JsonLd } from "@/lib/seo/jsonLd";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "Contact",
  description:
    "Contactez Meubles De Paris par téléphone, e-mail ou dans nos showrooms. Assistance 24h/24 et 7j/7 — nous parlons bengali, français et anglais.",
  path: "/contact",
  keywords: ["contact", "showroom", "La Courneuve", APP_NAME],
});

const ADDRESS =
  "160 Avenue Paul Vaillant Couturier, 93120 La Courneuve, France";
const MAPS_HREF = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(ADDRESS)}`;

/** Set to true after SMTP is configured to show the contact form again. */
const SHOW_CONTACT_FORM = false;

function IconFacebook({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

function IconInstagram({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
    </svg>
  );
}

function IconTikTok({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path d="M16.6 5.82c-1.05-.9-1.72-2.19-1.79-3.62h-3.35v13.66c0 1.68-1.36 3.04-3.04 3.04a3.04 3.04 0 0 1-3.04-3.04 3.04 3.04 0 0 1 3.04-3.04c.31 0 .61.05.89.13v-3.4a6.4 6.4 0 0 0-.89-.06A6.44 6.44 0 0 0 2 15.9a6.44 6.44 0 0 0 6.42 6.44 6.44 6.44 0 0 0 6.42-6.44V8.83a9.6 9.6 0 0 0 5.61 1.8V6.83a5.94 5.94 0 0 1-3.85-1.01z" />
    </svg>
  );
}

const SOCIAL_LINKS = [
  {
    name: "Facebook",
    href: "https://www.facebook.com/meublesdeparisofficial",
    icon: IconFacebook,
  },
  {
    name: "Instagram",
    href: "https://www.instagram.com/meubles_de_paris/",
    icon: IconInstagram,
  },
  {
    name: "TikTok",
    href: "https://www.tiktok.com/@meublesdeparis",
    icon: IconTikTok,
  },
] as const;

function IconPin() {
  return (
    <svg className="h-4 w-4 shrink-0 text-[#B8935A]" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 21s-7-6.373-7-11a7 7 0 1 1 14 0c0 4.627-7 11-7 11z" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  );
}

function IconPhone() {
  return (
    <svg className="h-4 w-4 shrink-0 text-[#B8935A]" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L14 13l5 2v4a2 2 0 0 1-2 2C9.163 21 3 14.837 3 7a2 2 0 0 1 2-2z" />
    </svg>
  );
}

function IconMail() {
  return (
    <svg className="h-4 w-4 shrink-0 text-[#B8935A]" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24" aria-hidden>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 7l9 6 9-6" />
    </svg>
  );
}

function IconClock() {
  return (
    <svg className="h-4 w-4 shrink-0 text-[#B8935A]" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24" aria-hidden>
      <circle cx="12" cy="12" r="9" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 7v5l3 2" />
    </svg>
  );
}

export default function ContactPage() {
  const breadcrumbLd = breadcrumbJsonLd([
    { name: "Maison", path: "/" },
    { name: "Contact", path: "/contact" },
  ]);

  return (
    <>
      <JsonLd data={breadcrumbLd} />

      <div className="bg-[#FAFAF8]">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10 sm:py-14 lg:py-16">
          <nav aria-label="Fil d’Ariane" className="mb-8">
            <ol className="flex items-center gap-1.5 text-xs text-[#A09080]">
              <li>
                <Link href="/" className="hover:text-[#B8935A] transition-colors">
                  Maison
                </Link>
              </li>
              <li aria-hidden className="select-none">
                ›
              </li>
              <li className="font-medium text-[#1A1A1A]" aria-current="page">
                Contact
              </li>
            </ol>
          </nav>

          <header className="mb-10 sm:mb-12 max-w-2xl">
            <div className="mb-3 flex items-center gap-2">
              <div className="h-px w-8 bg-gradient-to-r from-[#B8935A]/70 to-transparent" />
              <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-[0.18em] text-[#B8935A]">
                Contact
              </span>
            </div>
            <h1 className="font-serif text-[1.75rem] sm:text-3xl lg:text-[2.25rem] font-semibold leading-tight tracking-[-0.015em] text-[#1A1A1A]">
              Contactez-nous
            </h1>
            <p className="mt-4 text-sm sm:text-base leading-relaxed text-[#6B6560]">
              Une question ou besoin d’aide ? Notre équipe est à votre écoute !
              Contactez-nous par téléphone, e-mail ou passez dans l’un de nos
              showrooms — nous parlons bengali, français et anglais.
            </p>
          </header>

          <div
            className={
              SHOW_CONTACT_FORM
                ? "grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10"
                : "max-w-2xl"
            }
          >
            <section className="rounded-2xl border border-[#E8E2D9] bg-white px-5 py-6 sm:px-7 sm:py-8">
              <h2 className="flex items-center gap-2.5 font-serif text-lg sm:text-xl font-semibold text-[#1A1A1A]">
                <IconClock />
                Assistance 24h/24 et 7j/7
              </h2>

              <ul className="mt-6 space-y-4 text-sm sm:text-[15px] leading-relaxed text-[#6B6560]">
                <li className="flex gap-3">
                  <IconPin />
                  <a
                    href={MAPS_HREF}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-[#B8935A] transition-colors"
                  >
                    {ADDRESS}
                  </a>
                </li>
                <li className="flex gap-3 items-start">
                  <IconPhone />
                  <span className="flex flex-wrap items-center gap-x-1.5">
                    <a
                      href="tel:+33753305109"
                      className="font-medium text-[#1A1A1A] hover:text-[#B8935A] transition-colors"
                    >
                      +33(0)753305109
                    </a>
                    <span className="text-[#A09080]">/</span>
                    <a
                      href="tel:+33188502394"
                      className="font-medium text-[#1A1A1A] hover:text-[#B8935A] transition-colors"
                    >
                      0188502394
                    </a>
                  </span>
                </li>
                <li className="flex gap-3">
                  <IconMail />
                  <a
                    href="mailto:meublesdeparis@gmail.com"
                    className="font-medium text-[#1A1A1A] hover:text-[#B8935A] transition-colors"
                  >
                    meublesdeparis@gmail.com
                  </a>
                </li>
              </ul>

              <div className="mt-8 border-t border-[#E8E2D9] pt-6">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#6B6560]">
                  Suivez-nous sur les réseaux sociaux
                </p>
                <ul className="mt-4 flex items-center gap-2.5">
                  {SOCIAL_LINKS.map((social) => {
                    const Icon = social.icon;
                    return (
                      <li key={social.name}>
                        <a
                          href={social.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={social.name}
                          className="flex h-11 w-11 items-center justify-center rounded-full border border-[#E8E2D9] bg-[#FAFAF8] text-[#6B6560] transition hover:border-[#B8935A]/45 hover:bg-[#F0EBE3] hover:text-[#B8935A]"
                        >
                          <Icon />
                        </a>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </section>

            {SHOW_CONTACT_FORM ? (
              <section className="rounded-2xl border border-[#E8E2D9] bg-white px-5 py-6 sm:px-7 sm:py-8">
                <h2 className="font-serif text-lg sm:text-xl font-semibold text-[#1A1A1A]">
                  Pour toute demande, remplissez le formulaire.
                </h2>
                <p className="mt-2 mb-6 text-sm text-[#6B6560]">
                  Nous vous répondons généralement sous 48 heures.
                </p>
                <ContactForm />
              </section>
            ) : null}
          </div>
        </div>
      </div>
    </>
  );
}
