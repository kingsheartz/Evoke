"use client";

import { useCallback, useRef, useState } from "react";
import { Camera, Trash2, User as UserIcon } from "lucide-react";
import { ImageCropModal } from "@/components/ui/image-crop-modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { FormError, FormSuccess } from "@/components/admin/admin-form-primitives";
import { useImageCropFlow } from "@/hooks/use-image-crop-flow";
import { usePasteMediaFile } from "@/hooks/use-paste-media-file";
import { apiClient, type ProfilePayload, type User } from "@/lib/api";
import { UPLOADABLE_IMAGE_ACCEPT } from "@/lib/media";
import { useNotifications } from "@/lib/notifications";
import { useAuthStore } from "@/stores/app";

interface ProfileEditorProps {
  user: User;
  token: string;
}

export function ProfileEditor({ user, token }: ProfileEditorProps) {
  const { setAuth } = useAuthStore();
  const { success, error: notifyError } = useNotifications();
  const fileRef = useRef<HTMLInputElement>(null);
  const avatarSectionRef = useRef<HTMLDivElement>(null);
  const { pendingCrop, startCrop, cancelCrop } = useImageCropFlow();
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState<ProfilePayload & { name: string }>({
    name: user.name,
    phone: user.phone ?? "",
    gender: user.gender ?? "",
    age: user.age ?? undefined,
    blood_group: user.blood_group ?? "",
    learning_mode: user.learning_mode ?? undefined,
    address_line1: user.address_line1 ?? "",
    address_line2: user.address_line2 ?? "",
    city: user.city ?? "",
    state: user.state ?? "",
    postal_code: user.postal_code ?? "",
    country: user.country ?? "India",
  });

  const updateField = (key: keyof typeof form, value: string | number | undefined) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const syncUser = (next: User) => {
    if (token) setAuth(next, token);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      const { data } = await apiClient.updateProfile(token, {
        name: form.name,
        phone: form.phone || undefined,
        gender: form.gender || undefined,
        age: form.age ? Number(form.age) : undefined,
        blood_group: form.blood_group || undefined,
        learning_mode: form.learning_mode || undefined,
        address_line1: form.address_line1 || undefined,
        address_line2: form.address_line2 || undefined,
        city: form.city || undefined,
        state: form.state || undefined,
        postal_code: form.postal_code || undefined,
        country: form.country || undefined,
      });
      syncUser(data);
      setMessage("Profile saved.");
      success("Profile updated");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Could not save profile";
      setError(msg);
      notifyError(msg);
    } finally {
      setSaving(false);
    }
  };

  const uploadAvatarFile = async (file: File) => {
    setUploading(true);
    setError(null);
    try {
      const { data } = await apiClient.uploadAvatar(token, file);
      syncUser(data);
      success("Photo updated");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Upload failed";
      setError(msg);
      notifyError(msg);
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    processAvatarFile(file);
  };

  const processAvatarFile = useCallback(
    (file: File) => {
      if (startCrop(file)) {
        if (fileRef.current) fileRef.current.value = "";
        return;
      }
      void uploadAvatarFile(file);
    },
    [startCrop, uploadAvatarFile],
  );

  usePasteMediaFile(avatarSectionRef, processAvatarFile, { kind: "image" });

  const handleRemoveAvatar = async () => {
    setUploading(true);
    setError(null);
    try {
      const { data } = await apiClient.removeAvatar(token);
      syncUser(data);
      success("Photo removed");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Could not remove photo";
      setError(msg);
      notifyError(msg);
    } finally {
      setUploading(false);
    }
  };

  return (
    <form onSubmit={handleSave} className="space-y-8">
      <div ref={avatarSectionRef} className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-full border border-app-border bg-app-surface-muted">
          {user.avatar_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={user.avatar_url} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-app-muted">
              <UserIcon className="h-8 w-8" />
            </div>
          )}
        </div>
        <div className="space-y-2">
          <p className="text-sm font-medium text-app-text">Profile photo</p>
          <p className="text-xs text-app-muted">Optional — upload or paste an image (Ctrl+V) when this section is focused.</p>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={uploading}
              onClick={() => fileRef.current?.click()}
            >
              <Camera className="h-4 w-4" />
              {uploading ? "Uploading..." : "Upload photo"}
            </Button>
            {user.avatar_url && (
              <Button type="button" variant="ghost" size="sm" disabled={uploading} onClick={() => void handleRemoveAvatar()}>
                <Trash2 className="h-4 w-4" />
                Remove
              </Button>
            )}
          </div>
          <input ref={fileRef} type="file" accept={UPLOADABLE_IMAGE_ACCEPT} className="hidden" onChange={handleAvatarChange} />
        </div>
      </div>

      <ImageCropModal
        open={Boolean(pendingCrop)}
        imageSrc={pendingCrop?.src ?? null}
        fileName={pendingCrop?.fileName ?? "avatar.jpg"}
        mimeType={pendingCrop?.mimeType ?? "image/jpeg"}
        originalFile={pendingCrop?.file}
        defaultAspect={1}
        title="Adjust profile photo"
        confirmLabel="Custom crop & upload"
        onClose={cancelCrop}
        onConfirm={uploadAvatarFile}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="profile-name">Full name</Label>
          <Input id="profile-name" value={form.name} onChange={(e) => updateField("name", e.target.value)} autoComplete="name" />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label>Email</Label>
          <Input value={user.email} disabled className="opacity-70" />
        </div>
        <div className="space-y-2">
          <Label>Evoke ID</Label>
          <Input value={user.evoke_id ?? "Assigned after save"} disabled className="opacity-70" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="profile-phone">Phone (optional)</Label>
          <Input id="profile-phone" value={form.phone ?? ""} onChange={(e) => updateField("phone", e.target.value)} autoComplete="tel" />
        </div>
      </div>

      <div className="rounded-xl border border-app-border bg-app-surface/50 p-4">
        <p className="text-sm font-medium text-app-text">Academy & travel details</p>
        <p className="mt-1 text-xs text-app-muted">
          Optional for shop purchases. Required before course enrollment or tour booking.
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="profile-gender">Gender</Label>
            <Select
              id="profile-gender"
              value={form.gender ?? ""}
              onChange={(e) => updateField("gender", e.target.value)}
            >
              <option value="">Select gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
              <option value="prefer_not_to_say">Prefer not to say</option>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="profile-age">Age</Label>
            <Input
              id="profile-age"
              type="number"
              min={1}
              max={120}
              value={form.age ?? ""}
              onChange={(e) => updateField("age", e.target.value ? Number(e.target.value) : undefined)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="profile-blood">Blood group</Label>
            <Select
              id="profile-blood"
              value={form.blood_group ?? ""}
              onChange={(e) => updateField("blood_group", e.target.value)}
            >
              <option value="">Select blood group</option>
              {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((group) => (
                <option key={group} value={group}>
                  {group}
                </option>
              ))}
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="profile-mode">Learning / travel mode</Label>
            <Select
              id="profile-mode"
              value={form.learning_mode ?? ""}
              onChange={(e) => updateField("learning_mode", e.target.value as "offline" | "online" | undefined)}
            >
              <option value="">Select mode</option>
              <option value="offline">Offline</option>
              <option value="online">Online</option>
            </Select>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-app-border bg-app-surface/50 p-4">
        <p className="text-sm font-medium text-app-text">Delivery address</p>
        <p className="mt-1 text-xs text-app-muted">Required for orders and bookings — not needed when you register.</p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="profile-address1">Address line 1</Label>
            <Input
              id="profile-address1"
              value={form.address_line1 ?? ""}
              onChange={(e) => updateField("address_line1", e.target.value)}
              autoComplete="address-line1"
              placeholder="Street, building, area"
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="profile-address2">Address line 2 (optional)</Label>
            <Input
              id="profile-address2"
              value={form.address_line2 ?? ""}
              onChange={(e) => updateField("address_line2", e.target.value)}
              autoComplete="address-line2"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="profile-city">City</Label>
            <Input id="profile-city" value={form.city ?? ""} onChange={(e) => updateField("city", e.target.value)} autoComplete="address-level2" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="profile-state">State</Label>
            <Input id="profile-state" value={form.state ?? ""} onChange={(e) => updateField("state", e.target.value)} autoComplete="address-level1" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="profile-postal">Postal code</Label>
            <Input id="profile-postal" value={form.postal_code ?? ""} onChange={(e) => updateField("postal_code", e.target.value)} autoComplete="postal-code" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="profile-country">Country</Label>
            <Input id="profile-country" value={form.country ?? ""} onChange={(e) => updateField("country", e.target.value)} autoComplete="country-name" />
          </div>
        </div>
      </div>

      <FormError message={error} />
      <FormSuccess message={message} />
      <Button type="submit" disabled={saving}>
        {saving ? "Saving..." : "Save profile"}
      </Button>
    </form>
  );
}
