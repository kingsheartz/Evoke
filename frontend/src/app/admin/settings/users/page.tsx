"use client";

import { useCallback, useEffect, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Eye,
  Search,
  Trash2,
  UserPlus,
  Users,
} from "lucide-react";
import { UserAvatar, UserDetailPanel } from "@/components/admin/user-detail-panel";
import { ActionButton } from "@/components/ui/action-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable, TableEmpty } from "@/components/ui/data-table";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { PageHeader } from "@/components/ui/page-header";
import { apiClient, type AdminUser, type UserListParams, type UserListStats } from "@/lib/api";
import { formatRole } from "@/lib/status-labels";
import { useNotifications } from "@/lib/notifications";
import { useAuthStore } from "@/stores/app";
import { cn } from "@/lib/utils";

type SortField = NonNullable<UserListParams["sort"]>;
type SortDir = NonNullable<UserListParams["dir"]>;

function formatDate(value?: string) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

function SortHeader({
  label,
  field,
  current,
  dir,
  onSort,
}: {
  label: string;
  field: SortField;
  current: SortField;
  dir: SortDir;
  onSort: (field: SortField) => void;
}) {
  const active = current === field;
  const Icon = active ? (dir === "asc" ? ArrowUp : ArrowDown) : ArrowUpDown;
  return (
    <button
      type="button"
      onClick={() => onSort(field)}
      className={cn("inline-flex items-center gap-1 hover:text-app-text", active && "text-accent-soft")}
    >
      {label}
      <Icon className="h-3.5 w-3.5" />
    </button>
  );
}

