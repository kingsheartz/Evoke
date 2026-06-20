import type { Area } from "react-easy-crop";

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", () => reject(new Error("Could not load image for cropping.")));
    image.crossOrigin = "anonymous";
    image.src = src;
  });
}

function outputMimeType(sourceMime: string): string {
  return sourceMime === "image/png" ? "image/png" : "image/jpeg";
}

function outputFileName(originalName: string, mimeType: string): string {
  const base = originalName.replace(/\.[^.]+$/, "") || "image";
  const ext = mimeType === "image/png" ? ".png" : ".jpg";
  return `${base}${ext}`;
}

/** Crop a region from an image URL/blob and return an upload-ready File. */
export async function cropImageToFile(
  imageSrc: string,
  pixelCrop: Area,
  originalFileName: string,
  sourceMimeType = "image/jpeg",
  quality = 0.92,
): Promise<File> {
  const image = await loadImage(imageSrc);
  const mimeType = outputMimeType(sourceMimeType);
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(pixelCrop.width));
  canvas.height = Math.max(1, Math.round(pixelCrop.height));

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Could not prepare crop canvas.");
  }

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height,
  );

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (result) => {
        if (result) resolve(result);
        else reject(new Error("Could not export cropped image."));
      },
      mimeType,
      quality,
    );
  });

  return new File([blob], outputFileName(originalFileName, mimeType), { type: mimeType });
}
