"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { apiClient, type CourseBatch, type Trainer } from "@/lib/api";
import { revalidateAcademyPublicCache } from "@/lib/revalidate-cms";
import { useAuthStore } from "@/stores/app";

type DraftBatch = {
  name: string;
  start_date: string;
  end_date: string;
  capacity: number;
  status: CourseBatch["status"];
  trainer_id: number | "";
};

const emptyBatch = (): DraftBatch => ({
  name: "",
  start_date: "",
  end_date: "",
  capacity: 20,
  status: "upcoming",
  trainer_id: "",
});

export function CourseBatchesEditor({
  courseId,
  courseSlug,
  initialBatches = [],
}: {
  courseId: number;
  courseSlug?: string;
  initialBatches?: CourseBatch[];
}) {
  const token = useAuthStore((s) => s.token);
  const [batches, setBatches] = useState<CourseBatch[]>(initialBatches);
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [draft, setDraft] = useState<DraftBatch>(emptyBatch());
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    setBatches(initialBatches);
  }, [initialBatches]);

  useEffect(() => {
    if (!token) return;
    apiClient.getAdminTrainers(token).then((response) => setTrainers(response.data ?? []));
  }, [token]);

  const reload = async () => {
    if (!token) return;
    const response = await apiClient.getCourseBatches(token, courseId);
    setBatches(response.data);
  };

  const revalidate = async () => {
    if (courseSlug) await revalidateAcademyPublicCache(courseSlug);
  };

  const addBatch = async () => {
    if (!token || !draft.name.trim() || !draft.start_date) return;
    setMessage(null);
    try {
      await apiClient.createCourseBatch(token, courseId, {
        name: draft.name,
        start_date: draft.start_date,
        end_date: draft.end_date || undefined,
        capacity: draft.capacity,
        status: draft.status,
        trainer_id: draft.trainer_id === "" ? null : draft.trainer_id,
      });
      setDraft(emptyBatch());
      await reload();
      await revalidate();
      setMessage("Batch added.");
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Could not add batch.");
    }
  };

  const updateBatch = async (batch: CourseBatch, patch: Partial<DraftBatch>) => {
    if (!token) return;
    setMessage(null);
    try {
      await apiClient.updateCourseBatch(token, courseId, batch.id, {
        ...patch,
        end_date: patch.end_date || undefined,
        trainer_id: patch.trainer_id === "" ? null : patch.trainer_id,
      });
      await reload();
      await revalidate();
      setMessage("Batch updated.");
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Could not update batch.");
    }
  };

  const removeBatch = async (batchId: number) => {
    if (!token) return;
    setMessage(null);
    try {
      await apiClient.deleteCourseBatch(token, courseId, batchId);
      await reload();
      await revalidate();
      setMessage("Batch removed.");
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Could not remove batch.");
    }
  };

  return (
    <div className="space-y-4">
      {batches.map((batch) => (
        <BatchRow
          key={batch.id}
          batch={batch}
          trainers={trainers}
          onSave={(patch) => updateBatch(batch, patch)}
          onRemove={() => removeBatch(batch.id)}
        />
      ))}

      <div className="grid gap-3 rounded-lg border border-dashed border-app-border bg-app-surface/60 p-4 md:grid-cols-2">
        <div className="space-y-2 md:col-span-2">
          <Label>Batch name</Label>
          <Input
            value={draft.name}
            onChange={(e) => setDraft({ ...draft, name: e.target.value })}
            placeholder="e.g. Summer 2026 — Weekday batch"
          />
        </div>
        <div className="space-y-2">
          <Label>Start date</Label>
          <Input
            type="date"
            value={draft.start_date}
            onChange={(e) => setDraft({ ...draft, start_date: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label>End date (optional)</Label>
          <Input
            type="date"
            value={draft.end_date}
            onChange={(e) => setDraft({ ...draft, end_date: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label>Capacity</Label>
          <Input
            type="number"
            value={draft.capacity}
            onChange={(e) => setDraft({ ...draft, capacity: Number(e.target.value) || 20 })}
          />
        </div>
        <div className="space-y-2">
          <Label>Status</Label>
          <Select
            value={draft.status}
            onChange={(e) => setDraft({ ...draft, status: e.target.value as CourseBatch["status"] })}
          >
            <option value="upcoming">Upcoming</option>
            <option value="open">Open for enrollment</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Trainer (optional)</Label>
          <Select
            value={draft.trainer_id === "" ? "" : String(draft.trainer_id)}
            onChange={(e) =>
              setDraft({ ...draft, trainer_id: e.target.value ? Number(e.target.value) : "" })
            }
          >
            <option value="">Unassigned</option>
            {trainers.map((trainer) => (
              <option key={trainer.id} value={trainer.id}>
                {trainer.name}
              </option>
            ))}
          </Select>
        </div>
        <div className="md:col-span-2">
          <Button type="button" onClick={addBatch}>
            <Plus className="mr-2 h-4 w-4" />
            Add batch
          </Button>
        </div>
      </div>

      {message && <p className="text-sm text-app-muted">{message}</p>}
    </div>
  );
}

function BatchRow({
  batch,
  trainers,
  onSave,
  onRemove,
}: {
  batch: CourseBatch;
  trainers: Trainer[];
  onSave: (patch: Partial<DraftBatch>) => void;
  onRemove: () => void;
}) {
  const [name, setName] = useState(batch.name);
  const [startDate, setStartDate] = useState(batch.start_date.slice(0, 10));
  const [endDate, setEndDate] = useState(batch.end_date?.slice(0, 10) ?? "");
  const [capacity, setCapacity] = useState(batch.capacity ?? 20);
  const [status, setStatus] = useState(batch.status);
  const [trainerId, setTrainerId] = useState<number | "">(batch.trainer_id ?? "");

  useEffect(() => {
    setName(batch.name);
    setStartDate(batch.start_date.slice(0, 10));
    setEndDate(batch.end_date?.slice(0, 10) ?? "");
    setCapacity(batch.capacity ?? 20);
    setStatus(batch.status);
    setTrainerId(batch.trainer_id ?? "");
  }, [batch]);

  return (
    <div className="rounded-lg border border-app-border bg-app-surface/80 p-4 ring-1 ring-app-border">
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-[1.2fr_10rem_10rem_8rem_10rem_10rem_auto] lg:items-end">
        <div className="space-y-2">
          <Label>Name</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>Start</Label>
          <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>End</Label>
          <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>Capacity</Label>
          <Input type="number" value={capacity} onChange={(e) => setCapacity(Number(e.target.value) || 20)} />
        </div>
        <div className="space-y-2">
          <Label>Status</Label>
          <Select value={status} onChange={(e) => setStatus(e.target.value as CourseBatch["status"])}>
            <option value="upcoming">Upcoming</option>
            <option value="open">Open</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Trainer</Label>
          <Select
            value={trainerId === "" ? "" : String(trainerId)}
            onChange={(e) => setTrainerId(e.target.value ? Number(e.target.value) : "")}
          >
            <option value="">Unassigned</option>
            {trainers.map((trainer) => (
              <option key={trainer.id} value={trainer.id}>
                {trainer.name}
              </option>
            ))}
          </Select>
        </div>
        <div className="flex gap-2">
          <Button
            type="button"
            size="sm"
            onClick={() =>
              onSave({
                name,
                start_date: startDate,
                end_date: endDate,
                capacity,
                status,
                trainer_id: trainerId,
              })
            }
          >
            Save
          </Button>
          <Button type="button" variant="ghost" size="sm" onClick={onRemove}>
            <Trash2 className="h-4 w-4 text-status-error" />
          </Button>
        </div>
      </div>
    </div>
  );
}
