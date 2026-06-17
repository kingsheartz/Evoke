"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { PageHeader } from "@/components/ui/page-header";
import { PageLoading } from "@/components/ui/page-loading";
import { AdminBackLink } from "@/components/admin/admin-form-primitives";
import { apiClient, type AcademyCategory, type Course } from "@/lib/api";
import { useAuthStore } from "@/stores/app";
import { cn } from "@/lib/utils";

interface EditForm {
  title: string;
  description: string;
  duration: string;
  fees: number;
  status: string;
}

export default function EditCoursePage() {
  const params = useParams();
  const router = useRouter();
  const token = useAuthStore((s) => s.token);
  const courseId = Number(params.id);
  const [course, setCourse] = useState<Course | null>(null);
  const [categories, setCategories] = useState<AcademyCategory[]>([]);
  const [message, setMessage] = useState<string | null>(null);

  const { register, handleSubmit, reset } = useForm<EditForm>();

  useEffect(() => {
    if (!token || !courseId) return;
    Promise.all([
      apiClient.getAdminCourse(token, courseId),
      apiClient.getAcademyCategories(),
    ]).then(([courseRes, catRes]) => {
      setCourse(courseRes.data);
      setCategories(catRes.data);
      reset({
        title: courseRes.data.title,
        description: courseRes.data.description ?? "",
        duration: courseRes.data.duration ?? "",
        fees: Number(courseRes.data.fees),
        status: courseRes.data.status,
      });
    });
  }, [token, courseId, reset]);

  const onSubmit = async (data: EditForm) => {
    if (!token) return;
    setMessage(null);
    try {
      await apiClient.updateCourse(token, courseId, data);
      setMessage("Course updated successfully.");
      router.refresh();
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Update failed");
    }
  };

  if (!course) {
    return <PageLoading label="Loading course..." />;
  }

  return (
    <div className="app-page">
      <PageHeader
        title="Edit Course"
        description={course.slug}
        actions={<AdminBackLink href="/admin/academy/courses">← Back to courses</AdminBackLink>}
      />

      <Card>
        <CardHeader>
          <CardTitle>{course.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2 md:col-span-2">
              <Label>Title</Label>
              <Input {...register("title")} />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Description</Label>
              <Textarea {...register("description")} />
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <p className="text-sm text-app-muted">
                {categories.find((c) => c.id === course.category_id)?.name ?? "—"}
              </p>
            </div>
            <div className="space-y-2">
              <Label>Duration</Label>
              <Input {...register("duration")} />
            </div>
            <div className="space-y-2">
              <Label>Fees (₹)</Label>
              <Input type="number" step="0.01" {...register("fees", { valueAsNumber: true })} />
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select {...register("status")}>
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </Select>
            </div>
            {message && (
              <p
                className={cn(
                  "text-sm md:col-span-2",
                  message.includes("success") ? "text-status-success" : "text-status-error",
                )}
              >
                {message}
              </p>
            )}
            <div className="md:col-span-2">
              <Button type="submit">Save Changes</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
