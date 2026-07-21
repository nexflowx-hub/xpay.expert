"use client";

import { MerchantGuard } from "@/components/dashboard/merchant-guard";
import { DashboardShell } from "@/components/dashboard/shell";
import { usePlatformBootstrap } from "@/hooks/use-queries";
import { useAuth } from "@/stores/auth";
import { Loader2 } from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { authenticated, sessionStatus } = useAuth();

  // Fetch bootstrap once when authenticated
  const { isLoading: bootstrapLoading, isError: bootstrapError, refetch: refetchBootstrap } = usePlatformBootstrap(
    authenticated && sessionStatus === "authenticated"
  );

  // Show loading while bootstrap is being fetched
  if (authenticated && sessionStatus === "authenticated" && bootstrapLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading workspace...</p>
        </div>
      </div>
    );
  }

  // Show retry on bootstrap error
  if (authenticated && sessionStatus === "authenticated" && bootstrapError) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4 text-center">
          <p className="text-sm text-destructive">Failed to load platform data.</p>
          <button
            onClick={() => refetchBootstrap()}
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <MerchantGuard>
      <DashboardShell>{children}</DashboardShell>
    </MerchantGuard>
  );
}