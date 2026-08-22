import type { Metadata } from "next";
import Link from "next/link";
import { APP_NAME } from "@/lib/config";
import { breadcrumbJsonLd, JsonLd } from "@/lib/seo/jsonLd";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "Retours & Échanges",
  description:
    "Politique de retours et d’échanges de Meubles De Paris : 14 jours après livraison, conditions, frais et démarches auprès du service client.",
  path: "/returns-exchanges",
  keywords: [
    "retours",
    "échanges",
    "rétractation",
    "politique de retour",
    APP_NAME,
  ],
});

const SECTIONS = [
  {
    title: "Conditions de retour",
    items: [
      "Vous disposez de 14 jours après la livraison pour demander un retour ou un échange.",
      "Les articles doivent être dans leur état d’origine, non utilisés, et dans leur emballage d’origine.",
      "Les meubles installés ou endommagés ne peuvent pas être retournés.",
    ],
  },
  {
    title: "Échange de produit",
    items: [
      "Les échanges sont possibles sous réserve de disponibilité du nouveau modèle.",
      "Tout échange doit être validé au préalable par notre service client.",
      "Les frais de transport peuvent s’appliquer selon les cas.",
    ],
  },
  {
    title: "Frais de retour",
    items: [
      "En cas de rétractation, les frais de retour sont à la charge du client, sauf si le produit est défectueux ou livré par erreur.",
      "Pour les produits défectueux, nous organiserons un remplacement gratuit.",
    ],
  },
] as const;

function SectionDivider() {
  return (
    <div className="flex items-center gap-3" aria-hidden>
      <span className="h-px flex-1 bg-gradient-to-r from-transparent to-[#E8E2D9]" />
      <span className="h-1.5 w-1.5 rotate-45 bg-[#B8935A]/50" />
      <span className="h-px flex-1 bg-gradient-to-l from-transparent to-[#E8E2D9]" />
    </div>
  );
}

