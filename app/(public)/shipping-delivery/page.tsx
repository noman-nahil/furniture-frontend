import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { APP_NAME } from "@/lib/config";
import { breadcrumbJsonLd, JsonLd } from "@/lib/seo/jsonLd";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "Expédition & Livraison",
  description:
    "Livraison Meubles De Paris en Île-de-France : délais de 3 à 7 jours, installation professionnelle incluse, paiement à la livraison et suivi de commande.",
  path: "/shipping-delivery",
  keywords: [
    "livraison",
    "expédition",
    "Île-de-France",
    "installation",
    "paiement à la livraison",
    APP_NAME,
  ],
});

const ZONES = [
  "Nous livrons dans toute l’Île-de-France.",
  "Pour les livraisons hors région parisienne, merci de nous contacter pour un devis personnalisé.",
] as const;

const DELAYS = [
  "La plupart de nos livraisons sont effectuées sous 3 à 7 jours ouvrables après confirmation de commande.",
  "Les délais peuvent varier selon la disponibilité des produits ou les conditions de transport.",
] as const;

const INSTALLATION = [
  "Nos livreurs assurent le montage et l’installation de vos meubles directement chez vous.",
  "Ce service est inclus dans le prix, sans frais supplémentaires.",
] as const;

const PAYMENT = [
  "Le paiement peut être effectué à la livraison (espèces ou carte bancaire).",
  "Des facilités de paiement en plusieurs fois sans frais sont également disponibles.",
] as const;

const TRACKING = [
  "Confirmer les informations de livraison",
  "Planifier la date et l’heure de livraison selon votre disponibilité",
  "Vous fournir un suivi en temps réel si nécessaire",
] as const;

const IMPORTANT = [
  "Merci de vérifier que les accès (escaliers, ascenseur, portes) permettent la livraison de vos meubles.",
  "En cas d’absence ou de difficulté d’accès, des frais de re-livraison peuvent s’appliquer.",
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
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-[#E8E2D9] bg-white px-5 py-6 sm:px-7 sm:py-7">
      <h2 className="font-serif text-lg sm:text-xl font-semibold text-[#1A1A1A]">
        {title}
      </h2>
      {children}
    </section>
  );
}

function SectionDivider() {
  return (
    <div className="flex items-center gap-3" aria-hidden>
      <span className="h-px flex-1 bg-gradient-to-r from-transparent to-[#E8E2D9]" />
      <span className="h-1.5 w-1.5 rotate-45 bg-[#B8935A]/50" />
      <span className="h-px flex-1 bg-gradient-to-l from-transparent to-[#E8E2D9]" />
    </div>
  );
}

export default function ShippingDeliveryPage() {
  const breadcrumbLd = breadcrumbJsonLd([
    { name: "Maison", path: "/" },
    { name: "Expédition & Livraison", path: "/shipping-delivery" },
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
                Expédition & Livraison
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
              Expédition & Livraison
            </h1>
            <p className="mt-4 text-sm sm:text-base leading-relaxed text-[#6B6560]">
              Chez Meubles De Paris, nous nous engageons à livrer vos meubles
              rapidement, en toute sécurité et avec un service de qualité.
            </p>
          </header>

          <div className="space-y-6">
            <Section title="Zones de livraison">
              <BulletList items={ZONES} />
            </Section>

            <Section title="Délais de livraison">
              <BulletList items={DELAYS} />
            </Section>

            <Section title="Installation professionnelle">
              <BulletList items={INSTALLATION} />
            </Section>

            <Section title="Paiement à la livraison">
              <BulletList items={PAYMENT} />
            </Section>

            <Section title="Suivi de commande">
              <p className="mt-3 text-sm sm:text-[15px] leading-relaxed text-[#6B6560]">
                Une fois votre commande validée, notre équipe vous contacte pour :
              </p>
              <BulletList items={TRACKING} />
            </Section>

            <Section title="Informations importantes">
              <BulletList items={IMPORTANT} />
            </Section>

            <Section title="Besoin d’aide ?">
              <p className="mt-3 text-sm sm:text-[15px] leading-relaxed text-[#6B6560]">
                Pour toute question concernant la livraison ou l’expédition,
                contactez-nous :
              </p>
              <p className="mt-3 text-sm sm:text-[15px] leading-relaxed">
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
          </div>

          <div className="mt-12 sm:mt-14">
            <SectionDivider />
            <p className="mt-8 text-center font-serif text-base sm:text-lg font-semibold text-[#1A1A1A]">
              Meubles De Paris — Livraison rapide, service soigné, satisfaction
              garantie.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
