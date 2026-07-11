"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { AdminTask } from "@/lib/api";
import { cn } from "@/lib/utils";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function toDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function parseDateKey(key: string): Date {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function monthRange(year: number, month: number) {
  const start = new Date(year, month, 1);
  const end = new Date(year, month + 1, 0);
  return { start, end };
}

function priorityDot(priority: AdminTask["priority"]) {
  if (priority === "high") return "bg-red-400";
  if (priority === "low") return "bg-app-muted";
  return "bg-accent";
}

interface AdminTaskCalendarProps {
  tasks: AdminTask[];
  month: Date;
  selectedDate: string | null;
  onMonthChange: (next: Date) => void;
  onSelectDate: (dateKey: string | null) => void;
}

export function AdminTaskCalendar({
  tasks,
  month,
  selectedDate,
  onMonthChange,
  onSelectDate,
}: AdminTaskCalendarProps) {
  const year = month.getFullYear();
  const monthIndex = month.getMonth();
  const { start, end } = monthRange(year, monthIndex);

  const tasksByDate = tasks.reduce<Record<string, AdminTask[]>>((acc, task) => {
    if (!task.due_at) return acc;
    const key = task.due_at.slice(0, 10);
    acc[key] = acc[key] ? [...acc[key], task] : [task];
    return acc;
  }, {});

  const leading = start.getDay();
  const daysInMonth = end.getDate();
  const cells: (Date | null)[] = [
    ...Array.from({ length: leading }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => new Date(year, monthIndex, i + 1)),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const todayKey = toDateKey(new Date());
  const monthLabel = month.toLocaleDateString(undefined, { month: "long", year: "numeric" });

  return (
    <div className="rounded-2xl border border-app-border bg-app-surface/80 p-4 ring-1 ring-app-border">
      <div className="mb-4 flex items-center justify-between gap-2">
        <h2 className="font-display text-lg font-semibold text-app-text">{monthLabel}</h2>
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Previous month"
            onClick={() => onMonthChange(new Date(year, monthIndex - 1, 1))}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              onMonthChange(new Date());
              onSelectDate(todayKey);
            }}
          >
            Today
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Next month"
            onClick={() => onMonthChange(new Date(year, monthIndex + 1, 1))}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-app-muted">
        {WEEKDAYS.map((day) => (
          <div key={day} className="py-2">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {cells.map((date, index) => {
          if (!date) {
            return <div key={`empty-${index}`} className="min-h-[4.5rem]" />;
          }

          const key = toDateKey(date);
          const dayTasks = tasksByDate[key] ?? [];
          const isSelected = selectedDate === key;
          const isToday = key === todayKey;

          return (
            <button
              key={key}
              type="button"
              onClick={() => onSelectDate(isSelected ? null : key)}
              className={cn(
                "flex min-h-[4.5rem] flex-col items-center rounded-xl border p-2 text-center transition-colors",
                isSelected
                  ? "border-accent/50 bg-accent/10 ring-1 ring-accent/30"
                  : "border-transparent hover:border-app-border hover:bg-white/[0.03]",
                isToday && !isSelected && "ring-1 ring-accent/20",
              )}
            >
              <span
                className={cn(
                  "inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium",
                  isToday ? "bg-accent text-white" : "text-app-text",
                )}
              >
                {date.getDate()}
              </span>
              <div className="mt-1 w-full space-y-0.5 text-left">
                {dayTasks.slice(0, 2).map((task) => (
                  <div
                    key={task.id}
                    className={cn(
                      "truncate rounded px-1 py-0.5 text-[10px] leading-tight",
                      task.status === "completed"
                        ? "bg-emerald-500/15 text-emerald-300 line-through"
                        : "bg-white/[0.06] text-app-text",
                    )}
                  >
                    <span className={cn("mr-1 inline-block h-1.5 w-1.5 rounded-full", priorityDot(task.priority))} />
                    {task.title}
                  </div>
                ))}
                {dayTasks.length > 2 && (
                  <p className="px-1 text-[10px] text-app-muted">+{dayTasks.length - 2} more</p>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export { toDateKey, parseDateKey, monthRange };
