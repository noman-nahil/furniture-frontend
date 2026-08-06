"use client";

import Link from "next/link";
import Image from "next/image";
import {
  useState,
  useEffect,
  useRef,
  useCallback,
  useLayoutEffect,
  Suspense,
} from "react";
import { createPortal } from "react-dom";
import { usePathname } from "next/navigation";
import {
  ShoppingCart,
  Menu,
  X,
  ChevronDown,
} from "lucide-react";
import { getCartItemCount } from "@/lib/cart";
import { APP_NAME, LOGO_PATH } from "@/lib/config";
import type { CategoryNav } from "@/types/categoryNav";
import { useAuth } from "@/contexts/AuthContext";
import {
  NavbarSearchField,
  NavbarSearchProvider,
  SEARCH_FIELD_INPUT_CLASS,
} from "@/components/layout/NavbarSearch";

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

type NavUser = {
  name: string;
  email: string;
  role: string;
  dashboardRoute: string;
};

// ─────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────

const DROPDOWN_WIDTH = 192;

/** Hardcoded home link — always first in the category bar. */
const MAISON_LABEL = "MAISON";
const MAISON_HREF = "/";

const CATEGORY_LINK_CLASS =
  "flex shrink-0 items-center gap-1 border-b-2 pb-1 text-sm font-bold whitespace-nowrap transition-colors duration-200";

// ─────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <ChevronDown
      className={`h-3 w-3 shrink-0 text-current transition-transform duration-200 ${
        open ? "rotate-180" : ""
      }`}
      aria-hidden
    />
  );
}

// ─────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────

