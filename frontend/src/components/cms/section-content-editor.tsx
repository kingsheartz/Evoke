"use client";

import { Plus, Trash2 } from "lucide-react";
import { HeroBackgroundImagesField } from "@/components/cms/hero-background-images-field";
import { MediaUrlField } from "@/components/cms/media-url-field";
import { FormFieldsEditor } from "@/components/cms/form-fields-editor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { FormattedTextField, SectionFormattedField } from "@/components/ui/formatted-text-field";
import { Textarea } from "@/components/ui/textarea";
import {
  defaultSectionContent,
  type HeroSlideshowSettings,
  heroSlideshowSettings,
  normalizeUrlList,
  type CardItem,
  type CatalogContent,
  type CmsButtonItem,
  type FaqItem,
  type FormField,
  type GalleryImage,
  type ItineraryDay,
  type SectionDefaultsContext,
  type SectionType,
  type StatItem,
  type TabItem,
  type TestimonialItem,
} from "@/lib/cms-sections";
import type { TimelineVariant } from "@/lib/offerings";
import { DIVISION_ICONS } from "@/lib/division-page";
import { cn } from "@/lib/utils";

function FieldGroup({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("space-y-2.5", className)}>
      <Label>{label}</Label>
      {children}
    </div>
  );
}

function ItemActions({ onRemove }: { onRemove: () => void }) {
  return (
    <Button type="button" variant="ghost" size="sm" onClick={onRemove} className="mt-0.5 shrink-0 self-start">
      <Trash2 className="h-4 w-4 text-status-error" />
    </Button>
  );
}

function ItemCard({ children, onRemove }: { children: React.ReactNode; onRemove: () => void }) {
  return (
    <div className="rounded-lg border border-app-border bg-app-surface-muted/40 p-4">
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1 space-y-3">{children}</div>
        <ItemActions onRemove={onRemove} />
      </div>
    </div>
  );
}

function ListFieldGroup({
  label,
  addLabel,
  onAdd,
  children,
}: {
  label: string;
  addLabel: string;
  onAdd: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-app-border/70 bg-app-surface-muted/15 p-4">
      <Label className="mb-4 block">{label}</Label>
      {children}
      <Button type="button" variant="outline" size="sm" className="mt-4" onClick={onAdd}>
        <Plus className="h-4 w-4" />
        {addLabel}
      </Button>
    </div>
  );
}

function StringListEditor({
  label,
  addLabel,
  values,
  onChange,
  placeholder,
}: {
  label: string;
  addLabel: string;
  values: string[];
  onChange: (next: string[]) => void;
  placeholder?: string;
}) {
  return (
    <ListFieldGroup label={label} addLabel={addLabel} onAdd={() => onChange([...values, ""])}>
      <div className="space-y-3">
        {values.map((value, index) => (
          <ItemCard key={index} onRemove={() => onChange(values.filter((_, i) => i !== index))}>
            <Input
              placeholder={placeholder ?? "List item"}
              value={value}
              onChange={(e) => onChange(updateStringList(values, index, e.target.value))}
            />
          </ItemCard>
        ))}
      </div>
    </ListFieldGroup>
  );
}

function updateStringList(list: string[], index: number, value: string): string[] {
  return list.map((item, i) => (i === index ? value : item));
}

function updateList<T>(list: T[], index: number, patch: Partial<T>): T[] {
  return list.map((item, i) => (i === index ? { ...item, ...patch } : item));
}

function timelineItemLabels(variant: TimelineVariant) {
  switch (variant) {
    case "course":
      return { listLabel: "Modules", addLabel: "Add module", titlePlaceholder: "Module title (e.g. Module 01: Foundations)" };
    case "product":
      return { listLabel: "Steps", addLabel: "Add step", titlePlaceholder: "Step title (e.g. Specifications)" };
    default:
      return { listLabel: "Days", addLabel: "Add day", titlePlaceholder: "Day title (e.g. Day 01: Arrival)" };
  }
}

const sectionStack = "space-y-4";

