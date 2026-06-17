"use client";

import { useEffect, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PermissionGate } from "@/components/admin/permission-gate";
import { apiClient, type EntryCard, type HomepageData } from "@/lib/api";
import { useAuthStore } from "@/stores/app";

interface HomepageForm {
  hero_heading: string;
  hero_subheading: string;
  hero_background_type: string;
  hero_background_url: string;
  hero_video_url: string;
  hero_cta_text: string;
  hero_cta_url: string;
  entry_cards: EntryCard[];
}

function toForm(data: HomepageData): HomepageForm {
  return {
    hero_heading: data.hero.heading ?? "",
    hero_subheading: data.hero.subheading ?? "",
    hero_background_type: data.hero.background_type ?? "gradient",
    hero_background_url: data.hero.background_url ?? "",
    hero_video_url: data.hero.video_url ?? "",
    hero_cta_text: data.hero.cta_text ?? "",
    hero_cta_url: data.hero.cta_url ?? "",
    entry_cards: data.entry_cards ?? [],
  };
}

export default function HomepageEditorPage() {
  const token = useAuthStore((s) => s.token);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const { register, control, handleSubmit, reset } = useForm<HomepageForm>();
  const { fields } = useFieldArray({ control, name: "entry_cards" });

  useEffect(() => {
    apiClient.getHomepage().then((res) => {
      if (res.data) reset(toForm(res.data));
      setLoading(false);
    });
  }, [reset]);

  const onSubmit = async (data: HomepageForm) => {
    if (!token) return;
    setMessage(null);
    try {
      await apiClient.updateHomepage(token, data);
      setMessage("Homepage saved successfully.");
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Failed to save.");
    }
  };

  if (loading) {
    return <p className="text-sm text-zinc-500">Loading homepage settings...</p>;
  }

  return (
    <PermissionGate
      permission={["cms.homepage.manage", "cms.pages.manage"]}
      fallback={<p className="text-red-600">You do not have permission to edit the homepage.</p>}
    >
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-zinc-900">Homepage Editor</h1>
        <p className="mt-1 text-zinc-500">Manage hero section and division entry cards</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Hero Section</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2 md:col-span-2">
              <Label>Heading</Label>
              <Input {...register("hero_heading")} />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Subheading</Label>
              <Input {...register("hero_subheading")} />
            </div>
            <div className="space-y-2">
              <Label>Background Type</Label>
              <select
                {...register("hero_background_type")}
                className="flex h-10 w-full rounded-lg border border-zinc-200 px-3 text-sm"
              >
                <option value="gradient">Gradient</option>
                <option value="image">Image</option>
                <option value="video">Video</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label>Background URL</Label>
              <Input {...register("hero_background_url")} placeholder="https://..." />
            </div>
            <div className="space-y-2">
              <Label>Video URL</Label>
              <Input {...register("hero_video_url")} placeholder="https://..." />
            </div>
            <div className="space-y-2">
              <Label>CTA Text</Label>
              <Input {...register("hero_cta_text")} />
            </div>
            <div className="space-y-2">
              <Label>CTA URL</Label>
              <Input {...register("hero_cta_url")} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Entry Cards</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {fields.map((field, index) => (
              <div key={field.id} className="grid gap-3 rounded-lg border border-zinc-100 p-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input {...register(`entry_cards.${index}.title`)} />
                </div>
                <div className="space-y-2">
                  <Label>Slug</Label>
                  <Input {...register(`entry_cards.${index}.slug`)} />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>Description</Label>
                  <Input {...register(`entry_cards.${index}.description`)} />
                </div>
                <div className="space-y-2">
                  <Label>URL</Label>
                  <Input {...register(`entry_cards.${index}.url`)} />
                </div>
                <div className="space-y-2">
                  <Label>Gradient classes</Label>
                  <Input {...register(`entry_cards.${index}.gradient`)} />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {message && (
          <p className={message.includes("success") ? "text-emerald-600" : "text-red-600"}>
            {message}
          </p>
        )}
        <Button type="submit">Save Homepage</Button>
      </form>
    </PermissionGate>
  );
}
