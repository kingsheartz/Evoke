"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  Building2,
  Camera,
  Loader2,
  MapPin,
  Phone,
  Save,
  Shield,
  Trash2,
  User as UserIcon,
  X,
} from "lucide-react";
import { ActionButton } from "@/components/ui/action-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { apiClient, type AdminBranch, type AdminUser, type UserPayload } from "@/lib/api";
import { formatRole } from "@/lib/status-labels";
import { useNotifications } from "@/lib/notifications";
import { cn } from "@/lib/utils";

type UserForm = {
  name: string;
  email: string;
  phone: string;
  password: string;
  role: string;
  branch_id: string;
  address_line1: string;
  address_line2: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
};

const emptyForm = (): UserForm => ({
  name: "",
  email: "",
  phone: "",
  password: "",
  role: "customer",
  branch_id: "",
  address_line1: "",
  address_line2: "",
  city: "",
  state: "",
  postal_code: "",
  country: "",
});

function formFromUser(user: AdminUser): UserForm {
  return {
    name: user.name,
    email: user.email,
    phone: user.phone ?? "",
    password: "",
    role: user.roles?.[0]?.name ?? "customer",
    branch_id: user.branch_id ? String(user.branch_id) : user.branch?.id ? String(user.branch.id) : "",
    address_line1: user.address_line1 ?? "",
    address_line2: user.address_line2 ?? "",
    city: user.city ?? "",
    state: user.state ?? "",
    postal_code: user.postal_code ?? "",
    country: user.country ?? "",
  };
}

function formatDateTime(value?: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function UserAvatar({
  user,
  size = "md",
  className,
}: {
  user: Pick<AdminUser, "name" | "avatar_url">;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}) {
  const initial = user.name?.charAt(0)?.toUpperCase() ?? "?";
  const sizeClass =
    size === "sm" ? "h-8 w-8 text-xs" : size === "lg" ? "h-16 w-16 text-xl" : size === "xl" ? "h-24 w-24 text-3xl" : "h-10 w-10 text-sm";

  if (user.avatar_url) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={user.avatar_url}
        alt={user.name}
        className={cn("shrink-0 rounded-full object-cover ring-2 ring-app-border", sizeClass, className)}
      />
    );
  }

  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full bg-accent/15 font-semibold text-accent-soft ring-2 ring-accent/20",
        sizeClass,
        className,
      )}
    >
      {initial}
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="grid gap-1 sm:grid-cols-[8rem_1fr] sm:gap-3">
      <dt className="text-xs font-medium uppercase tracking-wide text-app-muted">{label}</dt>
      <dd className="text-sm text-app-text">{value || "—"}</dd>
    </div>
  );
}

type UserDetailPanelProps = {
  userId: number | null;
  mode: "view" | "create";
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  token: string | null;
  roles: string[];
};

