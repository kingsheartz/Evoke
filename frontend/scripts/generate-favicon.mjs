#!/usr/bin/env node
/**
 * Regenerate favicon assets from public/logo-icon.png.
 * Output: src/app/icon.png, src/app/apple-icon.png, public/icon-192.png, public/icon-512.png
 * Do NOT add src/app/favicon.ico — it overrides icon.png with a stale Next default.
 */
import { copyFileSync, existsSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const src = join(root, "public", "logo-icon.png");
const appDir = join(root, "src", "app");
const publicDir = join(root, "public");

if (!existsSync(src)) {
  console.error("Missing public/logo-icon.png — add the EOKE icon first.");
  process.exit(1);
}

async function main() {
  try {
    const sharp = (await import("sharp")).default;
    mkdirSync(appDir, { recursive: true });

    await sharp(src).resize(32, 32, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toFile(join(appDir, "icon.png"));
    await sharp(src).resize(180, 180, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toFile(join(appDir, "apple-icon.png"));
    await sharp(src).resize(192, 192, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toFile(join(publicDir, "icon-192.png"));
    await sharp(src).resize(512, 512, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toFile(join(publicDir, "icon-512.png"));

    console.log("Favicon PNG assets updated (see public/favicon.ico for legacy browsers).");
  } catch {
    console.warn("sharp not installed — run: npm install -D sharp && npm run generate:favicon");
    process.exit(1);
  }
}

main();
