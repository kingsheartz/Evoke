/** File input accept string for CMS, brand, and profile image uploads (includes HEIC from iOS). */
export const UPLOADABLE_IMAGE_ACCEPT =
  "image/jpeg,image/png,image/gif,image/webp,image/svg+xml,image/heic,image/heif,.heic,.heif,.svg,image/*";

function apiStorageOrigin(): string {
  const api =
    (typeof window !== "undefined"
      ? process.env.NEXT_PUBLIC_API_URL
      : process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL) ?? "http://localhost:8000/api/v1";
  return api.replace(/\/api\/v1\/?$/, "");
}

/** S3 or CDN base when FILESYSTEM_DISK=s3; otherwise APP_URL/storage. */
function mediaBaseUrl(): string {
  const explicit = (process.env.NEXT_PUBLIC_MEDIA_BASE_URL ?? "").trim().replace(/\/$/, "");
  if (explicit) return explicit;
  return `${apiStorageOrigin()}/storage`;
}

/** Resolve CMS/media URLs for browser display (storage paths, protocol-relative, etc.). */
export function resolvePublicMediaUrl(value: string | null | undefined): string {
  const trimmed = (value ?? "").trim();
  if (!trimmed) return "";

  if (/^(https?:|data:|blob:)/i.test(trimmed)) return trimmed;
  if (trimmed.startsWith("//")) return `https:${trimmed}`;

  const base = mediaBaseUrl();
  const useExternalBase = Boolean((process.env.NEXT_PUBLIC_MEDIA_BASE_URL ?? "").trim());

  if (trimmed.startsWith("/storage/")) {
    const suffix = trimmed.slice("/storage/".length);
    return useExternalBase ? `${base}/${suffix}` : `${apiStorageOrigin()}${trimmed}`;
  }

  if (trimmed.startsWith("/")) {
    return `${apiStorageOrigin()}${trimmed}`;
  }

  return `${base}/${trimmed.replace(/^\/+/, "")}`;
}

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
