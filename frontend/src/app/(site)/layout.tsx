import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteChromeMarker } from "@/components/layout/site-chrome-marker";
import { SiteChromeSpacer } from "@/components/layout/site-chrome-spacer";
import { SiteScrollExtras } from "@/components/navigation/site-scroll-extras";
import { SiteAdBanner } from "@/components/site/site-ad-banner";
import { SiteAdFloatingRails } from "@/components/site/site-ad-floating-rails";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-screen flex-col overflow-x-clip bg-app-bg">
      <SiteChromeMarker />
      <SiteHeader />
      <SiteChromeSpacer />
      <SiteAdFloatingRails />
      <main className="relative flex-1">{children}</main>
      <div className="app-shell-x pb-4 pt-2">
        <SiteAdBanner placement="footer" />
      </div>
      <SiteFooter />
      <SiteScrollExtras />
    </div>
  );
}