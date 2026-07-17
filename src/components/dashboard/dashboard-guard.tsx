"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/stores/auth";
import { DashboardShell } from "./shell";
import { toast } from "sonner";

interface DashboardGuardProps {
  children: React.ReactNode;
}

export function DashboardGuard({ children }: DashboardGuardProps) {
  const router = useRouter();
  const { authenticated, sessionChecked, sessionStatus, hydrated, hydrate, networkError } = useAuth();

  useEffect(() => {
    if (!hydrated) hydrate();
  }, [hydrated, hydrate]);

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

  // Network error
  if (networkError) {
    return (
      <div className="flex h-screen items-center justify-center bg-background px-4">
        <div className="text-center space-y-4 max-w-md">
          <p className="text-sm text-muted-foreground">Unable to reach the server.</p>
          <button
            onClick={() => hydrate()}
            className="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return <DashboardShell mode="merchant">{children}</DashboardShell>;
}