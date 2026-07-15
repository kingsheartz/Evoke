import { Suspense } from "react";
import { cookies } from "next/headers";
import { DefaultHome } from "@/components/home/default-home";
import { ImmersiveHome } from "@/components/home/immersive/immersive-home";
import { MotionHome } from "@/components/home/motion/motion-home";
import { HomeVariantSwitcher } from "@/components/home/home-variant-switcher";
import { apiClient } from "@/lib/api";
import { defaultHomepageFallback } from "@/lib/homepage-defaults";
import { parseHomepageMeta } from "@/lib/homepage-meta";
import {
  HOME_VARIANT_COOKIE,
  homeVariantSwitchEnabled,
  resolveHomeVariant,
  type HomeVariant,
} from "@/lib/home-variant";
import type { HomepageData } from "@/lib/api";

/** Keep CMS waits short — never block the home shell on a slow / dead API. */
const HOMEPAGE_FETCH_MS = 2500;

async function loadHomepage(): Promise<HomepageData> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), HOMEPAGE_FETCH_MS);
  try {
    const response = await Promise.race([
      apiClient.getHomepage({ signal: controller.signal }),
      new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error("Homepage request timed out")), HOMEPAGE_FETCH_MS);
      }),
    ]);
    return response.data ?? defaultHomepageFallback;
  } catch {
    return defaultHomepageFallback;
  } finally {
    clearTimeout(timer);
  }
}

function HomeView({
  variant,
  homepage,
}: {
  variant: HomeVariant;
  homepage: HomepageData;
}) {
  const meta = parseHomepageMeta(homepage.meta);
  if (variant === "motion") return <MotionHome homepage={homepage} meta={meta} />;
  if (variant === "immersive") return <ImmersiveHome homepage={homepage} meta={meta} />;
  return <DefaultHome homepage={homepage} meta={meta} />;
}

async function HomeWithCms({ variant }: { variant: HomeVariant }) {
  const homepage = await loadHomepage();
  return <HomeView variant={variant} homepage={homepage} />;
}

export default async function HomePage() {
  const cookieStore = await cookies();
  const variant = resolveHomeVariant(cookieStore.get(HOME_VARIANT_COOKIE)?.value);
  const showSwitcher = homeVariantSwitchEnabled();

  // Return immediately so `(site)/loading.tsx` does not sit on "Loading page…"
  // while `/homepage` waits. CMS is streamed behind the fallback shell.
  return (
    <>
      <Suspense fallback={<HomeView variant={variant} homepage={defaultHomepageFallback} />}>
        <HomeWithCms variant={variant} />
      </Suspense>
      <HomeVariantSwitcher current={variant} enabled={showSwitcher} />
    </>
  );
}
