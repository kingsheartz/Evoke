"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useForm, useFieldArray, useWatch, Controller } from "react-hook-form";
import { ExternalLink, Plus, Save, Trash2 } from "lucide-react";
import { HomepageSectionsEditor } from "@/components/cms/homepage-sections-editor";
import { GradientPicker } from "@/components/admin/gradient-picker";
import { ActionButton } from "@/components/ui/action-button";
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
import { useUnsavedChangesWarning } from "@/hooks/use-unsaved-changes";
import { invalidateDivisionNavCache } from "@/hooks/use-division-nav";
import {
  apiClient,
  type DivisionHighlightCard,
  type DivisionPageData,
} from "@/lib/api";
import {
  DIVISION_ACCENT_STYLES,
  DIVISION_ICONS,
  RESERVED_SITE_SLUGS,
  emptyDivisionForm,
  parseDivisionMeta,
  slugifyDivision,
} from "@/lib/division-page";
import { inferDivisionFromSlug } from "@/lib/cms-sections";
import type { HomepageSection } from "@/lib/homepage-meta";
import { revalidateDivisionPublicCache } from "@/lib/revalidate-cms";
import { useNotifications } from "@/lib/notifications";
import { useConfirm } from "@/lib/process-modal";
import { useAuthStore } from "@/stores/app";

interface DivisionForm {
  nav_label: string;
  sort_order: number;
  show_in_nav: boolean;
  badge: string;
  title: string;
  description: string;
  icon: string;
  accent_style: string;
  home_gradient: string;
  highlight_cards: DivisionHighlightCard[];
  footer_note: string;
  sections: HomepageSection[];
}

const EMPTY_DIVISION_FORM: DivisionForm = {
  nav_label: "",
  sort_order: 0,
  show_in_nav: true,
  badge: "",
  title: "",
  description: "",
  icon: "graduation-cap",
  accent_style: "accent",
  home_gradient: "",
  highlight_cards: [],
  footer_note: "",
  sections: [],
};

function toForm(data: DivisionPageData): DivisionForm {
  const meta = parseDivisionMeta(data.meta);
  return {
    nav_label: data.nav_label,
    sort_order: data.sort_order ?? 0,
    show_in_nav: data.show_in_nav ?? true,
    badge: data.badge,
    title: data.title,
    description: data.description,
    icon: data.icon,
    accent_style: data.accent_style ?? "accent",
    home_gradient: data.home_gradient ?? "",
    highlight_cards: data.highlight_cards?.length ? data.highlight_cards : [],
    footer_note: data.footer_note ?? "",
    sections: meta.sections,
  };
}

