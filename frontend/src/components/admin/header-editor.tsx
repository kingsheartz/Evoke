"use client";

import { ChevronDown, ChevronUp, Plus, Trash2 } from "lucide-react";
import { HeaderIconDisplay } from "@/components/brand/header-icon-display";
import { Button } from "@/components/ui/button";
import { IconPicker } from "@/components/ui/icon-picker";
import { FormattedTextField } from "@/components/ui/formatted-text-field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  createHeaderComponent,
  HEADER_COMPONENT_CATALOG,
  type BrandHeaderConfig,
  type HeaderComponent,
  type HeaderComponentType,
  type HeaderSocialLink,
} from "@/lib/header-config";
import {
  componentSupportsIcon,
  resolveComponentIcon,
  SOCIAL_PLATFORM_DEFAULT_ICONS,
} from "@/lib/header-icons";

const SOCIAL_PLATFORMS: { value: HeaderSocialLink["platform"]; label: string }[] = [
  { value: "facebook", label: "Facebook" },
  { value: "instagram", label: "Instagram" },
  { value: "twitter", label: "Twitter / X" },
  { value: "linkedin", label: "LinkedIn" },
  { value: "youtube", label: "YouTube" },
  { value: "whatsapp", label: "WhatsApp" },
  { value: "tiktok", label: "TikTok" },
  { value: "telegram", label: "Telegram" },
  { value: "discord", label: "Discord" },
  { value: "github", label: "GitHub" },
  { value: "pinterest", label: "Pinterest" },
  { value: "snapchat", label: "Snapchat" },
  { value: "custom", label: "Custom" },
];

function ComponentIconField({
  component,
  onChange,
}: {
  component: HeaderComponent;
  onChange: (patch: Partial<HeaderComponent>) => void;
}) {
  if (!componentSupportsIcon(component.type)) return null;

  const resolved = resolveComponentIcon(component);

  return (
    <IconPicker
      label="Icon"
      value={component.icon ?? resolved ?? undefined}
      allowClear={Boolean(component.icon)}
      onChange={(icon) => onChange({ icon })}
    />
  );
}

function updateComponent(
  components: HeaderComponent[],
  id: string,
  patch: Partial<HeaderComponent>,
): HeaderComponent[] {
  return components.map((item) => (item.id === id ? { ...item, ...patch } : item));
}

function moveComponent(components: HeaderComponent[], id: string, direction: -1 | 1): HeaderComponent[] {
  const index = components.findIndex((item) => item.id === id);
  if (index < 0) return components;
  const next = index + direction;
  if (next < 0 || next >= components.length) return components;
  const copy = [...components];
  const [item] = copy.splice(index, 1);
  copy.splice(next, 0, item);
  return copy;
}

