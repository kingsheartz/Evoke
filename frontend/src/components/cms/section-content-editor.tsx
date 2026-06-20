"use client";

import { Plus, Trash2 } from "lucide-react";
import { MediaUrlField } from "@/components/cms/media-url-field";
import { FormFieldsEditor } from "@/components/cms/form-fields-editor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  defaultSectionContent,
  type CardItem,
  type FaqItem,
  type FormField,
  type GalleryImage,
  type ItineraryDay,
  type SectionType,
  type StatItem,
  type TestimonialItem,
} from "@/lib/cms-sections";
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

function updateList<T>(list: T[], index: number, patch: Partial<T>): T[] {
  return list.map((item, i) => (i === index ? { ...item, ...patch } : item));
}

const sectionStack = "space-y-4";

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
    case "banner":
      return (
        <div className={sectionStack}>
          <FieldGroup label="Heading">
            <Input value={String(content.heading ?? "")} onChange={(e) => patch({ heading: e.target.value })} />
          </FieldGroup>
          <FieldGroup label="Subheading">
            <Input value={String(content.subheading ?? "")} onChange={(e) => patch({ subheading: e.target.value })} />
          </FieldGroup>
          <FieldGroup label="Body">
            <Textarea value={String(content.body ?? "")} onChange={(e) => patch({ body: e.target.value })} rows={3} />
          </FieldGroup>
          <FieldGroup label="Background image">
            <MediaUrlField
              kind="image"
              value={String(content.image_url ?? "")}
              onChange={(url) => patch({ image_url: url })}
            />
          </FieldGroup>
          <div className="grid gap-4 sm:grid-cols-2">
            <FieldGroup label="CTA label">
              <Input value={String(content.cta_label ?? "")} onChange={(e) => patch({ cta_label: e.target.value })} />
            </FieldGroup>
            <FieldGroup label="CTA URL">
              <Input value={String(content.cta_url ?? "")} onChange={(e) => patch({ cta_url: e.target.value })} placeholder="/contact" />
            </FieldGroup>
          </div>
        </div>
      );

    case "text":
      return (
        <div className={sectionStack}>
          <FieldGroup label="Heading">
            <Input value={String(content.heading ?? "")} onChange={(e) => patch({ heading: e.target.value })} />
          </FieldGroup>
          <FieldGroup label="Body">
            <Textarea value={String(content.body ?? "")} onChange={(e) => patch({ body: e.target.value })} rows={5} />
          </FieldGroup>
        </div>
      );

    case "gallery": {
      const images = (content.images as GalleryImage[] | undefined) ?? [];
      const columns = Number(content.columns ?? 3);
      return (
        <div className={sectionStack}>
          <FieldGroup label="Heading">
            <Input value={String(content.heading ?? "")} onChange={(e) => patch({ heading: e.target.value })} />
          </FieldGroup>
          <FieldGroup label="Description">
            <Textarea value={String(content.body ?? "")} onChange={(e) => patch({ body: e.target.value })} rows={2} />
          </FieldGroup>
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
          <FieldGroup label="Heading">
            <Input value={String(content.heading ?? "")} onChange={(e) => patch({ heading: e.target.value })} />
          </FieldGroup>
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
          <FieldGroup label="Heading">
            <Input value={String(content.heading ?? "")} onChange={(e) => patch({ heading: e.target.value })} />
          </FieldGroup>
          <FieldGroup label="Description">
            <Textarea value={String(content.body ?? "")} onChange={(e) => patch({ body: e.target.value })} rows={2} />
          </FieldGroup>
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
          <FieldGroup label="Heading">
            <Input value={String(content.heading ?? "")} onChange={(e) => patch({ heading: e.target.value })} />
          </FieldGroup>
          <FieldGroup label="Description">
            <Textarea value={String(content.body ?? "")} onChange={(e) => patch({ body: e.target.value })} rows={2} />
          </FieldGroup>
          <ListFieldGroup
            label="Cards"
            addLabel="Add card"
            onAdd={() => patch({ items: [...items, { title: "", description: "", image_url: "", icon: "book-open", link_url: "", link_label: "" }] })}
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
          <FieldGroup label="Heading">
            <Input value={String(content.heading ?? "")} onChange={(e) => patch({ heading: e.target.value })} />
          </FieldGroup>
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
          <FieldGroup label="Heading">
            <Input value={String(content.heading ?? "")} onChange={(e) => patch({ heading: e.target.value })} />
          </FieldGroup>
          <FieldGroup label="Description">
            <Textarea value={String(content.body ?? "")} onChange={(e) => patch({ body: e.target.value })} rows={2} />
          </FieldGroup>
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
          <FieldGroup label="Heading">
            <Input value={String(content.heading ?? "")} onChange={(e) => patch({ heading: e.target.value })} />
          </FieldGroup>
          <FieldGroup label="Description">
            <Textarea value={String(content.body ?? "")} onChange={(e) => patch({ body: e.target.value })} rows={2} />
          </FieldGroup>
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

    case "itinerary": {
      const items = (content.items as ItineraryDay[] | undefined) ?? [];
      return (
        <div className={sectionStack}>
          <FieldGroup label="Itinerary tab heading">
            <Input value={String(content.heading ?? "")} onChange={(e) => patch({ heading: e.target.value })} />
          </FieldGroup>
          <FieldGroup label="Cost tab heading">
            <Input value={String(content.cost_heading ?? "")} onChange={(e) => patch({ cost_heading: e.target.value })} />
          </FieldGroup>
          <FieldGroup label="Cost tab content">
            <Textarea value={String(content.cost_body ?? "")} onChange={(e) => patch({ cost_body: e.target.value })} rows={4} />
          </FieldGroup>
          <ListFieldGroup
            label="Days"
            addLabel="Add day"
            onAdd={() => patch({ items: [...items, { title: "", body: "" }] })}
          >
            <div className="space-y-3">
              {items.map((item, index) => (
                <ItemCard key={index} onRemove={() => patch({ items: items.filter((_, i) => i !== index) })}>
                  <Input
                    placeholder="Day title (e.g. Day 01: Arrival)"
                    value={item.title}
                    onChange={(e) => patch({ items: updateList(items, index, { title: e.target.value }) })}
                  />
                  <Textarea
                    placeholder="Day details"
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
                    <option value="">Regular day</option>
                    <option value="start">Trip start</option>
                    <option value="end">Departure / end</option>
                  </select>
                </ItemCard>
              ))}
            </div>
          </ListFieldGroup>
        </div>
      );
    }

    default:
      return (
        <div className={sectionStack}>
          <FieldGroup label="Heading">
            <Input value={String(content.heading ?? "")} onChange={(e) => patch({ heading: e.target.value })} />
          </FieldGroup>
          <FieldGroup label="Body">
            <Textarea value={String(content.body ?? "")} onChange={(e) => patch({ body: e.target.value })} rows={5} />
          </FieldGroup>
        </div>
      );
  }
}

export function createSectionContent(type: SectionType): Record<string, unknown> {
  return defaultSectionContent(type);
}
