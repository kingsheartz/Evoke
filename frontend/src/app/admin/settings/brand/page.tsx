"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Save } from "lucide-react";
import { HeaderEditor } from "@/components/admin/header-editor";
import { SiteHeaderPreview } from "@/components/brand/site-header-preview";
import { FormattedTextField } from "@/components/ui/formatted-text-field";
import { MediaUrlField } from "@/components/cms/media-url-field";
import { CompanyLogo } from "@/components/brand/company-logo";
import { ActionButton } from "@/components/ui/action-button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageHeader } from "@/components/ui/page-header";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { ALLOW_RUNTIME_BRAND_EDIT, DEFAULT_BRAND } from "@/lib/brand-defaults";
import { DEFAULT_HEADER_CONFIG } from "@/lib/header-config";
import {
  BRAND_HEADER_FONTS,
  DEFAULT_BRAND_HEADER_FONT,
  type BrandHeaderFont,
} from "@/lib/brand-header-fonts";
import {
  brandFormState,
  canManageBrand,
  mergeBrand,
  overrideFromFormState,
  type BrandConfig,
} from "@/lib/brand";
import { apiClient } from "@/lib/api";
import { useNotifications } from "@/lib/notifications";
import { useAuthStore } from "@/stores/app";

const EMPTY_FORM: BrandConfig = {
  name: "",
  shortName: "",
  tagline: "",
  description: "",
  logos: { horizontal: "", vertical: "", icon: "", mobile: "" },
  logoDisplay: {
    iconBlend: false,
    headerText: "",
    headerSubheading: "",
    headerFont: DEFAULT_BRAND_HEADER_FONT,
  },
  header: DEFAULT_HEADER_CONFIG,
};

function PreviewBrand({ form }: { form: BrandConfig }) {
  const brand = useMemo(() => mergeBrand(DEFAULT_BRAND, overrideFromFormState(form)), [form]);

  return (
    <div className="rounded-xl border border-app-border bg-app-surface-muted/30 p-6">
      <p className="mb-4 text-xs font-medium uppercase tracking-wider text-app-muted">Live preview</p>
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-3">
          <p className="text-xs text-app-muted">Site header (mobile)</p>
          <SiteHeaderPreview brand={brand} variant="mobile" />
        </div>
        <div className="space-y-3">
          <p className="text-xs text-app-muted">Site header (desktop)</p>
          <SiteHeaderPreview brand={brand} variant="desktop" />
        </div>
        <div className="space-y-3">
          <p className="text-xs text-app-muted">Footer</p>
          <div className="rounded-lg border border-app-border bg-black/80 px-4 py-3">
            <CompanyLogo variant="footer" href={null} brand={brand} />
          </div>
        </div>
        <div className="space-y-3 text-center">
          <p className="text-xs text-app-muted">Auth / sign-in</p>
          <CompanyLogo variant="auth" href={null} elevated brand={brand} />
        </div>
      </div>
    </div>
  );
}