function ComponentFields({
  component,
  onChange,
}: {
  component: HeaderComponent;
  onChange: (patch: Partial<HeaderComponent>) => void;
}) {
  switch (component.type) {
    case "search":
      return (
        <div className="space-y-3">
          <ComponentIconField component={component} onChange={onChange} />
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <Label>Placeholder</Label>
              <Input
                value={component.placeholder ?? ""}
                onChange={(e) => onChange({ placeholder: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <Label>Submit URL</Label>
              <Input value={component.href ?? ""} onChange={(e) => onChange({ href: e.target.value })} />
            </div>
          </div>
        </div>
      );
    case "cta_button":
      return (
        <div className="space-y-3">
          <ComponentIconField component={component} onChange={onChange} />
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="space-y-1 sm:col-span-1">
              <Label>Label</Label>
              <Input value={component.label ?? ""} onChange={(e) => onChange({ label: e.target.value })} />
            </div>
            <div className="space-y-1 sm:col-span-1">
              <Label>Link</Label>
              <Input value={component.href ?? ""} onChange={(e) => onChange({ href: e.target.value })} />
            </div>
            <div className="space-y-1 sm:col-span-1">
              <Label>Style</Label>
              <Select
                value={component.variant ?? "primary"}
                onChange={(e) => onChange({ variant: e.target.value as HeaderComponent["variant"] })}
              >
                <option value="primary">Primary</option>
                <option value="outline">Outline</option>
                <option value="ghost">Ghost</option>
              </Select>
            </div>
          </div>
        </div>
      );
    case "cta_link":
      return (
        <div className="space-y-3">
          <ComponentIconField component={component} onChange={onChange} />
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <Label>Label</Label>
              <Input value={component.label ?? ""} onChange={(e) => onChange({ label: e.target.value })} />
            </div>
            <div className="space-y-1">
              <Label>Link</Label>
              <Input value={component.href ?? ""} onChange={(e) => onChange({ href: e.target.value })} />
            </div>
          </div>
        </div>
      );
    case "social_links":
      return (
        <div className="space-y-3">
          {(component.social ?? []).map((item, index) => (
            <div key={index} className="space-y-2 rounded-lg border border-app-border/60 bg-app-surface-muted/20 p-3">
              <div className="grid gap-2 sm:grid-cols-2">
                <div className="space-y-1">
                  <Label>Platform</Label>
                  <Select
                    value={item.platform}
                    onChange={(e) => {
                      const platform = e.target.value as HeaderSocialLink["platform"];
                      const social = [...(component.social ?? [])];
                      social[index] = {
                        ...social[index],
                        platform,
                        icon: SOCIAL_PLATFORM_DEFAULT_ICONS[platform] ?? social[index].icon,
                      };
                      onChange({ social });
                    }}
                  >
                    {SOCIAL_PLATFORMS.map((platform) => (
                      <option key={platform.value} value={platform.value}>
                        {platform.label}
                      </option>
                    ))}
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label>Aria label</Label>
                  <Input
                    value={item.label ?? ""}
                    onChange={(e) => {
                      const social = [...(component.social ?? [])];
                      social[index] = { ...social[index], label: e.target.value };
                      onChange({ social });
                    }}
                    placeholder="Instagram"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <Label>URL</Label>
                <Input
                  value={item.url}
                  onChange={(e) => {
                    const social = [...(component.social ?? [])];
                    social[index] = { ...social[index], url: e.target.value };
                    onChange({ social });
                  }}
                  placeholder="https://"
                />
              </div>
              <IconPicker
                label="Icon"
                value={item.icon ?? SOCIAL_PLATFORM_DEFAULT_ICONS[item.platform]}
                allowClear
                onChange={(icon) => {
                  const social = [...(component.social ?? [])];
                  social[index] = { ...social[index], icon };
                  onChange({ social });
                }}
              />
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              onChange({
                social: [
                  ...(component.social ?? []),
                  {
                    platform: "instagram",
                    url: "https://",
                    label: "Instagram",
                    icon: SOCIAL_PLATFORM_DEFAULT_ICONS.instagram,
                  },
                ],
              })
            }
          >
            Add social link
          </Button>
        </div>
      );
    case "divider":
      return <p className="text-xs text-app-muted">Visual separator — no extra fields.</p>;
    default:
      return (
        <div className="space-y-3">
          <ComponentIconField component={component} onChange={onChange} />
          <div className="grid gap-3 sm:grid-cols-2">
            <FormattedTextField
              label="Label / text"
              value={component.label ?? ""}
              format={component.label_format}
              preset="label"
              onChange={(label, label_format) => onChange({ label, label_format })}
            />
            {"href" in component || component.type !== "text" ? (
              <div className="space-y-1">
                <Label>Link (optional)</Label>
                <Input value={component.href ?? ""} onChange={(e) => onChange({ href: e.target.value })} />
              </div>
            ) : null}
          </div>
        </div>
      );
  }
}

export function HeaderEditor({
  value,
  onChange,
}: {
  value: BrandHeaderConfig;
  onChange: (next: BrandHeaderConfig) => void;
}) {
  const patchAnnouncement = (patch: Partial<BrandHeaderConfig["announcement"]>) => {
    onChange({ ...value, announcement: { ...value.announcement, ...patch } });
  };

  const patchComponents = (components: HeaderComponent[]) => {
    onChange({ ...value, components });
  };

  const addComponent = (type: HeaderComponentType) => {
    patchComponents([...value.components, createHeaderComponent(type)]);
  };

  return (
    <div className="space-y-8">
      <div className="space-y-4 rounded-lg border border-app-border bg-app-surface-muted/20 p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold text-app-text">Announcement bar</h3>
            <p className="text-xs text-app-muted">Full-width strip above the main header.</p>
          </div>
          <Switch
            checked={value.announcement.enabled}
            onCheckedChange={(enabled) => patchAnnouncement({ enabled })}
          />
        </div>
        {value.announcement.enabled ? (
          <div className="grid gap-3 md:grid-cols-2">
            <div className="space-y-1 md:col-span-2">
              <FormattedTextField
                label="Message"
                value={value.announcement.text}
                format={value.announcement.text_format}
                preset="label"
                onChange={(text, text_format) => patchAnnouncement({ text, text_format })}
                placeholder="Summer enrollment is open — register today"
              />
            </div>
            <div className="space-y-1">
              <Label>Link (optional)</Label>
              <Input
                value={value.announcement.href ?? ""}
                onChange={(e) => patchAnnouncement({ href: e.target.value })}
                placeholder="/academy"
              />
            </div>
            <div className="space-y-1">
              <Label>Tone</Label>
              <Select
                value={value.announcement.tone}
                onChange={(e) =>
                  patchAnnouncement({ tone: e.target.value as BrandHeaderConfig["announcement"]["tone"] })
                }
              >
                <option value="accent">Accent</option>
                <option value="muted">Muted</option>
                <option value="dark">Dark</option>
              </Select>
            </div>
            <label className="flex items-center gap-2 text-sm text-app-text md:col-span-2">
              <input
                type="checkbox"
                checked={value.announcement.dismissible}
                onChange={(e) => patchAnnouncement({ dismissible: e.target.checked })}
                className="h-4 w-4 rounded border-app-border"
              />
              Allow visitors to dismiss
            </label>
          </div>
        ) : null}
      </div>

      <div className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold text-app-text">Header components</h3>
            <p className="text-xs text-app-muted">
              Add common header elements — search, CTAs, contact links, social icons, and more.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {HEADER_COMPONENT_CATALOG.map((item) => {
              const previewIcon = resolveComponentIcon(createHeaderComponent(item.type));
              return (
                <Button
                  key={item.type}
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => addComponent(item.type)}
                  title={item.description}
                  className="gap-1.5"
                >
                  {previewIcon ? (
                    <HeaderIconDisplay id={previewIcon} className="h-3.5 w-3.5 shrink-0" />
                  ) : (
                    <Plus className="h-3.5 w-3.5 shrink-0" />
                  )}
                  {item.label}
                </Button>
              );
            })}
          </div>
        </div>

        {value.components.length === 0 ? (
          <p className="rounded-lg border border-dashed border-app-border px-4 py-8 text-center text-sm text-app-muted">
            No header components yet. Use the buttons above to add search, CTAs, phone, social links, etc.
          </p>
        ) : (
          <div className="space-y-3">
            {value.components.map((component, index) => {
              const meta = HEADER_COMPONENT_CATALOG.find((item) => item.type === component.type);
              return (
                <div key={component.id} className="rounded-lg border border-app-border bg-app-surface/40 p-4">
                  <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <Switch
                        checked={component.enabled}
                        onCheckedChange={(enabled) =>
                          patchComponents(updateComponent(value.components, component.id, { enabled }))
                        }
                      />
                      {resolveComponentIcon(component) ? (
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-app-border bg-app-surface-muted/50">
                          <HeaderIconDisplay id={resolveComponentIcon(component)!} className="h-4 w-4" />
                        </span>
                      ) : null}
                      <div>
                        <p className="text-sm font-medium text-app-text">{meta?.label ?? component.type}</p>
                        <p className="text-xs text-app-muted">{meta?.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        disabled={index === 0}
                        onClick={() => patchComponents(moveComponent(value.components, component.id, -1))}
                      >
                        <ChevronUp className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        disabled={index === value.components.length - 1}
                        onClick={() => patchComponents(moveComponent(value.components, component.id, 1))}
                      >
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-status-error"
                        onClick={() =>
                          patchComponents(value.components.filter((item) => item.id !== component.id))
                        }
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="mb-3 max-w-xs space-y-1">
                    <Label>Show on</Label>
                    <Select
                      value={component.visibility}
                      onChange={(e) =>
                        patchComponents(
                          updateComponent(value.components, component.id, {
                            visibility: e.target.value as HeaderComponent["visibility"],
                          }),
                        )
                      }
                    >
                      <option value="desktop">Desktop only</option>
                      <option value="mobile">Mobile only</option>
                      <option value="all">All screen sizes</option>
                    </Select>
                  </div>
                  <ComponentFields
                    component={component}
                    onChange={(patch) =>
                      patchComponents(updateComponent(value.components, component.id, patch))
                    }
                  />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
