"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Store, Globe, Zap, Shield } from "lucide-react";
import { usePlatformStore } from "@/stores/platform";

const MARKETPLACE_ITEMS = [
  {
    icon: Store,
    title: "Payment Providers",
    description: "Connect additional payment providers and processors",
    badge: "Coming Soon",
  },
  {
    icon: Globe,
    title: "Currency Exchange",
    description: "FX rate providers and corridors",
    badge: "Coming Soon",
  },
  {
    icon: Zap,
    title: "Smart Routing",
    description: "AI-powered payment routing optimization",
    badge: "Coming Soon",
  },
  {
    icon: Shield,
    title: "Fraud Prevention",
    description: "Third-party fraud detection integrations",
    badge: "Coming Soon",
  },
];

export default function MarketplacePage() {
  const isCapabilityEnabled = usePlatformStore((s) => s.isCapabilityEnabled);
  const marketplaceEnabled = isCapabilityEnabled("marketplace");

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Marketplace</h1>
        <p className="text-muted-foreground mt-1">
          Discover integrations and services to extend your platform
        </p>
      </div>

      {!marketplaceEnabled && (
        <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-4">
          <p className="text-sm text-amber-400">
            The Marketplace requires account verification. Complete your onboarding to unlock this feature.
          </p>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {MARKETPLACE_ITEMS.map((item) => (
          <Card key={item.title} className={!marketplaceEnabled ? "opacity-60" : ""}>
            <CardHeader className="flex flex-row items-center gap-4 pb-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <item.icon className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <CardTitle className="text-base">{item.title}</CardTitle>
              </div>
              <Badge variant="secondary">{item.badge}</Badge>
            </CardHeader>
            <CardContent>
              <CardDescription>{item.description}</CardDescription>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}