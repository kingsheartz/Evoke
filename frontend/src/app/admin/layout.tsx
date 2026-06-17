import { AdminAuthGuard } from "@/components/admin/admin-auth-guard";
import { AdminSidebar } from "@/components/admin/admin-sidebar";

export const metadata = {
  title: "Admin",
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminAuthGuard>
      <div className="flex min-h-screen bg-zinc-50">
        <AdminSidebar />
        <div className="flex-1 overflow-auto">
          <div className="mx-auto max-w-6xl p-8">{children}</div>
        </div>
      </div>
    </AdminAuthGuard>
  );
}
