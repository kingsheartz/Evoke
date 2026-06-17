import { Compass, Globe, Mountain } from "lucide-react";
import { DivisionContent, DivisionHero } from "@/components/layout/division-hero";
import { Plane } from "lucide-react";

const packages = [
  { name: "Domestic Escapes", desc: "Weekend getaways and cultural tours across India", icon: Compass },
  { name: "International", desc: "Curated global destinations with premium stays", icon: Globe },
  { name: "Adventure", desc: "Trekking, diving, and adrenaline experiences", icon: Mountain },
];

export default function ToursPage() {
  return (
    <>
      <DivisionHero
        badge="Tours & Travels"
        title="Journeys worth remembering"
        description="From serene domestic retreats to international adventures — every trip crafted with care."
        icon={Plane}
      />
      <DivisionContent>
        <div className="grid gap-4 sm:grid-cols-3">
          {packages.map((p) => (
            <div
              key={p.name}
              className="rounded-2xl border border-app-border bg-app-surface/80 p-6 ring-1 ring-app-border transition-colors hover:border-accent/25 hover:bg-app-surface"
            >
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500/10 ring-1 ring-orange-500/20">
                <p.icon className="h-5 w-5 text-orange-400" />
              </div>
              <h3 className="font-display font-semibold text-app-text">{p.name}</h3>
              <p className="mt-1 text-sm text-app-muted">{p.desc}</p>
            </div>
          ))}
        </div>
        <p className="mt-12 text-center text-sm text-app-muted">
          Package booking portal coming soon.
        </p>
      </DivisionContent>
    </>
  );
}
