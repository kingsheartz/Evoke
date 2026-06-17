import { PageHeader } from "@/components/ui/page-header";

export function ComingSoonPage({ title }: { title: string }) {
  return (
    <div className="app-page">
      <PageHeader title={title} description="This section is coming soon." />
    </div>
  );
}
