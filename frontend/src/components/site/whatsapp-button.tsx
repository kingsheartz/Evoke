"use client";

import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { buildWhatsAppUrl } from "@/lib/contact";
import { cn } from "@/lib/utils";

export function WhatsAppButton({
  phone,
  message,
  label = "WhatsApp",
  className,
  variant = "outline",
  size = "default",
}: {
  phone: string;
  message?: string;
  label?: string;
  className?: string;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg";
}) {
  const href = buildWhatsAppUrl(phone, message);

  return (
    <Button
      asChild
      variant={variant}
      size={size}
      className={cn("gap-2", className)}
    >
      <a href={href} target="_blank" rel="noopener noreferrer">
        <MessageCircle className="h-4 w-4 text-emerald-400" />
        {label}
      </a>
    </Button>
  );
}
