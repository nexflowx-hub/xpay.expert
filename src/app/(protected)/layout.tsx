"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/stores/auth";
import { DashboardShell } from "@/components/dashboard/shell";

/**
 * Legacy protected layout — keeps guard and redirects old routes
 * to their new locations under (dashboard).
 */
const OLD_ROUTE_REDIRECTS: Record<string, string> = {
  "/money": "/commerce/wallets",
  "/insights": "/insights",
  "/risk": "/risk",
  "/commerce": "/commerce/stores",
  "/developers": "/developers/overview",
  "/settings": "/settings",
  "/support": "/support",
  "/marketplace": "/commerce/overview",
};

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { authenticated, sessionChecked, sessionStatus, hydrated, hydrate } =
    useAuth();

  useEffect(() => {
    if (!hydrated) hydrate();
  }, [hydrated, hydrate]);

  // Redirect old routes to new locations
  useEffect(() => {
    if (authenticated && sessionChecked) {
      const redirectPath = OLD_ROUTE_REDIRECTS[pathname];
      if (redirectPath) {
        router.replace(redirectPath);
      }
    }
  }, [authenticated, sessionChecked, pathname, router]);

  // Still loading
  if (!hydrated || sessionStatus === "hydrating" || sessionStatus === "checking") {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">Loading…</p>
        </div>
      </div>
    );
  }

  // Not authenticated
  if (!authenticated || !sessionChecked) {
    router.replace("/login");
    return null;
  }

  return <DashboardShell>{children}</DashboardShell>;
}