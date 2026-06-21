"use client";

import { AccountShell } from "@/components/account/account-shell";
import { ProfileEditor } from "@/components/account/profile-editor";
import { Card, CardContent } from "@/components/ui/card";
import { useAuthStore } from "@/stores/app";

export default function AccountProfilePage() {
  const { user, token } = useAuthStore();
  if (!user || !token) return null;

  return (
    <AccountShell
      title="Profile & address"
      description="Update your contact details and delivery address for shop orders."
    >
      <Card variant="glass">
        <CardContent className="pt-6">
          <ProfileEditor user={user} token={token} />
        </CardContent>
      </Card>
    </AccountShell>
  );
}
