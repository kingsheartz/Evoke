import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteAdBanner } from "@/components/site/site-ad-banner";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-app-bg">
      <SiteHeader />
      <SiteAdBanner placement="site_header" />
      <main className="relative flex-1">{children}</main>
      <div className="app-shell-x pb-4">
        <SiteAdBanner placement="footer" />
      </div>
      <SiteFooter />
    </div>
  );
}