"use client";

import { Plus, Trash2 } from "lucide-react";
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
  type SectionType,
  type TestimonialItem,
} from "@/lib/cms-sections";
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
          <FieldGroup label="Background image URL">
            <Input value={String(content.image_url ?? "")} onChange={(e) => patch({ image_url: e.target.value })} placeholder="https://..." />
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
          <ListFieldGroup
            label="Images"
            addLabel="Add image"
            onAdd={() => patch({ images: [...images, { url: "", alt: "", caption: "" }] })}
          >
            <div className="space-y-3">
              {images.map((image, index) => (
                <ItemCard key={index} onRemove={() => patch({ images: images.filter((_, i) => i !== index) })}>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Input
                      placeholder="Image URL"
                      value={image.url}
                      onChange={(e) => patch({ images: updateList(images, index, { url: e.target.value }) })}
                    />
                    <Input
                      placeholder="Alt text"
                      value={image.alt ?? ""}
                      onChange={(e) => patch({ images: updateList(images, index, { alt: e.target.value }) })}
                    />
                    <Input
                      className="sm:col-span-2"
                      placeholder="Caption (optional)"
                      value={image.caption ?? ""}
                      onChange={(e) => patch({ images: updateList(images, index, { caption: e.target.value }) })}
                    />
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
      return (
        <div className={sectionStack}>
          <FieldGroup label="Heading">
            <Input value={String(content.heading ?? "")} onChange={(e) => patch({ heading: e.target.value })} />
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
          <FieldGroup label="Video URL (YouTube, Vimeo, or .mp4)">
            <Input value={String(content.video_url ?? "")} onChange={(e) => patch({ video_url: e.target.value })} placeholder="https://youtube.com/watch?v=..." />
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
            onAdd={() => patch({ items: [...items, { title: "", description: "", image_url: "", link_url: "", link_label: "" }] })}
          >
            <div className="space-y-3">
              {items.map((item, index) => (
                <ItemCard key={index} onRemove={() => patch({ items: items.filter((_, i) => i !== index) })}>
                  <Input
                    placeholder="Title"
                    value={item.title}
                    onChange={(e) => patch({ items: updateList(items, index, { title: e.target.value }) })}
                  />
                  <Textarea
                    placeholder="Description"
                    value={item.description}
                    onChange={(e) => patch({ items: updateList(items, index, { description: e.target.value }) })}
                    rows={2}
                  />
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Input
                      placeholder="Image URL (optional)"
                      value={item.image_url ?? ""}
                      onChange={(e) => patch({ items: updateList(items, index, { image_url: e.target.value }) })}
                    />
                    <Input
                      placeholder="Link URL (optional)"
                      value={item.link_url ?? ""}
                      onChange={(e) => patch({ items: updateList(items, index, { link_url: e.target.value }) })}
                    />
                  </div>
                  <Input
                    placeholder="Link label (optional)"
                    value={item.link_label ?? ""}
                    onChange={(e) => patch({ items: updateList(items, index, { link_label: e.target.value }) })}
                  />
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
                  <Input
                    placeholder="Avatar URL (optional)"
                    value={item.avatar_url ?? ""}
                    onChange={(e) => patch({ items: updateList(items, index, { avatar_url: e.target.value }) })}
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
          <ListFieldGroup
            label="Form fields"
            addLabel="Add field"
            onAdd={() => patch({ fields: [...fields, { label: "New field", type: "text", required: false }] })}
          >
            <div className="space-y-3">
              {fields.map((field, index) => (
                <div
                  key={index}
                  className="flex flex-col gap-3 rounded-lg border border-app-border bg-app-surface-muted/40 p-4 sm:flex-row sm:flex-wrap sm:items-center"
                >
                  <Input
                    className="min-w-0 flex-1 sm:min-w-[10rem]"
                    placeholder="Label"
                    value={field.label}
                    onChange={(e) => patch({ fields: updateList(fields, index, { label: e.target.value }) })}
                  />
                  <select
                    value={field.type}
                    onChange={(e) => patch({ fields: updateList(fields, index, { type: e.target.value as FormField["type"] }) })}
                    className="form-select h-10 w-full rounded-lg border border-app-border bg-app-surface-muted/60 px-3 text-sm text-app-text sm:w-auto"
                  >
                    <option value="text">Text</option>
                    <option value="email">Email</option>
                    <option value="tel">Phone</option>
                    <option value="textarea">Long text</option>
                  </select>
                  <label className="flex items-center gap-2 text-sm text-app-muted">
                    <input
                      type="checkbox"
                      checked={field.required ?? false}
                      onChange={(e) => patch({ fields: updateList(fields, index, { required: e.target.checked }) })}
                    />
                    Required
                  </label>
                  <ItemActions onRemove={() => patch({ fields: fields.filter((_, i) => i !== index) })} />
                </div>
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
