"use client";

import { useRouter, useSearchParams } from "next/navigation";
import {
  apiClient,
  getDefaultAdminPath,
  getUserPermissions,
  getUserRoles,
  hasAdminAccess,
} from "@/lib/api";
import { useNotifications } from "@/lib/notifications";
import { useAuthStore } from "@/stores/app";

export function useCompleteCustomerAuth() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setAuth, setContext } = useAuthStore();
  const { success: notifySuccess } = useNotifications();

  return async (idToken: string, options?: { phone?: string; verificationSent?: boolean }) => {
    const { data: auth } = await apiClient.loginWithFirebase(idToken);

    if (options?.phone) {
      const { data: user } = await apiClient.updateProfile(auth.token, { phone: options.phone });
      auth.user = user;
    }

    setAuth(auth.user, auth.token);

    const roles = getUserRoles(auth.user);
    const permissions = getUserPermissions(auth.user);

    if (hasAdminAccess(roles, permissions)) {
      const { data: context } = await apiClient.getAdminContext(auth.token);
      setContext(context);
      notifySuccess("Signed in. Redirecting to admin...");
      router.push(searchParams.get("redirect") ?? getDefaultAdminPath(context.navigation));
      return;
    }

    if (options?.verificationSent) {
      notifySuccess("Account created. Check your email to verify your address.");
    } else {
      notifySuccess("Welcome!");
    }

    router.push(searchParams.get("redirect") ?? "/account");
  };
}

export function useCompleteCustomerAuthHandlers() {
  const completeAuth = useCompleteCustomerAuth();
  const { error: notifyError } = useNotifications();

  const handleFirebaseToken = async (
    idToken: string,
    options?: { phone?: string; verificationSent?: boolean },
  ) => {
    try {
      await completeAuth(idToken, options);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Sign in failed";
      notifyError(message);
    }
  };

  return { handleFirebaseToken };
}

export function useLegacyEmailPasswordSignIn() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setAuth, setContext } = useAuthStore();
  const { success: notifySuccess } = useNotifications();

  return async (email: string, password: string) => {
    const { data: auth } = await apiClient.login(email, password);
    setAuth(auth.user, auth.token);

    const roles = getUserRoles(auth.user);
    const permissions = getUserPermissions(auth.user);

    if (hasAdminAccess(roles, permissions)) {
      const { data: context } = await apiClient.getAdminContext(auth.token);
      setContext(context);
      notifySuccess("Signed in. Redirecting to admin...");
      router.push(searchParams.get("redirect") ?? getDefaultAdminPath(context.navigation));
      return;
    }

    notifySuccess("Welcome back!");
    router.push(searchParams.get("redirect") ?? "/account");
  };
}
