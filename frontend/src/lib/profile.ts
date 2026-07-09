import type { User } from "@/lib/api";

const FIELD_LABELS: Record<string, string> = {
  gender: "gender",
  age: "age",
  blood_group: "blood group",
  learning_mode: "offline/online mode",
};

export function missingProfileFieldsForCourseOrTravel(user: User): string[] {
  const missing: string[] = [];
  if (!user.gender?.trim()) missing.push("gender");
  if (user.age == null || user.age < 1) missing.push("age");
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
