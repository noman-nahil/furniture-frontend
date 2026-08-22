import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { CookieSettingsButton } from "@/components/consent/CookieSettingsButton";
import { APP_NAME } from "@/lib/config";
import { breadcrumbJsonLd, JsonLd } from "@/lib/seo/jsonLd";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "Politique de confidentialité",
  description:
    "Politique de confidentialité de Meubles De Paris : collecte, utilisation, partage, conservation et vos droits RGPD concernant vos données personnelles.",
  path: "/privacy-policy",
  keywords: [
    "politique de confidentialité",
    "RGPD",
    "données personnelles",
    "cookies",
    APP_NAME,
  ],
});

const COLLECTED = [
  "Nom, prénom",
  "Adresse e-mail",
  "Numéro de téléphone",
  "Adresse postale",
  "Historique de vos commandes",
  "Adresse IP et données de navigation (via cookies)",
] as const;

const USES = [
  "Traiter et livrer vos commandes",
  "Répondre à vos demandes et questions",
  "Améliorer notre service client et votre expérience utilisateur",
  "Vous envoyer des offres spéciales ou communications marketing (si vous y avez consenti)",
] as const;

const PARTNERS = [
  "Nos partenaires logistiques pour la livraison",
  "Nos prestataires techniques (hébergement, maintenance)",
] as const;

const RIGHTS = [
  "Droit d’accès à vos données",
  "Droit de rectification ou suppression",
  "Droit d’opposition au traitement",
  "Droit à la portabilité des données",
  "Droit de retirer votre consentement à tout moment",
] as const;

function BulletList({ items }: { items: readonly string[] }) {
  return (
    <ul className="mt-4 space-y-3">
      {items.map((item) => (
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
  );
}

function Section({
  number,
  title,
  children,
}: {
  number: number;
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-[#E8E2D9] bg-white px-5 py-6 sm:px-7 sm:py-7">
      <h2 className="font-serif text-lg sm:text-xl font-semibold text-[#1A1A1A]">
        <span className="mr-2 text-[#B8935A]">{number}.</span>
        {title}
      </h2>
      {children}
    </section>
  );
}

export default function PrivacyPolicyPage() {
  const breadcrumbLd = breadcrumbJsonLd([
    { name: "Maison", path: "/" },
    { name: "Politique de confidentialité", path: "/privacy-policy" },
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
                Politique de confidentialité
              </li>
            </ol>
          </nav>

          <header className="mb-10 sm:mb-12">
            <div className="mb-3 flex items-center gap-2">
              <div className="h-px w-8 bg-gradient-to-r from-[#B8935A]/70 to-transparent" />
              <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-[0.18em] text-[#B8935A]">
                Informations légales
              </span>
            </div>
            <h1 className="font-serif text-[1.75rem] sm:text-3xl lg:text-[2.25rem] font-semibold leading-tight tracking-[-0.015em] text-[#1A1A1A]">
              Politique de confidentialité
            </h1>
            <p className="mt-4 text-sm sm:text-base leading-relaxed text-[#6B6560]">
              Chez Meubles De Paris, la protection de vos données personnelles est
              une priorité. Cette politique de confidentialité explique quelles
              informations nous collectons, comment nous les utilisons, et quels
              sont vos droits.
            </p>
          </header>

          <div className="space-y-6">
            <Section number={1} title="Collecte des données personnelles">
              <p className="mt-3 text-sm sm:text-[15px] leading-relaxed text-[#6B6560]">
                Lorsque vous visitez notre site, passez une commande, ou remplissez
                un formulaire de contact, nous pouvons collecter les informations
                suivantes :
              </p>
              <BulletList items={COLLECTED} />
            </Section>

            <Section number={2} title="Utilisation des données">
              <p className="mt-3 text-sm sm:text-[15px] leading-relaxed text-[#6B6560]">
                Les données personnelles collectées sont utilisées pour :
              </p>
              <BulletList items={USES} />
            </Section>

            <Section number={3} title="Partage des données">
              <p className="mt-3 text-sm sm:text-[15px] leading-relaxed text-[#6B6560]">
                Nous ne partageons jamais vos données personnelles avec des tiers
                à des fins commerciales. Vos données peuvent être partagées
                uniquement avec :
              </p>
              <BulletList items={PARTNERS} />
              <p className="mt-4 text-sm sm:text-[15px] leading-relaxed text-[#6B6560]">
                Ces partenaires s’engagent à respecter la confidentialité et la
                sécurité de vos données.
              </p>
            </Section>

            <Section number={4} title="Sécurité">
              <p className="mt-3 text-sm sm:text-[15px] leading-relaxed text-[#6B6560]">
                Nous mettons en œuvre des mesures de sécurité techniques et
                organisationnelles pour protéger vos données contre l’accès non
                autorisé, la perte ou la divulgation.
              </p>
            </Section>

            <Section number={5} title="Durée de conservation">
              <p className="mt-3 text-sm sm:text-[15px] leading-relaxed text-[#6B6560]">
                Vos données sont conservées uniquement pendant la durée
                nécessaire à leur finalité (ex. : durée de la relation commerciale
                ou obligations légales).
              </p>
            </Section>

            <Section number={6} title="Vos droits">
              <p className="mt-3 text-sm sm:text-[15px] leading-relaxed text-[#6B6560]">
                Conformément au RGPD, vous disposez des droits suivants :
              </p>
              <BulletList items={RIGHTS} />
              <p className="mt-5 text-sm sm:text-[15px] leading-relaxed text-[#6B6560]">
                Pour exercer vos droits, contactez-nous à :
              </p>
              <p className="mt-2 text-sm sm:text-[15px] leading-relaxed">
                <a
                  href="mailto:meublesdeparis@gmail.com"
                  className="font-medium text-[#1A1A1A] underline decoration-[#E8E2D9] underline-offset-2 hover:text-[#B8935A] hover:decoration-[#B8935A]"
                >
                  meublesdeparis@gmail.com
                </a>
              </p>
              <p className="mt-1 text-sm sm:text-[15px] leading-relaxed">
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
              </p>
            </Section>

            <Section number={7} title="Cookies">
              <p className="mt-3 text-sm sm:text-[15px] leading-relaxed text-[#6B6560]">
                Nous utilisons des cookies pour améliorer votre navigation. Pour
                en savoir plus, consultez notre{" "}
                <CookieSettingsButton className="inline font-medium text-[#1A1A1A] underline decoration-[#E8E2D9] underline-offset-2 hover:text-[#B8935A] hover:decoration-[#B8935A] disabled:opacity-60">
                  Politique de cookies
                </CookieSettingsButton>
                .
              </p>
            </Section>

            <Section number={8} title="Modifications">
              <p className="mt-3 text-sm sm:text-[15px] leading-relaxed text-[#6B6560]">
                Cette politique peut être mise à jour. Toute modification
                importante sera affichée sur cette page.
              </p>
            </Section>
          </div>
        </div>
      </div>
    </>
  );
}
