import { Suspense } from "react";
import NewsletterUnsubscribePage from "./page-client";

export default function Page() {
  return (
    <Suspense fallback={<div className="py-16 text-center text-sm text-app-muted">Loading…</div>}>
      <NewsletterUnsubscribePage />
    </Suspense>
  );
}
