"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { ChevronLeft, ChevronRight, X, ZoomIn, ZoomOut, Minimize2 } from "lucide-react";
import { getImageUrl } from "@/lib/image";

function isRemoteImage(src: string): boolean {
  return /^https?:\/\//i.test(src);
}

const ZOOM_STEP = 0.4;
const ZOOM_MIN  = 1;
const ZOOM_MAX  = 2.5;

type Props    = { images?: string[] | null; alt?: string };
type PanState = { x: number; y: number };

export default function ProductImageViewer({ images, alt = "Product" }: Props) {
const list = useMemo(() => {
  const raw = images?.filter(Boolean) ?? [];

  const resolved =
    raw.length > 0
      ? raw.map(getImageUrl)
      : ["/placeholder.png"];

  return resolved;
}, [images]);

  const [open,    setOpen]    = useState(false);
  const [current, setCurrent] = useState(0);
  const [zoom,    setZoom]    = useState(1);
  const [pan,     setPan]     = useState<PanState>({ x: 0, y: 0 });

  // Portals must not render on the server — track mount so the very
  // first client render matches the server-rendered HTML, then flip on.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const closeBtnRef  = useRef<HTMLButtonElement>(null);
  const imageWrapRef = useRef<HTMLDivElement>(null);
  const [isPanning, setIsPanning] = useState(false);
  const panStart     = useRef({ x: 0, y: 0 });
  const panOrigin    = useRef<PanState>({ x: 0, y: 0 });

  const len = list.length;

  const resetZoom = useCallback(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }, []);

  const go = useCallback((delta: number) => {
    setCurrent((p) => (p + delta + len) % len);
    resetZoom();
  }, [len, resetZoom]);

  const goTo = useCallback((i: number) => {
    setCurrent(((i % len) + len) % len);
  }, [len]);

  const openAt = useCallback((i: number) => {
    goTo(i);
    resetZoom();
    setOpen(true);
  }, [goTo, resetZoom]);

  const close = useCallback(() => {
    setOpen(false);
    resetZoom();
  }, [resetZoom]);

  const zoomIn  = useCallback(() =>
    setZoom((z) => Math.min(z + ZOOM_STEP, ZOOM_MAX)), []);

  const zoomOut = useCallback(() =>
    setZoom((z) => {
      const next = Math.max(z - ZOOM_STEP, ZOOM_MIN);
      if (next <= ZOOM_MIN) setPan({ x: 0, y: 0 });
      return next;
    }), []);

  const fitScreen = useCallback(() => resetZoom(), [resetZoom]);

  // Mouse-wheel zoom
  useEffect(() => {
    if (!open) return;
    const el = imageWrapRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const delta = e.deltaY < 0 ? ZOOM_STEP : -ZOOM_STEP;
      setZoom((z) => {
        const next = Math.min(Math.max(z + delta, ZOOM_MIN), ZOOM_MAX);
        if (next <= ZOOM_MIN) setPan({ x: 0, y: 0 });
        return next;
      });
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [open]);

  // Pan
  const onPointerDown = useCallback((e: React.PointerEvent) => {
    if (zoom <= ZOOM_MIN) return;
    setIsPanning(true);
    panStart.current  = { x: e.clientX, y: e.clientY };
    panOrigin.current = pan;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }, [zoom, pan]);

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!isPanning) return;
    setPan({
      x: panOrigin.current.x + (e.clientX - panStart.current.x),
      y: panOrigin.current.y + (e.clientY - panStart.current.y),
    });
  }, [isPanning]);

  const onPointerUp = useCallback(() => {
    setIsPanning(false);
  }, []);

  // Double-click to zoom
  const onDoubleClick = useCallback(() => {
    zoom > 1 ? fitScreen() : setZoom(2.5);
  }, [zoom, fitScreen]);

  // Keyboard shortcuts
  useEffect(() => {
    if (!open) return;
    const fn = (e: KeyboardEvent) => {
      if (e.key === "Escape")             close();
      if (e.key === "ArrowRight")         go(1);
      if (e.key === "ArrowLeft")          go(-1);
      if (e.key === "+" || e.key === "=") zoomIn();
      if (e.key === "-")                  zoomOut();
      if (e.key === "0")                  fitScreen();
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [open, go, close, zoomIn, zoomOut, fitScreen]);

  // Scroll lock + auto-focus close button
  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    closeBtnRef.current?.focus();
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  useEffect(() => {
    setCurrent((c) => (c >= list.length ? 0 : c));
  }, [list.length]);

  const src = list[current];

  // ─── Lightbox JSX, portaled straight to document.body ─────────────────
  // This is the key fix: rendering this through a portal means it's no
  // longer a DOM/paint descendant of the `overflow-hidden` card wrapper
  // in ProductDetailPage. `overflow: hidden` clips `position: fixed`
  // descendants during paint regardless of transforms — that's what was
  // boxing the lightbox in below the navbar. Portaling to <body>
  // sidesteps that entirely; no changes needed in ProductDetailPage,
  // and its overflow-hidden still correctly clips the card view as
  // intended.
  const lightbox = open && (
    <div
      className="fixed inset-0 z-[9999] flex flex-col"
      role="dialog"
      aria-modal="true"
      aria-label={`${alt} — image ${current + 1} of ${len}`}
    >
      <div className="absolute inset-0 bg-black/75 backdrop-blur-lg" onClick={close} />

      {/* Top scrim — guarantees the counter/close button stay legible
          even when the image fills the frame edge-to-edge (e.g. wide
          landscape photos with light/white content right at the top,
          where there's no letterboxed dark gap behind them). Without
          this, text with no background of its own — like the counter —
          can land directly on a bright part of the photo and become
          nearly unreadable. Pointer-events disabled so it never blocks
          clicks on the buttons above it. */}
      <div
        className="absolute top-0 inset-x-0 h-24 bg-gradient-to-b from-black/50 to-transparent pointer-events-none z-10"
        aria-hidden
      />

      <button
        ref={closeBtnRef}
        type="button"
        onClick={close}
        className="
          absolute top-4 right-4 z-20
          flex items-center justify-center
          w-10 h-10 rounded-full
          bg-white/15 hover:bg-white/30 active:bg-white/40
          text-white
          backdrop-blur-sm
          transition-colors duration-150
          focus:outline-none focus-visible:ring-2 focus-visible:ring-white
        "
        aria-label="Close"
      >
        <X className="w-5 h-5" aria-hidden />
      </button>

      {len > 1 && (
        <div className="absolute top-5 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
          <span className="text-white/70 text-xs tabular-nums font-medium tracking-widest">
            {current + 1} / {len}
          </span>
        </div>
      )}

      <div
        ref={imageWrapRef}
        className="relative flex-1 flex items-center justify-center overflow-hidden z-10 pt-14 sm:pt-16"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
        onDoubleClick={onDoubleClick}
        style={{
          cursor: zoom > 1
            ? (isPanning ? "grabbing" : "grab")
            : "zoom-in",
        }}
      >
        <div
          style={{
            transform: `scale(${zoom}) translate(${pan.x / zoom}px, ${pan.y / zoom}px)`,
            transition: isPanning
              ? "none"
              : "transform 0.22s cubic-bezier(0.22,1,0.36,1)",
            transformOrigin: "center center",
            userSelect: "none",
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <img
            src={getImageUrl(list[current])}
            alt={`${alt} — image ${current + 1} of ${len}`}
            draggable={false}
            style={{
              maxWidth:  "100%",
              maxHeight: "100%",
              width:     "auto",
              height:    "auto",
              objectFit: "contain",
              display:   "block",
            }}
          />
        </div>

        {len > 1 && (
          <>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); go(-1); }}
              onDoubleClick={(e) => e.stopPropagation()}
              className="
                absolute left-3 top-1/2 -translate-y-1/2
                flex items-center justify-center
                w-11 h-11 rounded-full
                bg-black/30 hover:bg-black/55
                backdrop-blur-sm text-white
                transition-colors duration-150
                focus:outline-none focus-visible:ring-2 focus-visible:ring-white
              "
              aria-label="Previous image"
            >
              <ChevronLeft className="w-6 h-6" aria-hidden />
            </button>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); go(1); }}
              onDoubleClick={(e) => e.stopPropagation()}
              className="
                absolute right-3 top-1/2 -translate-y-1/2
                flex items-center justify-center
                w-11 h-11 rounded-full
                bg-black/30 hover:bg-black/55
                backdrop-blur-sm text-white
                transition-colors duration-150
                focus:outline-none focus-visible:ring-2 focus-visible:ring-white
              "
              aria-label="Next image"
            >
              <ChevronRight className="w-6 h-6" aria-hidden />
            </button>
          </>
        )}

        {zoom === 1 && (
          <p className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/25 text-[11px] pointer-events-none select-none whitespace-nowrap">
            Double-click or scroll to zoom · Drag to pan
          </p>
        )}
      </div>

      <div className="relative z-20 flex justify-center pb-5 pt-3 shrink-0">
        <div className="flex items-center gap-1 bg-black/50 backdrop-blur-md rounded-full px-3 py-2 shadow-xl">
          <button
            type="button"
            onClick={zoomOut}
            disabled={zoom <= ZOOM_MIN}
            className="flex items-center justify-center w-9 h-9 rounded-full text-white hover:bg-white/15 disabled:opacity-25 disabled:cursor-not-allowed transition-colors"
            aria-label="Zoom out"
          >
            <ZoomOut className="w-4 h-4" aria-hidden />
          </button>

          <button
            type="button"
            onClick={fitScreen}
            className="px-3 text-xs font-semibold text-white/60 hover:text-white tabular-nums min-w-[46px] text-center transition-colors"
            title="Fit to screen (press 0)"
          >
            {Math.round(zoom * 100)}%
          </button>

          <button
            type="button"
            onClick={zoomIn}
            disabled={zoom >= ZOOM_MAX}
            className="flex items-center justify-center w-9 h-9 rounded-full text-white hover:bg-white/15 disabled:opacity-25 disabled:cursor-not-allowed transition-colors"
            aria-label="Zoom in"
          >
            <ZoomIn className="w-4 h-4" aria-hidden />
          </button>

          <div className="w-px h-4 bg-white/20 mx-1" />

          <button
            type="button"
            onClick={fitScreen}
            className="flex items-center justify-center w-9 h-9 rounded-full text-white hover:bg-white/15 transition-colors"
            aria-label="Fit to screen"
            title="Fit to screen"
          >
            <Minimize2 className="w-4 h-4" aria-hidden />
          </button>
        </div>
      </div>

      {len > 1 && (
        <div className="relative z-20 flex justify-center pb-2 shrink-0">
          <div className="flex gap-2 overflow-x-auto [&::-webkit-scrollbar]:hidden max-w-[90vw]">
            {list.map((img, i) => (
              <button
                key={`modal-thumb-${i}`}
                type="button"
                onClick={() => { goTo(i); resetZoom(); }}
                onDoubleClick={(e) => e.stopPropagation()}
                className={[
                  "shrink-0 w-14 h-14 rounded-xl overflow-hidden border-2 transition-all duration-200",
                  i === current
                    ? "border-[#B8935A] opacity-100 scale-105"
                    : "border-white/15 opacity-40 hover:opacity-70 hover:border-white/30",
                ].join(" ")}
                aria-label={`Image ${i + 1}`}
                aria-pressed={i === current}
              >
                <img
                  src={getImageUrl(img)}
                  alt=""
                  className="w-full h-full object-contain bg-[#111] p-0.5"
                  draggable={false}
                />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="flex h-full w-full flex-col">

      {/* ── Card view: main image ───────────────────────────────────────── */}
      <div className="relative min-h-0 flex-1 overflow-hidden rounded-t-xl bg-[#F5F0EA]">
        <button
          type="button"
          onClick={() => openAt(current)}
          className="group relative flex h-full w-full items-center justify-center p-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#B8935A] focus-visible:ring-inset"
          aria-label={`View ${alt} fullscreen`}
        >
          <Image
            src={getImageUrl(src)}
            alt={alt}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 60vw, 50vw"
            className="object-contain p-2 transition-transform duration-500 ease-out group-hover:scale-[1.03] cursor-zoom-in"
            unoptimized={isRemoteImage(src)}
            priority
          />
          <span
            className="absolute bottom-3 right-3 flex items-center gap-1.5 rounded-full bg-[#1A1A1A]/55 backdrop-blur-sm px-3 py-1.5 text-[11px] font-medium text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none"
            aria-hidden
          >
            <ZoomIn className="w-3 h-3" />
            Click to zoom
          </span>
        </button>
      </div>

      {/* ── Card view: thumbnails ───────────────────────────────────────── */}
      {len > 1 && (
        <div className="flex gap-2 p-2 bg-[#F0EBE3] rounded-b-xl overflow-x-auto [&::-webkit-scrollbar]:hidden">
          {list.map((img, i) => (
            <button
              key={`thumb-${i}`}
              type="button"
              onClick={() => goTo(i)}
              className={[
                "relative shrink-0 w-14 h-14 overflow-hidden rounded-lg transition-all duration-200",
                i === current
                  ? "ring-2 ring-[#B8935A] ring-offset-1 ring-offset-[#F0EBE3] opacity-100"
                  : "opacity-55 hover:opacity-85",
              ].join(" ")}
              aria-label={`View image ${i + 1} of ${len}`}
              aria-pressed={i === current}
            >
              <Image
                src={getImageUrl(img)}
                alt=""
                fill
                sizes="56px"
                className="object-contain bg-[#F5F0EA] p-0.5"
                unoptimized={isRemoteImage(img)}
              />
            </button>
          ))}
        </div>
      )}

      {/* ── Lightbox, portaled to document.body ─────────────────────────── */}
      {mounted && lightbox && createPortal(lightbox, document.body)}
    </div>
  );
}