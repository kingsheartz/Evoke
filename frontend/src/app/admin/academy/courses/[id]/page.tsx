"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { CourseBatchesEditor } from "@/components/admin/course-batches-editor";
import { GalleryUrlsField, normalizeUrlList } from "@/components/admin/gallery-urls-field";
import { AdminBackLink } from "@/components/admin/admin-form-primitives";
import { CategorySelectField } from "@/components/admin/category-select-field";
import { MediaUrlField } from "@/components/cms/media-url-field";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { PageHeader } from "@/components/ui/page-header";
import { PageLoading } from "@/components/ui/page-loading";
import { apiClient, type Course } from "@/lib/api";
import { revalidateAcademyPublicCache } from "@/lib/revalidate-cms";
import { useAuthStore } from "@/stores/app";
import { cn } from "@/lib/utils";

interface EditForm {
  category_id: number;
  title: string;
  description: string;
  duration: string;
  fees: number;
  status: string;
  seo_title: string;
  seo_description: string;
}

export default function EditCoursePage() {
  const params = useParams();
  const router = useRouter();
  const token = useAuthStore((s) => s.token);
  const courseId = Number(params.id);
  const [course, setCourse] = useState<Course | null>(null);
  const [thumbnail, setThumbnail] = useState("");
  const [gallery, setGallery] = useState<string[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const { register, handleSubmit, reset, control } = useForm<EditForm>();

  const load = () => {
    if (!token || !courseId) return;
    apiClient.getAdminCourse(token, courseId).then((courseRes) => {
      setCourse(courseRes.data);
      setThumbnail(courseRes.data.thumbnail ?? "");
      setGallery(courseRes.data.gallery ?? []);
      reset({
        category_id: courseRes.data.category_id,
        title: courseRes.data.title,
        description: courseRes.data.description ?? "",
        duration: courseRes.data.duration ?? "",
        fees: Number(courseRes.data.fees),
        status: courseRes.data.status,
        seo_title: courseRes.data.seo_title ?? "",
        seo_description: courseRes.data.seo_description ?? "",
      });
    });
  };

  useEffect(load, [token, courseId, reset]);

  const onSubmit = async (data: EditForm) => {
    if (!token) return;
    setMessage(null);
    try {
      await apiClient.updateCourse(token, courseId, {
        ...data,
        thumbnail: thumbnail.trim() || undefined,
        gallery: normalizeUrlList(gallery),
        seo_title: data.seo_title || undefined,
        seo_description: data.seo_description || undefined,
      });
      if (course?.slug) await revalidateAcademyPublicCache(course.slug);
      setMessage("Course updated successfully.");
      router.refresh();
      load();
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Update failed");
    }
  };

  if (!course) {
    return <PageLoading label="Loading course..." />;
  }

  return (
    <div className="app-page space-y-6">
      <PageHeader
        title="Edit Course"
        description={course.slug}
        actions={<AdminBackLink href="/admin/academy/courses">← Back to courses</AdminBackLink>}
      />

      <Card>
        <CardHeader><CardTitle>{course.title}</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2 md:col-span-2"><Label>Title</Label><Input {...register("title")} /></div>
              <div className="space-y-2 md:col-span-2"><Label>Description</Label><Textarea rows={4} {...register("description")} /></div>
              <Controller
                name="category_id"
                control={control}
                render={({ field }) => (
                  <CategorySelectField module="academy" value={field.value ?? 0} onChange={field.onChange} />
                )}
              />
              <div className="space-y-2"><Label>Duration</Label><Input {...register("duration")} placeholder="e.g. 12 weeks" /></div>
              <div className="space-y-2"><Label>Fees (₹)</Label><Input type="number" step="0.01" {...register("fees", { valueAsNumber: true })} /></div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select {...register("status")}>
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="archived">Archived</option>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Thumbnail</Label>
              <MediaUrlField value={thumbnail} onChange={setThumbnail} cropAspect={4 / 3} />
            </div>

            <GalleryUrlsField
              label="Course gallery"
              values={gallery.length ? gallery : [""]}
              onChange={(next) => setGallery(next.filter(Boolean))}
            />

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2 md:col-span-2">
                <Label>SEO title</Label>
                <Input {...register("seo_title")} placeholder="Optional page title for search engines" />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>SEO description</Label>
                <Textarea rows={2} {...register("seo_description")} placeholder="Optional meta description" />
              </div>
            </div>

            {message && (
              <p className={cn("text-sm", message.includes("success") ? "text-status-success" : "text-status-error")}>
                {message}
              </p>
            )}
            <Button type="submit">Save course</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Batches</CardTitle></CardHeader>
        <CardContent>
          <p className="mb-4 text-sm text-app-muted">Schedule upcoming batches shown on the public course page.</p>
          <CourseBatchesEditor courseId={courseId} courseSlug={course.slug} initialBatches={course.batches ?? []} />
        </CardContent>
      </Card>
    </div>
  );
}
