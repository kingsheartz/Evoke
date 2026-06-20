"use client";

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Plus, Trash2 } from "lucide-react";
import { useCallback, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { SectionTypeBadge } from "@/components/cms/cms-page-view";
import { createSectionContent, SectionContentEditor } from "@/components/cms/section-content-editor";
import { apiClient, SECTION_TYPES, type PageSection } from "@/lib/api";
import { isSectionType } from "@/lib/cms-sections";
import { revalidateCmsPagePublicCache } from "@/lib/revalidate-cms";
import { useAuthStore } from "@/stores/app";

function SortableSection({
  section,
  onUpdate,
  onDelete,
}: {
  section: PageSection;
  onUpdate: (id: number, content: Record<string, unknown>) => void;
  onDelete: (id: number) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: section.id });
  const style = { transform: CSS.Transform.toString(transform), transition };
  const sectionType = isSectionType(section.component_type) ? section.component_type : "text";

  return (
    <div ref={setNodeRef} style={style} className="rounded-xl border border-app-border bg-app-surface p-5 ring-1 ring-app-border">
      <div className="mb-5 flex items-center justify-between gap-3 border-b border-app-border/60 pb-4">
        <div className="flex min-w-0 items-center gap-3">
          <button type="button" className="cursor-grab shrink-0 text-app-muted hover:text-accent-soft" {...attributes} {...listeners}>
            <GripVertical className="h-5 w-5" />
          </button>
          <SectionTypeBadge type={section.component_type} />
        </div>
        <Button variant="ghost" size="sm" className="shrink-0" onClick={() => onDelete(section.id)}>
          <Trash2 className="h-4 w-4 text-status-error" />
        </Button>
      </div>
      <SectionContentEditor
        type={sectionType}
        content={section.content}
        onChange={(content) => onUpdate(section.id, content)}
      />
    </div>
  );
}

export function PageSectionBuilder({
  pageId,
  pageSlug,
  pageStatus = "draft",
  sections: initial,
  onChange,
  onDirtyChange,
}: {
  pageId: number;
  pageSlug: string;
  pageStatus?: string;
  sections: PageSection[];
  onChange: (sections: PageSection[]) => void;
  onDirtyChange?: (dirty: boolean) => void;
}) {
  const token = useAuthStore((s) => s.token);
  const [sections, setSections] = useState(initial);
  const [newType, setNewType] = useState("text");
  const sectionsRef = useRef(sections);
  sectionsRef.current = sections;

  const maybeRevalidatePublic = useCallback(async () => {
    if (pageStatus === "published") {
      await revalidateCmsPagePublicCache(pageSlug);
    }
  }, [pageSlug, pageStatus]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const updateSection = useCallback(
    (id: number, content: Record<string, unknown>) => {
      setSections((prev) => {
        const next = prev.map((s) => (s.id === id ? { ...s, content } : s));
        onChange(next);
        return next;
      });
      onDirtyChange?.(true);
    },
    [onChange, onDirtyChange],
  );

  const addSection = async () => {
    if (!token) return;
    const type = isSectionType(newType) ? newType : "text";
    const { data } = await apiClient.createPageSection(token, pageId, {
      component_type: type,
      content: createSectionContent(type),
    });
    const next = [...sectionsRef.current, data];
    setSections(next);
    onChange(next);
    await maybeRevalidatePublic();
  };

  const deleteSection = async (id: number) => {
    if (!token) return;
    await apiClient.deletePageSection(token, pageId, id);
    const next = sectionsRef.current.filter((s) => s.id !== id);
    setSections(next);
    onChange(next);
    await maybeRevalidatePublic();
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id || !token) return;
    const previous = sectionsRef.current;
    const oldIndex = previous.findIndex((s) => s.id === active.id);
    const newIndex = previous.findIndex((s) => s.id === over.id);
    const reordered = arrayMove(previous, oldIndex, newIndex).map((s, i) => ({ ...s, sort_order: i }));
    setSections(reordered);
    onChange(reordered);
    try {
      await apiClient.reorderPageSections(token, pageId, reordered.map((s, i) => ({ id: s.id, sort_order: i })));
      await maybeRevalidatePublic();
    } catch {
      setSections(previous);
      onChange(previous);
    }
  };

  return (
    <Card>
      <CardHeader><CardTitle>Page Sections</CardTitle></CardHeader>
      <CardContent className="space-y-5">
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={sections.map((s) => s.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-4">
              {sections.map((section) => (
                <SortableSection key={section.id} section={section} onUpdate={updateSection} onDelete={deleteSection} />
              ))}
            </div>
          </SortableContext>
        </DndContext>
        <div className="flex flex-col gap-4 rounded-xl border border-dashed border-app-border bg-app-surface/60 p-5 ring-1 ring-app-border sm:flex-row sm:items-end">
          <div className="min-w-0 flex-1 space-y-2.5">
            <Label>Component</Label>
            <select
              value={newType}
              onChange={(e) => setNewType(e.target.value)}
              className="form-select flex h-10 w-full rounded-lg border border-app-border bg-app-surface-muted/60 px-3 text-sm text-app-text sm:max-w-xs"
            >
              {SECTION_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>
          <Button type="button" className="w-full shrink-0 sm:w-auto" onClick={addSection}>
            <Plus className="h-4 w-4" />
            Add Section
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
