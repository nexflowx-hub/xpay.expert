"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Building2,
  ScrollText,
  HandCoins,
  Banknote,
  ArrowRight,
  Gauge,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  PageHeader,
  StatCard,
  ErrorState,
  fadeUp,
} from "@/components/shared";
import {
  useAdminMerchants,
  useAdminKyc,
  useAdminMerchantPayouts,
  useAdminRevenue,
} from "@/hooks/use-queries";
import { formatCurrency, formatNumber } from "@/lib/utils";

export default function AdminConsolePage() {
  const router = useRouter();
  const merchants = useAdminMerchants();
  const kyc = useAdminKyc();
  const payouts = useAdminMerchantPayouts({ limit: 1 });
  const revenue = useAdminRevenue();

  const totalMerchants =
    merchants.data?.meta?.total ??
    (Array.isArray(merchants.data) ? merchants.data.length : 0) ?? 0;
  const pendingKyc = Array.isArray(kyc.data)
    ? kyc.data.filter((k) => k.status === "pending").length
    : 0;
  const pendingPayouts =
    payouts.data?.meta?.total ??
    (Array.isArray(payouts.data) ? payouts.data.length : 0) ?? 0;
  const totalRevenue =
    (revenue.data as { total?: number } | undefined)?.total ?? 0;

  const isLoading =
    merchants.isLoading ||
    kyc.isLoading ||
    payouts.isLoading ||
    revenue.isLoading;

  const hasError =
    merchants.isError ||
    kyc.isError ||
    payouts.isError ||
    revenue.isError;

  const quickLinks = [
    {
      label: "Merchants",
      description: "View all merchants",
      icon: Building2,
      route: "/admin/commerce/merchants",
      count: totalMerchants,
    },
    {
      label: "KYC Queue",
      description: "Review verifications",
      icon: ScrollText,
      route: "/admin/kyc",
      count: pendingKyc,
    },
    {
      label: "Payout Operations",
      description: "Manage payout queue",
      icon: HandCoins,
      route: "/admin/commerce/payouts",
      count: pendingPayouts,
    },
    {
      label: "Settlements",
      description: "View settlement batches",
      icon: HandCoins,
      route: "/admin/commerce/settlements",
    },
    {
      label: "System Health",
      description: "Monitor infrastructure",
      icon: Gauge,
      route: "/admin/system/health",
    },
    {
      label: "Revenue",
      description: "Platform revenue metrics",
      icon: Banknote,
      route: "/admin/revenue",
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Admin Console"
        description="Platform operations and monitoring"
        breadcrumbs={[{ label: "Admin" }, { label: "Overview" }]}
      />

      {isLoading && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
      )}

      {hasError && !isLoading && (
        <ErrorState
          message="Failed to load admin data"
          onRetry={() => {
            merchants.refetch();
            kyc.refetch();
            payouts.refetch();
            revenue.refetch();
          }}
        />
      )}

      {!isLoading && !hasError && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              label="Total Merchants"
              value={totalMerchants}
              icon={Building2}
              accent="blue"
              format={formatNumber}
            />
            <StatCard
              label="Pending KYC"
              value={pendingKyc}
              icon={ScrollText}
              accent="amber"
              format={formatNumber}
            />
            <StatCard
              label="Pending Payouts"
              value={pendingPayouts}
              icon={HandCoins}
              accent="violet"
              format={formatNumber}
            />
            <StatCard
              label="Total Revenue"
              value={totalRevenue}
              icon={Banknote}
              accent="green"
              format={(v) => formatCurrency(v, "EUR", { compact: true })}
            />
          </div>

          <div {...fadeUp} className="space-y-4">
            <h2 className="text-sm font-semibold text-foreground">
              Quick Links
            </h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {quickLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <motion.div
                    key={link.route}
                    whileHover={{ y: -1 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Card
                      className="cursor-pointer border-border/60 bg-card/60 backdrop-blur-xl transition-colors hover:bg-accent/30"
                      onClick={() => router.push(link.route)}
                    >
                      <CardContent className="flex items-center gap-4 p-4">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                          <Icon className="h-5 w-5 text-primary" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-semibold text-foreground">
                              {link.label}
                            </p>
                            {link.count !== undefined && (
                              <span className="text-xs font-mono text-muted-foreground">
                                {formatNumber(link.count)}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {link.description}
                          </p>
                        </div>
                        <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground/50" />
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}