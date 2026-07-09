"use client";

import { useEffect, useMemo, useState } from "react";
import { Plus, Save, Trash2 } from "lucide-react";
import { PermissionGate } from "@/components/admin/permission-gate";
import { ActionButton } from "@/components/ui/action-button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageHeader } from "@/components/ui/page-header";
import { apiClient, type AdminRoleRecord, type PermissionSection } from "@/lib/api";
import { useNotifications } from "@/lib/notifications";
import { useAuthStore } from "@/stores/app";
import { cn } from "@/lib/utils";

function formatPermissionLabel(name: string): string {
  return name
    .split(".")
    .slice(1)
    .join(" ")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase()) || name;
}

function formatSectionLabel(section: string): string {
  return section.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

type RoleDraft = {
  id?: number;
  draftId?: string;
  name: string;
  permissions: string[];
  users_count?: number;
  isNew?: boolean;
};

function roleKey(role: RoleDraft): string {
  return role.isNew ? (role.draftId ?? role.name) : String(role.id);
}

function isSameRole(a: RoleDraft, b: RoleDraft): boolean {
  if (a.isNew && b.isNew) return a.draftId === b.draftId;
  if (!a.isNew && !b.isNew) return a.id === b.id;
  return false;
}

export default function RolesSettingsPage() {
  const token = useAuthStore((s) => s.token);
  const { success, error } = useNotifications();
  const [sections, setSections] = useState<PermissionSection[]>([]);
  const [roles, setRoles] = useState<RoleDraft[]>([]);
  const [activeRoleId, setActiveRoleId] = useState<string | number | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const activeRole = useMemo(
    () => roles.find((role) => roleKey(role) === String(activeRoleId)) ?? null,
    [roles, activeRoleId],
  );

  const load = () => {
    if (!token) return;
    Promise.all([apiClient.getPermissionSections(token), apiClient.getManagedRoles(token)])
      .then(([permissionRes, roleRes]) => {
        setSections(permissionRes.data ?? []);
        const loaded = (roleRes.data ?? []).map((role: AdminRoleRecord) => ({
          id: role.id,
          name: role.name,
          permissions: role.permissions ?? [],
          users_count: role.users_count,
        }));
        setRoles(loaded);
        if (loaded.length > 0 && activeRoleId == null) {
          setActiveRoleId(loaded[0].id ?? null);
        }
      })
      .catch(() => {
        setSections([]);
        setRoles([]);
      });
  };

  useEffect(load, [token]);

  const updateActiveRole = (patch: Partial<RoleDraft>) => {
    if (!activeRole) return;
    setRoles((prev) =>
      prev.map((role) => (isSameRole(role, activeRole) ? { ...role, ...patch } : role)),
    );
  };

  const togglePermission = (permission: string) => {
    if (!activeRole || activeRole.name === "super-admin") return;
    const next = activeRole.permissions.includes(permission)
      ? activeRole.permissions.filter((item) => item !== permission)
      : [...activeRole.permissions, permission];
    updateActiveRole({ permissions: next });
  };

  const addRole = () => {
    const draftId = crypto.randomUUID();
    const draft: RoleDraft = { draftId, name: "", permissions: [], isNew: true };
    setRoles((prev) => [...prev, draft]);
    setActiveRoleId(draftId);
  };

  const saveRole = async () => {
    if (!token || !activeRole) return;
    if (!activeRole.name.trim()) {
      error("Role name is required.");
      return;
    }
    setSaving(true);
    try {
      if (activeRole.isNew) {
        const { data } = await apiClient.createManagedRole(token, {
          name: activeRole.name.trim(),
          permissions: activeRole.permissions,
        });
        success(`Role "${data.name}" created.`);
        setActiveRoleId(data.id);
      } else if (activeRole.id != null) {
        const { data } = await apiClient.updateManagedRole(token, activeRole.id, {
          name: activeRole.name.trim(),
          permissions: activeRole.permissions,
        });
        success(`Role "${data.name}" updated.`);
      }
      load();
    } catch (e) {
      error(e instanceof Error ? e.message : "Could not save role.");
    } finally {
      setSaving(false);
    }
  };

  const deleteRole = async () => {
    if (!token || !activeRole?.id || activeRole.isNew) return;
    if (activeRole.name === "super-admin") return;
    setDeleting(true);
    try {
      await apiClient.deleteManagedRole(token, activeRole.id);
      success("Role deleted.");
      setActiveRoleId(null);
      load();
    } catch (e) {
      error(e instanceof Error ? e.message : "Could not delete role.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <PermissionGate permission={["roles.manage", "users.manage"]}>
      <div className="app-page space-y-6">
        <PageHeader
          title="Roles & permissions"
          description="Create custom roles and choose which admin sections each role can access."
          actions={
            <div className="flex gap-2">
              <ActionButton variant="outline" icon={Plus} onClick={addRole}>
                New role
              </ActionButton>
              <ActionButton icon={Save} loading={saving} disabled={!activeRole || activeRole.name === "super-admin"} onClick={saveRole}>
                Save role
              </ActionButton>
            </div>
          }
        />

        <div className="grid gap-6 lg:grid-cols-[260px_minmax(0,1fr)]">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Roles</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {roles.length === 0 ? (
                <p className="text-sm text-app-muted">No roles yet.</p>
              ) : (
                roles.map((role) => {
                  const key = roleKey(role);
                  const selected = activeRoleId === key;
                  const label = role.isNew && !role.name.trim() ? "New role" : role.name;
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setActiveRoleId(key)}
                      className={cn(
                        "flex w-full items-center justify-between rounded-lg border px-3 py-2 text-left text-sm transition-colors",
                        selected
                          ? "border-accent/40 bg-accent/10 text-app-text"
                          : "border-app-border bg-app-surface hover:bg-app-surface-muted",
                      )}
                    >
                      <span className={cn("font-medium", role.isNew && !role.name.trim() && "text-app-muted")}>
                        {label}
                        {role.isNew ? " (draft)" : ""}
                      </span>
                      {role.users_count != null && <span className="text-xs text-app-muted">{role.users_count}</span>}
                    </button>
                  );
                })
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-start justify-between gap-4">
              <div>
                <CardTitle>{activeRole?.name.trim() || (activeRole?.isNew ? "New role" : "Select a role")}</CardTitle>
                <CardDescription>
                  {activeRole?.name === "super-admin"
                    ? "Super admin always has full access and cannot be edited here."
                    : "Toggle permissions by section. Users inherit access from their assigned role."}
                </CardDescription>
              </div>
              {activeRole?.id && activeRole.name !== "super-admin" && (
                <ActionButton variant="outline" size="sm" icon={Trash2} loading={deleting} onClick={deleteRole}>
                  Delete
                </ActionButton>
              )}
            </CardHeader>
            <CardContent className="space-y-6">
              {activeRole ? (
                <>
                  <div className="space-y-2 max-w-md">
                    <Label htmlFor="role-name">Role name</Label>
                    <Input
                      id="role-name"
                      value={activeRole.name}
                      disabled={activeRole.name === "super-admin"}
                      placeholder="e.g. content-editor"
                      onChange={(e) => updateActiveRole({ name: e.target.value })}
                    />
                  </div>

                  {sections.map((section) => (
                    <div key={section.section} className="space-y-3">
                      <p className="text-sm font-medium text-app-text">{formatSectionLabel(section.section)}</p>
                      <div className="grid gap-2 sm:grid-cols-2">
                        {section.permissions.map((permission) => {
                          const checked = activeRole.permissions.includes(permission.name);
                          const disabled = activeRole.name === "super-admin";
                          return (
                            <label
                              key={permission.id}
                              className={cn(
                                "flex items-center gap-2 rounded-lg border border-app-border px-3 py-2 text-sm",
                                disabled && "opacity-60",
                              )}
                            >
                              <input
                                type="checkbox"
                                className="form-checkbox"
                                checked={checked}
                                disabled={disabled}
                                onChange={() => togglePermission(permission.name)}
                              />
                              <span>{formatPermissionLabel(permission.name)}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </>
              ) : (
                <p className="text-sm text-app-muted">Choose a role to edit its permissions.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </PermissionGate>
  );
}
