import companyConfig from "../../company.config.json";

export interface BrandLogoDisplay {
  /** Screen blend removes black logo plates; turn off for icons on transparent PNGs. */
  iconBlend: boolean;
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
  },
};