export default function BrandSettingsPage() {
  const router = useRouter();
  const token = useAuthStore((s) => s.token);
  const permissions = useAuthStore((s) => s.permissions);
  const { success, error } = useNotifications();
  const [form, setForm] = useState<BrandConfig>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const canEdit = ALLOW_RUNTIME_BRAND_EDIT && canManageBrand(permissions);

  useEffect(() => {
    if (!canManageBrand(permissions)) {
      router.replace("/admin");
    }
  }, [permissions, router]);

  useEffect(() => {
    if (!token || !canEdit) return;
    apiClient
      .getAdminBrand(token)
      .then((r) => {
        setForm(brandFormState(r.data));
      })
      .catch(() => {
        setForm(brandFormState(null));
      })
      .finally(() => setLoaded(true));
  }, [token, canEdit]);

  const patch = (updates: Partial<Omit<BrandConfig, "logos" | "logoDisplay" | "header">> & {
    logos?: Partial<BrandConfig["logos"]>;
    logoDisplay?: Partial<BrandConfig["logoDisplay"]>;
    header?: BrandConfig["header"];
  }) => {
    setForm((prev) => ({
      ...prev,
      ...updates,
      logos: { ...prev.logos, ...updates.logos },
      logoDisplay: { ...prev.logoDisplay, ...updates.logoDisplay },
      header: updates.header ?? prev.header,
    }));
  };

  const save = async () => {
    if (!token || !canEdit) return;
    setSaving(true);
    try {
      const payload = overrideFromFormState(form);
      const { data } = await apiClient.updateAdminBrand(token, payload);
      setForm(brandFormState(data));
      success("Brand saved. Public site updates on refresh.");
      window.dispatchEvent(new CustomEvent("evoke-brand-updated"));
    } catch (e) {
      error(e instanceof Error ? e.message : "Could not save brand settings.");
    } finally {
      setSaving(false);
    }
  };

  if (!canManageBrand(permissions)) {
    return null;
  }

  if (!ALLOW_RUNTIME_BRAND_EDIT) {
    return (
      <div className="app-page">
        <PageHeader
          title="Brand & company"
          description="Brand is locked to the build-time configuration for this deployment."
        />
        <Card>
          <CardContent className="pt-6 text-sm text-app-muted">
            <p>
              Runtime brand editing is disabled in <code className="text-xs">company.config.json</code>{" "}
              (<code className="text-xs">allowRuntimeBrandEdit: false</code>). Update the config and rebuild to
              change name, tagline, or logos.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="app-page">
      <PageHeader
        title="Brand & company"
        description="Edit the live brand for this deployment. Values from company.config.json are pre-filled and can be changed here without rebuilding."
        actions={
          <ActionButton
            icon={Save}
            loading={saving}
            disabled={!loaded}
            data-admin-primary-save="true"
            onClick={save}
          >
            Save brand
          </ActionButton>
        }
      />

      <div className="space-y-6">
        <PreviewBrand form={form} />

        <Card>
          <CardHeader>
            <CardTitle>Company details</CardTitle>
            <CardDescription>
              Fields show the current brand, including values set at build time in{" "}
              <code className="text-xs">company.config.json</code>. Changes saved here apply immediately on the
              public site.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Company name</Label>
              <Input
                value={form.name}
                onChange={(e) => patch({ name: e.target.value })}
                placeholder={DEFAULT_BRAND.name}
              />
            </div>
            <div className="space-y-2">
              <Label>Short name</Label>
              <Input
                value={form.shortName}
                onChange={(e) => patch({ shortName: e.target.value })}
                placeholder={DEFAULT_BRAND.shortName}
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Tagline</Label>
              <Input
                value={form.tagline}
                onChange={(e) => patch({ tagline: e.target.value })}
                placeholder={DEFAULT_BRAND.tagline}
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Footer description</Label>
              <Textarea
                value={form.description}
                onChange={(e) => patch({ description: e.target.value })}
                placeholder={DEFAULT_BRAND.description}
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Site header</CardTitle>
            <CardDescription>
              Configure the public site header — announcement bar, logo lockup text, and reusable header
              components (search, CTAs, contact links, social icons, and more).
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="grid gap-4 md:grid-cols-2">
              <FormattedTextField
                label="Header text (beside logo)"
                value={form.logoDisplay.headerText ?? ""}
                format={form.logoDisplay.headerText_format}
                preset="label"
                onChange={(headerText, headerText_format) =>
                  patch({ logoDisplay: { headerText, headerText_format } })
                }
                placeholder={DEFAULT_BRAND.name}
              />
              <p className="text-xs text-app-muted md:col-span-2 md:-mt-2">Desktop only (lg+). Mobile keeps the icon mark.</p>
              <FormattedTextField
                label="Subheading"
                value={form.logoDisplay.headerSubheading ?? ""}
                format={form.logoDisplay.headerSubheading_format}
                preset="label"
                onChange={(headerSubheading, headerSubheading_format) =>
                  patch({ logoDisplay: { headerSubheading, headerSubheading_format } })
                }
                placeholder={DEFAULT_BRAND.tagline}
              />
              <div className="space-y-2 md:col-span-2">
                <Label>Lockup font (default)</Label>
                <p className="text-xs text-app-muted">
                  Applies when font family is left as Default in the format panel above.
                </p>
                <Select
                  value={form.logoDisplay.headerFont ?? DEFAULT_BRAND_HEADER_FONT}
                  onChange={(e) =>
                    patch({ logoDisplay: { headerFont: e.target.value as BrandHeaderFont } })
                  }
                >
                  {BRAND_HEADER_FONTS.map((font) => (
                    <option key={font.id} value={font.id}>
                      {font.label}
                    </option>
                  ))}
                </Select>
              </div>
            </div>

            <HeaderEditor value={form.header} onChange={(header) => patch({ header })} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Logos</CardTitle>
            <CardDescription>
              Horizontal for desktop header/footer, vertical for sign-in, icon for favicon. Use a dedicated mobile
              header icon (square mark) so phones show only the bird — not the full wordmark.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>Mobile header icon</Label>
              <p className="text-xs text-app-muted">
                Shown on screens under 768px. Use a square PNG (transparent background recommended). Leave empty to
                use the favicon icon below.
              </p>
              <MediaUrlField
                kind="image"
                value={form.logos.mobile ?? ""}
                onChange={(url) => patch({ logos: { mobile: url } })}
                placeholder={form.logos.icon || DEFAULT_BRAND.logos.icon}
              />
            </div>
            <div className="space-y-2">
              <Label>Icon / favicon</Label>
              <MediaUrlField
                kind="image"
                value={form.logos.icon}
                onChange={(url) => patch({ logos: { icon: url } })}
                placeholder={DEFAULT_BRAND.logos.icon}
              />
            </div>
            <div className="space-y-2">
              <Label>Horizontal logo</Label>
              <MediaUrlField
                kind="image"
                value={form.logos.horizontal}
                onChange={(url) => patch({ logos: { horizontal: url } })}
                placeholder={DEFAULT_BRAND.logos.horizontal}
              />
            </div>
            <div className="space-y-2">
              <Label>Vertical logo</Label>
              <MediaUrlField
                kind="image"
                value={form.logos.vertical}
                onChange={(url) => patch({ logos: { vertical: url } })}
                placeholder={DEFAULT_BRAND.logos.vertical}
              />
            </div>
            <div className="flex items-start gap-3 rounded-lg border border-app-border bg-app-surface-muted/20 p-4">
              <input
                id="icon-blend"
                type="checkbox"
                className="mt-1 h-4 w-4 rounded border-app-border"
                checked={form.logoDisplay.iconBlend}
                onChange={(e) => patch({ logoDisplay: { iconBlend: e.target.checked } })}
              />
              <div className="space-y-1">
                <Label htmlFor="icon-blend" className="cursor-pointer">
                  Screen blend on icon
                </Label>
                <p className="text-xs text-app-muted">
                  Enable only if your icon has a solid black background plate (like the horizontal logo). Leave off
                  for transparent PNGs — they display sharper on the hero and mobile header.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>White-label build (new company)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-app-muted">
            <p>
              1. Copy <code className="text-xs">frontend/company.config.example.json</code> to{" "}
              <code className="text-xs">company.config.json</code>
            </p>
            <p>
              2. Set <code className="text-xs">allowRuntimeBrandEdit: true</code> to keep this page enabled after
              build
            </p>
            <p>
              3. Replace logo files in <code className="text-xs">frontend/public/</code> and update paths in the
              config
            </p>
            <p>
              4. Run <code className="text-xs">npm run validate:company</code> then{" "}
              <code className="text-xs">npm run build</code>
            </p>
            <p>5. Use this page for further tweaks without rebuilding</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
