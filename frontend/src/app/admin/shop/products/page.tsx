"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Pencil, Plus } from "lucide-react";
import { ActionButton } from "@/components/ui/action-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable, TableEmpty, TableLoading } from "@/components/ui/data-table";
import { PageHeader } from "@/components/ui/page-header";
import { StatusBadge } from "@/components/ui/status-badge";
import { apiClient, type Product } from "@/lib/api";
import { useAuthStore } from "@/stores/app";

export default function ShopProductsPage() {
  const token = useAuthStore((s) => s.token);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    apiClient.getAdminProducts(token).then((r) => setProducts(r.data)).finally(() => setLoading(false));
  }, [token]);

  return (
    <div className="app-page">
      <PageHeader
        title="Products"
        description="Manage sports shop inventory"
        actions={
          <ActionButton asChild icon={Plus}>
            <Link href="/admin/shop/products/new">Add Product</Link>
          </ActionButton>
        }
      />
      <Card>
        <CardHeader><CardTitle>All Products</CardTitle></CardHeader>
        <CardContent flush>
          {loading ? (
            <TableLoading inset />
          ) : products.length === 0 ? (
            <TableEmpty inset message="No products yet. Add your first product." />
          ) : (
            <DataTable inset>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>SKU</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id}>
                    <td className="font-medium">{p.name}</td>
                    <td>{p.sku}</td>
                    <td>₹{p.price}</td>
                    <td>{p.stock}</td>
                    <td><StatusBadge status={p.is_active} /></td>
                    <td>
                      <ActionButton asChild variant="outline" size="sm" icon={Pencil}>
                        <Link href={`/admin/shop/products/${p.id}`}>Edit</Link>
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
