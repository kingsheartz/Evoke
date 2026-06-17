import { BookOpen, Clock, Users } from "lucide-react";
import { DivisionContent, DivisionHero } from "@/components/layout/division-hero";
import { GraduationCap } from "lucide-react";

const programs = [
  { name: "Karate", level: "All ages", icon: Users },
  { name: "Yoga & Wellness", level: "Beginner to Advanced", icon: BookOpen },
  { name: "Swimming", level: "Certified coaches", icon: Clock },
];

export default function AcademyPage() {
  return (
    <>
      <DivisionHero
        badge="Evoke Academy"
        title="Train with the best"
        description="World-class instruction across martial arts, wellness, aquatics, and performing arts — all under one roof."
        icon={GraduationCap}
      />
      <DivisionContent>
        <div className="grid gap-4 sm:grid-cols-3">
          {programs.map((p) => (
            <div
              key={p.name}
              className="rounded-2xl border border-app-border bg-app-surface/80 p-6 ring-1 ring-app-border transition-colors hover:border-accent/25 hover:bg-app-surface"
            >
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10 ring-1 ring-accent/20">
                <p.icon className="h-5 w-5 text-accent-soft" />
              </div>
              <h3 className="font-display font-semibold text-app-text">{p.name}</h3>
              <p className="mt-1 text-sm text-app-muted">{p.level}</p>
            </div>
          ))}
        </div>
        <p className="mt-12 text-center text-sm text-app-muted">
          Full course catalog and enrollment coming soon.
        </p>
      </DivisionContent>
    </>
  );
}
