"use client";

import { useEffect, useState } from "react";

export default function ProductImageSection({
  images,
  name,
}: {
  images: string[];
  name: string;
}) {
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState(0);

  const next = () =>
    setCurrent((prev) => (prev + 1) % images.length);

  const prev = () =>
    setCurrent((prev) =>
      prev === 0 ? images.length - 1 : prev - 1
    );

  // Keyboard support
  useEffect(() => {
    if (!open) return;

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open]);

  return (
    <>
      {/* MAIN IMAGE */}
      <div className="relative w-full h-full">
        <img
          src={images[current]}
          alt={name}
          onClick={() => setOpen(true)}
          className="w-full h-full object-contain p-1 cursor-zoom-in"
        />

        {/* BUTTON */}
        <button
          onClick={() => setOpen(true)}
          className="absolute bottom-3 right-3 bg-black/70 text-white text-xs px-3 py-1 rounded-md"
        >
          View Fullscreen
        </button>
      </div>

      {/* ✅ THUMBNAILS (THIS WAS MISSING) */}
      {images.length > 1 && (
        <div className="grid grid-cols-4 gap-3 mt-2">
          {images.map((img, i) => (
            <div
              key={i}
              onClick={() => {
                setCurrent(i);
                setOpen(true); // 🔥 open modal when thumbnail clicked
              }}
              className={`cursor-pointer border rounded-lg overflow-hidden ${
                i === current
                  ? "border-blue-500"
                  : "border-gray-200"
              }`}
            >
              <img
                src={img}
                alt={`${name}-${i}`}
                className="w-full h-full object-contain"
              />
            </div>
          ))}
        </div>
      )}

      {/* MODAL */}
      {open && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex flex-col items-center justify-center"
          onClick={() => setOpen(false)}
        >
          {/* CLOSE */}
          <button
            className="absolute top-5 right-5 text-white text-3xl"
            onClick={() => setOpen(false)}
          >
            ✕
          </button>

          {/* IMAGE */}
          <div onClick={(e) => e.stopPropagation()}>
            <img
              src={images[current]}
              alt={name}
              className="max-h-[80vh] max-w-[95vw] object-contain"
            />
          </div>

          {/* NAV */}
          {images.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  prev();
                }}
                className="absolute left-5 text-white text-3xl"
              >
                ‹
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  next();
                }}
                className="absolute right-5 text-white text-3xl"
              >
                ›
              </button>
            </>
          )}
        </div>
      )}
    </>
  );
}