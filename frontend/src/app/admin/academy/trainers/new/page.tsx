"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { StringListField, normalizeStringList } from "@/components/admin/string-list-field";
import { MediaUrlField } from "@/components/cms/media-url-field";
import { AdminBackLink } from "@/components/admin/admin-form-primitives";
import { PermissionGate } from "@/components/admin/permission-gate";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PageHeader } from "@/components/ui/page-header";
import { apiClient } from "@/lib/api";
import { useAuthStore } from "@/stores/app";

interface FormData {
  name: string;
  bio: string;
  is_active: boolean;
}

export default function NewTrainerPage() {
  const router = useRouter();
  const token = useAuthStore((s) => s.token);
  const [photo, setPhoto] = useState("");
  const [specializations, setSpecializations] = useState<string[]>([""]);
  const [certifications, setCertifications] = useState<string[]>([""]);
  const { register, handleSubmit, formState: { isSubmitting } } = useForm<FormData>({
    defaultValues: { is_active: true },
  });

  const onSubmit = async (data: FormData) => {
    if (!token) return;
    const response = await apiClient.createTrainer(token, {
      name: data.name,
      bio: data.bio || undefined,
      photo: photo.trim() || undefined,
      specializations: normalizeStringList(specializations),
      certifications: normalizeStringList(certifications),
      is_active: data.is_active,
    });
    router.push(`/admin/academy/trainers/${response.data.id}`);
  };

  return (
    <PermissionGate permission="academy.trainers.manage">
      <div className="app-page">
        <PageHeader
          title="Add trainer"
          actions={<AdminBackLink href="/admin/academy/trainers">← Back to trainers</AdminBackLink>}
        />
        <Card>
          <CardHeader>
            <CardTitle>Trainer details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="grid max-w-2xl gap-4">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input {...register("name", { required: true })} />
              </div>
              <div className="space-y-2">
                <Label>Bio</Label>
                <Textarea rows={4} {...register("bio")} />
              </div>
              <div className="space-y-2">
                <Label>Photo</Label>
                <MediaUrlField value={photo} onChange={setPhoto} cropAspect={1} />
              </div>
              <StringListField label="Specializations" values={specializations} onChange={setSpecializations} />
              <StringListField label="Certifications" values={certifications} onChange={setCertifications} />
              <label className="flex items-center gap-2 text-sm text-app-text">
                <input type="checkbox" className="form-checkbox" {...register("is_active")} />
                Active
              </label>
              <Button type="submit" disabled={isSubmitting}>Create trainer</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </PermissionGate>
  );
}
