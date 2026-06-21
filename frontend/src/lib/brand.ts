import { DEFAULT_BRAND, type BrandConfig, type BrandLogoDisplay } from "@/lib/brand-defaults";
import {
  DEFAULT_HEADER_CONFIG,
  headerConfigEquals,
  mergeHeaderConfig,
  type BrandHeaderConfig,
} from "@/lib/header-config";

export type { BrandConfig, BrandHeaderConfig, BrandLogoDisplay };
export { DEFAULT_BRAND };

export type BrandLogoVariant =
  | "icon"
  | "horizontal"
  | "vertical"
  | "header"
  | "footer"
  | "auth"
  | "admin"
  | "admin-icon";

/** @deprecated Use BrandLogoVariant */
export type EvokeLogoVariant = BrandLogoVariant;

export type BrandOverride = Partial<{
  name: string;
  shortName: string;
  tagline: string;
  description: string;
  logos: Partial<BrandConfig["logos"]>;
  logoDisplay: Partial<BrandLogoDisplay>;
  header: Partial<BrandHeaderConfig>;
}>;

export function mobileHeaderIcon(logos: BrandConfig["logos"]): string {
  return logos.mobile?.trim() || logos.icon;
}

export function mergeBrand(defaults: BrandConfig, override: BrandOverride | null | undefined): BrandConfig {
  if (!override) return defaults;

  return {
    name: override.name?.trim() || defaults.name,
    shortName: override.shortName?.trim() || defaults.shortName,
    tagline: override.tagline?.trim() || defaults.tagline,
    description: override.description?.trim() || defaults.description,
    logos: {
      horizontal: override.logos?.horizontal?.trim() || defaults.logos.horizontal,
      vertical: override.logos?.vertical?.trim() || defaults.logos.vertical,
      icon: override.logos?.icon?.trim() || defaults.logos.icon,
      mobile: override.logos?.mobile?.trim() || defaults.logos.mobile || "",
    },
    logoDisplay: {
      iconBlend: override.logoDisplay?.iconBlend ?? defaults.logoDisplay.iconBlend,
      headerText: override.logoDisplay?.headerText ?? defaults.logoDisplay.headerText ?? "",
      headerText_format: override.logoDisplay?.headerText_format ?? defaults.logoDisplay.headerText_format,
      headerSubheading:
        override.logoDisplay?.headerSubheading ?? defaults.logoDisplay.headerSubheading ?? "",
      headerSubheading_format:
        override.logoDisplay?.headerSubheading_format ?? defaults.logoDisplay.headerSubheading_format,
      headerFont: override.logoDisplay?.headerFont ?? defaults.logoDisplay.headerFont ?? "jakarta",
    },
    header: mergeHeaderConfig(defaults.header, override.header),
  };
}

/** Effective brand for the admin form (build defaults + saved overrides). */
export function brandFormState(override: BrandOverride | null | undefined): BrandConfig {
  return mergeBrand(DEFAULT_BRAND, override);
}

/** Persist only values that differ from build-time defaults; empty clears an override. */
export function overrideFromFormState(form: BrandConfig): BrandOverride {
  const pick = (value: string, defaultValue: string) =>
    value.trim() === defaultValue.trim() ? "" : value.trim();

  const override: BrandOverride = {
    name: pick(form.name, DEFAULT_BRAND.name),
    shortName: pick(form.shortName, DEFAULT_BRAND.shortName),
    tagline: pick(form.tagline, DEFAULT_BRAND.tagline),
    description: pick(form.description, DEFAULT_BRAND.description),
    logos: {
      horizontal: pick(form.logos.horizontal, DEFAULT_BRAND.logos.horizontal),
      vertical: pick(form.logos.vertical, DEFAULT_BRAND.logos.vertical),
      icon: pick(form.logos.icon, DEFAULT_BRAND.logos.icon),
      mobile: pick(form.logos.mobile ?? "", DEFAULT_BRAND.logos.mobile ?? ""),
    },
  };

  if (form.logoDisplay.iconBlend !== DEFAULT_BRAND.logoDisplay.iconBlend) {
    override.logoDisplay = { ...override.logoDisplay, iconBlend: form.logoDisplay.iconBlend };
  }

  const headerText = (form.logoDisplay.headerText ?? "").trim();
  if (headerText !== (DEFAULT_BRAND.logoDisplay.headerText ?? "").trim()) {
    override.logoDisplay = { ...override.logoDisplay, headerText };
  }

  const headerSubheading = (form.logoDisplay.headerSubheading ?? "").trim();
  if (headerSubheading !== (DEFAULT_BRAND.logoDisplay.headerSubheading ?? "").trim()) {
    override.logoDisplay = { ...override.logoDisplay, headerSubheading };
  }

  if (form.logoDisplay.headerText_format) {
    override.logoDisplay = { ...override.logoDisplay, headerText_format: form.logoDisplay.headerText_format };
  }
  if (form.logoDisplay.headerSubheading_format) {
    override.logoDisplay = {
      ...override.logoDisplay,
      headerSubheading_format: form.logoDisplay.headerSubheading_format,
    };
  }

  const headerFont = form.logoDisplay.headerFont ?? DEFAULT_BRAND.logoDisplay.headerFont ?? "jakarta";
  if (headerFont !== (DEFAULT_BRAND.logoDisplay.headerFont ?? "jakarta")) {
    override.logoDisplay = { ...override.logoDisplay, headerFont };
  }

  if (!headerConfigEquals(form.header, DEFAULT_BRAND.header)) {
    override.header = form.header;
  }

  return override;
}

export function canManageBrand(permissions: string[]): boolean {
  return (
    permissions.includes("platform.manage") ||
    permissions.includes("cms.homepage.manage") ||
    permissions.includes("cms.pages.manage")
  );
}

const BRAND_SETTINGS_HREF = "/admin/settings/brand";

/** Hide brand settings from admin nav when runtime editing is disabled at build time. */
export function filterBrandNavigation<T extends { href?: string; children?: T[] }>(
  items: T[],
  allowRuntimeBrandEdit: boolean,
): T[] {
  if (allowRuntimeBrandEdit) return items;

  return items
    .map((item) => {
      if (!item.children?.length) return item;
      const children = item.children.filter((child) => child.href !== BRAND_SETTINGS_HREF);
      return children.length === item.children.length ? item : { ...item, children };
    })
    .filter((item) => !item.children || item.children.length > 0);
}
