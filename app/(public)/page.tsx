import type { Metadata } from "next";
import { Fragment, Suspense } from "react";
import HeroCarousel from "@/components/banner/HeroCarousel";
import type { HeroBanner } from "@/components/banner/HeroCarousel";
import { FeaturedProducts } from "@/components/product/FeaturedProducts";
import type { PublicHomepageSection } from "@/features/homepage-sections/types";
import { serverFetch, isServerFetchError } from "@/lib/serverFetch";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { DEFAULT_DESCRIPTION, DEFAULT_TITLE, SITE_KEYWORDS } from "@/lib/seo/site";

export const revalidate = 60;

export const metadata: Metadata = {
  ...buildPageMetadata({
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    path: "/",
    keywords: [...SITE_KEYWORDS],
  }),
  // Avoid "Home | Brand" when using the root title template
  title: {
    absolute: DEFAULT_TITLE,
  },
};

// ─────────────────────────────────────────────
// Async sections — isolated so Suspense can stream
// each in without blocking the rest of the page.
// ─────────────────────────────────────────────

async function HeroCarouselSection() {
  const res = await serverFetch<HeroBanner[]>("/banners", { revalidate: 60 });

  if (isServerFetchError(res)) {
    return null;
  }

  return <HeroCarousel banners={res} />;
}

function HeroCarouselSkeleton() {
  return (
    <div className="w-full h-[300px] sm:h-[500px] md:h-[600px] lg:h-[700px] bg-gray-200 animate-pulse" />
  );
}

function SectionDivider() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8" aria-hidden>
      <div className="flex items-center gap-3">
        <span className="h-px flex-1 bg-gradient-to-r from-transparent to-[#E8E2D9]" />
        <span className="h-1.5 w-1.5 rotate-45 bg-[#B8935A]/50" />
        <span className="h-px flex-1 bg-gradient-to-l from-transparent to-[#E8E2D9]" />
      </div>
    </div>
  );
}

async function HomepageSections() {
  const res = await serverFetch<PublicHomepageSection[]>("/homepage-sections", {
    revalidate: 60,
  });

  if (isServerFetchError(res)) {
    return (
      <section className="max-w-7xl mx-auto px-4 py-14 sm:py-20 text-center">
        <h2 className="text-xl sm:text-2xl font-semibold text-gray-800">Our products</h2>
        <p className="text-gray-500 mt-3 text-sm sm:text-base">
          Couldn&apos;t load products right now — please refresh.
        </p>
      </section>
    );
  }

  const sections = res.filter((section) => section.products.length > 0);

  return sections.map((section, index) => (
    <Fragment key={section._id}>
      {index > 0 && <SectionDivider />}
      <FeaturedProducts
        anchorId={section.slug}
        title={section.title}
        products={section.products}
        viewAllHref={`/${section.slug}`}
      />
    </Fragment>
  ));
}

function HomepageSectionsSkeleton() {
  return (
    <section className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-10 sm:py-14 lg:py-16 animate-pulse">
      <div className="mb-7 sm:mb-9 lg:mb-11 flex items-center justify-between gap-3 sm:gap-6">
        <div className="h-6 sm:h-8 w-36 sm:w-56 rounded bg-gray-200" />
        <div className="h-8 sm:h-10 w-24 sm:w-28 rounded-full bg-gray-200" />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-5 lg:gap-6">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="aspect-[4/3] rounded-lg sm:rounded-xl bg-gray-200" />
        ))}
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────

export default function HomePage() {
  return (
  <>
    <Suspense fallback={<HeroCarouselSkeleton />}>
      <HeroCarouselSection />
    </Suspense>
    <div className="max-w-7xl mx-auto px-3 sm:px-4 py-6 sm:py-10">
      <Suspense fallback={<HomepageSectionsSkeleton />}>
        <HomepageSections />
      </Suspense>
    </div>
    </>
  );
}