function NavbarClientInner({
  categories,
  user,
}: {
  categories: CategoryNav[];
  user: NavUser | null;
}) {
  const { logout } = useAuth();
  const pathname = usePathname();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [cartItemCount, setCartItemCount]         = useState(0);
  const [hoveredCategory, setHoveredCategory]     = useState<string | null>(null);
  const [openCategory, setOpenCategory]           = useState<string | null>(null);
  const [isDesktop, setIsDesktop]                 = useState(true);
  const [dropdownPos, setDropdownPos]             = useState<{ top: number; left: number } | null>(null);
  const [mounted, setMounted]                     = useState(false);

  const categoriesBarRef  = useRef<HTMLDivElement | null>(null);
  const dropdownPanelRef  = useRef<HTMLDivElement | null>(null);
  const triggerRefs       = useRef<Map<string, HTMLDivElement>>(new Map());
  const leaveTimerRef     = useRef<ReturnType<typeof setTimeout> | null>(null);

  const nameParts = APP_NAME.trim().split(" ");
  const firstWord = nameParts[0];
  const restWords = nameParts.slice(1).join(" ");
  const restChars = restWords.split("");
  // ─── Logout ────────────────────────────────────────────────────────────

  const handleLogout = useCallback(() => {
    void logout();
  }, [logout]);

  // ─── Hover timer helpers ───────────────────────────────────────────────

  const clearLeaveTimer = useCallback(() => {
    if (leaveTimerRef.current) {
      clearTimeout(leaveTimerRef.current);
      leaveTimerRef.current = null;
    }
  }, []);

  const scheduleHoverClose = useCallback(() => {
    clearLeaveTimer();
    leaveTimerRef.current = setTimeout(() => {
      setHoveredCategory(null);
      leaveTimerRef.current = null;
    }, 120);
  }, [clearLeaveTimer]);

  useEffect(() => {
    return () => {
      if (leaveTimerRef.current) clearTimeout(leaveTimerRef.current);
    };
  }, []);

  // ─── Derived state ─────────────────────────────────────────────────────

  const activeMenuSlug = isDesktop ? hoveredCategory : openCategory;
  const activeCategory = activeMenuSlug != null
    ? categories.find((c) => c.slug === activeMenuSlug)
    : null;
  const activeSubs    = activeCategory?.subcategories ?? [];
  const menuVisible   = activeSubs.length > 0 && activeMenuSlug != null;

type TriggerSource = "desktop" | "mobile";

  const setTriggerRef = useCallback(
    (slug: string, el: HTMLDivElement | null, source: TriggerSource) => {
      const isActiveSource =
        (source === "desktop" && isDesktop) ||
        (source === "mobile" && !isDesktop);

      if (!isActiveSource) return;

      if (el) triggerRefs.current.set(slug, el);
      else triggerRefs.current.delete(slug);
    },
    [isDesktop],
  );

  // ─── Effects ───────────────────────────────────────────────────────────

  useEffect(() => setMounted(true), []);

  useLayoutEffect(() => {
    const mq   = window.matchMedia("(min-width: 1024px)");
    const sync = () => setIsDesktop(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useLayoutEffect(() => {
    setCartItemCount(getCartItemCount());
    const onCartUpdate = () => setCartItemCount(getCartItemCount());
    window.addEventListener("cart-update", onCartUpdate);
    return () => window.removeEventListener("cart-update", onCartUpdate);
  }, []);

  // Close dropdowns on navigation
  useEffect(() => {
    setHoveredCategory(null);
    setOpenCategory(null);
    setIsMobileMenuOpen(false);
  }, [pathname]);

  // ─── Dropdown positioning ──────────────────────────────────────────────

  useLayoutEffect(() => {
    if (!menuVisible || !activeMenuSlug) {
      setDropdownPos(null);
      return;
    }
    const el = triggerRefs.current.get(activeMenuSlug);
    if (!el) {
      setDropdownPos(null);
      return;
    }
    const update = () => {
      const r = el.getBoundingClientRect();
      if (r.width === 0 && r.height === 0) return;
      const maxLeft = Math.max(8, Math.min(r.left, window.innerWidth - DROPDOWN_WIDTH - 8));
      setDropdownPos({ top: r.bottom + 8, left: maxLeft });
    };
    update();
    window.addEventListener("scroll", update, true);
    window.addEventListener("resize",  update);
    return () => {
      window.removeEventListener("scroll", update, true);
      window.removeEventListener("resize",  update);
    };
  }, [menuVisible, activeMenuSlug, isDesktop]);

  // Close dropdown on outside click
  useEffect(() => {
    if (hoveredCategory == null && openCategory == null) return;
    const onPointerDown = (e: MouseEvent) => {
      const t = e.target as Node;
      if (categoriesBarRef.current?.contains(t)) return;
      if ((t as Element).closest?.("[data-category-nav]")) return;
      if (dropdownPanelRef.current?.contains(t)) return;
      setHoveredCategory(null);
      setOpenCategory(null);
    };
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [hoveredCategory, openCategory]);

  useEffect(() => {
    if (!isDesktop || hoveredCategory == null) return;
    const onFocusIn = (e: FocusEvent) => {
      const t = e.target as Node;
      const triggerEl = triggerRefs.current.get(hoveredCategory);
      const inTrigger = triggerEl?.contains(t) ?? false;
      const inPanel = dropdownPanelRef.current?.contains(t) ?? false;
      if (!inTrigger && !inPanel) {
        setHoveredCategory(null);
      }
    };
    document.addEventListener("focusin", onFocusIn);
    return () => document.removeEventListener("focusin", onFocusIn);
  }, [isDesktop, hoveredCategory]);

  useEffect(() => {
    if (activeMenuSlug == null) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      const triggerEl = triggerRefs.current.get(activeMenuSlug);
      setHoveredCategory(null);
      setOpenCategory(null);
      triggerEl?.querySelector("a")?.focus();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [activeMenuSlug]);

  // ─── Derived active states ─────────────────────────────────────────────

  const isTrackingActive = pathname === "/order-tracking";
  const isCategoriesActive = pathname === "/categories";

  // ─── Portal dropdown ───────────────────────────────────────────────────

  const dropdownNode =
    mounted &&
    menuVisible &&
    dropdownPos &&
    activeCategory &&
    createPortal(
      <div
        ref={dropdownPanelRef}
        className="fixed z-[100] rounded-xl border border-gray-200 bg-white py-1.5 shadow-xl"
        style={{
          top: dropdownPos.top,
          left: dropdownPos.left,
          width: DROPDOWN_WIDTH,
          maxWidth: "calc(100vw - 1rem)",
        }}
        onMouseEnter={() => {
          if (!isDesktop) return;
          clearLeaveTimer();
          setHoveredCategory(activeMenuSlug);
        }}
        onMouseLeave={() => {
          if (!isDesktop) return;
          scheduleHoverClose();
        }}
      >
        {activeSubs.map((sub) => (
          <Link
            key={sub._id}
            href={`/category/${activeCategory.slug}/${sub.slug}`}
            className="block px-4 py-2.5 text-sm text-gray-700 transition-colors hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
            onClick={() => {
              setOpenCategory(null);
              setHoveredCategory(null);
            }}
          >
            {sub.name}
          </Link>
        ))}
      </div>,
      document.body,
    );

  // ─── Shared render fragments ───────────────────────────────────────────

  const logoLink = (
    <Link
      href="/"
      className="flex items-center gap-0 shrink-0 group md:gap-3"
    >
      <div className="relative h-16 w-16 shrink-0 md:h-20 md:w-20 lg:h-24 lg:w-24">
        <Image
          src={LOGO_PATH}
          alt={APP_NAME}
          fill
          className="object-contain"
          priority
        />
      </div>
      <div className="flex flex-col items-stretch leading-none px-0 md:px-1">
        <span className="uppercase font-serif text-sm font-semibold text-teal-700 transition-colors duration-200 md:text-xl lg:text-2xl whitespace-nowrap">
          {firstWord}
        </span>
        {restChars.length > 0 && (
          <span className="-mt-0.5 font-serif flex justify-between text-sm font-medium uppercase text-teal-700 md:-mt-1 md:text-lg">
            {restChars.map((char, i) => (
              <span key={i}>{char === " " ? "\u00A0\u00A0" : char}</span>
            ))}
          </span>
        )}
      </div>
    </Link>
  );

  const categoriesButton = (
    <Link
      href="/categories"
      className={`rounded-lg bg-teal-700 px-12 py-2 text-sm font-medium text-white transition-all duration-200 ${
        isCategoriesActive ? "" : ""
      }`}
    >
      Toutes les catégories
    </Link>
  );

  const cartLink = (
    <Link
      href="/cart"
      className="relative rounded-lg p-2 text-gray-600 transition-colors hover:bg-gray-100 hover:text-blue-600"
      aria-label={`Shopping cart${cartItemCount > 0 ? `, ${cartItemCount} items` : ""}`}
    >
      <ShoppingCart className="h-6 w-6" aria-hidden />
      {cartItemCount > 0 && (
        <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
          {cartItemCount > 99 ? "99+" : cartItemCount}
        </span>
      )}
    </Link>
  );

  const desktopAuthActions = (
    <div className="flex items-center gap-2">
      {!user ? (
        <>
          <Link
            href="/login"
            className="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 transition-all duration-200 hover:bg-blue-50 hover:text-blue-600"
          >
            Login
          </Link>
          <Link
            href="/register"
            className="rounded-lg bg-teal-700 px-4 py-2 text-sm font-medium text-white shadow-sm transition-all duration-200 hover:bg-blue-700"
          >
            Sign Up
          </Link>
        </>
      ) : (
        <>
          <Link
            href={user.dashboardRoute}
            className="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 transition-all duration-200 hover:bg-blue-50 hover:text-blue-600"
          >
            Dashboard
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className="rounded-lg bg-red-500 px-4 py-2 text-sm font-medium text-white transition-all duration-200 hover:bg-red-600"
          >
            Logout
          </button>
        </>
      )}
    </div>
  );

  const isMaisonActive = pathname === "/" || pathname === "";

  const renderCategoryLinks = (source: TriggerSource) =>
    categories.map((cat) => {
      const subs = cat.subcategories ?? [];
      const hasSubs = subs.length > 0;
      const active =
        pathname === `/category/${cat.slug}` ||
        pathname?.startsWith(`/category/${cat.slug}/`);
      const menuOpen =
        hasSubs &&
        (isDesktop ? hoveredCategory === cat.slug : openCategory === cat.slug);

      if (!hasSubs) {
        return (
          <Link
            key={cat.slug}
            href={`/category/${cat.slug}`}
            className={`${CATEGORY_LINK_CLASS} ${
              active
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-700 hover:border-blue-600 hover:text-blue-600"
            }`}
          >
            {cat.name}
          </Link>
        );
      }

      return (
        <div
          key={cat.slug}
          ref={(el) => setTriggerRef(cat.slug, el, source)}
          className="shrink-0"
          onMouseEnter={() => {
            if (!isDesktop) return;
            clearLeaveTimer();
            setHoveredCategory(cat.slug);
          }}
          onMouseLeave={() => {
            if (!isDesktop) return;
            scheduleHoverClose();
          }}
          onFocus={() => {
            if (!isDesktop) return;
            clearLeaveTimer();
            setHoveredCategory(cat.slug);
          }}
        >
          <div
            className={`flex items-center gap-1 border-b-2 pb-1 transition-colors duration-200 ${
              active
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-700 hover:border-blue-600 hover:text-blue-600"
            }`}
          >
            <Link
              href={`/category/${cat.slug}`}
              className="text-sm font-bold whitespace-nowrap"
              aria-haspopup={isDesktop ? "true" : undefined}
              aria-expanded={isDesktop ? menuOpen : undefined}
            >
              {cat.name}
            </Link>
            {isDesktop ? (
              <span className="flex items-center" aria-hidden>
                <ChevronIcon open={menuOpen} />
              </span>
            ) : (
              <button
                type="button"
                className="flex items-center rounded p-0.5 hover:bg-gray-200/80"
                aria-expanded={menuOpen}
                aria-label={`Toggle ${cat.name} subcategories`}
                onClick={(e) => {
                  e.preventDefault();
                  setOpenCategory((o) => (o === cat.slug ? null : cat.slug));
                }}
              >
                <ChevronIcon open={menuOpen} />
              </button>
            )}
          </div>
        </div>
      );
    });

  const categoryBar = (source: TriggerSource) => (
    <>
      <Link
        href={MAISON_HREF}
        className={`${CATEGORY_LINK_CLASS} ${
          isMaisonActive
            ? "border-teal-700 text-teal-800"
            : "border-transparent text-gray-700 hover:border-teal-700 hover:text-teal-800"
        }`}
      >
        {MAISON_LABEL}
      </Link>
      {renderCategoryLinks(source)}
    </>
  );

  // ─── Render ────────────────────────────────────────────────────────────

  return (
    <nav className="w-full border-b border-gray-200 bg-white/95 shadow-sm backdrop-blur-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* ── Mobile / tablet header (< lg) ── */}
        <div className="flex min-h-14 items-center gap-2 py-2 lg:hidden">
          {logoLink}

          <div className="min-w-0 flex-1 pl-2 ml-1">
            <NavbarSearchField
              active={!isDesktop}
              className="h-10 w-full min-w-0 rounded-xl border border-gray-300 bg-white pl-10 pr-10 text-sm text-gray-900 placeholder:text-gray-500 shadow-sm transition-all focus:border-teal-700/40 focus:outline-none focus:ring-2 focus:ring-teal-700"
            />
          </div>

          <div className="flex shrink-0 items-center gap-1">
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen((v) => !v)}
              className="rounded-lg p-2 text-gray-600 transition-colors hover:bg-gray-100 hover:text-blue-600"
              aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={isMobileMenuOpen}
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" aria-hidden />
              ) : (
                <Menu className="h-6 w-6" aria-hidden />
              )}
            </button>
          </div>
        </div>

        {/* ── Desktop grid (lg+) ── */}
        <div className="hidden lg:grid lg:grid-cols-[auto_1fr_auto] lg:grid-rows-[auto_auto] lg:items-center lg:gap-x-8 lg:gap-y-1 lg:py-3">
          {/* Logo — spans both rows, vertically centered */}
          <div className="row-span-2 self-center pr-4">{logoLink}</div>

          {/* Row 1 — search + categories button */}
          <div className="col-start-2 row-start-1 flex min-h-12 items-center gap-4">
            <div className="min-w-0 flex-1 max-w-2xl">
              <NavbarSearchField
                active={isDesktop}
                className={SEARCH_FIELD_INPUT_CLASS}
              />
            </div>
            {categoriesButton}
          </div>

          {/* Row 1 — cart + auth */}
          <div className="col-start-3 row-start-1 flex min-h-12 items-center justify-end gap-2 sm:gap-3">
            {cartLink}
            {desktopAuthActions}
          </div>

          {/* Row 2 — category navigation (starts after logo column) */}
          <div
            ref={categoriesBarRef}
            data-category-nav
            className="col-span-2 col-start-2 row-start-2 min-h-12"
          >
            <div className="flex items-center gap-4 overflow-x-auto py-2 sm:gap-6 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              {categoryBar("desktop")}
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div className="space-y-1 border-t border-gray-200 py-4 lg:hidden">
            <Link
              href={MAISON_HREF}
              className="block rounded-lg px-4 py-2 text-sm font-medium text-gray-700 transition-all hover:bg-blue-50 hover:text-blue-600"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {MAISON_LABEL}
            </Link>
            <Link
              href="/products"
              className="block rounded-lg px-4 py-2 text-sm font-medium text-gray-700 transition-all hover:bg-blue-50 hover:text-blue-600"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Products
            </Link>
            <Link
              href="/categories"
              className="block rounded-lg px-4 py-2 text-sm font-medium text-gray-700 transition-all hover:bg-blue-50 hover:text-blue-600"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Categories
            </Link>
            <Link
              href="/cart"
              className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-gray-700 transition-all hover:bg-blue-50 hover:text-blue-600"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <ShoppingCart className="h-4 w-4" aria-hidden />
              Cart
              {cartItemCount > 0 && (
                <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-blue-600 px-1.5 text-xs font-bold text-white">
                  {cartItemCount > 99 ? "99+" : cartItemCount}
                </span>
              )}
            </Link>

            {!user ? (
              <>
                <Link
                  href="/login"
                  className="block rounded-lg px-4 py-2 text-sm font-medium text-gray-700 transition-all hover:bg-blue-50 hover:text-blue-600"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="block rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-blue-700"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Sign Up
                </Link>
              </>
            ) : (
              <>
                <Link
                  href={user.dashboardRoute}
                  className="block rounded-lg px-4 py-2 text-sm font-medium text-gray-700 transition-all hover:bg-blue-50 hover:text-blue-600"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Dashboard
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="block w-full rounded-lg px-4 py-2 text-left text-sm font-medium text-red-600 transition-all hover:bg-red-50"
                >
                  Logout
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {/* Mobile / tablet category bar (< lg) */}
      <div className="lg:hidden">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div
            data-category-nav
            className="min-h-12 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
          >
            <div className="flex items-center gap-4 overflow-x-auto py-2 sm:gap-6 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              {categoryBar("mobile")}
            </div>
          </div>
        </div>
      </div>

      {dropdownNode}
    </nav>
  );
}

/**
 * Search suspends (useSearchParams) inside NavbarSearchProvider only.
 * Fallback renders the same chrome with a search skeleton so MAISON +
 * categories appear immediately.
 */
export default function NavbarClient({
  categories,
  user,
}: {
  categories: CategoryNav[];
  user: NavUser | null;
}) {
  return (
    <Suspense fallback={<NavbarClientInner categories={categories} user={user} />}>
      <NavbarSearchProvider categories={categories}>
        <NavbarClientInner categories={categories} user={user} />
      </NavbarSearchProvider>
    </Suspense>
  );
}