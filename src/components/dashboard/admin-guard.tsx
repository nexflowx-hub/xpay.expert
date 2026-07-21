"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/stores/auth";
import { useAdminStore } from "@/stores/admin";
import { ShieldX } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AdminGuardProps {
  children: React.ReactNode;
}

export function AdminGuard({ children }: AdminGuardProps) {
  const router = useRouter();
  const { authenticated, sessionChecked, sessionStatus, hydrated, hydrate } =
    useAuth();
  const {
    isPlatformAdmin,
    adminCapabilityStatus,
    checkAdminCapability,
    resetCapability,
  } = useAdminStore();

  useEffect(() => {
    if (!hydrated) hydrate();
  }, [hydrated, hydrate]);

  // When authenticated and session checked, probe admin capability
  useEffect(() => {
    if (authenticated && sessionChecked && adminCapabilityStatus === "loading") {
      checkAdminCapability();
    }
  }, [authenticated, sessionChecked, adminCapabilityStatus, checkAdminCapability]);

  // Still loading (auth)
  if (!hydrated || sessionStatus === "hydrating" || sessionStatus === "checking") {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-rose-500 border-t-transparent" />
          <p className="text-sm text-muted-foreground">Verifying access…</p>
        </div>
      </div>
    );
  }

  // Not authenticated — redirect to login (do NOT clear session here)
  if (!authenticated || !sessionChecked) {
    router.replace("/login");
    return null;
  }

  // Admin capability still loading
  if (adminCapabilityStatus === "loading") {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-rose-500 border-t-transparent" />
          <p className="text-sm text-muted-foreground">Checking admin access…</p>
        </div>
      </div>
    );
  }

  // Access denied (403) — show error, do NOT clear session
  if (adminCapabilityStatus === "false") {
    return (
      <div className="flex h-screen items-center justify-center bg-background px-4">
        <div className="text-center space-y-6 max-w-sm">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-500/10">
            <ShieldX className="h-8 w-8 text-rose-400" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-foreground">
              Access Denied
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              You do not have permission to access the admin panel. If you
              believe this is an error, contact support.
            </p>
          </div>
          <div className="flex items-center justify-center gap-3">
            <Button
              variant="outline"
              onClick={() => router.push("/commerce/overview")}
            >
              Go to Dashboard
            </Button>
            <Button
              variant="ghost"
              onClick={() => {
                resetCapability();
                checkAdminCapability();
              }}
            >
              Retry
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Unknown status (network error etc.) — show retry
  if (adminCapabilityStatus === "unknown") {
    return (
      <div className="flex h-screen items-center justify-center bg-background px-4">
        <div className="text-center space-y-4 max-w-sm">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/10">
            <ShieldX className="h-8 w-8 text-amber-400" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-foreground">
              Unable to verify access
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Could not verify your admin access. This may be a network issue.
            </p>
          </div>
          <div className="flex items-center justify-center gap-3">
            <Button
              variant="outline"
              onClick={() => router.push("/commerce/overview")}
            >
              Go to Dashboard
            </Button>
            <Button
              onClick={() => {
                resetCapability();
                checkAdminCapability();
              }}
            >
              Retry
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // isPlatformAdmin === true
  return <>{children}</>;
}