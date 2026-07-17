"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/stores/auth";
import { usePlatformBootstrap } from "@/hooks/use-queries";
import { usePlatformStore } from "@/stores/platform";
import { useWorkspaceStore } from "@/stores/workspace";
import { DashboardShell } from "@/components/dashboard/shell";
import { lazy, Suspense } from "react";

const LaunchpadContent = lazy(() =>
  import("@/components/merchant/dashboard")
);

function LandingFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <div className="h-12 w-12 animate-pulse rounded-xl bg-muted" />
        <div className="h-4 w-48 animate-pulse rounded bg-muted" />
      </div>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="flex h-screen items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <p className="text-sm text-muted-foreground">Loading dashboard…</p>
      </div>
    </div>
  );
}

export default function RootPage() {
  const router = useRouter();
  const { authenticated, sessionChecked, sessionStatus, hydrated, hydrate, networkError } = useAuth();
  const { data: bootstrap, isLoading: bootstrapLoading } = usePlatformBootstrap(authenticated && sessionChecked);
  const setBootstrap = usePlatformStore((s) => s.setBootstrap);
  const setStores = useWorkspaceStore((s) => s.setStores);

  // Hydrate auth on mount
  useEffect(() => {
    if (!hydrated) hydrate();
  }, [hydrated, hydrate]);

  // When bootstrap data arrives, hydrate stores
  useEffect(() => {
    if (bootstrap) {
      setBootstrap(bootstrap);
      if (bootstrap.workspace?.stores) {
        setStores(bootstrap.workspace.stores);
      }
    }
  }, [bootstrap, setBootstrap, setStores]);

  // Still hydrating
  if (!hydrated || sessionStatus === "hydrating" || sessionStatus === "checking") {
    return <DashboardSkeleton />;
  }

  // Not authenticated — show landing page
  if (!authenticated || !sessionChecked) {
    const LandingPage = lazy(() =>
      import("@/components/landing/landing-page").then((m) => ({
        default: m.LandingPage || (m.default as any),
      }))
    );
    return (
      <Suspense fallback={<LandingFallback />}>
        <LandingPage />
      </Suspense>
    );
  }

  // Network error
  if (networkError) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="text-center space-y-4 max-w-md">
          <div className="text-4xl">⚠️</div>
          <h2 className="text-xl font-semibold">Unable to reach the server</h2>
          <p className="text-sm text-muted-foreground">
            The API is not responding. Please check your connection and try again.
          </p>
          <button
            onClick={() => hydrate()}
            className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Authenticated — show dashboard shell + launchpad
  return (
    <DashboardShell mode="merchant">
      {bootstrapLoading && !bootstrap ? (
        <DashboardSkeleton />
      ) : (
        <Suspense fallback={<DashboardSkeleton />}>
          <LaunchpadContent />
        </Suspense>
      )}
    </DashboardShell>
  );
}