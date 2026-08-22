import type { Metadata } from "next";
import { NotFoundView } from "@/components/NotFoundView";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "Page introuvable",
  description: "Cette page n’existe pas ou a été déplacée.",
  path: "/404",
  noIndex: true,
  noFollow: true,
});

/** `/404` must not hit the `/{sectionSlug}` lookup or throw notFound() (that reloads). */
export default function FourOhFourPage() {
  return <NotFoundView />;
}
