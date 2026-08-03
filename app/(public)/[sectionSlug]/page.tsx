import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ProductCard from "@/components/product/ProductCard";
import { APP_NAME } from "@/lib/config";
import { fetchHomepageSectionBySlug } from "@/lib/seo/catalog";
import { breadcrumbJsonLd, JsonLd } from "@/lib/seo/jsonLd";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const revalidate = 60;

type PageParams = {
  params: Promise<{ sectionSlug: string }>;
};

/** Future-ready: description is not on the model yet, but the UI can show it. */
type SectionDescription = { description?: string };

export async function generateMetadata({
  params,
}: PageParams): Promise<Metadata> {
  const { sectionSlug } = await params;
  const section = await fetchHomepageSectionBySlug(sectionSlug);

  if (!section) {
    return buildPageMetadata({
      title: "Section not found",
      description: "This collection is unavailable.",
      path: `/${sectionSlug}`,
      noIndex: true,
    });
  }

  return buildPageMetadata({
    title: section.title,
    description: `Browse all products in ${section.title}.`,
    path: `/${section.slug}`,
    keywords: [section.title, "furniture", "home décor", APP_NAME],
  });
}

export default async function HomepageSectionPage({ params }: PageParams) {
  const { sectionSlug } = await params;
  const section = await fetchHomepageSectionBySlug(sectionSlug);

  if (!section) {
    notFound();
  }

  const description = (section as SectionDescription).description?.trim();
  const products = section.products ?? [];
  const count = products.length;

  const breadcrumbLd = breadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: section.title, path: `/${section.slug}` },
  ]);

  return (
    <>
      <JsonLd data={breadcrumbLd} />
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-10 sm:py-14 lg:py-16">
        <header className="mb-8 sm:mb-10 lg:mb-12">
          <h1 className="font-serif text-[1.6rem] sm:text-3xl lg:text-[2.15rem] font-semibold leading-tight tracking-[-0.015em] text-[#1A1A1A]">
            {section.title}
          </h1>

          {description ? (
            <p className="mt-2.5 sm:mt-3 max-w-2xl text-sm sm:text-base text-[#6B6560]">
              {description}
            </p>
          ) : null}

          <p className="mt-3 sm:mt-4 text-xs sm:text-sm font-medium tracking-[0.04em] text-[#A09080]">
            {count > 0
              ? `${count} product${count === 1 ? "" : "s"}`
              : "No products available"}
          </p>
        </header>

        {count === 0 ? (
          <div className="rounded-xl border border-dashed border-[#E8E2D9] bg-[#FAFAF8] px-6 py-14 sm:py-20 text-center">
            <p className="text-base sm:text-lg font-medium text-[#1A1A1A]">
              This collection is empty for now
            </p>
            <p className="mt-2 text-sm text-[#6B6560]">
              New pieces will appear here when they become available.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-5 lg:gap-6">
            {products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
