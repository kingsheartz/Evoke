import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { PageContainer } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const labels: Record<string, { title: string; description: string }> = {
  order: {
    title: "Order placed",
    description: "Thank you. We will process your order and keep you updated.",
  },
  booking: {
    title: "Booking received",
    description: "Your tour booking request has been submitted. Our team will confirm shortly.",
  },
  enrollment: {
    title: "Enrollment submitted",
    description: "Your course enrollment has been received. Check your account for status updates.",
  },
  enquiry: {
    title: "Enquiry sent",
    description: "Thanks for reaching out. A travel specialist will contact you soon.",
  },
};

export default async function ConfirmationPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; ref?: string }>;
}) {
  const params = await searchParams;
  const type = params.type ?? "order";
  const ref = params.ref;
  const copy = labels[type] ?? labels.order;

  return (
    <PageContainer className="py-20">
      <Card className="mx-auto max-w-lg">
        <CardContent className="flex flex-col items-center gap-4 px-8 py-12 text-center">
          <CheckCircle2 className="h-14 w-14 text-status-success" />
          <h1 className="font-display text-3xl font-semibold text-app-text">{copy.title}</h1>
          <p className="text-app-muted">{copy.description}</p>
          {ref && (
            <p className="rounded-lg bg-app-surface-muted/40 px-4 py-2 font-mono text-sm text-app-text">
              Reference: {ref}
            </p>
          )}
          <div className="mt-4 flex flex-wrap justify-center gap-3">
            <Button asChild>
              <Link href="/account">View account</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/">Back home</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </PageContainer>
  );
}