export default function ReturnsExchangesPage() {
  const breadcrumbLd = breadcrumbJsonLd([
    { name: "Maison", path: "/" },
    { name: "Retours & Échanges", path: "/returns-exchanges" },
  ]);

  return (
    <>
      <JsonLd data={breadcrumbLd} />

      <div className="bg-[#FAFAF8]">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-10 sm:py-14 lg:py-16">
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
                Retours & Échanges
              </li>
            </ol>
          </nav>

          <header className="mb-10 sm:mb-12">
            <div className="mb-3 flex items-center gap-2">
              <div className="h-px w-8 bg-gradient-to-r from-[#B8935A]/70 to-transparent" />
              <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-[0.18em] text-[#B8935A]">
                Service client
              </span>
            </div>
            <h1 className="font-serif text-[1.75rem] sm:text-3xl lg:text-[2.25rem] font-semibold leading-tight tracking-[-0.015em] text-[#1A1A1A]">
              Retours & Échanges
            </h1>
            <p className="mt-4 text-sm sm:text-base leading-relaxed text-[#6B6560]">
              Chez Meubles De Paris, votre satisfaction est notre priorité. Si un
              produit ne vous convient pas, nous faisons de notre mieux pour
              faciliter le retour ou l’échange.
            </p>
          </header>

          <div className="space-y-8">
            {SECTIONS.map((section) => (
              <section
                key={section.title}
                className="rounded-2xl border border-[#E8E2D9] bg-white px-5 py-6 sm:px-7 sm:py-7"
              >
                <h2 className="font-serif text-lg sm:text-xl font-semibold text-[#1A1A1A]">
                  {section.title}
                </h2>
                <ul className="mt-4 space-y-3">
                  {section.items.map((item) => (
                    <li
                      key={item}
                      className="flex gap-3 text-sm sm:text-[15px] leading-relaxed text-[#6B6560]"
                    >
                      <span
                        className="mt-2 h-1.5 w-1.5 shrink-0 rotate-45 bg-[#B8935A]"
                        aria-hidden
                      />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </section>
            ))}

            <section className="rounded-2xl border border-[#E8E2D9] bg-white px-5 py-6 sm:px-7 sm:py-7">
              <h2 className="font-serif text-lg sm:text-xl font-semibold text-[#1A1A1A]">
                Comment faire une demande de retour ?
              </h2>
              <ol className="mt-4 space-y-3">
                <li className="flex gap-3 text-sm sm:text-[15px] leading-relaxed text-[#6B6560]">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#B8935A]/12 text-[11px] font-semibold text-[#B8935A]">
                    1
                  </span>
                  <span>
                    Contactez notre service client par e-mail à{" "}
                    <a
                      href="mailto:meublesdeparis@gmail.com"
                      className="font-medium text-[#1A1A1A] underline decoration-[#E8E2D9] underline-offset-2 hover:text-[#B8935A] hover:decoration-[#B8935A]"
                    >
                      meublesdeparis@gmail.com
                    </a>{" "}
                    ou par téléphone au{" "}
                    <a
                      href="tel:+33753305109"
                      className="font-medium text-[#1A1A1A] underline decoration-[#E8E2D9] underline-offset-2 hover:text-[#B8935A] hover:decoration-[#B8935A]"
                    >
                      07 53 30 51 09
                    </a>
                    {" / "}
                    <a
                      href="tel:+33188502394"
                      className="font-medium text-[#1A1A1A] underline decoration-[#E8E2D9] underline-offset-2 hover:text-[#B8935A] hover:decoration-[#B8935A]"
                    >
                      01 88 50 23 94
                    </a>
                    .
                  </span>
                </li>
                <li className="flex gap-3 text-sm sm:text-[15px] leading-relaxed text-[#6B6560]">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#B8935A]/12 text-[11px] font-semibold text-[#B8935A]">
                    2
                  </span>
                  <span>
                    Indiquez votre numéro de commande, la référence du produit, et
                    le motif du retour.
                  </span>
                </li>
                <li className="flex gap-3 text-sm sm:text-[15px] leading-relaxed text-[#6B6560]">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#B8935A]/12 text-[11px] font-semibold text-[#B8935A]">
                    3
                  </span>
                  <span>
                    Notre équipe vous répondra sous 48 heures pour vous indiquer
                    la marche à suivre.
                  </span>
                </li>
              </ol>
            </section>

            <section className="rounded-2xl border border-[#E8E2D9] bg-white px-5 py-6 sm:px-7 sm:py-7">
              <h2 className="font-serif text-lg sm:text-xl font-semibold text-[#1A1A1A]">
                Exceptions
              </h2>
              <ul className="mt-4 space-y-3">
                <li className="flex gap-3 text-sm sm:text-[15px] leading-relaxed text-[#6B6560]">
                  <span
                    className="mt-2 h-1.5 w-1.5 shrink-0 rotate-45 bg-[#B8935A]"
                    aria-hidden
                  />
                  <span>
                    Les commandes sur mesure ou personnalisées ne sont ni
                    remboursables ni échangeables.
                  </span>
                </li>
                <li className="flex gap-3 text-sm sm:text-[15px] leading-relaxed text-[#6B6560]">
                  <span
                    className="mt-2 h-1.5 w-1.5 shrink-0 rotate-45 bg-[#B8935A]"
                    aria-hidden
                  />
                  <span>
                    Les produits en promotion ou soldés peuvent ne pas être
                    éligibles au retour, sauf défaut.
                  </span>
                </li>
              </ul>
            </section>
          </div>

          <div className="mt-12 sm:mt-14">
            <SectionDivider />
            <p className="mt-8 text-center text-sm sm:text-base leading-relaxed text-[#6B6560]">
              Merci de votre confiance.
            </p>
            <p className="mt-2 text-center text-sm leading-relaxed text-[#A09080]">
              Meubles De Paris – Bangladesh Furniture reste à votre écoute pour
              toute question.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
