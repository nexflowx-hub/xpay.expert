"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/stores/auth";

interface MerchantGuardProps {
  children: React.ReactNode;
}

export function MerchantGuard({ children }: MerchantGuardProps) {
  const router = useRouter();
  const { authenticated, sessionChecked, sessionStatus, hydrated, hydrate } =
    useAuth();

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

  // Not authenticated — redirect to login
  if (!authenticated || !sessionChecked) {
    router.replace("/login");
    return null;
  }

  return <>{children}</>;
}