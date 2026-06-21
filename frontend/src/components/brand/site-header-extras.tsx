"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { HeaderIconDisplay } from "@/components/brand/header-icon-display";
import { FormattedText } from "@/components/ui/formatted-text";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { BrandHeaderConfig, HeaderComponent, HeaderComponentVisibility } from "@/lib/header-config";
import { resolveComponentIcon, resolveSocialIcon } from "@/lib/header-icons";
import { textFormatClassName, type TextFormat } from "@/lib/text-format";
import { cn } from "@/lib/utils";

const ANNOUNCEMENT_DISMISS_KEY = "evoke-header-announcement-dismissed";

function visibilityClass(visibility: HeaderComponentVisibility, preview?: "mobile" | "desktop"): string {
  if (preview === "mobile") return visibility === "desktop" ? "hidden" : "flex";
  if (preview === "desktop") return visibility === "mobile" ? "hidden" : "flex";
  if (visibility === "desktop") return "hidden md:flex";
  if (visibility === "mobile") return "flex md:hidden";
  return "flex";
}

function IconLabel({
  iconId,
  label,
  preview,
  format,
}: {
  iconId: string | null;
  label: string;
  preview?: "mobile" | "desktop";
  format?: TextFormat;
}) {
  return (
    <>
      {iconId ? <HeaderIconDisplay id={iconId} className="h-4 w-4 shrink-0" /> : null}
      <FormattedText
        text={label}
        format={format}
        as="span"
        className={cn(preview === "mobile" && "hidden", preview === "desktop" && "inline", !preview && "hidden lg:inline")}
      />
    </>
  );
}

function previewDividerClass(preview?: "mobile" | "desktop") {
  if (preview === "mobile") return "hidden";
  if (preview === "desktop") return "block";
  return "hidden md:block";
}

function previewSearchWidthClass(preview?: "mobile" | "desktop") {
  if (preview === "mobile") return "w-28";
  if (preview === "desktop") return "w-44";
  return "w-36 lg:w-44";
}

function HeaderComponentItem({
  component,
  preview,
}: {
  component: HeaderComponent;
  preview?: "mobile" | "desktop";
}) {
  if (!component.enabled) return null;

  const iconId = resolveComponentIcon(component);

  const wrap = (child: ReactNode) => (
    <div className={cn("site-header-extra shrink-0 items-center", visibilityClass(component.visibility, preview))}>
      {child}
    </div>
  );

  switch (component.type) {
    case "search":
      return wrap(
        <form
          className="site-header-search flex items-center gap-1"
          onSubmit={(event) => {
            event.preventDefault();
            const href = component.href?.trim() || "/shop";
            window.location.href = href;
          }}
        >
          <Input
            type="search"
            placeholder={component.placeholder || "Search…"}
            className={cn("site-header-search-input h-9", previewSearchWidthClass(preview))}
            aria-label="Search"
          />
          <Button type="submit" variant="ghost" size="sm" className="site-header-action-ghost h-9 w-9 p-0">
            <HeaderIconDisplay id={iconId ?? "search"} className="h-4 w-4" />
          </Button>
        </form>,
      );
    case "cta_button":
      return wrap(
        <Button
          variant={component.variant === "outline" ? "outline" : component.variant === "ghost" ? "ghost" : "default"}
          size="sm"
          asChild
          className={cn(
            component.variant === "outline" && "site-header-action-outline",
            component.variant === "ghost" && "site-header-action-ghost",
          )}
        >
          <Link
            href={component.href || "/"}
            className={cn("inline-flex items-center gap-1.5", textFormatClassName(component.label_format))}
          >
            {iconId ? <HeaderIconDisplay id={iconId} className="h-4 w-4" /> : null}
            {component.label || "Action"}
          </Link>
        </Button>,
      );
    case "cta_link":
      return wrap(
        <Link
          href={component.href || "/"}
          className={cn(
            "site-header-link site-header-link-muted inline-flex items-center gap-1.5 text-sm font-medium",
            textFormatClassName(component.label_format),
          )}
        >
          {iconId ? <HeaderIconDisplay id={iconId} className="h-4 w-4" /> : null}
          {component.label || "Link"}
        </Link>,
      );
    case "phone":
    case "email":
    case "whatsapp":
      return wrap(
        <Link
          href={component.href || "#"}
          target={component.type === "whatsapp" ? "_blank" : undefined}
          rel={component.type === "whatsapp" ? "noopener noreferrer" : undefined}
          className="site-header-link site-header-link-muted inline-flex items-center gap-1.5 text-sm"
        >
          <IconLabel
            iconId={iconId}
            label={component.label || component.type}
            preview={preview}
            format={component.label_format}
          />
        </Link>,
      );
    case "social_links":
      return wrap(
        <div className="flex items-center gap-1">
          {(component.social ?? []).map((item) => (
            <Link
              key={`${item.platform}-${item.url}`}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={item.label || item.platform}
              className="site-header-action-ghost inline-flex h-9 w-9 items-center justify-center rounded-lg transition-colors hover:bg-white/10"
            >
              <HeaderIconDisplay id={resolveSocialIcon(item)} className="h-4 w-4" />
            </Link>
          ))}
        </div>,
      );
    case "text":
      return wrap(
        <span className="site-header-extra-text inline-flex max-w-[12rem] items-center gap-1.5 truncate text-xs text-app-muted lg:max-w-xs">
          {iconId ? <HeaderIconDisplay id={iconId} className="h-3.5 w-3.5 shrink-0" /> : null}
          <FormattedText
            text={component.label || "Text"}
            format={component.label_format}
            as="span"
            className="truncate"
          />
        </span>,
      );
    case "badge":
      return wrap(
        <span className="site-header-badge inline-flex items-center gap-1 rounded-full bg-accent/20 px-2.5 py-0.5 text-xs font-semibold text-accent-soft">
          {iconId ? <HeaderIconDisplay id={iconId} className="h-3 w-3" /> : null}
          <FormattedText
            text={component.label || "Badge"}
            format={component.label_format}
            as="span"
          />
        </span>,
      );
    case "divider":
      return wrap(<span className={cn("site-header-divider mx-1 h-6 w-px bg-white/20", previewDividerClass(preview))} aria-hidden />);
    case "hours":
    case "location":
      return wrap(
        component.href ? (
          <Link
            href={component.href}
            target="_blank"
            rel="noopener noreferrer"
            className="site-header-extra-text inline-flex max-w-[14rem] items-center gap-1.5 truncate text-xs text-app-muted hover:text-accent-soft"
          >
            <IconLabel
            iconId={iconId}
            label={component.label || component.type}
            preview={preview}
            format={component.label_format}
          />
          </Link>
        ) : (
          <span className="site-header-extra-text inline-flex max-w-[14rem] items-center gap-1.5 truncate text-xs text-app-muted">
            <IconLabel
            iconId={iconId}
            label={component.label || component.type}
            preview={preview}
            format={component.label_format}
          />
          </span>
        ),
      );
    default:
      return null;
  }
}