export function UserDetailPanel({ userId, mode, open, onClose, onSaved, token, roles }: UserDetailPanelProps) {
  const { success, error } = useNotifications();
  const [user, setUser] = useState<AdminUser | null>(null);
  const [branches, setBranches] = useState<AdminBranch[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [editing, setEditing] = useState(mode === "create");
  const [form, setForm] = useState<UserForm>(emptyForm());
  const fileRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    if (!token || !userId) return;
    setLoading(true);
    try {
      const { data } = await apiClient.getAdminUser(token, userId);
      setUser(data);
      setForm(formFromUser(data));
    } catch (e) {
      error(e instanceof Error ? e.message : "Could not load user.");
      onClose();
    } finally {
      setLoading(false);
    }
  }, [token, userId, error, onClose]);

  useEffect(() => {
    if (!open) return;
    setEditing(mode === "create");
    if (mode === "create") {
      setUser(null);
      setForm(emptyForm());
    } else if (userId) {
      load();
    }
  }, [open, mode, userId, load]);

  useEffect(() => {
    if (!token || !open) return;
    apiClient.getAdminBranches(token).then((r) => setBranches(r.data)).catch(() => {});
  }, [token, open]);

  useEffect(() => {
    if (!open) return;
    const onClosePanel = () => onClose();
    window.addEventListener("evoke-admin-close-panel", onClosePanel);
    return () => window.removeEventListener("evoke-admin-close-panel", onClosePanel);
  }, [open, onClose]);

  const payloadFromForm = (): UserPayload => ({
    name: form.name,
    email: form.email,
    phone: form.phone || undefined,
    role: form.role,
    branch_id: form.branch_id ? Number(form.branch_id) : undefined,
    address_line1: form.address_line1 || undefined,
    address_line2: form.address_line2 || undefined,
    city: form.city || undefined,
    state: form.state || undefined,
    postal_code: form.postal_code || undefined,
    country: form.country || undefined,
    ...(form.password ? { password: form.password } : {}),
  });

  const save = async () => {
    if (!token) return;
    setSaving(true);
    try {
      if (mode === "create") {
        if (!form.password) {
          error("Password is required for new users.");
          setSaving(false);
          return;
        }
        await apiClient.createUser(token, payloadFromForm());
        success("User created.");
        onSaved();
        onClose();
      } else if (user) {
        const { data } = await apiClient.updateUser(token, user.id, payloadFromForm());
        setUser(data);
        setForm(formFromUser(data));
        setEditing(false);
        success("User updated.");
        onSaved();
      }
    } catch (e) {
      error(e instanceof Error ? e.message : "Could not save user.");
    } finally {
      setSaving(false);
    }
  };

  const onAvatarPick = async (file: File) => {
    if (!token || !user) return;
    setUploading(true);
    try {
      const { data } = await apiClient.uploadUserAvatar(token, user.id, file);
      setUser(data);
      success("Photo updated.");
      onSaved();
    } catch (e) {
      error(e instanceof Error ? e.message : "Could not upload photo.");
    } finally {
      setUploading(false);
    }
  };

  const removeAvatar = async () => {
    if (!token || !user || !user.avatar_url) return;
    setUploading(true);
    try {
      const { data } = await apiClient.removeUserAvatar(token, user.id);
      setUser(data);
      success("Photo removed.");
      onSaved();
    } catch (e) {
      error(e instanceof Error ? e.message : "Could not remove photo.");
    } finally {
      setUploading(false);
    }
  };

  if (!open) return null;

  const title = mode === "create" ? "New user" : user?.name ?? "User details";

  return createPortal(
    <div className="fixed inset-0 z-[2147483630] flex justify-end bg-black/50" role="dialog" aria-modal="true">
      <button type="button" className="absolute inset-0 cursor-default" aria-label="Close panel" onClick={onClose} />
      <aside
        data-admin-detail-panel="true"
        className="relative flex h-full w-full max-w-xl flex-col border-l border-app-border bg-app-surface shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-app-border px-5 py-4">
          <h2 className="text-lg font-semibold text-app-text">{title}</h2>
          <button type="button" onClick={onClose} className="rounded-md p-1.5 text-app-muted hover:text-app-text" aria-label="Close">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {loading ? (
            <div className="flex items-center justify-center py-20 text-app-muted">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : (
            <div className="space-y-8">
              <section className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
                {mode === "create" ? (
                  <div className="flex h-24 w-24 items-center justify-center rounded-full bg-app-surface-muted ring-2 ring-app-border">
                    <UserIcon className="h-10 w-10 text-app-muted" />
                  </div>
                ) : user ? (
                  <div className="relative">
                    <UserAvatar user={user} size="xl" />
                    {uploading && (
                      <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50">
                        <Loader2 className="h-6 w-6 animate-spin text-white" />
                      </div>
                    )}
                  </div>
                ) : null}
                <div className="flex-1 text-center sm:text-left">
                  {user && !editing && (
                    <>
                      <p className="text-xl font-semibold text-app-text">{user.name}</p>
                      <p className="text-sm text-app-muted">{user.email}</p>
                      <p className="mt-1 text-xs text-app-muted">
                        {user.roles?.[0]?.name ? formatRole(user.roles[0].name) : "No role"}
                        {user.branch?.name ? ` · ${user.branch.name}` : ""}
                      </p>
                    </>
                  )}
                  {user && editing && (
                    <p className="text-sm text-app-muted">Update profile photo and account details below.</p>
                  )}
                  {mode === "create" && (
                    <p className="text-sm text-app-muted">Add account details. Upload a photo after creating the user.</p>
                  )}
                  {user && (
                    <div className="mt-3 flex flex-wrap justify-center gap-2 sm:justify-start">
                      <input
                        ref={fileRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) onAvatarPick(file);
                          e.target.value = "";
                        }}
                      />
                      <ActionButton
                        variant="outline"
                        size="sm"
                        icon={Camera}
                        disabled={uploading}
                        onClick={() => fileRef.current?.click()}
                      >
                        {user.avatar_url ? "Change photo" : "Upload photo"}
                      </ActionButton>
                      {user.avatar_url && (
                        <ActionButton variant="outline" size="sm" icon={Trash2} disabled={uploading} onClick={removeAvatar}>
                          Remove
                        </ActionButton>
                      )}
                    </div>
                  )}
                </div>
              </section>

              {editing ? (
                <div className="space-y-6">
                  <Section title="Account" icon={UserIcon}>
                    <Field label="Full name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} />
                    <Field label="Email" type="email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} />
                    <Field
                      label={mode === "create" ? "Password" : "New password (optional)"}
                      type="password"
                      value={form.password}
                      onChange={(v) => setForm({ ...form, password: v })}
                    />
                    <div className="space-y-2">
                      <Label>Role</Label>
                      <Select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                        {roles.map((r) => (
                          <option key={r} value={r}>{formatRole(r)}</option>
                        ))}
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Branch</Label>
                      <Select value={form.branch_id} onChange={(e) => setForm({ ...form, branch_id: e.target.value })}>
                        <option value="">No branch</option>
                        {branches.map((b) => (
                          <option key={b.id} value={b.id}>{b.name}</option>
                        ))}
                      </Select>
                    </div>
                  </Section>
                  <Section title="Contact" icon={Phone}>
                    <Field label="Phone" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} />
                  </Section>
                  <Section title="Address" icon={MapPin}>
                    <Field label="Address line 1" value={form.address_line1} onChange={(v) => setForm({ ...form, address_line1: v })} />
                    <Field label="Address line 2" value={form.address_line2} onChange={(v) => setForm({ ...form, address_line2: v })} />
                    <div className="grid gap-3 sm:grid-cols-2">
                      <Field label="City" value={form.city} onChange={(v) => setForm({ ...form, city: v })} />
                      <Field label="State" value={form.state} onChange={(v) => setForm({ ...form, state: v })} />
                      <Field label="Postal code" value={form.postal_code} onChange={(v) => setForm({ ...form, postal_code: v })} />
                      <Field label="Country" value={form.country} onChange={(v) => setForm({ ...form, country: v })} />
                    </div>
                  </Section>
                </div>
              ) : user ? (
                <div className="space-y-6">
                  <Section title="Account" icon={UserIcon}>
                    <dl className="space-y-3">
                      <DetailRow label="Full name" value={user.name} />
                      <DetailRow label="Email" value={user.email} />
                      <DetailRow label="Role" value={user.roles?.[0]?.name ? formatRole(user.roles[0].name) : "—"} />
                      <DetailRow label="Branch" value={user.branch?.name} />
                      <DetailRow label="User ID" value={`#${user.id}`} />
                    </dl>
                  </Section>
                  <Section title="Contact" icon={Phone}>
                    <dl className="space-y-3">
                      <DetailRow label="Phone" value={user.phone} />
                      <DetailRow label="Email verified" value={formatDateTime(user.email_verified_at)} />
                      <DetailRow label="Phone verified" value={formatDateTime(user.phone_verified_at)} />
                    </dl>
                  </Section>
                  <Section title="Address" icon={MapPin}>
                    <dl className="space-y-3">
                      <DetailRow label="Line 1" value={user.address_line1} />
                      <DetailRow label="Line 2" value={user.address_line2} />
                      <DetailRow label="City" value={user.city} />
                      <DetailRow label="State" value={user.state} />
                      <DetailRow label="Postal" value={user.postal_code} />
                      <DetailRow label="Country" value={user.country} />
                    </dl>
                  </Section>
                  <Section title="Security" icon={Shield}>
                    <dl className="space-y-3">
                      <DetailRow label="Two-factor" value={user.two_factor_enabled ? "Enabled" : "Disabled"} />
                      <DetailRow
                        label="Permissions"
                        value={
                          user.permissions?.length
                            ? user.permissions.map((p) => p.name).join(", ")
                            : "Inherited from role"
                        }
                      />
                    </dl>
                  </Section>
                  <Section title="Activity" icon={Building2}>
                    <dl className="space-y-3">
                      <DetailRow label="Joined" value={formatDateTime(user.created_at)} />
                      <DetailRow label="Last updated" value={formatDateTime(user.updated_at)} />
                    </dl>
                  </Section>
                </div>
              ) : null}
            </div>
          )}
        </div>

        <div className="flex gap-2 border-t border-app-border px-5 py-4">
          {editing ? (
            <>
              {mode !== "create" && (
                <ActionButton
                  variant="outline"
                  onClick={() => {
                    setEditing(false);
                    if (user) setForm(formFromUser(user));
                  }}
                >
                  Cancel
                </ActionButton>
              )}
              <ActionButton icon={Save} loading={saving} data-admin-primary-save="true" onClick={save}>
                {mode === "create" ? "Create user" : "Save changes"}
              </ActionButton>
            </>
          ) : user ? (
            <ActionButton onClick={() => setEditing(true)}>Edit details</ActionButton>
          ) : null}
        </div>
      </aside>
    </div>,
    document.body,
  );
}

function Section({ title, icon: Icon, children }: { title: string; icon: typeof UserIcon; children: React.ReactNode }) {
  return (
    <section>
      <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-app-text">
        <Icon className="h-4 w-4 text-accent-soft" />
        {title}
      </h3>
      <div className="space-y-3 rounded-xl border border-app-border bg-app-surface-muted/30 p-4">{children}</div>
    </section>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Input type={type} value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}
