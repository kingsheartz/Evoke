"use client";

import { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import { PermissionGate } from "@/components/admin/permission-gate";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable, TableEmpty, TableLoading } from "@/components/ui/data-table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageHeader } from "@/components/ui/page-header";
import { Select } from "@/components/ui/select";
import { StatusBadge } from "@/components/ui/status-badge";
import { Switch } from "@/components/ui/switch";
import { apiClient, type ShopCoupon } from "@/lib/api";
import { useNotifications } from "@/lib/notifications";
import { useAuthStore } from "@/stores/app";

const emptyForm = {
  code: "",
  type: "percentage" as "percentage" | "fixed",
  value: "",
  is_active: true,
};

export default function ShopCouponsAdminPage() {
  const token = useAuthStore((s) => s.token);
  const { success, error: notifyError } = useNotifications();
  const [coupons, setCoupons] = useState<ShopCoupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const load = () => {
    if (!token) return;
    setLoading(true);
    apiClient
      .getAdminCoupons(token)
      .then((response) => setCoupons(response.data ?? []))
      .catch(() => notifyError("Could not load coupons."))
      .finally(() => setLoading(false));
  };

  useEffect(load, [token]);

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !form.code.trim() || !form.value) return;
    setCreating(true);
    try {
      await apiClient.createCoupon(token, {
        code: form.code.trim(),
        type: form.type,
        value: Number(form.value),
        is_active: form.is_active,
      });
      success("Coupon created.");
      setForm(emptyForm);
      load();
    } catch (err) {
      notifyError(err instanceof Error ? err.message : "Could not create coupon.");
    } finally {
      setCreating(false);
    }
  };

  const remove = async (coupon: ShopCoupon) => {
    if (!token) return;
    if (!window.confirm(`Delete coupon "${coupon.code}"?`)) return;
    try {
      await apiClient.deleteCoupon(token, coupon.id);
      success("Coupon deleted.");
      load();
    } catch (err) {
      notifyError(err instanceof Error ? err.message : "Delete failed.");
    }
  };

  return (
    <PermissionGate permission="shop.coupons.manage">
      <div className="app-page">
        <PageHeader title="Coupons" description="Create and manage shop discount codes" />
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Create coupon</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={create} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5 lg:items-end">
              <div className="space-y-2">
                <Label htmlFor="coupon-code">Code</Label>
                <Input
                  id="coupon-code"
                  value={form.code}
                  onChange={(e) => setForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))}
                  placeholder="SAVE10"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="coupon-type">Type</Label>
                <Select
                  id="coupon-type"
                  value={form.type}
                  onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as "percentage" | "fixed" }))}
                >
                  <option value="percentage">Percentage</option>
                  <option value="fixed">Fixed amount</option>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="coupon-value">Value</Label>
                <Input
                  id="coupon-value"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.value}
                  onChange={(e) => setForm((f) => ({ ...f, value: e.target.value }))}
                  placeholder={form.type === "percentage" ? "10" : "500"}
                  required
                />
              </div>
              <div className="flex items-center gap-3 pb-1">
                <Switch
                  checked={form.is_active}
                  onCheckedChange={(is_active) => setForm((f) => ({ ...f, is_active }))}
                  aria-label="Active"
                />
                <Label>Active</Label>
              </div>
              <Button type="submit" disabled={creating}>
                {creating ? "Creating…" : "Create coupon"}
              </Button>
            </form>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>All coupons</CardTitle>
          </CardHeader>
          <CardContent flush>
            {loading ? (
              <TableLoading inset />
            ) : coupons.length === 0 ? (
              <TableEmpty inset message="No coupons yet." />
            ) : (
              <DataTable inset>
                <thead>
                  <tr>
                    <th>Code</th>
                    <th>Type</th>
                    <th>Value</th>
                    <th>Used</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {coupons.map((coupon) => (
                    <tr key={coupon.id}>
                      <td className="font-mono text-xs">{coupon.code}</td>
                      <td className="capitalize">{coupon.type}</td>
                      <td>{coupon.type === "percentage" ? `${coupon.value}%` : `₹${coupon.value}`}</td>
                      <td>
                        {coupon.used_count ?? 0}
                        {coupon.usage_limit != null ? ` / ${coupon.usage_limit}` : ""}
                      </td>
                      <td><StatusBadge status={coupon.is_active ? "active" : "inactive"} /></td>
                      <td>
                        <Button type="button" size="sm" variant="outline" onClick={() => remove(coupon)}>
                          <Trash2 className="h-4 w-4" />
                          Delete
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </DataTable>
            )}
          </CardContent>
        </Card>
      </div>
    </PermissionGate>
  );
}
