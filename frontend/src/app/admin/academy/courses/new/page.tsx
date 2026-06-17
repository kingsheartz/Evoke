"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { PageHeader } from "@/components/ui/page-header";
import { AdminBackLink, FormError } from "@/components/admin/admin-form-primitives";
import { apiClient, type AcademyCategory } from "@/lib/api";
import { useAuthStore } from "@/stores/app";

const schema = z.object({
  category_id: z.number({ error: "Select a category" }).min(1, "Select a category"),
  title: z.string().min(2, "Title is required"),
  description: z.string().optional(),
  duration: z.string().optional(),
  fees: z.number().min(0),
  requires_approval: z.boolean().optional(),
});

type FormData = z.infer<typeof schema>;

export default function NewCoursePage() {
  const router = useRouter();
  const token = useAuthStore((s) => s.token);
  const [categories, setCategories] = useState<AcademyCategory[]>([]);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { fees: 0, requires_approval: false },
  });

  useEffect(() => {
    apiClient.getAcademyCategories().then((res) => setCategories(res.data));
  }, []);

  const onSubmit = async (data: FormData) => {
    if (!token) return;
    setError(null);
    try {
      const { data: course } = await apiClient.createCourse(token, data);
      router.push(`/admin/academy/courses/${course.id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to create course");
    }
  };

  return (
    <div className="app-page">
      <PageHeader
        title="New Course"
        description="Create a new academy course"
        actions={<AdminBackLink href="/admin/academy/courses">← Back to courses</AdminBackLink>}
      />

      <Card>
        <CardHeader>
          <CardTitle>Course Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2 md:col-span-2">
              <Label>Title</Label>
              <Input {...register("title")} />
              <FormError message={errors.title?.message} />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Description</Label>
              <Textarea {...register("description")} />
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <Select {...register("category_id", { valueAsNumber: true })}>
                <option value={0}>Select category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </Select>
              <FormError message={errors.category_id?.message} />
            </div>
            <div className="space-y-2">
              <Label>Duration</Label>
              <Input {...register("duration")} placeholder="e.g. 3 months" />
            </div>
            <div className="space-y-2">
              <Label>Fees (₹)</Label>
              <Input type="number" step="0.01" {...register("fees")} />
            </div>
            <div className="flex items-center gap-2 md:col-span-2">
              <input type="checkbox" id="requires_approval" className="form-checkbox" {...register("requires_approval")} />
              <Label htmlFor="requires_approval">Requires admin approval for enrollment</Label>
            </div>
            <FormError message={error} />
            <div className="md:col-span-2">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Creating..." : "Create Course"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
