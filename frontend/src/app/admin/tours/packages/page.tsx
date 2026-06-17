"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { apiClient, type TourPackage } from "@/lib/api";
import { useAuthStore } from "@/stores/app";

export default function TourPackagesPage() {
  const token = useAuthStore((s) => s.token);
  const [packages, setPackages] = useState<TourPackage[]>([]);

  useEffect(() => {
    if (!token) return;
    apiClient.getAdminPackages(token).then((r) => setPackages(r.data));
  }, [token]);

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div><h1 className="text-3xl font-bold">Tour Packages</h1><p className="mt-1 text-zinc-500">Manage travel packages and itineraries</p></div>
        <Button asChild><Link href="/admin/tours/packages/new"><Plus className="mr-2 h-4 w-4" />Add Package</Link></Button>
      </div>
      <Card>
        <CardHeader><CardTitle>All Packages</CardTitle></CardHeader>
        <CardContent>
          {packages.length === 0 ? <p className="text-sm text-zinc-500">No packages yet.</p> : (
            <table className="w-full text-left text-sm">
              <thead><tr className="border-b text-zinc-500"><th className="pb-3 pr-4">Title</th><th className="pb-3 pr-4">Destination</th><th className="pb-3 pr-4">Days</th><th className="pb-3 pr-4">Price</th><th className="pb-3">Actions</th></tr></thead>
              <tbody>
                {packages.map((p) => (
                  <tr key={p.id} className="border-b border-zinc-50">
                    <td className="py-3 pr-4 font-medium">{p.title}</td>
                    <td className="py-3 pr-4">{p.destination}</td>
                    <td className="py-3 pr-4">{p.duration_days}</td>
                    <td className="py-3 pr-4">₹{p.price}</td>
                    <td className="py-3"><Link href={`/admin/tours/packages/${p.id}`} className="text-indigo-600 hover:underline">Edit</Link></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
