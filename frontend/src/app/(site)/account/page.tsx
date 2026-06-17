"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { GraduationCap, LogOut, Plane, ShoppingBag, User } from "lucide-react";
import { CustomerAuthGuard } from "@/components/auth/customer-auth-guard";
import { PageContainer } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { apiClient, hasAdminAccess } from "@/lib/api";
import { useAuthStore } from "@/stores/app";

const quickLinks = [
  { href: "/academy", label: "Academy", description: "Browse courses and enrollments", icon: GraduationCap },
  { href: "/shop", label: "Sports Shop", description: "Shop gear and track orders", icon: ShoppingBag },
  { href: "/tours", label: "Tours & Travels", description: "Explore packages and bookings", icon: Plane },
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

  if (!user) return null;

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

        <Card variant="glass" className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <User className="h-5 w-5 text-accent-soft" />
              Profile
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-app-muted">Name</p>
              <p className="mt-1 text-app-text">{user.name}</p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-app-muted">Email</p>
              <p className="mt-1 text-app-text">{user.email}</p>
            </div>
            {user.phone && (
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-app-muted">Phone</p>
                <p className="mt-1 text-app-text">{user.phone}</p>
              </div>
            )}
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

        <p className="mt-8 text-sm text-app-muted">
          Orders, enrollments, and bookings will appear here as those features roll out across Academy, Shop, and Tours.
        </p>

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
