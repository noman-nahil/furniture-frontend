// features/catalog/components/CategoryCard.tsx
import Link from "next/link";
import Image from "next/image";
import { getImageUrl } from "@/lib/image";
import { shimmerBlurDataUrl } from "../utils/shimmer";

type CategoryCardProps = {
  name: string;
  href: string;
  image?: string;
  /** Used to stagger the entrance animation across the grid — purely visual. */
  index?: number;
};

export function CategoryCard({ name, href, image, index = 0 }: CategoryCardProps) {
  const imageSrc = image ? getImageUrl(image) : null;

  return (
    <Link
      href={href}
      aria-label={`Browse ${name}`}
      style={{ animationDelay: `${Math.min(index, 8) * 50}ms` }}
      className="group relative flex flex-col overflow-hidden rounded-xl border border-[#E8E2D9] bg-[#FAFAF8] opacity-0 animate-fade-in-up transition-all duration-300 hover:border-[#B8935A]/40 hover:shadow-[0_8px_30px_rgba(184,147,90,0.12)] hover:-translate-y-0.5"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#F0EBE3]">
        {imageSrc ? (
          <Image
            src={imageSrc}
            alt={name}
            fill
            sizes="(max-width: 768px) 50vw, (max-width: 1024px) 50vw, 33vw"
            placeholder="blur"
            blurDataURL={shimmerBlurDataUrl()}
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.06]"
          />
        ) : null}

        {/* Base gradient — always visible, keeps text legible over any photo */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#1A1A1A]/60 via-[#1A1A1A]/10 to-transparent" />

        {/* Deeper veil on hover — same interaction language as ProductCard */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#1A1A1A]/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        <div className="absolute inset-x-4 bottom-4 sm:inset-x-5 sm:bottom-5">
          <span className="block text-lg sm:text-xl font-semibold text-white tracking-tight drop-shadow-sm">
            {name}
          </span>
          <span className="mt-1 flex items-center gap-1 text-xs font-semibold uppercase tracking-[0.08em] text-white/0 -translate-y-1 group-hover:text-white/90 group-hover:translate-y-0 transition-all duration-300 ease-out">
            Explore collection
            <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 12 12" aria-hidden>
              <path d="M2 6h8M6 2l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
        </div>
      </div>
    </Link>
  );
}
