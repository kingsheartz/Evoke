import { SiteHeader } from "@/components/layout/site-header";
import { PageIllustration } from "@/components/layout/page-illustration";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-app-bg">
      <PageIllustration />
      <SiteHeader />
      <main className="relative flex-1">{children}</main>
    </div>
  );
}