function ButtonsListEditor({
  label,
  buttons,
  onChange,
}: {
  label: string;
  buttons: CmsButtonItem[];
  onChange: (next: CmsButtonItem[]) => void;
}) {
  return (
    <ListFieldGroup
      label={label}
      addLabel="Add button"
      onAdd={() => onChange([...buttons, { label: "New button", url: "/", variant: "primary" }])}
    >
      <div className="space-y-3">
        {buttons.map((button, index) => (
          <ItemCard key={index} onRemove={() => onChange(buttons.filter((_, i) => i !== index))}>
            <div className="grid gap-3 sm:grid-cols-2">
              <FormattedTextField
                label="Label"
                value={button.label}
                format={button.label_format}
                preset="button"
                onChange={(label, label_format) => onChange(updateList(buttons, index, { label, label_format }))}
              />
              <FieldGroup label="URL">
                <Input
                  value={button.url}
                  onChange={(e) => onChange(updateList(buttons, index, { url: e.target.value }))}
                  placeholder="/contact"
                />
              </FieldGroup>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <FieldGroup label="Style">
                <Select
                  value={button.variant ?? "primary"}
                  onChange={(e) =>
                    onChange(updateList(buttons, index, { variant: e.target.value as CmsButtonItem["variant"] }))
                  }
                >
                  <option value="primary">Primary</option>
                  <option value="outline">Outline</option>
                  <option value="ghost">Ghost</option>
                </Select>
              </FieldGroup>
              <label className="flex items-center gap-2 self-end pb-2 text-sm text-app-text">
                <input
                  type="checkbox"
                  className="form-checkbox"
                  checked={Boolean(button.new_tab)}
                  onChange={(e) => onChange(updateList(buttons, index, { new_tab: e.target.checked }))}
                />
                Open in new tab
              </label>
            </div>
          </ItemCard>
        ))}
      </div>
    </ListFieldGroup>
  );
}

