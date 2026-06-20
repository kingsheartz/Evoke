import { DivisionLandingPage } from "@/components/home/division-landing-page";
import type { OfferingVertical } from "@/lib/offerings";

export async function VerticalDivisionPage({ vertical }: { vertical: OfferingVertical }) {
  return <DivisionLandingPage slug={vertical} />;
}
