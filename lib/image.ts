// lib/image.ts

const R2_PUBLIC_URL = process.env.NEXT_PUBLIC_R2_PUBLIC_URL!;

export function getImageUrl(image?: string) {
  if (!image) {
    return "/images/placeholder.webp";
  }

  // Old products already contain a full URL
  if (
    image.startsWith("http://") ||
    image.startsWith("https://")
  ) {
    return image;
  }

  // Local images
  if (image.startsWith("/")) {
    return image;
  }

  // New R2 object key
  return `${R2_PUBLIC_URL}/${image}`;
}