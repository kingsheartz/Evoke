/** File input accept string for CMS, brand, and profile image uploads (includes HEIC from iOS). */
export const UPLOADABLE_IMAGE_ACCEPT =
  "image/jpeg,image/png,image/gif,image/webp,image/heic,image/heif,.heic,.heif,image/*";

/** Academy completion certificates — PDF or image. */
export const CERTIFICATE_FILE_ACCEPT =
  "application/pdf,image/jpeg,image/png,image/webp,.pdf,.jpg,.jpeg,.png,.webp";

export function isCertificatePdf(url: string): boolean {
  return /\.pdf(\?|$)/i.test(url.trim());
}

/** Browsers cannot reliably preview HEIC in a crop canvas — upload as-is. */
export function isCropSupportedImage(file: File): boolean {
  if (!file.type.startsWith("image/") && !/\.(jpe?g|png|gif|webp)$/i.test(file.name)) {
    return false;
  }
  if (/heic|heif/i.test(file.type) || /\.heic$/i.test(file.name)) {
    return false;
  }
  return true;
}
