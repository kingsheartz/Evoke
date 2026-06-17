import { Package, Shirt, Dumbbell } from "lucide-react";
import { DivisionContent, DivisionHero } from "@/components/layout/division-hero";
import { ShoppingBag } from "lucide-react";

const categories = [
  { name: "Equipment", desc: "Professional-grade gear for every sport", icon: Dumbbell },
  { name: "Apparel", desc: "Performance wear and team kits", icon: Shirt },
  { name: "Accessories", desc: "Bags, bottles, guards, and more", icon: Package },
];

export default function ShopPage() {
  return (
    <>
      <DivisionHero
        badge="Sports Shop"
        title="Gear up to perform"
        description="Curated equipment, apparel, and fitness accessories — quality-tested and ready to ship."
        icon={ShoppingBag}
      />
      <DivisionContent>
        <div className="grid gap-4 sm:grid-cols-3">
          {categories.map((c) => (
            <div
              key={c.name}
              className="rounded-2xl border border-app-border bg-app-surface/80 p-6 ring-1 ring-app-border transition-colors hover:border-accent/25 hover:bg-app-surface"
            >
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 ring-1 ring-emerald-500/20">
                <c.icon className="h-5 w-5 text-emerald-400" />
              </div>
              <h3 className="font-display font-semibold text-app-text">{c.name}</h3>
              <p className="mt-1 text-sm text-app-muted">{c.desc}</p>
            </div>
          ))}
        </div>
        <p className="mt-12 text-center text-sm text-app-muted">
          Online storefront launching soon.
        </p>
      </DivisionContent>
    </>
  );
}
