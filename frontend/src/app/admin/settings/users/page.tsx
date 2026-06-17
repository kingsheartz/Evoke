"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiClient, type AdminUser } from "@/lib/api";
import { useAuthStore } from "@/stores/app";

export default function UsersSettingsPage() {
  const token = useAuthStore((s) => s.token);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [roles, setRoles] = useState<string[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "customer" });

  const load = () => {
    if (!token) return;
    apiClient.getAdminUsers(token).then((r) => setUsers(r.data));
    apiClient.getRoles(token).then((r) => setRoles(r.data));
  };

  useEffect(load, [token]);

  const create = async () => {
    if (!token) return;
    await apiClient.createUser(token, form);
    setShowForm(false);
    setForm({ name: "", email: "", password: "", role: "customer" });
    load();
  };

  const remove = async (id: number) => {
    if (!token || !confirm("Delete this user?")) return;
    await apiClient.deleteUser(token, id);
    load();
  };

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div><h1 className="text-3xl font-bold">User Management</h1><p className="mt-1 text-zinc-500">Manage staff and customer accounts</p></div>
        <Button onClick={() => setShowForm(!showForm)}>{showForm ? "Cancel" : "Add User"}</Button>
      </div>
      {showForm && (
        <Card className="mb-6">
          <CardHeader><CardTitle>New User</CardTitle></CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2"><Label>Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
            <div className="space-y-2"><Label>Email</Label><Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
            <div className="space-y-2"><Label>Password</Label><Input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /></div>
            <div className="space-y-2">
              <Label>Role</Label>
              <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className="flex h-10 w-full rounded-lg border border-zinc-200 px-3 text-sm">
                {roles.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div className="md:col-span-2"><Button onClick={create}>Create User</Button></div>
          </CardContent>
        </Card>
      )}
      <Card>
        <CardHeader><CardTitle>All Users</CardTitle></CardHeader>
        <CardContent>
          <table className="w-full text-left text-sm">
            <thead><tr className="border-b text-zinc-500"><th className="pb-3 pr-4">Name</th><th className="pb-3 pr-4">Email</th><th className="pb-3 pr-4">Role</th><th className="pb-3">Actions</th></tr></thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b border-zinc-50">
                  <td className="py-3 pr-4">{u.name}</td>
                  <td className="py-3 pr-4">{u.email}</td>
                  <td className="py-3 pr-4">{u.roles?.[0]?.name ?? "—"}</td>
                  <td className="py-3"><button type="button" onClick={() => remove(u.id)} className="text-red-600 hover:underline">Delete</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
