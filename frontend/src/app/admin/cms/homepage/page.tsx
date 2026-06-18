"use client";

import { useEffect, useState } from "react";
import { useForm, useFieldArray, useWatch, Controller } from "react-hook-form";
import Link from "next/link";
import { ExternalLink, Plus, Trash2 } from "lucide-react";
import { HomepageSectionsEditor } from "@/components/cms/homepage-sections-editor";
import { GradientPicker } from "@/components/admin/gradient-picker";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { PageHeader } from "@/components/ui/page-header";
import { PermissionGate } from "@/components/admin/permission-gate";
import { PageLoading } from "@/components/ui/page-loading";
import { apiClient, type EntryCard, type HomepageData } from "@/lib/api";
import { DEFAULT_HERO_VIDEO } from "@/lib/homepage-defaults";
import {
  ENTRY_CARD_ICONS,
  FEATURE_ICONS,
  defaultHomepageMeta,
  parseHomepageMeta,
  type HomepageFeature,
  type HomepageSection,
  type HomepageStat,
} from "@/lib/homepage-meta";
import { useNotifications } from "@/lib/notifications";
import { useAuthStore } from "@/stores/app";

interface HomepageForm {
  hero_heading: string;
  hero_subheading: string;
  hero_background_type: string;
  hero_background_url: string;
  hero_video_url: string;
  hero_cta_text: string;
  hero_cta_url: string;
  entry_cards: EntryCard[];
  stats_enabled: boolean;
  stats: HomepageStat[];
  features_enabled: boolean;
  features_eyebrow: string;
  features_heading: string;
  features: HomepageFeature[];
  sections: HomepageSection[];
}

function toForm(data: HomepageData): HomepageForm {
  const meta = parseHomepageMeta(data.meta);
  return {
    hero_heading: data.hero.heading ?? "",
    hero_subheading: data.hero.subheading ?? "",
    hero_background_type: data.hero.background_type ?? "video",
    hero_background_url: data.hero.background_url ?? "",
    hero_video_url: data.hero.video_url ?? DEFAULT_HERO_VIDEO,
    hero_cta_text: data.hero.cta_text ?? "",
    hero_cta_url: data.hero.cta_url ?? "",
    entry_cards: data.entry_cards ?? [],
    stats_enabled: meta.stats?.enabled ?? true,
    stats: meta.stats?.items ?? defaultHomepageMeta().stats!.items!,
    features_enabled: meta.features?.enabled ?? true,
    features_eyebrow: meta.features?.eyebrow ?? "Why Evoke",
    features_heading: meta.features?.heading ?? "Built for excellence",
    features: meta.features?.items ?? defaultHomepageMeta().features!.items!,
    sections: meta.sections ?? [],
  };
}

function toPayload(data: HomepageForm) {
  return {
    hero_heading: data.hero_heading,
    hero_subheading: data.hero_subheading,
    hero_background_type: data.hero_background_type,
    hero_background_url: data.hero_background_url,
    hero_video_url: data.hero_video_url,
    hero_cta_text: data.hero_cta_text,
    hero_cta_url: data.hero_cta_url,
    entry_cards: data.entry_cards,
    meta: {
      stats: { enabled: data.stats_enabled, items: data.stats },
      features: {
        enabled: data.features_enabled,
        eyebrow: data.features_eyebrow,
        heading: data.features_heading,
        items: data.features,
      },
      sections: data.sections,
    },
  };
}

