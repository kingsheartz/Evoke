"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { apiClient, type AdminModule } from "@/lib/api";
import { useAuthStore } from "@/stores/app";

export default function ModulesSettingsPage() {
  const token = useAuthStore((s) => s.token);
  const [modules, setModules] = useState<AdminModule[]>([]);

  useEffect(() => {
    if (!token) return;
    apiClient.getAdminModules(token).then((r) => setModules(r.data));
  }, [token]);

  const toggle = async (mod: AdminModule) => {
    if (!token) return;
    const { data } = await apiClient.updateModule(token, mod.id, { is_enabled: !mod.is_enabled });
    setModules((prev) => prev.map((m) => (m.id === data.id ? data : m)));
  };

  return (
    <div>
      <h1 className="mb-2 text-3xl font-bold">Module Settings</h1>
      <p className="mb-8 text-zinc-500">Enable or disable business verticals</p>
      <Card>
        <CardHeader><CardTitle>Business Modules</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          {modules.map((mod) => (
            <div key={mod.id} className="flex items-center justify-between rounded-lg border border-zinc-100 p-4">
              <div>
                <p className="font-medium">{mod.name}</p>
                <p className="text-sm text-zinc-500">{mod.description}</p>
              </div>
              <button
                type="button"
                onClick={() => toggle(mod)}
                className={`relative h-6 w-11 rounded-full transition-colors ${mod.is_enabled ? "bg-emerald-500" : "bg-zinc-300"}`}
              >
                <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${mod.is_enabled ? "left-5" : "left-0.5"}`} />
              </button>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
