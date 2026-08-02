// lib/uploadConstraints.ts
//
// Shared image upload constraints — used by features/products' ImageUploader
// and features/categories' CategoryImageUploader. Single source of truth so
// the two don't drift (e.g. one accepting GIFs the other doesn't).
export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
export const ALLOWED_IMAGE_TYPES_LABEL = "JPEG, PNG or WebP";
export const MAX_FILE_SIZE_MB = 5;