export default function HomepageEditorPage() {
  const token = useAuthStore((s) => s.token);
  const { success, error: notifyError } = useNotifications();
  const [loading, setLoading] = useState(true);

  const { register, control, handleSubmit, reset, setValue, watch } = useForm<HomepageForm>({
    defaultValues: {
      hero_background_type: "video",
      hero_video_url: DEFAULT_HERO_VIDEO,
      stats_enabled: true,
      features_enabled: true,
      stats: defaultHomepageMeta().stats!.items!,
      features: defaultHomepageMeta().features!.items!,
      sections: [],
    },
  });

  const { fields: cardFields } = useFieldArray({ control, name: "entry_cards" });
  const { fields: statFields, append: appendStat, remove: removeStat } = useFieldArray({ control, name: "stats" });
  const { fields: featureFields, append: appendFeature, remove: removeFeature } = useFieldArray({ control, name: "features" });

  const backgroundType = useWatch({ control, name: "hero_background_type" });
  const videoUrl = useWatch({ control, name: "hero_video_url" });
  const statsEnabled = watch("stats_enabled");
  const featuresEnabled = watch("features_enabled");
  const sections = watch("sections");

  useEffect(() => {
    apiClient.getHomepage().then((res) => {
      if (res.data) reset(toForm(res.data));
      setLoading(false);
    });
  }, [reset]);

  const onSubmit = async (data: HomepageForm) => {
    if (!token) return;
    try {
      await apiClient.updateHomepage(token, toPayload(data));
      success("Homepage saved. Hard refresh the public site to preview.");
    } catch (e) {
      notifyError(e instanceof Error ? e.message : "Failed to save homepage.");
    }
  };

  if (loading) {
    return <PageLoading label="Loading homepage settings..." />;
  }

  return (
    <PermissionGate
      permission={["cms.homepage.manage", "cms.pages.manage"]}
      fallback={<p className="text-status-error">You do not have permission to edit the homepage.</p>}
    >
      <div className="app-page">
        <PageHeader
          title="Homepage Editor"
          description="Hero, stats, division cards, features, and extra CMS sections for the public homepage."
          badge="CMS"
          actions={
            <Button variant="outline" size="sm" asChild>
              <Link href="/" target="_blank">
                Preview site
                <ExternalLink className="h-3.5 w-3.5" />
              </Link>
            </Button>
          }
        />

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Hero Section</CardTitle>
              <CardDescription>
                Video background recommended. Default:{" "}
                <code className="rounded bg-white/5 px-1.5 py-0.5 text-xs">{DEFAULT_HERO_VIDEO}</code>
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-5 md:grid-cols-2">
              <div className="form-field md:col-span-2">
                <Label htmlFor="hero_heading">Heading</Label>
                <Input id="hero_heading" placeholder="Welcome to Evoke" {...register("hero_heading")} />
              </div>
              <div className="form-field md:col-span-2">
                <Label htmlFor="hero_subheading">Subheading</Label>
                <Input id="hero_subheading" placeholder="Academy · Sports Shop · Tours & Travels" {...register("hero_subheading")} />
              </div>
              <div className="form-field">
                <Label htmlFor="hero_background_type">Background type</Label>
                <Select id="hero_background_type" {...register("hero_background_type")}>
                  <option value="video">Video</option>
                  <option value="image">Image</option>
                  <option value="gradient">Gradient</option>
                </Select>
              </div>
              {backgroundType === "image" && (
                <div className="form-field">
                  <Label htmlFor="hero_background_url">Image URL</Label>
                  <Input id="hero_background_url" placeholder="/images/hero.jpg" {...register("hero_background_url")} />
                </div>
              )}
              {backgroundType === "video" && (
                <div className="form-field md:col-span-2">
                  <Label htmlFor="hero_video_url">Video URL</Label>
                  <Input id="hero_video_url" placeholder={DEFAULT_HERO_VIDEO} {...register("hero_video_url")} />
                  <p className="text-xs text-app-muted">
                    Path: <span className="font-mono text-accent-soft">{videoUrl || DEFAULT_HERO_VIDEO}</span>
                  </p>
                </div>
              )}
              <div className="form-field">
                <Label htmlFor="hero_cta_text">CTA text</Label>
                <Input id="hero_cta_text" {...register("hero_cta_text")} />
              </div>
              <div className="form-field">
                <Label htmlFor="hero_cta_url">CTA URL</Label>
                <Input id="hero_cta_url" placeholder="#divisions" {...register("hero_cta_url")} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-4">
              <div>
                <CardTitle>Stats bar</CardTitle>
                <CardDescription>Key numbers shown below the hero.</CardDescription>
              </div>
              <label className="flex items-center gap-2 text-sm text-app-muted">
                <Switch checked={statsEnabled} onCheckedChange={(v) => setValue("stats_enabled", v)} />
                Show on site
              </label>
            </CardHeader>
            <CardContent className="space-y-4">
              {statFields.map((field, index) => (
                <div key={field.id} className="flex flex-col gap-3 rounded-xl border border-app-border bg-app-surface-muted/20 p-4 sm:flex-row sm:items-end">
                  <div className="form-field flex-1">
                    <Label>Value</Label>
                    <Input {...register(`stats.${index}.value`)} placeholder="12+" />
                  </div>
                  <div className="form-field flex-1">
                    <Label>Label</Label>
                    <Input {...register(`stats.${index}.label`)} placeholder="Academy Programs" />
                  </div>
                  <Button type="button" variant="ghost" size="sm" onClick={() => removeStat(index)}>
                    <Trash2 className="h-4 w-4 text-status-error" />
                  </Button>
                </div>
              ))}
              <Button type="button" variant="outline" size="sm" onClick={() => appendStat({ value: "", label: "" })}>
                <Plus className="h-4 w-4" />Add stat
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Division entry cards</CardTitle>
              <CardDescription>Bento grid linking to Academy, Shop, and Tours.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {cardFields.map((field, index) => (
                <div key={field.id} className="grid gap-4 rounded-xl border border-app-border bg-app-surface-muted/20 p-4 md:grid-cols-2">
                  <div className="form-field">
                    <Label>Title</Label>
                    <Input {...register(`entry_cards.${index}.title`)} />
                  </div>
                  <div className="form-field">
                    <Label>Slug</Label>
                    <Input {...register(`entry_cards.${index}.slug`)} />
                  </div>
                  <div className="form-field md:col-span-2">
                    <Label>Description</Label>
                    <Textarea rows={2} {...register(`entry_cards.${index}.description`)} />
                  </div>
                  <div className="form-field">
                    <Label>URL</Label>
                    <Input {...register(`entry_cards.${index}.url`)} />
                  </div>
                  <div className="form-field">
                    <Label>Icon</Label>
                    <Select {...register(`entry_cards.${index}.icon`)}>
                      {ENTRY_CARD_ICONS.map((icon) => (
                        <option key={icon.value} value={icon.value}>{icon.label}</option>
                      ))}
                    </Select>
                  </div>
                  <div className="form-field md:col-span-2">
                    <Label>Card gradient</Label>
                    <Controller
                      control={control}
                      name={`entry_cards.${index}.gradient`}
                      render={({ field }) => (
                        <GradientPicker value={field.value ?? ""} onChange={field.onChange} className="mt-2" />
                      )}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-4">
              <div>
                <CardTitle>Features section</CardTitle>
                <CardDescription>Why Evoke — icon cards below the divisions.</CardDescription>
              </div>
              <label className="flex items-center gap-2 text-sm text-app-muted">
                <Switch checked={featuresEnabled} onCheckedChange={(v) => setValue("features_enabled", v)} />
                Show on site
              </label>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="form-field">
                  <Label>Eyebrow</Label>
                  <Input {...register("features_eyebrow")} placeholder="Why Evoke" />
                </div>
                <div className="form-field">
                  <Label>Heading</Label>
                  <Input {...register("features_heading")} placeholder="Built for excellence" />
                </div>
              </div>
              {featureFields.map((field, index) => (
                <div key={field.id} className="grid gap-4 rounded-xl border border-app-border bg-app-surface-muted/20 p-4 md:grid-cols-2">
                  <div className="form-field">
                    <Label>Icon</Label>
                    <Select {...register(`features.${index}.icon`)}>
                      {FEATURE_ICONS.map((icon) => (
                        <option key={icon.value} value={icon.value}>{icon.label}</option>
                      ))}
                    </Select>
                  </div>
                  <div className="form-field">
                    <Label>Title</Label>
                    <Input {...register(`features.${index}.title`)} />
                  </div>
                  <div className="form-field md:col-span-2">
                    <Label>Description</Label>
                    <Textarea rows={2} {...register(`features.${index}.description`)} />
                  </div>
                  <div className="md:col-span-2">
                    <Button type="button" variant="ghost" size="sm" onClick={() => removeFeature(index)}>
                      <Trash2 className="mr-2 h-4 w-4 text-status-error" />Remove feature
                    </Button>
                  </div>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => appendFeature({ icon: "sparkles", title: "", description: "" })}
              >
                <Plus className="h-4 w-4" />Add feature
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Extra homepage sections</CardTitle>
              <CardDescription>
                Add galleries, FAQs, testimonials, banners, and more — same blocks as CMS pages.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <HomepageSectionsEditor
                sections={sections ?? []}
                onChange={(next) => setValue("sections", next, { shouldDirty: true })}
              />
            </CardContent>
          </Card>

          <Button type="submit" variant="glow">
            Save Homepage
          </Button>
        </form>
      </div>
    </PermissionGate>
  );
}