export default function UsersSettingsPage() {
  const token = useAuthStore((s) => s.token);
  const { success, error } = useNotifications();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [roles, setRoles] = useState<string[]>([]);
  const [stats, setStats] = useState<UserListStats | null>(null);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [sort, setSort] = useState<SortField>("created_at");
  const [dir, setDir] = useState<SortDir>("desc");
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);
  const [panelMode, setPanelMode] = useState<"view" | "create">("view");
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const r = await apiClient.getAdminUsers(token, {
        search: search || undefined,
        role: roleFilter || undefined,
        sort,
        dir,
        page,
        per_page: 15,
      });
      setUsers(r.data);
      setLastPage(r.last_page);
      setTotal(r.total);
      if (r.stats) setStats(r.stats);
    } catch (e) {
      error(e instanceof Error ? e.message : "Could not load users.");
    } finally {
      setLoading(false);
    }
  }, [token, search, roleFilter, sort, dir, page, error]);

  useEffect(() => {
    if (!token) return;
    apiClient.getRoles(token).then((r) => setRoles(r.data));
  }, [token]);

  useEffect(() => {
    const t = window.setTimeout(load, search ? 300 : 0);
    return () => window.clearTimeout(t);
  }, [load, search]);

  const toggleSort = (field: SortField) => {
    if (sort === field) {
      setDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSort(field);
      setDir("asc");
    }
    setPage(1);
  };

  const openCreate = () => {
    setPanelMode("create");
    setSelectedUserId(null);
    setPanelOpen(true);
  };

  const openView = (user: AdminUser) => {
    setPanelMode("view");
    setSelectedUserId(user.id);
    setPanelOpen(true);
  };

  const remove = async (id: number, name: string) => {
    if (!token || !confirm(`Delete ${name}?`)) return;
    try {
      await apiClient.deleteUser(token, id);
      if (selectedUserId === id) setPanelOpen(false);
      load();
      success("User deleted.");
    } catch (e) {
      error(e instanceof Error ? e.message : "Could not delete user.");
    }
  };

  return (
    <div className="app-page">
      <PageHeader
        title="User Management"
        description="View full profiles, photos, and manage staff and customer accounts"
        actions={
          <ActionButton icon={UserPlus} data-admin-new="true" onClick={openCreate}>
            Add User
          </ActionButton>
        }
      />

      {stats && (
        <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="flex items-center gap-3 p-4">
              <Users className="h-8 w-8 text-accent-soft" />
              <div>
                <p className="text-2xl font-semibold text-app-text">{stats.total}</p>
                <p className="text-xs text-app-muted">Total users</p>
              </div>
            </CardContent>
          </Card>
          {Object.entries(stats.by_role).slice(0, 3).map(([role, count]) => (
            <Card key={role}>
              <CardContent className="p-4">
                <p className="text-2xl font-semibold text-app-text">{count}</p>
                <p className="text-xs text-app-muted">{formatRole(role)}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle>All Users ({total})</CardTitle>
            <div className="flex flex-wrap gap-2">
              <div className="relative min-w-[200px] flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-app-muted" />
                <Input
                  data-admin-search="true"
                  className="pl-9"
                  placeholder="Search name, email, phone…"
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                />
              </div>
              <Select
                value={roleFilter}
                onChange={(e) => {
                  setRoleFilter(e.target.value);
                  setPage(1);
                }}
                className="w-40"
              >
                <option value="">All roles</option>
                {roles.map((r) => (
                  <option key={r} value={r}>{formatRole(r)}</option>
                ))}
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent flush>
          {loading && users.length === 0 ? (
            <TableEmpty inset message="Loading users…" />
          ) : users.length === 0 ? (
            <TableEmpty inset message="No users match your filters." />
          ) : (
            <>
              <DataTable inset>
                <thead>
                  <tr>
                    <th className="w-12">Photo</th>
                    <th><SortHeader label="Name" field="name" current={sort} dir={dir} onSort={toggleSort} /></th>
                    <th><SortHeader label="Email" field="email" current={sort} dir={dir} onSort={toggleSort} /></th>
                    <th>Phone</th>
                    <th>Role</th>
                    <th>Branch</th>
                    <th><SortHeader label="Joined" field="created_at" current={sort} dir={dir} onSort={toggleSort} /></th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr
                      key={u.id}
                      className={cn(selectedUserId === u.id && panelOpen && "bg-accent/5")}
                    >
                      <td>
                        <button type="button" onClick={() => openView(u)} className="rounded-full">
                          <UserAvatar user={u} size="sm" />
                        </button>
                      </td>
                      <td>
                        <button
                          type="button"
                          onClick={() => openView(u)}
                          className="font-medium text-app-text hover:text-accent-soft"
                        >
                          {u.name}
                        </button>
                      </td>
                      <td className="text-app-muted">{u.email}</td>
                      <td className="text-app-muted">{u.phone || "—"}</td>
                      <td>{u.roles?.[0]?.name ? formatRole(u.roles[0].name) : "—"}</td>
                      <td className="text-app-muted">{u.branch?.name ?? "—"}</td>
                      <td className="text-xs text-app-muted">{formatDate(u.created_at)}</td>
                      <td>
                        <div className="flex gap-1">
                          <ActionButton variant="outline" size="sm" icon={Eye} onClick={() => openView(u)}>
                            View
                          </ActionButton>
                          <ActionButton variant="outline" size="sm" icon={Trash2} onClick={() => remove(u.id, u.name)}>
                            Delete
                          </ActionButton>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </DataTable>
              {lastPage > 1 && (
                <div className="flex items-center justify-between border-t border-app-border px-4 py-3">
                  <p className="text-xs text-app-muted">Page {page} of {lastPage}</p>
                  <div className="flex gap-2">
                    <ActionButton variant="outline" size="sm" icon={ChevronLeft} disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                      Prev
                    </ActionButton>
                    <ActionButton variant="outline" size="sm" icon={ChevronRight} disabled={page >= lastPage} onClick={() => setPage((p) => p + 1)}>
                      Next
                    </ActionButton>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <UserDetailPanel
        open={panelOpen}
        mode={panelMode}
        userId={selectedUserId}
        token={token}
        roles={roles}
        onClose={() => setPanelOpen(false)}
        onSaved={load}
      />
    </div>
  );
}
