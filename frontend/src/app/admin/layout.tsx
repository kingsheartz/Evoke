import { AdminAuthGuard } from "@/components/admin/admin-auth-guard";
import { AdminHeader } from "@/components/admin/admin-header";
import { AdminScrollLock } from "@/components/admin/admin-scroll-lock";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AdminContent } from "@/components/layout/app-shell";

export const metadata = {
  title: "Admin",
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminAuthGuard>
      <AdminScrollLock />
      <div className="admin-shell" data-admin-layout="fixed-sidebar-v2">
        <AdminSidebar />
        <div className="admin-main-column">
          <AdminHeader />
          <main className="admin-main">
            <AdminContent>{children}</AdminContent>
          </main>
        </div>
      </div>
    </AdminAuthGuard>
  );
}
