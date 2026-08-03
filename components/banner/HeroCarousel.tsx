"use client";

import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import Image from "next/image";
import { getImageUrl } from "@/lib/image";

/** Shape the backend's active-banner endpoint returns for each slide. */
export type HeroBanner = {
  image: string;
  alt: string;
};

const TRANSITION_MS = 700;
const AUTOPLAY_MS = 5000;
const SWIPE_THRESHOLD_PX = 50;

const FIRST_REAL_INDEX = 1;

export default function HeroCarousel({ banners }: { banners: readonly HeroBanner[] }) {
  const [index, setIndex] = useState(FIRST_REAL_INDEX);
  const [withTransition, setWithTransition] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  // ✅ Locks all navigation while a slide transition (or the post-clone
  //    snap-back) is in flight. This is the actual fix: previously
  //    nothing stopped a second click from landing while index was
  //    sitting on a clone slide awaiting snap-back, which pushed index
  //    past the end of `slides` (undefined slide → blank hero).
  const isAnimatingRef = useRef(false);

  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  // Same clone-padded track as before — last slide prepended and first
  // appended — just derived from the fetched banners instead of a literal.
  const slides = useMemo(
    () =>
      banners.length > 0
        ? [banners[banners.length - 1], ...banners, banners[0]]
        : [],
    [banners],
  );
  const LAST_REAL_INDEX = banners.length;

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const onChange = () => setReducedMotion(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  // ─── Navigation — all guarded by isAnimatingRef ────────────────────────

  const goToNext = useCallback(() => {
    if (isAnimatingRef.current) return;
    isAnimatingRef.current = true;
    setWithTransition(true);
    setIndex((prev) => prev + 1);
  }, []);

  const goToPrevious = useCallback(() => {
    if (isAnimatingRef.current) return;
    isAnimatingRef.current = true;
    setWithTransition(true);
    setIndex((prev) => prev - 1);
  }, []);

  const goToSlide = useCallback((dotIndex: number) => {
    if (isAnimatingRef.current) return;
    isAnimatingRef.current = true;
    setWithTransition(true);
    setIndex(dotIndex + FIRST_REAL_INDEX);
  }, []);

  // ─── Autoplay ──────────────────────────────────────────────────────────

  useEffect(() => {
    if (isPaused || reducedMotion) return;
    const interval = setInterval(goToNext, AUTOPLAY_MS);
    return () => clearInterval(interval);
  }, [isPaused, reducedMotion, goToNext]);

  // ─── Seamless loop: snap back across a clone, driven by the real
  //     transitionend event instead of a guessed setTimeout ─────────────

  const handleTransitionEnd = useCallback(() => {
    const atEndClone = index === slides.length - 1;
    const atStartClone = index === 0;

    if (atEndClone || atStartClone) {
      // Snap instantly (no transition) to the matching real slide.
      setWithTransition(false);
      setIndex(atEndClone ? FIRST_REAL_INDEX : LAST_REAL_INDEX);
      // Release the lock on the *next* frame, after the no-transition
      // snap has committed — otherwise the browser can coalesce the
      // withTransition=false update with the click that follows.
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          isAnimatingRef.current = false;
        });
      });
    } else {
      isAnimatingRef.current = false;
    }
  }, [index, slides.length, LAST_REAL_INDEX]);

  // Fallback: if transitionend never fires (e.g. withTransition was
  // already false, so there's nothing to transition), don't leave the
  // lock stuck forever.
  useEffect(() => {
    if (!withTransition) {
      const id = requestAnimationFrame(() => {
        isAnimatingRef.current = false;
      });
      return () => cancelAnimationFrame(id);
    }
  }, [withTransition, index]);

  // ─── Touch / swipe ──────────────────────────────────────────────────────

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
    touchEndX.current = null;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (touchStartX.current == null || touchEndX.current == null) {
      touchStartX.current = null;
      touchEndX.current = null;
      return;
    }
    const distance = touchStartX.current - touchEndX.current;
    if (distance > SWIPE_THRESHOLD_PX) goToNext();
    else if (distance < -SWIPE_THRESHOLD_PX) goToPrevious();

    touchStartX.current = null;
    touchEndX.current = null;
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft") { e.preventDefault(); goToPrevious(); }
    if (e.key === "ArrowRight") { e.preventDefault(); goToNext(); }
  };

  // Nothing to show until an admin publishes at least one active banner.
  if (slides.length === 0) return null;

  const currentSlideIndex =
    ((index - FIRST_REAL_INDEX) % banners.length + banners.length) % banners.length;

  // ✅ Defensive: even if index ever ends up out of bounds (shouldn't
  //    happen now, but this makes the component fail-safe instead of
  //    rendering a blank slide if it ever does), clamp before render.
  const safeIndex = Math.min(Math.max(index, 0), slides.length - 1);

  return (
    <div
      ref={containerRef}
      className="relative w-full overflow-hidden group focus:outline-none"
      role="region"
      aria-roledescription="carousel"
      aria-label="Featured banners"
      tabIndex={0}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onBlur={() => setIsPaused(false)}
      onKeyDown={handleKeyDown}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <p className="sr-only" aria-live="polite">
        Slide {currentSlideIndex + 1} of {banners.length}
      </p>

      <div
        ref={trackRef}
        className={withTransition ? "flex transition-transform ease-in-out" : "flex"}
        style={{
          transform: `translateX(-${safeIndex * 100}%)`,
          transitionDuration: withTransition ? `${TRANSITION_MS}ms` : "0ms",
        }}
        onTransitionEnd={handleTransitionEnd}
      >
        {slides.map((banner, i) => (
          <div
            key={i}
            className="relative min-w-full h-[300px] sm:h-[500px] md:h-[600px] lg:h-[700px] bg-[#F5F0EA]"
            role="group"
            aria-roledescription="slide"
            aria-hidden={i !== safeIndex}
          >
            {/* Mobile: blurred fill so the hero stays tall without empty bars */}
            <Image
              src={getImageUrl(banner.image)}
              alt=""
              fill
              sizes="100vw"
              className="object-cover blur-md scale-110 sm:hidden"
              aria-hidden
              priority={i === FIRST_REAL_INDEX}
            />
            {/* Mobile: full banner visible; sm+: cover hero unchanged */}
            <Image
              src={getImageUrl(banner.image)}
              alt={banner.alt}
              fill
              sizes="100vw"
              className="object-contain sm:object-cover"
              priority={i === FIRST_REAL_INDEX}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={goToPrevious}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-10
                   w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center
                   bg-white/90 hover:bg-white rounded-full shadow-lg
                   opacity-0 group-hover:opacity-100 group-focus-within:opacity-100
                   transition-all duration-300
                   hover:scale-110 active:scale-95"
        aria-label="Previous slide"
      >
        <svg className="w-5 h-5 sm:w-6 sm:h-6 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      <button
        type="button"
        onClick={goToNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-10
                   w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center
                   bg-white/90 hover:bg-white rounded-full shadow-lg
                   opacity-0 group-hover:opacity-100 group-focus-within:opacity-100
                   transition-all duration-300
                   hover:scale-110 active:scale-95"
        aria-label="Next slide"
      >
        <svg className="w-5 h-5 sm:w-6 sm:h-6 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
        </svg>
      </button>

      <div
        className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10
                   flex items-center gap-2 bg-black/30 backdrop-blur-sm
                   px-4 py-2 rounded-full"
      >
        {banners.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => goToSlide(i)}
            className="relative group/dot"
            aria-label={`Go to slide ${i + 1}`}
            aria-current={currentSlideIndex === i ? "true" : undefined}
          >
            <div
              className={`h-2 w-2 rounded-full transition-all duration-300 ${
                currentSlideIndex === i ? "bg-white w-8" : "bg-white/50 hover:bg-white/75"
              }`}
            />
            {currentSlideIndex === i && (
              <div className="absolute inset-0 -m-1 rounded-full bg-white/20 animate-ping" aria-hidden />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}