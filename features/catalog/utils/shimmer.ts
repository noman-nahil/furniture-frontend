// features/catalog/utils/shimmer.ts

/**
 * Generates a tiny animated shimmer SVG used as a next/image blur
 * placeholder. Pure server-side string generation — no client JS,
 * so it's safe to use from Server Components and costs nothing at runtime
 * beyond the few hundred bytes of inline base64.
 */
function shimmerSvg(w: number, h: number): string {
  return `
<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="g">
      <stop stop-color="#F0EBE3" offset="20%" />
      <stop stop-color="#E8E2D9" offset="50%" />
      <stop stop-color="#F0EBE3" offset="70%" />
    </linearGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="#F0EBE3" />
  <rect width="${w}" height="${h}" fill="url(#g)" />
</svg>`.trim();
}

function toBase64(str: string): string {
  // Server Components run in Node, so Buffer is always available here.
  return Buffer.from(str).toString("base64");
}

export function shimmerBlurDataUrl(w = 400, h = 300): string {
  return `data:image/svg+xml;base64,${toBase64(shimmerSvg(w, h))}`;
}