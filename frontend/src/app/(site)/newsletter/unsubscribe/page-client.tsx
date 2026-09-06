"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { PageContainer } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { apiClient } from "@/lib/api";

export default function NewsletterUnsubscribePage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("This unsubscribe link is missing a token.");
    }
  }, [token]);

  const unsubscribe = async () => {
    if (!token) return;
    setStatus("loading");
    try {
      const response = await apiClient.unsubscribeNewsletter(token);
      setMessage(response.message);
      setStatus("success");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Could not unsubscribe.");
      setStatus("error");
    }
  };

  return (
    <PageContainer className="py-16">
      <Card className="mx-auto max-w-lg">
        <CardHeader>
          <CardTitle>Newsletter unsubscribe</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {status === "idle" && token ? (
            <>
              <p className="text-sm text-app-muted">
                Click below to stop receiving newsletter updates from us.
              </p>
              <Button onClick={unsubscribe}>Unsubscribe</Button>
            </>
          ) : null}

          {status === "loading" ? (
            <div className="flex items-center gap-2 text-sm text-app-muted">
              <Loader2 className="h-4 w-4 animate-spin" />
              Processing…
            </div>
          ) : null}

          {(status === "success" || status === "error") && (
            <p className={`text-sm ${status === "success" ? "text-app-text" : "text-destructive"}`}>{message}</p>
          )}

          <Button variant="outline" asChild>
            <Link href="/">Back to home</Link>
          </Button>
        </CardContent>
      </Card>
    </PageContainer>
  );
}