export default function DivisionPagesEditorPage() {
  const token = useAuthStore((s) => s.token);
  const { success, error: notifyError } = useNotifications();
  const confirm = useConfirm();
  const [loading, setLoading] = useState(true);
  const [divisions, setDivisions] = useState<DivisionPageData[]>([]);
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [newSlug, setNewSlug] = useState("");
  const [newNavLabel, setNewNavLabel] = useState("");

  const { register, control, handleSubmit, reset, setValue, formState: { isDirty, isSubmitting } } = useForm<DivisionForm>({
    defaultValues: EMPTY_DIVISION_FORM,
  });
  const sections = useWatch({ control, name: "sections" }) ?? [];
  const showInNav = useWatch({ control, name: "show_in_nav" });

  const { fields, append, remove } = useFieldArray({ control, name: "highlight_cards" });

  const loadDivisions = useCallback(async () => {
    if (!token) return;
    const res = await apiClient.getAdminDivisionPages(token);
    setDivisions(res.data);
    return res.data;
  }, [token]);

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    loadDivisions()
      .then((list) => {
        if (list?.length && !selectedSlug) {
          setSelectedSlug(list[0].slug);
        }
      })
      .catch(() => notifyError("Unable to load divisions."))
      .finally(() => setLoading(false));
  }, [token, loadDivisions, notifyError, selectedSlug]);

  useEffect(() => {
    if (!token || !selectedSlug) return;
    apiClient
      .getAdminDivisionPage(token, selectedSlug)
      .then((res) => reset(toForm(res.data)))
      .catch(() => notifyError("Unable to load division page."));
  }, [token, selectedSlug, reset, notifyError]);

  const current = divisions.find((d) => d.slug === selectedSlug);

  useUnsavedChangesWarning(isDirty);

  const onSubmit = handleSubmit(async (data) => {
    if (!token || !selectedSlug) return;
    try {
      const res = await apiClient.updateDivisionPage(token, selectedSlug, {
        nav_label: data.nav_label,
        sort_order: Number(data.sort_order),
        show_in_nav: data.show_in_nav,
        badge: data.badge,
        title: data.title,
        description: data.description,
        icon: data.icon,
        accent_style: data.accent_style as DivisionPageData["accent_style"],
        home_gradient: data.home_gradient || null,
        highlight_cards: data.highlight_cards,
        footer_note: data.footer_note.trim() || null,
        meta: { sections: data.sections },
      });
      invalidateDivisionNavCache();
      await revalidateDivisionPublicCache(selectedSlug);
      await loadDivisions();
      reset(toForm(res.data));
      success("Division saved.");
    } catch {
      notifyError("Could not save division.");
    }
  });

  const createDivision = async () => {
    if (!token) return;
    const slug = slugifyDivision(newSlug || newNavLabel);
    if (!slug) {
      notifyError("Enter a valid name or URL slug.");
      return;
    }
    if (RESERVED_SITE_SLUGS.has(slug)) {
      notifyError("That URL slug is reserved.");
      return;
    }
    try {
      const label = newNavLabel.trim() || slug;
      const { data } = await apiClient.createDivisionPage(token, {
        ...emptyDivisionForm(slug, label),
        slug,
        nav_label: label,
      });
      invalidateDivisionNavCache();
      await revalidateDivisionPublicCache(data.slug);
      const list = await loadDivisions();
      setSelectedSlug(data.slug);
      setShowCreate(false);
      setNewSlug("");
      setNewNavLabel("");
      success(`Division “${data.nav_label}” created.`);
      if (!list?.find((d) => d.slug === data.slug)) {
        setDivisions((prev) => [...prev, data]);
      }
    } catch {
      notifyError("Could not create division. Check the slug is unique.");
    }
  };

  const deleteDivision = async () => {
    if (!token || !selectedSlug) return;
    const confirmed = await confirm({
      title: "Are you sure?",
      description: `This will permanently delete “${current?.nav_label}” and its public page at /${selectedSlug}. This action cannot be undone.`,
      confirmLabel: "Delete division",
      variant: "danger",
    });
    if (!confirmed) return;
    try {
      await apiClient.deleteDivisionPage(token, selectedSlug);
      invalidateDivisionNavCache();
      await revalidateDivisionPublicCache(selectedSlug);
      const list = await loadDivisions();
      setSelectedSlug(list?.[0]?.slug ?? null);
      success("Division deleted.");
    } catch {
      notifyError("Could not delete division.");
    }
  };

  if (loading) {
    return <PageLoading label="Loading divisions…" layout="viewport" />;
  }

  return (
    <PermissionGate permission="cms.homepage.manage">
      <div className="app-page">
        <PageHeader
          title="Division pages"
          badge="CMS"
          description={
            isDirty
              ? "Unsaved changes — save to publish updates."
              : "Add divisions, edit landing pages, and control header navigation."
          }
          actions={
            <div className="flex flex-wrap items-center gap-2">
              {selectedSlug && (
                <ActionButton
                  icon={Save}
                  type="submit"
                  form="division-form"
                  loading={isSubmitting}
                  disabled={!isDirty && !isSubmitting}
                  data-admin-primary-save="true"
                >
                  Save division
                </ActionButton>
              )}
              {current && (
                <Button variant="outline" size="sm" asChild>
                  <Link href={current.public_path ?? `/${current.slug}`} target="_blank">
                    Preview
                    <ExternalLink className="h-3.5 w-3.5" />
                  </Link>
                </Button>
              )}
            </div>
          }
        />

        <div className="grid gap-6 xl:grid-cols-[16rem_1fr]">
          <Card className="h-fit">
            <CardHeader className="flex flex-row items-center justify-between gap-2">
              <CardTitle className="text-base">Divisions</CardTitle>
              <Button type="button" size="sm" variant="outline" onClick={() => setShowCreate((v) => !v)}>
                <Plus className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {showCreate && (
                <div className="space-y-2 rounded-lg border border-app-border bg-app-surface-muted/30 p-3">
                  <div className="form-field">
                    <Label>Nav label</Label>
                    <Input
                      value={newNavLabel}
                      onChange={(e) => {
                        setNewNavLabel(e.target.value);
                        if (!newSlug) setNewSlug(slugifyDivision(e.target.value));
                      }}
                      placeholder="Wellness Studio"
                    />
                  </div>
                  <div className="form-field">
                    <Label>URL slug</Label>
                    <Input
                      value={newSlug}
                      onChange={(e) => setNewSlug(slugifyDivision(e.target.value))}
                      placeholder="wellness"
                    />
                    <p className="text-xs text-app-muted">Public URL: /{newSlug || "…"}</p>
                  </div>
                  <Button type="button" size="sm" className="w-full" onClick={createDivision}>
                    Create division
                  </Button>
                </div>
              )}

              <ul className="space-y-1">
                {divisions.map((d) => (
                  <li key={d.slug}>
                    <button
                      type="button"
                      onClick={() => setSelectedSlug(d.slug)}
                      className={`w-full rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                        selectedSlug === d.slug
                          ? "bg-accent/15 font-medium text-accent-soft"
                          : "text-app-muted hover:bg-app-surface-muted hover:text-app-text"
                      }`}
                    >
                      {d.nav_label}
                      <span className="mt-0.5 block text-xs opacity-70">/{d.slug}</span>
                    </button>
                  </li>
                ))}
              </ul>

              {divisions.length === 0 && (
                <p className="text-sm text-app-muted">No divisions yet. Create one above.</p>
              )}
            </CardContent>
          </Card>

          {!selectedSlug ? (
            <Card>
              <CardContent className="py-12 text-center text-sm text-app-muted">
                Select a division or create a new one.
              </CardContent>
            </Card>
          ) : (
            <form id="division-form" onSubmit={onSubmit} className="space-y-6">
              <Card>
                <CardHeader className="flex flex-row items-start justify-between gap-4">
                  <div>
                    <CardTitle>Settings</CardTitle>
                    <CardDescription>
                      URL:{" "}
                      <Link
                        href={`/${selectedSlug}`}
                        target="_blank"
                        className="font-medium text-accent-soft hover:text-accent"
                      >
                        /{selectedSlug}
                      </Link>
                    </CardDescription>
                  </div>
                  <Button type="button" variant="ghost" size="sm" onClick={deleteDivision}>
                    <Trash2 className="mr-1 h-4 w-4 text-status-error" />
                    Delete
                  </Button>
                </CardHeader>
                <CardContent className="grid gap-5 md:grid-cols-2">
                  <div className="form-field">
                    <Label>Nav label</Label>
                    <Input {...register("nav_label")} />
                  </div>
                  <div className="form-field">
                    <Label>Sort order</Label>
                    <Input type="number" min={0} {...register("sort_order", { valueAsNumber: true })} />
                  </div>
                  <div className="md:col-span-2 flex flex-col gap-3 rounded-lg border border-app-border px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0 flex-1">
                      <Label htmlFor="show-in-nav">Show in site navigation</Label>
                      <p className="mt-0.5 text-xs text-app-muted">Header, footer, and mobile menu</p>
                    </div>
                    <Switch
                      id="show-in-nav"
                      checked={showInNav ?? true}
                      onCheckedChange={(v) => setValue("show_in_nav", v, { shouldDirty: true })}
                      className="shrink-0"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Hero</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-5 md:grid-cols-2">
                  <div className="form-field md:col-span-2">
                    <Label>Badge</Label>
                    <Input {...register("badge")} />
                  </div>
                  <div className="form-field md:col-span-2">
                    <Label>Title</Label>
                    <Input {...register("title")} />
                  </div>
                  <div className="form-field md:col-span-2">
                    <Label>Description</Label>
                    <Textarea rows={3} {...register("description")} />
                  </div>
                  <div className="form-field">
                    <Label>Icon</Label>
                    <Select {...register("icon")}>
                      {DIVISION_ICONS.map((icon) => (
                        <option key={icon.value} value={icon.value}>
                          {icon.label}
                        </option>
                      ))}
                    </Select>
                  </div>
                  <div className="form-field">
                    <Label>Card accent</Label>
                    <Select {...register("accent_style")}>
                      {DIVISION_ACCENT_STYLES.map((s) => (
                        <option key={s.value} value={s.value}>
                          {s.label}
                        </option>
                      ))}
                    </Select>
                  </div>
                  <div className="form-field md:col-span-2">
                    <Label>Homepage card gradient</Label>
                    <Controller
                      control={control}
                      name="home_gradient"
                      render={({ field }) => (
                        <GradientPicker value={field.value ?? ""} onChange={field.onChange} className="mt-2" />
                      )}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Highlight cards</CardTitle>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => append({ title: "", description: "", icon: "book-open", link_url: "", link_label: "" })}
                  >
                    <Plus className="mr-1 h-4 w-4" />
                    Add card
                  </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                  {fields.map((field, index) => (
                    <div
                      key={field.id}
                      className="grid gap-4 rounded-xl border border-app-border bg-app-surface-muted/20 p-4 md:grid-cols-2"
                    >
                      <div className="form-field">
                        <Label>Title</Label>
                        <Input {...register(`highlight_cards.${index}.title`)} />
                      </div>
                      <div className="form-field">
                        <Label>Icon</Label>
                        <Select {...register(`highlight_cards.${index}.icon`)}>
                          {DIVISION_ICONS.map((icon) => (
                            <option key={icon.value} value={icon.value}>
                              {icon.label}
                            </option>
                          ))}
                        </Select>
                      </div>
                      <div className="form-field md:col-span-2">
                        <Label>Description</Label>
                        <Input {...register(`highlight_cards.${index}.description`)} />
                      </div>
                      <div className="form-field">
                        <Label>Link URL (optional)</Label>
                        <Input {...register(`highlight_cards.${index}.link_url`)} placeholder="/academy or https://..." />
                      </div>
                      <div className="form-field">
                        <Label>Link label (optional)</Label>
                        <Input {...register(`highlight_cards.${index}.link_label`)} placeholder="Learn more" />
                      </div>
                      <div className="md:col-span-2 flex justify-end">
                        <Button type="button" variant="ghost" size="sm" onClick={() => remove(index)}>
                          <Trash2 className="mr-1 h-4 w-4 text-status-error" />
                          Remove
                        </Button>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-start justify-between gap-4">
                  <div>
                    <CardTitle>Footer note</CardTitle>
                    <CardDescription>
                      Optional message at the bottom of this division page. Edit below, or clear to remove it from the site.
                    </CardDescription>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setValue("footer_note", "", { shouldDirty: true })}
                  >
                    <Trash2 className="mr-1 h-4 w-4 text-status-error" />
                    Clear
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="form-field">
                    <Label htmlFor="footer_note">Note text</Label>
                    <Textarea
                      id="footer_note"
                      rows={2}
                      placeholder="e.g. Online storefront launching soon."
                      {...register("footer_note")}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Extra sections</CardTitle>
                </CardHeader>
                <CardContent>
                  <HomepageSectionsEditor
                    sections={sections}
                    onChange={(next) => setValue("sections", next, { shouldDirty: true })}
                    defaultsContext={{ division: inferDivisionFromSlug(selectedSlug ?? "") }}
                  />
                </CardContent>
              </Card>
            </form>
          )}
        </div>
      </div>
    </PermissionGate>
  );
}
