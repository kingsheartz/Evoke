"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import type { CourseBatch } from "@/lib/api";
import { apiClient } from "@/lib/api";
import { useAuthStore } from "@/stores/app";

const enrollableStatuses = new Set<CourseBatch["status"]>(["upcoming", "open", "active"]);

export function AcademyEnrollAction({
  batches = [],
  redirectPath,
}: {
  batches?: CourseBatch[];
  redirectPath: string;
}) {
  const router = useRouter();
  const { token } = useAuthStore();
  const openBatches = useMemo(
    () => batches.filter((batch) => enrollableStatuses.has(batch.status)),
    [batches],
  );
  const [batchId, setBatchId] = useState<number | "">(openBatches[0]?.id ?? "");
  const [message, setMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const signInHref = `/sign-in?redirect=${encodeURIComponent(redirectPath)}`;

  const enroll = async () => {
    if (!token) {
      router.push(signInHref);
      return;
    }
    if (batchId === "") {
      setMessage("Choose a batch.");
      return;
    }
    setSubmitting(true);
    setMessage(null);
    try {
      await apiClient.createEnrollment(token, { batch_id: batchId });
      setMessage("Enrollment submitted successfully.");
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Could not enroll.");
    } finally {
      setSubmitting(false);
    }
  };

  if (openBatches.length === 0) {
    return (
      <Button type="button" disabled className="h-12 rounded-xl px-6 text-sm font-semibold opacity-60">
        No open batches
      </Button>
    );
  }

  return (
    <div className="flex w-full max-w-md flex-col gap-3 sm:items-end">
      <div className="w-full space-y-2">
        <Label>Batch</Label>
        <Select
          value={batchId === "" ? "" : String(batchId)}
          onChange={(e) => setBatchId(e.target.value ? Number(e.target.value) : "")}
        >
          {openBatches.map((batch) => (
            <option key={batch.id} value={batch.id}>
              {batch.name} — {batch.start_date.slice(0, 10)}
              {batch.trainer?.name ? ` (${batch.trainer.name})` : ""}
            </option>
          ))}
        </Select>
      </div>
      <Button type="button" className="h-12 rounded-xl px-6 text-sm font-semibold" onClick={enroll} disabled={submitting}>
        {submitting ? "Enrolling…" : "Enroll now"}
      </Button>
      {!token && (
        <p className="text-xs text-app-muted">
          <Link href={signInHref} className="text-accent-soft hover:text-accent">
            Sign in
          </Link>{" "}
          to enroll in a batch.
        </p>
      )}
      {message && (
        <p className={`text-sm ${message.includes("success") ? "text-status-success" : "text-status-error"}`}>
          {message}
          {message.includes("success") && (
            <>
              {" "}
              <Link href="/account" className="font-medium text-accent-soft hover:text-accent">
                View account
              </Link>
            </>
          )}
        </p>
      )}
    </div>
  );
}
