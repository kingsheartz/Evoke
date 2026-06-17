import { AdminAuthGuard } from "@/components/admin/admin-auth-guard";
import { AdminHeader } from "@/components/admin/admin-header";
import { AdminSidebar } from "@/components/admin/admin-sidebar";

export const metadata = {
  title: "Admin",
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminAuthGuard>
      <div className="flex min-h-screen bg-app-bg">
        <AdminSidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <AdminHeader />
          <main className="relative flex-1 overflow-auto">
            <div className="mx-auto max-w-6xl p-8">{children}</div>
          </main>
        </div>
      </div>
    </AdminAuthGuard>
  );
}
