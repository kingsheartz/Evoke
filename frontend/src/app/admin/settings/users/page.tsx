"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, UserPlus } from "lucide-react";
import { ActionButton } from "@/components/ui/action-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable, TableEmpty } from "@/components/ui/data-table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageHeader } from "@/components/ui/page-header";
import { Select } from "@/components/ui/select";
import { apiClient, type AdminUser } from "@/lib/api";
import { formatRole } from "@/lib/status-labels";
import { useNotifications } from "@/lib/notifications";
import { useAuthStore } from "@/stores/app";

export default function UsersSettingsPage() {
  const token = useAuthStore((s) => s.token);
  const { success, error } = useNotifications();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [roles, setRoles] = useState<string[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "customer" });

  const load = () => {
    if (!token) return;
    apiClient.getAdminUsers(token).then((r) => setUsers(r.data));
    apiClient.getRoles(token).then((r) => setRoles(r.data));
  };

  useEffect(load, [token]);

  const create = async () => {
    if (!token) return;
    setSaving(true);
    try {
      await apiClient.createUser(token, form);
      setShowForm(false);
      setForm({ name: "", email: "", password: "", role: "customer" });
      load();
      success("User created successfully.");
    } catch (e) {
      error(e instanceof Error ? e.message : "Could not create user.");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: number, name: string) => {
    if (!token || !confirm(`Delete ${name}?`)) return;
    try {
      await apiClient.deleteUser(token, id);
      load();
      success("User deleted.");
    } catch (e) {
      error(e instanceof Error ? e.message : "Could not delete user.");
    }
  };

  return (
    <div>
      <PageHeader
        title="User Management"
        description="Manage staff and customer accounts"
        actions={
          <ActionButton
            icon={showForm ? undefined : UserPlus}
            variant={showForm ? "outline" : "default"}
            onClick={() => setShowForm(!showForm)}
          >
            {showForm ? "Cancel" : "Add User"}
          </ActionButton>
        }
      />
      {showForm && (
        <Card className="mb-6">
          <CardHeader><CardTitle>New User</CardTitle></CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2"><Label>Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
            <div className="space-y-2"><Label>Email</Label><Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
            <div className="space-y-2"><Label>Password</Label><Input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /></div>
            <div className="space-y-2">
              <Label>Role</Label>
              <Select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                {roles.map((r) => (
                  <option key={r} value={r}>{formatRole(r)}</option>
                ))}
              </Select>
            </div>
            <div className="md:col-span-2">
              <ActionButton icon={Plus} loading={saving} onClick={create}>Create User</ActionButton>
            </div>
          </CardContent>
        </Card>
      )}
      <Card>
        <CardHeader><CardTitle>All Users</CardTitle></CardHeader>
        <CardContent>
          {users.length === 0 ? (
            <TableEmpty message="No users found." />
          ) : (
            <DataTable>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id}>
                    <td className="font-medium">{u.name}</td>
                    <td>{u.email}</td>
                    <td>{u.roles?.[0]?.name ? formatRole(u.roles[0].name) : "—"}</td>
                    <td>
                      <ActionButton
                        variant="outline"
                        size="sm"
                        icon={Trash2}
                        onClick={() => remove(u.id, u.name)}
                      >
                        Delete
                      </ActionButton>
                    </td>
                  </tr>
                ))}
              </tbody>
            </DataTable>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
