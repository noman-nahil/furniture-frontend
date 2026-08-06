import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";
import { getImageUrl } from "@/lib/image";
import { getSiteUrl } from "@/lib/seo/site";

export const runtime = "nodejs";

/** WhatsApp silently drops previews when og:image is much larger than ~300KB. */
const MAX_WIDTH = 1200;
const JPEG_QUALITY = 82;

function r2Hostname(): string | null {
  const base = process.env.NEXT_PUBLIC_R2_PUBLIC_URL?.trim();
  if (!base) return null;
  try {
    return new URL(base).hostname;
  } catch {
    return null;
  }
}

/**
 * Resolve `src` to an absolute upstream URL, or null if it is not an
 * allow-listed R2 key / our own origin / our R2 host (open-proxy guard).
 */
function resolveUpstream(src: string): string | null {
  const value = src.trim();
  if (!value || value.length > 2048) return null;

  // R2 object key (e.g. products/2026/08/06/….webp)
  if (!/^https?:\/\//i.test(value) && !value.startsWith("/")) {
    if (value.includes("..") || value.includes("\\")) return null;
    const url = getImageUrl(value);
    return /^https?:\/\//i.test(url) ? url : null;
  }

  try {
    const absolute = value.startsWith("/")
      ? `${getSiteUrl()}${value}`
      : value;
    const parsed = new URL(absolute);
    if (parsed.protocol !== "https:" && parsed.protocol !== "http:") return null;

    const siteHost = new URL(getSiteUrl()).hostname;
    const allowed = new Set<string>([siteHost]);
    const r2 = r2Hostname();
    if (r2) allowed.add(r2);

    if (!allowed.has(parsed.hostname)) return null;
    return parsed.toString();
  } catch {
    return null;
  }
}

export async function GET(req: NextRequest) {
  const src = req.nextUrl.searchParams.get("src");
  if (!src) {
    return new NextResponse("Missing src", { status: 400 });
  }

  const upstreamUrl = resolveUpstream(src);
  if (!upstreamUrl) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  try {
    const upstream = await fetch(upstreamUrl, {
      // Cache at the edge / Next data cache so messengers don't hammer R2.
      next: { revalidate: 86_400 },
      headers: { Accept: "image/*" },
    });

    if (!upstream.ok) {
      return new NextResponse("Image not found", { status: 404 });
    }

    const input = Buffer.from(await upstream.arrayBuffer());
    const jpeg = await sharp(input)
      .rotate()
      .resize({
        width: MAX_WIDTH,
        height: 630,
        fit: "inside",
        withoutEnlargement: true,
      })
      .jpeg({ quality: JPEG_QUALITY, mozjpeg: true })
      .toBuffer();

    return new NextResponse(new Uint8Array(jpeg), {
      status: 200,
      headers: {
        "Content-Type": "image/jpeg",
        "Content-Disposition": "inline",
        "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
      },
    });
  } catch (err) {
    console.error("[og/image] failed to build social JPEG", err);
    return new NextResponse("Failed to process image", { status: 502 });
  }
}