export function SectionContentEditor({
  type,
  content,
  onChange,
}: {
  type: SectionType;
  content: Record<string, unknown>;
  onChange: (content: Record<string, unknown>) => void;
}) {
  const patch = (updates: Record<string, unknown>) => onChange({ ...content, ...updates });

  switch (type) {
    case "hero":
      return (
        <div className={sectionStack}>
          <SectionFormattedField label="Eyebrow / tagline" field="eyebrow" content={content} onPatch={patch} preset="eyebrow" />
          <div className="grid gap-4 sm:grid-cols-3">
            <SectionFormattedField label="Heading line 1" field="heading" content={content} onPatch={patch} preset="heading" />
            <SectionFormattedField
              label="Accent word (script)"
              field="heading_accent"
              content={content}
              onPatch={patch}
              preset="heading"
              placeholder="meets"
            />
            <SectionFormattedField label="Heading line 2" field="heading_suffix" content={content} onPatch={patch} preset="heading" />
          </div>
          <SectionFormattedField label="Description" field="body" content={content} onPatch={patch} multiline rows={3} preset="body" />
          <div className="grid gap-4 sm:grid-cols-2">
            <FieldGroup label="Background type">
              <Select
                value={String(content.background_type ?? "image")}
                onChange={(e) => patch({ background_type: e.target.value })}
              >
                <option value="image">Image</option>
                <option value="video">Video</option>
              </Select>
            </FieldGroup>
            <FieldGroup label="Overlay">
              <Select
                value={String(content.overlay ?? "gradient")}
                onChange={(e) => patch({ overlay: e.target.value })}
              >
                <option value="gradient">Gradient</option>
                <option value="dark">Dark</option>
                <option value="light">Light</option>
                <option value="none">None</option>
              </Select>
            </FieldGroup>
          </div>
          {content.background_type === "video" ? (
            <FieldGroup label="Background video">
              <MediaUrlField
                kind="video"
                value={String(content.video_url ?? "")}
                onChange={(url) => patch({ video_url: url })}
              />
            </FieldGroup>
          ) : (
            <HeroBackgroundImagesField
              images={normalizeUrlList(content.background_images as string[] | undefined).length > 0
                ? (content.background_images as string[])
                : content.image_url
                  ? [String(content.image_url)]
                  : [""]}
              settings={heroSlideshowSettings(content as { slideshow?: HeroSlideshowSettings })}
              onChange={(background_images, slideshow) => {
                const urls = normalizeUrlList(background_images);
                patch({
                  background_images: urls,
                  image_url: urls[0] ?? "",
                  slideshow,
                });
              }}
            />
          )}
          <div className="grid gap-4 sm:grid-cols-2">
            <FieldGroup label="Height">
              <Select value={String(content.height ?? "full")} onChange={(e) => patch({ height: e.target.value })}>
                <option value="full">Full viewport</option>
                <option value="tall">Tall</option>
                <option value="medium">Medium</option>
              </Select>
            </FieldGroup>
            <FieldGroup label="Content alignment">
              <Select value={String(content.align ?? "left")} onChange={(e) => patch({ align: e.target.value })}>
                <option value="left">Left</option>
                <option value="center">Center</option>
              </Select>
            </FieldGroup>
          </div>
          <ButtonsListEditor
            label="Call-to-action buttons"
            buttons={(content.buttons as CmsButtonItem[] | undefined) ?? []}
            onChange={(buttons) => patch({ buttons })}
          />
        </div>
      );

    case "buttons":
      return (
        <div className={sectionStack}>
          <SectionFormattedField label="Heading (optional)" field="heading" content={content} onPatch={patch} preset="heading" />
          <SectionFormattedField
            label="Description (optional)"
            field="body"
            content={content}
            onPatch={patch}
            multiline
            rows={2}
            preset="body"
          />
          <FieldGroup label="Alignment">
            <Select value={String(content.align ?? "left")} onChange={(e) => patch({ align: e.target.value })}>
              <option value="left">Left</option>
              <option value="center">Center</option>
            </Select>
          </FieldGroup>
          <ButtonsListEditor
            label="Buttons"
            buttons={(content.buttons as CmsButtonItem[] | undefined) ?? []}
            onChange={(buttons) => patch({ buttons })}
          />
        </div>
      );

    case "table": {
      const columns = (content.columns as string[] | undefined) ?? [];
      const rows = (content.rows as string[][] | undefined) ?? [];
      return (
        <div className={sectionStack}>
          <SectionFormattedField label="Heading" field="heading" content={content} onPatch={patch} preset="heading" />
          <SectionFormattedField label="Description" field="body" content={content} onPatch={patch} multiline rows={2} preset="body" />
          <StringListEditor
            label="Columns"
            addLabel="Add column"
            values={columns}
            onChange={(next) => patch({ columns: next })}
            placeholder="Column name"
          />
          <ListFieldGroup
            label="Rows"
            addLabel="Add row"
            onAdd={() => patch({ rows: [...rows, columns.map(() => "")] })}
          >
            <div className="space-y-3">
              {rows.map((row, rowIndex) => (
                <ItemCard key={rowIndex} onRemove={() => patch({ rows: rows.filter((_, i) => i !== rowIndex) })}>
                  <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                    {Array.from({ length: Math.max(columns.length, row.length, 1) }).map((_, colIndex) => (
                      <Input
                        key={colIndex}
                        placeholder={columns[colIndex] ?? `Column ${colIndex + 1}`}
                        value={row[colIndex] ?? ""}
                        onChange={(e) => {
                          const nextRows = rows.map((existing, i) => {
                            if (i !== rowIndex) return existing;
                            const nextRow = [...existing];
                            nextRow[colIndex] = e.target.value;
                            return nextRow;
                          });
                          patch({ rows: nextRows });
                        }}
                      />
                    ))}
                  </div>
                </ItemCard>
              ))}
            </div>
          </ListFieldGroup>
          <label className="flex items-center gap-2 text-sm text-app-text">
            <input
              type="checkbox"
              className="form-checkbox"
              checked={content.striped !== false}
              onChange={(e) => patch({ striped: e.target.checked })}
            />
            Striped rows
          </label>
          <label className="flex items-center gap-2 text-sm text-app-text">
            <input
              type="checkbox"
              className="form-checkbox"
              checked={content.highlight_header !== false}
              onChange={(e) => patch({ highlight_header: e.target.checked })}
            />
            Highlight header row
          </label>
        </div>
      );
    }

    case "tabs": {
      const tabs = (content.tabs as TabItem[] | undefined) ?? [];
      return (
        <div className={sectionStack}>
          <SectionFormattedField label="Heading" field="heading" content={content} onPatch={patch} preset="heading" />
          <SectionFormattedField label="Description" field="body" content={content} onPatch={patch} multiline rows={2} preset="body" />
          <FieldGroup label="Tab style">
            <Select value={String(content.style ?? "pills")} onChange={(e) => patch({ style: e.target.value })}>
              <option value="pills">Pills</option>
              <option value="underline">Underline</option>
            </Select>
          </FieldGroup>
          <ListFieldGroup label="Tabs" addLabel="Add tab" onAdd={() => patch({ tabs: [...tabs, { label: "New tab", body: "" }] })}>
            <div className="space-y-3">
              {tabs.map((tab, index) => (
                <ItemCard key={index} onRemove={() => patch({ tabs: tabs.filter((_, i) => i !== index) })}>
                  <FormattedTextField
                    label="Tab label"
                    value={tab.label}
                    format={tab.label_format}
                    preset="label"
                    onChange={(label, label_format) => patch({ tabs: updateList(tabs, index, { label, label_format }) })}
                  />
                  <FormattedTextField
                    label="Tab content"
                    value={tab.body ?? ""}
                    format={tab.body_format}
                    preset="body"
                    multiline
                    rows={4}
                    onChange={(body, body_format) => patch({ tabs: updateList(tabs, index, { body, body_format }) })}
                  />
                </ItemCard>
              ))}
            </div>
          </ListFieldGroup>
        </div>
      );
    }

    case "banner":
      return (
        <div className={sectionStack}>
          <SectionFormattedField label="Heading" field="heading" content={content} onPatch={patch} preset="heading" />
          <SectionFormattedField label="Subheading" field="subheading" content={content} onPatch={patch} preset="eyebrow" />
          <SectionFormattedField label="Body" field="body" content={content} onPatch={patch} multiline rows={3} preset="body" />
          <FieldGroup label="Background image">
            <MediaUrlField
              kind="image"
              value={String(content.image_url ?? "")}
              onChange={(url) => patch({ image_url: url })}
            />
          </FieldGroup>
          <div className="grid gap-4 sm:grid-cols-2">
            <SectionFormattedField label="CTA label" field="cta_label" content={content} onPatch={patch} preset="button" />
            <FieldGroup label="CTA URL">
              <Input value={String(content.cta_url ?? "")} onChange={(e) => patch({ cta_url: e.target.value })} placeholder="/contact" />
            </FieldGroup>
          </div>
        </div>
      );

    case "text":
      return (
        <div className={sectionStack}>
          <SectionFormattedField label="Heading" field="heading" content={content} onPatch={patch} preset="heading" />
          <SectionFormattedField label="Body" field="body" content={content} onPatch={patch} multiline rows={5} preset="body" />
        </div>
      );

    case "gallery": {
      const images = (content.images as GalleryImage[] | undefined) ?? [];
      const columns = Number(content.columns ?? 3);
      return (
        <div className={sectionStack}>
          <SectionFormattedField label="Heading" field="heading" content={content} onPatch={patch} preset="heading" />
          <SectionFormattedField label="Description" field="body" content={content} onPatch={patch} multiline rows={2} preset="body" />
          <FieldGroup label="Columns">
            <select
              value={columns}
              onChange={(e) => patch({ columns: Number(e.target.value) })}
              className="form-select flex h-10 w-full rounded-lg border border-app-border bg-app-surface-muted/60 px-3 text-sm text-app-text"
            >
              <option value={2}>2 columns</option>
              <option value={3}>3 columns</option>
              <option value={4}>4 columns</option>
            </select>
          </FieldGroup>
          <FieldGroup label="Inline preview limit">
            <Input
              type="number"
              min={1}
              max={24}
              value={Number(content.preview_limit ?? 6)}
              onChange={(e) => patch({ preview_limit: Math.max(1, Number(e.target.value) || 6) })}
            />
            <p className="mt-1 text-xs text-app-muted">
              Show this many images before the &quot;View all&quot; gallery opens. No maximum on total images.
            </p>
          </FieldGroup>
          <ListFieldGroup
            label="Images"
            addLabel="Add image"
            onAdd={() => patch({ images: [...images, { url: "", alt: "", caption: "" }] })}
          >
            <div className="space-y-3">
              {images.map((image, index) => (
                <ItemCard key={index} onRemove={() => patch({ images: images.filter((_, i) => i !== index) })}>
                  <FieldGroup label="Image">
                    <MediaUrlField
                      kind="image"
                      value={image.url}
                      onChange={(url) => patch({ images: updateList(images, index, { url }) })}
                    />
                  </FieldGroup>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <FieldGroup label="Alt text">
                      <Input
                        placeholder="Describe the image"
                        value={image.alt ?? ""}
                        onChange={(e) => patch({ images: updateList(images, index, { alt: e.target.value }) })}
                      />
                    </FieldGroup>
                    <FieldGroup label="Caption (optional)" className="sm:col-span-2">
                      <Input
                        placeholder="Optional caption"
                        value={image.caption ?? ""}
                        onChange={(e) => patch({ images: updateList(images, index, { caption: e.target.value }) })}
                      />
                    </FieldGroup>
                  </div>
                </ItemCard>
              ))}
            </div>
          </ListFieldGroup>
        </div>
      );
    }

    case "faq": {
      const items = (content.items as FaqItem[] | undefined) ?? [];
      const style = content.style === "list" ? "list" : "details";
      return (
        <div className={sectionStack}>
          <SectionFormattedField label="Heading" field="heading" content={content} onPatch={patch} preset="heading" />
          <FieldGroup label="Layout">
            <select
              value={style}
              onChange={(e) => patch({ style: e.target.value as "details" | "list" })}
              className="form-select flex h-10 w-full rounded-lg border border-app-border bg-app-surface-muted/60 px-3 text-sm text-app-text"
            >
              <option value="details">Accordion (expand/collapse)</option>
              <option value="list">Bullet list (all visible)</option>
            </select>
          </FieldGroup>
          <ListFieldGroup
            label="Questions"
            addLabel="Add question"
            onAdd={() => patch({ items: [...items, { question: "", answer: "" }] })}
          >
            <div className="space-y-3">
              {items.map((item, index) => (
                <ItemCard key={index} onRemove={() => patch({ items: items.filter((_, i) => i !== index) })}>
                  <Input
                    placeholder="Question"
                    value={item.question}
                    onChange={(e) => patch({ items: updateList(items, index, { question: e.target.value }) })}
                  />
                  <Textarea
                    placeholder="Answer"
                    value={item.answer}
                    onChange={(e) => patch({ items: updateList(items, index, { answer: e.target.value }) })}
                    rows={3}
                  />
                </ItemCard>
              ))}
            </div>
          </ListFieldGroup>
        </div>
      );
    }

    case "video":
      return (
        <div className={sectionStack}>
          <SectionFormattedField label="Heading" field="heading" content={content} onPatch={patch} preset="heading" />
          <SectionFormattedField label="Description" field="body" content={content} onPatch={patch} multiline rows={2} preset="body" />
          <FieldGroup label="Video (YouTube, Vimeo, or .mp4)">
            <MediaUrlField
              kind="video"
              value={String(content.video_url ?? "")}
              onChange={(url) => patch({ video_url: url })}
            />
          </FieldGroup>
          <FieldGroup label="Caption">
            <Input value={String(content.caption ?? "")} onChange={(e) => patch({ caption: e.target.value })} />
          </FieldGroup>
        </div>
      );

    case "cards": {
      const items = (content.items as CardItem[] | undefined) ?? [];
      return (
        <div className={sectionStack}>
          <SectionFormattedField label="Heading" field="heading" content={content} onPatch={patch} preset="heading" />
          <SectionFormattedField label="Description" field="body" content={content} onPatch={patch} multiline rows={2} preset="body" />
          <ListFieldGroup
            label="Cards"
            addLabel="Add card"
            onAdd={() => patch({ items: [...items, { title: "", description: "", image_url: "", icon: "book-open", link_url: "", link_label: "", price: "", badge: "", meta_line: "" }] })}
          >
            <div className="space-y-3">
              {items.map((item, index) => (
                <ItemCard key={index} onRemove={() => patch({ items: items.filter((_, i) => i !== index) })}>
                  <Input
                    placeholder="Title"
                    value={item.title}
                    onChange={(e) => patch({ items: updateList(items, index, { title: e.target.value }) })}
                  />
                  <select
                    value={item.icon ?? ""}
                    onChange={(e) => patch({ items: updateList(items, index, { icon: e.target.value }) })}
                    className="form-select h-11 w-full rounded-xl border border-app-border bg-app-surface-muted/60 px-3 text-sm text-app-text sm:max-w-xs"
                  >
                    <option value="">No icon</option>
                    {DIVISION_ICONS.map((icon) => (
                      <option key={icon.value} value={icon.value}>
                        {icon.label}
                      </option>
                    ))}
                  </select>
                  <Textarea
                    placeholder="Description"
                    value={item.description}
                    onChange={(e) => patch({ items: updateList(items, index, { description: e.target.value }) })}
                    rows={2}
                  />
                  <div className="grid gap-3 sm:grid-cols-3">
                    <FieldGroup label="Price (optional)">
                      <Input
                        placeholder="From ₹12,999"
                        value={item.price ?? ""}
                        onChange={(e) => patch({ items: updateList(items, index, { price: e.target.value }) })}
                      />
                    </FieldGroup>
                    <FieldGroup label="Badge (optional)">
                      <Input
                        placeholder="Featured"
                        value={item.badge ?? ""}
                        onChange={(e) => patch({ items: updateList(items, index, { badge: e.target.value }) })}
                      />
                    </FieldGroup>
                    <FieldGroup label="Meta line (optional)">
                      <Input
                        placeholder="5 days · 2–12 guests"
                        value={item.meta_line ?? ""}
                        onChange={(e) => patch({ items: updateList(items, index, { meta_line: e.target.value }) })}
                      />
                    </FieldGroup>
                  </div>
                  <FieldGroup label="Image">
                    <MediaUrlField
                      kind="image"
                      value={item.image_url ?? ""}
                      onChange={(url) => patch({ items: updateList(items, index, { image_url: url }) })}
                    />
                  </FieldGroup>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <FieldGroup label="Link URL (optional)">
                      <Input
                        placeholder="https://... or /page"
                        value={item.link_url ?? ""}
                        onChange={(e) => patch({ items: updateList(items, index, { link_url: e.target.value }) })}
                      />
                    </FieldGroup>
                    <FieldGroup label="Link label (optional)">
                      <Input
                        placeholder="Learn more"
                        value={item.link_label ?? ""}
                        onChange={(e) => patch({ items: updateList(items, index, { link_label: e.target.value }) })}
                      />
                    </FieldGroup>
                  </div>
                </ItemCard>
              ))}
            </div>
          </ListFieldGroup>
        </div>
      );
    }

    case "testimonials": {
      const items = (content.items as TestimonialItem[] | undefined) ?? [];
      return (
        <div className={sectionStack}>
          <SectionFormattedField label="Heading" field="heading" content={content} onPatch={patch} preset="heading" />
          <ListFieldGroup
            label="Testimonials"
            addLabel="Add testimonial"
            onAdd={() => patch({ items: [...items, { quote: "", author: "", role: "" }] })}
          >
            <div className="space-y-3">
              {items.map((item, index) => (
                <ItemCard key={index} onRemove={() => patch({ items: items.filter((_, i) => i !== index) })}>
                  <Textarea
                    placeholder="Quote"
                    value={item.quote}
                    onChange={(e) => patch({ items: updateList(items, index, { quote: e.target.value }) })}
                    rows={3}
                  />
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Input
                      placeholder="Author"
                      value={item.author}
                      onChange={(e) => patch({ items: updateList(items, index, { author: e.target.value }) })}
                    />
                    <Input
                      placeholder="Role (optional)"
                      value={item.role ?? ""}
                      onChange={(e) => patch({ items: updateList(items, index, { role: e.target.value }) })}
                    />
                  </div>
                  <MediaUrlField
                    kind="image"
                    value={item.avatar_url ?? ""}
                    onChange={(url) => patch({ items: updateList(items, index, { avatar_url: url }) })}
                  />
                </ItemCard>
              ))}
            </div>
          </ListFieldGroup>
        </div>
      );
    }

    case "map":
      return (
        <div className={sectionStack}>
          <SectionFormattedField label="Heading" field="heading" content={content} onPatch={patch} preset="heading" />
          <SectionFormattedField label="Description" field="body" content={content} onPatch={patch} multiline rows={2} preset="body" />
          <FieldGroup label="Map embed URL (Google Maps iframe src)">
            <Input value={String(content.embed_url ?? "")} onChange={(e) => patch({ embed_url: e.target.value })} placeholder="https://www.google.com/maps/embed?..." />
          </FieldGroup>
          <FieldGroup label="Address (fallback text + link)">
            <Input value={String(content.address ?? "")} onChange={(e) => patch({ address: e.target.value })} placeholder="123 Main St, City" />
          </FieldGroup>
        </div>
      );

    case "forms": {
      const fields = (content.fields as FormField[] | undefined) ?? [];
      return (
        <div className={sectionStack}>
          <SectionFormattedField label="Heading" field="heading" content={content} onPatch={patch} preset="heading" />
          <SectionFormattedField label="Description" field="body" content={content} onPatch={patch} multiline rows={2} preset="body" />
          <div className="grid gap-4 sm:grid-cols-2">
            <FieldGroup label="Submit button label">
              <Input value={String(content.submit_label ?? "")} onChange={(e) => patch({ submit_label: e.target.value })} />
            </FieldGroup>
            <FieldGroup label="Contact email (mailto target)">
              <Input value={String(content.contact_email ?? "")} onChange={(e) => patch({ contact_email: e.target.value })} placeholder="hello@example.com" />
            </FieldGroup>
          </div>
          <FieldGroup label="Custom fields">
            <FormFieldsEditor fields={fields} onChange={(next) => patch({ fields: next })} />
          </FieldGroup>
        </div>
      );
    }

    case "stats": {
      const items = (content.items as StatItem[] | undefined) ?? [];
      const columns = Number(content.columns ?? 3) as 2 | 3 | 4;
      return (
        <div className={sectionStack}>
          <FieldGroup label="Heading (optional)">
            <Input value={String(content.heading ?? "")} onChange={(e) => patch({ heading: e.target.value })} />
          </FieldGroup>
          <FieldGroup label="Columns">
            <select
              value={columns}
              onChange={(e) => patch({ columns: Number(e.target.value) as 2 | 3 | 4 })}
              className="form-select h-10 w-full rounded-lg border border-app-border bg-app-surface-muted/60 px-3 text-sm text-app-text sm:max-w-[10rem]"
            >
              <option value={2}>2</option>
              <option value={3}>3</option>
              <option value={4}>4</option>
            </select>
          </FieldGroup>
          <ListFieldGroup
            label="Quick facts"
            addLabel="Add fact"
            onAdd={() => patch({ items: [...items, { label: "", value: "", icon: "clock" }] })}
          >
            <div className="space-y-3">
              {items.map((item, index) => (
                <ItemCard key={index} onRemove={() => patch({ items: items.filter((_, i) => i !== index) })}>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Input
                      placeholder="Label (e.g. Duration)"
                      value={item.label}
                      onChange={(e) => patch({ items: updateList(items, index, { label: e.target.value }) })}
                    />
                    <Input
                      placeholder="Value (e.g. 5 Days)"
                      value={item.value}
                      onChange={(e) => patch({ items: updateList(items, index, { value: e.target.value }) })}
                    />
                  </div>
                  <select
                    value={item.icon ?? "clock"}
                    onChange={(e) => patch({ items: updateList(items, index, { icon: e.target.value }) })}
                    className="form-select h-10 w-full rounded-lg border border-app-border bg-app-surface-muted/60 px-3 text-sm text-app-text sm:max-w-xs"
                  >
                    {DIVISION_ICONS.map((icon) => (
                      <option key={icon.value} value={icon.value}>
                        {icon.label}
                      </option>
                    ))}
                  </select>
                </ItemCard>
              ))}
            </div>
          </ListFieldGroup>
        </div>
      );
    }

    case "inclusions": {
      const included = (content.included as string[] | undefined) ?? [];
      const excluded = (content.excluded as string[] | undefined) ?? [];
      return (
        <div className={sectionStack}>
          <FieldGroup label="Section heading">
            <Input value={String(content.heading ?? "")} onChange={(e) => patch({ heading: e.target.value })} />
          </FieldGroup>
          <div className="grid gap-4 sm:grid-cols-2">
            <FieldGroup label="Included column label">
              <Input
                value={String(content.included_label ?? "")}
                onChange={(e) => patch({ included_label: e.target.value })}
                placeholder="Inclusions"
              />
            </FieldGroup>
            <FieldGroup label="Excluded column label">
              <Input
                value={String(content.excluded_label ?? "")}
                onChange={(e) => patch({ excluded_label: e.target.value })}
                placeholder="Excludes"
              />
            </FieldGroup>
          </div>
          <StringListEditor
            label="Included items"
            addLabel="Add inclusion"
            values={included}
            onChange={(next) => patch({ included: next })}
            placeholder="e.g. Daily breakfast"
          />
          <StringListEditor
            label="Excluded items"
            addLabel="Add exclusion"
            values={excluded}
            onChange={(next) => patch({ excluded: next })}
            placeholder="e.g. Flights"
          />
        </div>
      );
    }

    case "itinerary": {
      const items = (content.items as ItineraryDay[] | undefined) ?? [];
      const variant = (content.variant as TimelineVariant | undefined) ?? "travel";
      const labels = timelineItemLabels(variant);
      return (
        <div className={sectionStack}>
          <FieldGroup label="Timeline variant">
            <select
              value={variant}
              onChange={(e) => patch({ variant: e.target.value as TimelineVariant })}
              className="form-select h-10 w-full rounded-lg border border-app-border bg-app-surface-muted/60 px-3 text-sm text-app-text sm:max-w-xs"
            >
              <option value="travel">Travel (days, destinations)</option>
              <option value="course">Course (modules, curriculum)</option>
              <option value="product">Product (steps, specs)</option>
            </select>
            <p className="mt-1 text-xs text-app-muted">Changes labels and icons only — same content structure.</p>
          </FieldGroup>
          <FieldGroup label="Timeline tab heading">
            <Input value={String(content.heading ?? "")} onChange={(e) => patch({ heading: e.target.value })} />
          </FieldGroup>
          <FieldGroup label="Secondary tab heading (optional)">
            <Input value={String(content.cost_heading ?? "")} onChange={(e) => patch({ cost_heading: e.target.value })} />
          </FieldGroup>
          <FieldGroup label="Secondary tab content (optional)">
            <Textarea value={String(content.cost_body ?? "")} onChange={(e) => patch({ cost_body: e.target.value })} rows={4} />
          </FieldGroup>
          <ListFieldGroup
            label={labels.listLabel}
            addLabel={labels.addLabel}
            onAdd={() => patch({ items: [...items, { title: "", body: "" }] })}
          >
            <div className="space-y-3">
              {items.map((item, index) => (
                <ItemCard key={index} onRemove={() => patch({ items: items.filter((_, i) => i !== index) })}>
                  <Input
                    placeholder={labels.titlePlaceholder}
                    value={item.title}
                    onChange={(e) => patch({ items: updateList(items, index, { title: e.target.value }) })}
                  />
                  <Textarea
                    placeholder="Details"
                    value={item.body ?? ""}
                    onChange={(e) => patch({ items: updateList(items, index, { body: e.target.value }) })}
                    rows={3}
                  />
                  <select
                    value={item.milestone ?? ""}
                    onChange={(e) =>
                      patch({
                        items: updateList(items, index, {
                          milestone: (e.target.value || undefined) as ItineraryDay["milestone"],
                        }),
                      })
                    }
                    className="form-select h-10 w-full rounded-lg border border-app-border bg-app-surface-muted/60 px-3 text-sm text-app-text sm:max-w-xs"
                  >
                    <option value="">Regular item</option>
                    <option value="start">Start / overview</option>
                    <option value="end">End / summary</option>
                  </select>
                </ItemCard>
              ))}
            </div>
          </ListFieldGroup>
        </div>
      );
    }

    case "catalog": {
      const catalogContent = content as unknown as CatalogContent;
      return (
        <div className={sectionStack}>
          <FieldGroup label="Vertical">
            <select
              value={String(catalogContent.vertical ?? "tours")}
              onChange={(e) => patch({ vertical: e.target.value })}
              className="form-select h-10 w-full rounded-lg border border-app-border bg-app-surface-muted/60 px-3 text-sm text-app-text sm:max-w-xs"
            >
              <option value="tours">Tours</option>
              <option value="shop">Shop</option>
              <option value="academy">Academy</option>
            </select>
          </FieldGroup>
          <SectionFormattedField label="Heading" field="heading" content={content} onPatch={patch} preset="heading" />
          <SectionFormattedField label="Description" field="body" content={content} onPatch={patch} multiline rows={2} preset="body" />
          <div className="grid gap-4 sm:grid-cols-2">
            <FieldGroup label="Item limit">
              <Input
                type="number"
                min={1}
                max={24}
                value={Number(catalogContent.limit ?? 6)}
                onChange={(e) => patch({ limit: Number(e.target.value) || 6 })}
              />
            </FieldGroup>
            <FieldGroup label="View all label">
              <Input
                value={String(catalogContent.view_all_label ?? "")}
                onChange={(e) => patch({ view_all_label: e.target.value })}
                placeholder="Browse all products"
              />
            </FieldGroup>
          </div>
          <label className="flex items-center gap-2 text-sm text-app-text">
            <input
              type="checkbox"
              className="form-checkbox"
              checked={Boolean(catalogContent.featured_only)}
              onChange={(e) =>
                patch({
                  featured_only: e.target.checked,
                  catalog_source: e.target.checked ? "featured" : catalogContent.catalog_source ?? "latest",
                })
              }
            />
            Featured items only (legacy — prefer Catalog source below)
          </label>
          <FieldGroup label="Catalog source">
            <Select
              value={catalogContent.catalog_source ?? (catalogContent.featured_only ? "featured" : "latest")}
              onChange={(e) =>
                patch({
                  catalog_source: e.target.value as CatalogContent["catalog_source"],
                  featured_only: e.target.value === "featured",
                })
              }
            >
              <option value="latest">Latest</option>
              <option value="featured">Featured</option>
              <option value="trending">Trending (bookings / orders / enrollments)</option>
            </Select>
          </FieldGroup>
          <p className="text-xs text-app-muted">
            Pulls live packages, products, or courses from the API. Academy lists published courses.
          </p>
        </div>
      );
    }

    default:
      return (
        <div className={sectionStack}>
          <SectionFormattedField label="Heading" field="heading" content={content} onPatch={patch} preset="heading" />
          <SectionFormattedField label="Body" field="body" content={content} onPatch={patch} multiline rows={5} preset="body" />
        </div>
      );
  }
}

export function createSectionContent(
  type: SectionType,
  context: SectionDefaultsContext = {},
): Record<string, unknown> {
  return defaultSectionContent(type, context);
}
