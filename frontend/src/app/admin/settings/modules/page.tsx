"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { Switch } from "@/components/ui/switch";
import { apiClient, type AdminModule } from "@/lib/api";
import { useNotifications } from "@/lib/notifications";
import { useAuthStore } from "@/stores/app";

export default function ModulesSettingsPage() {
  const token = useAuthStore((s) => s.token);
  const { success, error } = useNotifications();
  const [modules, setModules] = useState<AdminModule[]>([]);
  const [savingId, setSavingId] = useState<number | null>(null);

  useEffect(() => {
    if (!token) return;
    apiClient.getAdminModules(token).then((r) => setModules(r.data));
  }, [token]);

  const toggle = async (mod: AdminModule) => {
    if (!token) return;
    setSavingId(mod.id);
    try {
      const { data } = await apiClient.updateModule(token, mod.id, { is_enabled: !mod.is_enabled });
      setModules((prev) => prev.map((m) => (m.id === data.id ? data : m)));
      success(`${data.name} ${data.is_enabled ? "enabled" : "disabled"}.`);
    } catch {
      error(`Could not update ${mod.name}.`);
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div>
      <PageHeader
        title="Module Settings"
        description="Enable or disable business verticals"
      />
      <Card>
        <CardHeader><CardTitle>Business Modules</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {modules.map((mod) => (
            <div
              key={mod.id}
              className="flex items-center justify-between gap-4 rounded-xl border border-app-border bg-app-surface-muted p-4"
            >
              <div className="min-w-0">
                <p className="font-medium text-app-text">{mod.name}</p>
                <p className="text-sm text-app-muted">{mod.description}</p>
              </div>
              <Switch
                checked={mod.is_enabled}
                disabled={savingId === mod.id}
                onCheckedChange={() => toggle(mod)}
                aria-label={`Toggle ${mod.name}`}
              />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
