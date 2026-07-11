import type { User } from "@/lib/api";

const FIELD_LABELS: Record<string, string> = {
  gender: "gender",
  date_of_birth: "date of birth",
  blood_group: "blood group",
  learning_mode: "offline/online mode",
};

export function missingProfileFieldsForCourseOrTravel(user: User): string[] {
  const missing: string[] = [];
  if (!user.gender?.trim()) missing.push("gender");
  if (!user.date_of_birth?.trim()) missing.push("date_of_birth");
  if (!user.blood_group?.trim()) missing.push("blood_group");
  if (!user.learning_mode) missing.push("learning_mode");
  return missing;
}

export function isProfileCompleteForCourseOrTravel(user: User): boolean {
  return missingProfileFieldsForCourseOrTravel(user).length === 0;
}

export function profileCompletionMessage(user: User): string | null {
  const missing = missingProfileFieldsForCourseOrTravel(user);
  if (missing.length === 0) return null;
  const labels = missing.map((key) => FIELD_LABELS[key] ?? key);
  return `Complete your profile (${labels.join(", ")}) before enrolling or booking travel.`;
}

export function formatDateOfBirth(value?: string | null): string {
  if (!value) return "—";
  const date = new Date(`${value.slice(0, 10)}T12:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

export function ageFromDateOfBirth(value?: string | null): number | null {
  if (!value) return null;
  const born = new Date(`${value.slice(0, 10)}T12:00:00`);
  if (Number.isNaN(born.getTime())) return null;
  const today = new Date();
  let age = today.getFullYear() - born.getFullYear();
  const monthDiff = today.getMonth() - born.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < born.getDate())) {
    age -= 1;
  }
  return age;
}
