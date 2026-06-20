"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { GraduationCap, LogOut, Plane, Palette, ShoppingBag } from "lucide-react";
import { CustomerAuthGuard } from "@/components/auth/customer-auth-guard";
import { ProfileEditor } from "@/components/account/profile-editor";
import { PageContainer } from "@/components/layout/app-shell";
import { ThemeSettings } from "@/components/theme/theme-settings";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { apiClient, hasAdminAccess } from "@/lib/api";
import { useAuthStore } from "@/stores/app";

const quickLinks = [
  { href: "/academy", label: "EVOKE Academy", description: "Browse courses and enrollments", icon: GraduationCap },
  { href: "/shop", label: "EOKE Sports", description: "Shop gear and track orders", icon: ShoppingBag },
  { href: "/tours", label: "EVOKE Tours", description: "Explore packages and bookings", icon: Plane },
];

function AccountContent() {
  const router = useRouter();
  const { user, token, roles, permissions, logout } = useAuthStore();
  const isAdmin = hasAdminAccess(roles, permissions);

  const handleSignOut = async () => {
    if (token) {
      try {
        await apiClient.logout(token);
      } catch {
        // still clear local session
      }
    }
    logout();
    router.push("/");
  };

  if (!user || !token) return null;

  const addressComplete = Boolean(user.address_line1 && user.city && user.postal_code);

  return (
    <PageContainer className="py-16 md:py-20">
      <div className="mx-auto max-w-3xl">
        <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-accent-soft">My account</p>
            <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-app-text md:text-4xl">
              Welcome, {user.name.split(" ")[0]}
            </h1>
            <p className="mt-2 text-app-muted">{user.email}</p>
          </div>
          <Button variant="outline" onClick={handleSignOut}>
            <LogOut className="h-4 w-4" />
            Sign out
          </Button>
        </div>

        {!addressComplete && (
          <div className="mb-6 rounded-xl border border-status-warning/30 bg-status-warning/10 px-4 py-3 text-sm text-app-text">
            Add your delivery address below for shop orders and tour bookings.
          </div>
        )}

        <Card variant="glass" className="mb-8">
          <CardHeader>
            <CardTitle className="text-lg">Profile & address</CardTitle>
          </CardHeader>
          <CardContent>
            <ProfileEditor user={user} token={token} />
          </CardContent>
        </Card>

        <Card variant="glass" className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Palette className="h-5 w-5 text-accent-soft" />
              Theme
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ThemeSettings />
          </CardContent>
        </Card>

        <h2 className="mb-4 font-display text-xl font-semibold text-app-text">Your activity</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {quickLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="group rounded-2xl border border-app-border bg-app-surface/80 p-5 ring-1 ring-app-border transition-colors hover:border-accent/30"
            >
              <link.icon className="h-5 w-5 text-accent-soft" />
              <h3 className="mt-3 font-medium text-app-text">{link.label}</h3>
              <p className="mt-1 text-sm text-app-muted">{link.description}</p>
            </Link>
          ))}
        </div>

        {isAdmin && (
          <div className="mt-8 rounded-xl border border-accent/25 bg-accent/5 p-4">
            <p className="text-sm text-app-muted">
              You have staff access.{" "}
              <Link href="/admin" className="font-medium text-accent-soft hover:text-accent">
                Open admin portal →
              </Link>
            </p>
          </div>
        )}
      </div>
    </PageContainer>
  );
}

export default function AccountPage() {
  return (
    <CustomerAuthGuard>
      <AccountContent />
    </CustomerAuthGuard>
  );
}
