"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
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
import { PageLoading } from "@/components/ui/page-loading";
import { apiClient, type Trainer } from "@/lib/api";
import { useAuthStore } from "@/stores/app";

interface FormData {
  name: string;
  bio: string;
  is_active: boolean;
}

export default function EditTrainerPage() {
  const params = useParams();
  const token = useAuthStore((s) => s.token);
  const trainerId = Number(params.id);
  const [trainer, setTrainer] = useState<Trainer | null>(null);
  const [photo, setPhoto] = useState("");
  const [specializations, setSpecializations] = useState<string[]>([]);
  const [certifications, setCertifications] = useState<string[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const { register, handleSubmit, reset } = useForm<FormData>();

  useEffect(() => {
    if (!token || !trainerId) return;
    apiClient.getAdminTrainer(token, trainerId).then((response) => {
      setTrainer(response.data);
      setPhoto(response.data.photo ?? "");
      setSpecializations(response.data.specializations?.length ? response.data.specializations : [""]);
      setCertifications(response.data.certifications?.length ? response.data.certifications : [""]);
      reset({
        name: response.data.name,
        bio: response.data.bio ?? "",
        is_active: response.data.is_active,
      });
    });
  }, [token, trainerId, reset]);

  const onSubmit = async (data: FormData) => {
    if (!token) return;
    setMessage(null);
    try {
      await apiClient.updateTrainer(token, trainerId, {
        name: data.name,
        bio: data.bio || undefined,
        photo: photo.trim() || undefined,
        specializations: normalizeStringList(specializations),
        certifications: normalizeStringList(certifications),
        is_active: data.is_active,
      });
      setMessage("Trainer updated.");
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Update failed.");
    }
  };

  if (!trainer) return <PageLoading label="Loading trainer..." />;

  return (
    <PermissionGate permission="academy.trainers.manage">
      <div className="app-page">
        <PageHeader
          title="Edit trainer"
          description={trainer.slug}
          actions={<AdminBackLink href="/admin/academy/trainers">← Back to trainers</AdminBackLink>}
        />
        <Card>
          <CardHeader>
            <CardTitle>{trainer.name}</CardTitle>
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
              <StringListField
                label="Specializations"
                values={specializations}
                onChange={setSpecializations}
                placeholder="e.g. Karate, Yoga"
              />
              <StringListField
                label="Certifications"
                values={certifications}
                onChange={setCertifications}
                placeholder="e.g. Black belt, CPR"
              />
              <label className="flex items-center gap-2 text-sm text-app-text">
                <input type="checkbox" className="form-checkbox" {...register("is_active")} />
                Active
              </label>
              {message && (
                <p className={`text-sm ${message.includes("updated") ? "text-status-success" : "text-status-error"}`}>
                  {message}
                </p>
              )}
              <Button type="submit">Save trainer</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </PermissionGate>
  );
}
