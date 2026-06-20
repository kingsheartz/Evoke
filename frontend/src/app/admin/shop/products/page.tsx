"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Pencil, Plus } from "lucide-react";
import { ActionButton } from "@/components/ui/action-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ConfigurableDataTable, TableEmpty, TableLoading } from "@/components/ui/data-table";
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
            <ConfigurableDataTable
              tableId="admin-shop-products"
              inset
              data={products}
              keyField="id"
              searchPlaceholder="Search products…"
              searchText={(product) =>
                [product.name, product.sku, product.price, product.stock, product.is_active ? "active" : "inactive"]
                  .filter(Boolean)
                  .join(" ")
              }
              columns={[
                {
                  key: "name",
                  header: "Name",
                  width: 220,
                  render: (product) => <span className="font-medium">{product.name}</span>,
                },
                {
                  key: "sku",
                  header: "SKU",
                  width: 120,
                  render: (product) => product.sku,
                },
                {
                  key: "price",
                  header: "Price",
                  width: 100,
                  render: (product) => `₹${product.price}`,
                },
                {
                  key: "stock",
                  header: "Stock",
                  width: 80,
                  render: (product) => product.stock,
                },
                {
                  key: "status",
                  header: "Status",
                  width: 120,
                  render: (product) => <StatusBadge status={product.is_active} />,
                },
                {
                  key: "actions",
                  header: "Actions",
                  width: 120,
                  hideable: false,
                  pinnable: false,
                  render: (product) => (
                    <div className="table-actions">
                      <ActionButton asChild variant="outline" size="sm" icon={Pencil}>
                        <Link href={`/admin/shop/products/${product.id}`}>Edit</Link>
                      </ActionButton>
                    </div>
                  ),
                },
              ]}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
