"use client";

import { useCallback, useEffect, useState } from "react";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { FormError } from "@/components/admin/admin-form-primitives";
import {
  apiClient,
  type AcademyCategory,
  type ShopCategory,
} from "@/lib/api";
import { useAuthStore } from "@/stores/app";
import { cn } from "@/lib/utils";

type CategoryItem = AcademyCategory | ShopCategory;

interface CategorySelectFieldProps {
  module: "academy" | "shop";
  value: number;
  onChange: (categoryId: number) => void;
  error?: string;
  className?: string;
  disabled?: boolean;
}

export function CategorySelectField({
  module,
  value,
  onChange,
  error,
  className,
  disabled,
}: CategorySelectFieldProps) {
  const token = useAuthStore((s) => s.token);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [panelOpen, setPanelOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [newName, setNewName] = useState("");
  const [newDescription, setNewDescription] = useState("");

  const loadCategories = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res =
        module === "academy"
          ? await apiClient.getAdminAcademyCategories(token)
          : await apiClient.getAdminShopCategories(token);
      setCategories(res.data.filter((c) => c.is_active !== false));
    } finally {
      setLoading(false);
    }
  }, [module, token]);

  useEffect(() => {
    void loadCategories();
  }, [loadCategories]);

  const handleCreate = async () => {
    if (!token || !newName.trim()) {
      setCreateError("Category name is required.");
      return;
    }
    setCreating(true);
    setCreateError(null);
    try {
      const payload = {
        name: newName.trim(),
        description: newDescription.trim() || undefined,
      };
      const res =
        module === "academy"
          ? await apiClient.createAcademyCategory(token, payload)
          : await apiClient.createShopCategory(token, payload);
      setCategories((prev) => [...prev, res.data].sort((a, b) => a.name.localeCompare(b.name)));
      onChange(res.data.id);
      setNewName("");
      setNewDescription("");
      setPanelOpen(false);
    } catch (e) {
      setCreateError(e instanceof Error ? e.message : "Could not create category");
    } finally {
      setCreating(false);
    }
  };

  const closePanel = () => {
    setPanelOpen(false);
    setCreateError(null);
    setNewName("");
    setNewDescription("");
  };

  return (
    <div className={cn("space-y-2", panelOpen && "md:col-span-2", className)}>
      <div className="flex items-end gap-2">
        <div className="min-w-0 flex-1 space-y-2">
          <Label htmlFor={`${module}-category-select`}>Category</Label>
          <Select
            id={`${module}-category-select`}
            value={value || ""}
            disabled={disabled || loading}
            onChange={(e) => onChange(Number(e.target.value))}
          >
            <option value="">{loading ? "Loading..." : "Select category"}</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </Select>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-10 shrink-0 gap-1"
          disabled={disabled || !token}
          onClick={() => (panelOpen ? closePanel() : setPanelOpen(true))}
          aria-expanded={panelOpen}
        >
          {panelOpen ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          {panelOpen ? "Cancel" : "New"}
        </Button>
      </div>

      {panelOpen && (
        <div
          className="rounded-lg border border-app-border bg-app-surface-muted/50 p-3 space-y-3"
          role="region"
          aria-label="Create category"
        >
          <p className="text-xs font-medium text-app-muted">Add category without leaving this form</p>
          <div className="space-y-2">
            <Label htmlFor={`${module}-new-category-name`}>Name</Label>
            <Input
              id={`${module}-new-category-name`}
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="e.g. Martial Arts"
              autoFocus
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor={`${module}-new-category-desc`}>Description (optional)</Label>
            <Textarea
              id={`${module}-new-category-desc`}
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              rows={2}
              className="min-h-0 resize-y"
            />
          </div>
          <FormError message={createError} />
          <div className="flex flex-wrap gap-2">
            <Button type="button" size="sm" disabled={creating} onClick={() => void handleCreate()}>
              {creating ? "Creating..." : "Create & select"}
            </Button>
            <Button type="button" size="sm" variant="ghost" onClick={closePanel}>
              Close
            </Button>
          </div>
        </div>
      )}

      <FormError message={error} />
    </div>
  );
}
