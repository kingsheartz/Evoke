import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const configPath = join(root, "company.config.json");

if (!existsSync(configPath)) {
  console.error("Missing company.config.json — copy company.config.example.json before building.");
  process.exit(1);
}

let config;
try {
  config = JSON.parse(readFileSync(configPath, "utf8"));
} catch (error) {
  console.error("company.config.json is not valid JSON:", error.message);
  process.exit(1);
}

const errors = [];

if (!config.name?.trim()) errors.push("name is required");
if (!config.shortName?.trim()) errors.push("shortName is required");
if (!config.logos?.icon?.trim()) errors.push("logos.icon is required");
if (!config.logos?.horizontal?.trim() && !config.logos?.vertical?.trim()) {
  errors.push("At least one of logos.horizontal or logos.vertical is required");
}

for (const key of ["horizontal", "vertical", "icon"]) {
  const path = config.logos?.[key];
  if (path?.trim() && !path.startsWith("/") && !path.startsWith("http")) {
    errors.push(`logos.${key} must start with / or http`);
  }
}

if (errors.length > 0) {
  console.error("company.config.json validation failed:");
  for (const message of errors) console.error(`  - ${message}`);
  process.exit(1);
}

if (
  config.allowRuntimeBrandEdit !== undefined &&
  typeof config.allowRuntimeBrandEdit !== "boolean"
) {
  console.error("allowRuntimeBrandEdit must be a boolean when set");
  process.exit(1);
}

if (
  config.logoDisplay?.iconBlend !== undefined &&
  typeof config.logoDisplay.iconBlend !== "boolean"
) {
  console.error("logoDisplay.iconBlend must be a boolean when set");
  process.exit(1);
}

console.log(`Company config OK: ${config.name}`);