export function SiteHeaderAnnouncement({
  config,
  preview,
}: {
  config: BrandHeaderConfig["announcement"];
  preview?: boolean;
}) {
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (preview || !config.dismissible) return;
    try {
      setDismissed(localStorage.getItem(ANNOUNCEMENT_DISMISS_KEY) === "1");
    } catch {
      setDismissed(false);
    }
  }, [config.dismissible, preview]);

  if (!config.enabled || !config.text.trim() || dismissed) return null;

  const content = (
    <FormattedText
      text={config.text}
      format={config.text_format}
      as="span"
      className="truncate text-center text-sm font-medium"
    />
  );

  const dismiss = () => {
    setDismissed(true);
    try {
      localStorage.setItem(ANNOUNCEMENT_DISMISS_KEY, "1");
    } catch {
      // ignore
    }
  };

  return (
    <div
      className={cn(
        "site-header-announcement relative z-[51] w-full px-4 py-2 text-center",
        config.tone === "accent" && "bg-accent text-white",
        config.tone === "muted" && "bg-app-surface-muted text-app-text",
        config.tone === "dark" && "bg-black/90 text-white",
      )}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-center gap-3">
        {config.href?.trim() ? (
          <Link href={config.href} className="min-w-0 hover:underline">
            {content}
          </Link>
        ) : (
          content
        )}
        {config.dismissible && !preview ? (
          <button
            type="button"
            onClick={dismiss}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded px-2 py-0.5 text-xs opacity-80 hover:opacity-100"
          >
            Dismiss
          </button>
        ) : null}
      </div>
    </div>
  );
}

export function SiteHeaderExtras({
  components,
  preview,
  className,
}: {
  components: HeaderComponent[];
  preview?: "mobile" | "desktop";
  className?: string;
}) {
  const enabled = components.filter((c) => c.enabled);
  if (enabled.length === 0) return null;

  return (
    <div className={cn("site-header-extras flex items-center gap-2", className)}>
      {enabled.map((component) => (
        <HeaderComponentItem key={component.id} component={component} preview={preview} />
      ))}
    </div>
  );
}
