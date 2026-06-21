import companyConfig from "../../company.config.json";
import { DEFAULT_BRAND_HEADER_FONT, type BrandHeaderFont } from "@/lib/brand-header-fonts";
import {
  DEFAULT_HEADER_CONFIG,
  mergeHeaderConfig,
  type BrandHeaderConfig,
} from "@/lib/header-config";
import type { TextFormat } from "@/lib/text-format";

export type { BrandHeaderConfig };

export interface BrandLogoDisplay {
  /** Screen blend removes black logo plates; turn off for icons on transparent PNGs. */
  iconBlend: boolean;
  /** Optional title beside the header logo (desktop only). */
  headerText?: string;
  headerText_format?: TextFormat;
  /** Optional subheading under headerText (desktop only). */
  headerSubheading?: string;
  headerSubheading_format?: TextFormat;
  /** Font for header lockup text. */
  headerFont?: BrandHeaderFont;
}

export interface BrandConfig {
  name: string;
  shortName: string;
  tagline: string;
  description: string;
  logos: {
    horizontal: string;
    vertical: string;
    icon: string;
    /** Optional square mark for mobile header; falls back to icon. */
    mobile?: string;
  };
  logoDisplay: BrandLogoDisplay;
  header: BrandHeaderConfig;
}

/** When true (default), admins can edit brand in the panel even if values were set at build time. */
export const ALLOW_RUNTIME_BRAND_EDIT =
  (companyConfig as { allowRuntimeBrandEdit?: boolean }).allowRuntimeBrandEdit !== false;

export const DEFAULT_BRAND: BrandConfig = {
  name: companyConfig.name,
  shortName: companyConfig.shortName,
  tagline: companyConfig.tagline,
  description: companyConfig.description,
  logos: {
    horizontal: companyConfig.logos.horizontal,
    vertical: companyConfig.logos.vertical,
    icon: companyConfig.logos.icon,
    mobile: (companyConfig.logos as { mobile?: string }).mobile ?? "",
  },
  logoDisplay: {
    iconBlend:
      (companyConfig as { logoDisplay?: { iconBlend?: boolean } }).logoDisplay?.iconBlend ?? false,
    headerText:
      (companyConfig as { logoDisplay?: { headerText?: string } }).logoDisplay?.headerText?.trim() ??
      "",
    headerSubheading:
      (companyConfig as { logoDisplay?: { headerSubheading?: string } }).logoDisplay?.headerSubheading?.trim() ??
      "",
    headerFont:
      (companyConfig as { logoDisplay?: { headerFont?: BrandHeaderFont } }).logoDisplay?.headerFont ??
      DEFAULT_BRAND_HEADER_FONT,
  },
  header: mergeHeaderConfig(
    DEFAULT_HEADER_CONFIG,
    (companyConfig as { header?: Partial<BrandHeaderConfig> }).header,
  ),
};
