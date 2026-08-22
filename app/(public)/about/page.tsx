import type { Metadata } from "next";
import Link from "next/link";
import { APP_NAME } from "@/lib/config";
import { breadcrumbJsonLd, JsonLd } from "@/lib/seo/jsonLd";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "À propos de nous",
  description:
    "L’histoire de Meubles De Paris – Bangladesh Furniture : plus de 12 ans au service de Paris, mobilier importé de Turquie et d’Italie, trois magasins dont un showroom de 5 000 m² à La Courneuve.",
  path: "/about",
  keywords: [
    "à propos",
    "histoire",
    "Salim Reza",
    "La Courneuve",
    "mobilier turc",
    "mobilier italien",
    APP_NAME,
  ],
});

const ADVANTAGES = [
  "Livraison rapide et installation professionnelle",
  "Paiement en plusieurs fois sans frais",
  "Jusqu’à 30 % de réduction pour tous les clients",
  "Service multilingue en bengali, français et anglais",
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

export default function AboutPage() {
  const breadcrumbLd = breadcrumbJsonLd([
    { name: "Maison", path: "/" },
    { name: "À propos", path: "/about" },
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
                À propos
              </li>
            </ol>
          </nav>

          <header className="mb-10 sm:mb-12">
            <div className="mb-3 flex items-center gap-2">
              <div className="h-px w-8 bg-gradient-to-r from-[#B8935A]/70 to-transparent" />
              <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-[0.18em] text-[#B8935A]">
                Meubles De Paris
              </span>
            </div>
            <h1 className="font-serif text-[1.75rem] sm:text-3xl lg:text-[2.25rem] font-semibold leading-tight tracking-[-0.015em] text-[#1A1A1A]">
              L’histoire de Meubles De Paris
            </h1>
          </header>

          <div className="space-y-6 text-sm sm:text-base leading-relaxed text-[#6B6560]">
            <p>
              Meubles De Paris – Bangladesh Furniture est fier de servir la
              communauté parisienne depuis plus de 12 ans. Fondée par Salim Reza,
              notre entreprise est née d’une mission simple : offrir aux foyers
              français des meubles de haute qualité, élégants et accessibles, tout
              en restant profondément attachée à ses racines bangladaises.
            </p>
            <p>
              Nous sommes spécialisés dans le mobilier haut de gamme importé
              directement de Turquie et d’Italie. Notre collection comprend des
              canapés luxueux, des ensembles de chambre, des tables de salle à
              manger, des armoires et bien d’autres meubles soigneusement
              sélectionnés pour leur qualité de fabrication, leur confort et leur
              design contemporain.
            </p>
            <p>
              Avec trois magasins en région parisienne, dont un showroom principal
              de 5 000 m² à La Courneuve, Meubles De Paris est aujourd’hui l’une
              des enseignes de mobilier les plus importantes et les plus reconnues
              de Paris.
            </p>
          </div>

          <section className="mt-10 rounded-2xl border border-[#E8E2D9] bg-white px-5 py-6 sm:px-7 sm:py-8">
            <h2 className="font-serif text-lg sm:text-xl font-semibold text-[#1A1A1A]">
              Nos clients bénéficient de nombreux avantages
            </h2>
            <ul className="mt-5 space-y-3">
              {ADVANTAGES.map((item) => (
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

          <p className="mt-10 text-sm sm:text-base leading-relaxed text-[#6B6560]">
            Que vous aménagiez une nouvelle maison ou souhaitiez moderniser votre
            intérieur, Meubles De Paris vous accompagne avec des solutions
            alliant élégance, qualité et excellent service.
          </p>

          <div className="mt-12 sm:mt-14">
            <SectionDivider />
            <p className="mt-8 text-center font-serif text-base sm:text-lg font-semibold text-[#1A1A1A]">
              Meubles De Paris — Là où le confort rencontre l’élégance. ✨
            </p>
            <p className="mt-2 text-center text-sm text-[#A09080]">
              Meubles De Paris
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
