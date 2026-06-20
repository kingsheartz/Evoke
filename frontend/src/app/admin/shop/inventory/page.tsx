"use client";

import { useEffect, useState } from "react";
import { PermissionGate } from "@/components/admin/permission-gate";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable, TableEmpty, TableLoading } from "@/components/ui/data-table";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/page-header";
import { apiClient, type Product } from "@/lib/api";
import { useNotifications } from "@/lib/notifications";
import { useAuthStore } from "@/stores/app";

export default function ShopInventoryAdminPage() {
  const token = useAuthStore((s) => s.token);
  const { success, error: notifyError } = useNotifications();
  const [products, setProducts] = useState<Product[]>([]);
  const [threshold, setThreshold] = useState(5);
  const [loading, setLoading] = useState(true);
  const [draftStock, setDraftStock] = useState<Record<number, string>>({});
  const [savingId, setSavingId] = useState<number | null>(null);

  const load = () => {
    if (!token) return;
    setLoading(true);
    apiClient
      .getAdminInventory(token)
      .then((response) => {
        const items = response.data?.products?.data ?? [];
        setProducts(items);
        setThreshold(response.data?.threshold ?? 5);
        setDraftStock(Object.fromEntries(items.map((p) => [p.id, String(p.stock)])));
      })
      .catch(() => notifyError("Could not load inventory."))
      .finally(() => setLoading(false));
  };

  useEffect(load, [token]);

  const adjust = async (product: Product) => {
    if (!token) return;
    const stock = Number(draftStock[product.id]);
    if (Number.isNaN(stock) || stock < 0) {
      notifyError("Enter a valid stock quantity.");
      return;
    }
    setSavingId(product.id);
    try {
      await apiClient.adjustProductStock(token, product.id, stock);
      success(`${product.name} stock updated.`);
      load();
    } catch (e) {
      notifyError(e instanceof Error ? e.message : "Stock update failed.");
    } finally {
      setSavingId(null);
    }
  };

  return (
    <PermissionGate permission="shop.inventory.manage">
      <div className="app-page">
        <PageHeader
          title="Inventory"
          description={`Low-stock products at or below ${threshold} units`}
        />
        <Card>
          <CardHeader>
            <CardTitle>Low stock products</CardTitle>
          </CardHeader>
          <CardContent flush>
            {loading ? (
              <TableLoading inset />
            ) : products.length === 0 ? (
              <TableEmpty inset message="No low-stock products." />
            ) : (
              <DataTable inset>
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>SKU</th>
                    <th>Category</th>
                    <th>Current stock</th>
                    <th>Adjust stock</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr key={product.id}>
                      <td className="font-medium">{product.name}</td>
                      <td>{product.sku}</td>
                      <td>{product.category?.name ?? "—"}</td>
                      <td>{product.stock}</td>
                      <td>
                        <Input
                          type="number"
                          min="0"
                          value={draftStock[product.id] ?? String(product.stock)}
                          onChange={(e) =>
                            setDraftStock((prev) => ({ ...prev, [product.id]: e.target.value }))
                          }
                          className="w-24"
                        />
                      </td>
                      <td>
                        <Button
                          type="button"
                          size="sm"
                          disabled={savingId === product.id}
                          onClick={() => adjust(product)}
                        >
                          {savingId === product.id ? "Saving…" : "Save"}
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
