import { readFile } from "node:fs/promises";
import path from "node:path";
import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";
import { getImageUrl } from "@/lib/image";
import { getSiteUrl } from "@/lib/seo/site";

export const runtime = "nodejs";

/** WhatsApp silently drops previews when og:image is much larger than ~300KB. */
const MAX_WIDTH = 1200;
const JPEG_QUALITY = 82;
/** Hard cap on the *input* we buffer. Next Data Cache rejects items over 2MB;
 *  production `/og-default.jpg` is already ~3.2MB, so we must not put it there. */
const MAX_UPSTREAM_BYTES = 8 * 1024 * 1024;

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

/**
 * Load the source bytes. Site-relative files are read from `public/` so we
 * never HTTP-fetch (and Data-Cache) a 3MB `/og-default.jpg` from ourselves.
 * Remote/R2 fetches use `cache: "no-store"` — Next's Data Cache has a 2MB
 * item limit and would log on every request for oversized originals.
 */
async function loadUpstreamBytes(
  src: string,
  upstreamUrl: string,
): Promise<{ ok: true; bytes: Buffer } | { ok: false; status: 404 | 413 }> {
  const relative = src.trim();
  if (
    relative.startsWith("/") &&
    !relative.includes("..") &&
    !relative.includes("\\")
  ) {
    const diskPath = path.join(
      process.cwd(),
      "public",
      relative.replace(/^\/+/, ""),
    );
    try {
      const bytes = await readFile(diskPath);
      if (bytes.byteLength > MAX_UPSTREAM_BYTES) {
        return { ok: false, status: 413 };
      }
      return { ok: true, bytes };
    } catch {
      // Not in this checkout — production may still serve it over HTTP.
    }
  }

  const upstream = await fetch(upstreamUrl, {
    cache: "no-store",
    headers: { Accept: "image/*" },
  });

  if (!upstream.ok) {
    return { ok: false, status: 404 };
  }

  const declared = Number.parseInt(
    upstream.headers.get("content-length") ?? "",
    10,
  );
  if (Number.isFinite(declared) && declared > MAX_UPSTREAM_BYTES) {
    return { ok: false, status: 413 };
  }

  const bytes = Buffer.from(await upstream.arrayBuffer());
  if (bytes.byteLength > MAX_UPSTREAM_BYTES) {
    return { ok: false, status: 413 };
  }

  return { ok: true, bytes };
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
    const loaded = await loadUpstreamBytes(src, upstreamUrl);
    if (!loaded.ok) {
      if (loaded.status === 413) {
        return new NextResponse("Image too large", { status: 413 });
      }
      return new NextResponse("Image not found", { status: 404 });
    }

    const input = loaded.bytes;
    // Always emit a real 1200×630 JPEG. Declaring those dimensions in
    // og:image:width/height while serving a smaller "fit: inside" crop is a
    // common reason WhatsApp draws a title card with no thumbnail.
    const jpeg = await sharp(input)
      .rotate()
      .resize({
        width: MAX_WIDTH,
        height: 630,
        fit: "contain",
        background: { r: 245, g: 240, b: 234 },
      })
      .jpeg({ quality: JPEG_QUALITY, mozjpeg: true })
      .toBuffer();

    return new NextResponse(new Uint8Array(jpeg), {
      status: 200,
      headers: {
        "Content-Type": "image/jpeg",
        "Content-Length": String(jpeg.byteLength),
        "Content-Disposition": 'inline; filename="opengraph.jpg"',
        "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
      },
    });
  } catch (err) {
    console.error("[og/image] failed to build social JPEG", err);
    return new NextResponse("Failed to process image", { status: 502 });
  }
}

/** Facebook / WhatsApp often HEAD the image first; echo GET headers. */
export async function HEAD(req: NextRequest) {
  const res = await GET(req);
  return new NextResponse(null, { status: res.status, headers: res.headers });
}
