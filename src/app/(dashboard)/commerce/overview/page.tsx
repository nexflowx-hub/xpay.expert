"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  DollarSign,
  TrendingUp,
  ShieldCheck,
  Wallet as WalletIcon,
  Link2,
  Send,
  KeyRound,
  ArrowRight,
  Zap,
  Package,
  Users,
  Repeat,
  Receipt,
  Store,
  PiggyBank,
  BarChart3,
  Layers,
} from "lucide-react";
import {
  useAnalyticsOverview,
  useWallets,
  useTransactions,
  usePlatformBootstrap,
} from "@/hooks/use-queries";
import {
  StatCard,
  PageHeader,
  ErrorState,
  EmptyState,
  fadeUp,
} from "@/components/shared";
import { StatusBadge, MethodBadge, CurrencyBadge } from "@/components/shared/badges";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency, formatNumber, formatPercent, timeAgo, cn } from "@/lib/utils";
import { CURRENCIES } from "@/config";
import type { Transaction, Wallet, BootstrapModuleCard } from "@/types";

const moduleIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  payments: Receipt,
  wallets: WalletIcon,
  settlements: PiggyBank,
  payouts: Send,
  stores: Store,
  products: Package,
  customers: Users,
  subscriptions: Repeat,
  "payment-links": Link2,
  invoices: Receipt,
  analytics: BarChart3,
  risk: ShieldCheck,
  developers: KeyRound,
};

const statusOrder: Record<string, number> = {
  succeeded: 0,
  authorized: 1,
  pending: 2,
  failed: 3,
  refunded: 4,
  disputed: 5,
};

export default function CommerceOverviewPage() {
  const router = useRouter();

  const {
    data: analytics,
    isLoading: aLoading,
    isError: aError,
    refetch: aRefetch,
  } = useAnalyticsOverview();

  const {
    data: walletsRes,
    isLoading: wLoading,
    isError: wError,
    refetch: wRefetch,
  } = useWallets();

  const {
    data: bootstrap,
    isLoading: bLoading,
  } = usePlatformBootstrap();

  const { data: txPage } = useTransactions({
    page: 1,
    limit: 5,
    sortBy: "createdAt",
    sortDir: "desc",
  });

  const wallets: Wallet[] = (walletsRes as { wallets?: Wallet[] } | null)?.wallets ?? [];
  const txs: Transaction[] = (txPage as { data?: Transaction[] } | null)?.data ?? analytics?.recentTransactions ?? [];

  const totalVolume = analytics?.transactions?.volumeMonth ?? analytics?.volume ?? 0;
  const txTotal = analytics?.transactions?.total ?? 0;
  const successRate = analytics?.transactions?.successRate ?? analytics?.approvalRate ?? 0;
  const activeWallets = wallets.length;

  const hasError = aError || wError;

  const moduleCards: BootstrapModuleCard[] = bootstrap?.moduleCards ?? [];

  const capabilities = bootstrap?.capabilities ?? {};

  if (hasError) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader
          title="Commerce Overview"
          description="Your commerce dashboard with payment analytics, wallet balances, and quick actions."
        />
        <ErrorState
          message="Failed to load dashboard data. The backend may be unreachable."
          onRetry={() => {
            aRefetch();
            wRefetch();
          }}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Commerce Overview"
        description="Your commerce dashboard with payment analytics, wallet balances, and quick actions."
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {aLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))
        ) : (
          <>
            <StatCard
              label="Total Volume"
              value={totalVolume}
              icon={DollarSign}
              accent="green"
              format={(n) => formatCurrency(n, "EUR", { compact: true })}
            />
            <StatCard
              label="Successful Transactions"
              value={txTotal}
              icon={TrendingUp}
              accent="blue"
              format={(n) => formatNumber(n, { compact: true })}
            />
            <StatCard
              label="Success Rate"
              value={successRate}
              icon={ShieldCheck}
              accent="green"
              format={(n) => formatPercent(n)}
            />
            <StatCard
              label="Active Wallets"
              value={activeWallets}
              icon={WalletIcon}
              accent="violet"
              format={(n) => n.toString()}
            />
          </>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <motion.div {...fadeUp} transition={{ ...fadeUp.transition, delay: 0 }}>
          <Button
            variant="outline"
            className="h-auto w-full justify-start gap-3 border-border/60 bg-card/60 p-4 backdrop-blur-xl hover:bg-accent/50"
            onClick={() => router.push("/commerce/payment-links")}
          >
            <div className="rounded-lg bg-primary/10 p-2">
              <Link2 className="h-4 w-4 text-primary" />
            </div>
            <div className="text-left">
              <p className="text-sm font-medium">New Payment Link</p>
              <p className="text-xs text-muted-foreground">Create a shareable payment link</p>
            </div>
            <ArrowRight className="ml-auto h-4 w-4 text-muted-foreground" />
          </Button>
        </motion.div>
        <motion.div {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.05 }}>
          <Button
            variant="outline"
            className="h-auto w-full justify-start gap-3 border-border/60 bg-card/60 p-4 backdrop-blur-xl hover:bg-accent/50"
            onClick={() => router.push("/commerce/payouts")}
          >
            <div className="rounded-lg bg-emerald-500/10 p-2">
              <Send className="h-4 w-4 text-emerald-400" />
            </div>
            <div className="text-left">
              <p className="text-sm font-medium">View Payouts</p>
              <p className="text-xs text-muted-foreground">Track withdrawal requests</p>
            </div>
            <ArrowRight className="ml-auto h-4 w-4 text-muted-foreground" />
          </Button>
        </motion.div>
        <motion.div {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.1 }}>
          <Button
            variant="outline"
            className="h-auto w-full justify-start gap-3 border-border/60 bg-card/60 p-4 backdrop-blur-xl hover:bg-accent/50"
            onClick={() => router.push("/developers/api-keys")}
          >
            <div className="rounded-lg bg-amber-500/10 p-2">
              <KeyRound className="h-4 w-4 text-amber-400" />
            </div>
            <div className="text-left">
              <p className="text-sm font-medium">API Keys</p>
              <p className="text-xs text-muted-foreground">Manage your API credentials</p>
            </div>
            <ArrowRight className="ml-auto h-4 w-4 text-muted-foreground" />
          </Button>
        </motion.div>
      </div>

      {/* Recent Transactions + Module Cards */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Recent Transactions */}
        <Card className="border-border/60 bg-card/60 p-5 backdrop-blur-xl lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold">Recent Transactions</h3>
              <p className="text-xs text-muted-foreground">Latest payment activity</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="text-xs"
              onClick={() => router.push("/commerce/payments")}
            >
              View all
            </Button>
          </div>

          {!txPage && !analytics?.recentTransactions ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 rounded-lg" />
              ))}
            </div>
          ) : txs.length === 0 ? (
            <EmptyState
              icon={Receipt}
              title="No transactions yet"
              description="Transactions will appear here once payments are processed."
              action={
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push("/commerce/payment-links")}
                >
                  <Zap className="mr-1.5 h-3.5 w-3.5" />
                  Create Payment Link
                </Button>
              }
            />
          ) : (
            <div className="space-y-1">
              {txs.slice(0, 5).map((tx) => (
                <div
                  key={tx.id}
                  className="flex items-center justify-between rounded-lg px-3 py-2.5 transition hover:bg-muted/30"
                >
                  <div className="flex items-center gap-3">
                    <div className="grid h-8 w-8 place-items-center rounded-lg bg-primary/10 text-xs font-bold text-primary">
                      {tx.customer?.charAt(0)?.toUpperCase() ?? "?"}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{tx.customer}</p>
                      <p className="text-xs text-muted-foreground">{tx.reference}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <MethodBadge method={tx.method} />
                    <span className="hidden font-mono text-sm tabular-nums sm:inline-block">
                      {formatCurrency(tx.amount, tx.currency)}
                    </span>
                    <StatusBadge status={tx.status} />
                    <span className="hidden text-xs text-muted-foreground md:inline-block">
                      {timeAgo(tx.createdAt)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Module Cards from Bootstrap */}
        <Card className="border-border/60 bg-card/60 p-5 backdrop-blur-xl">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold">Modules</h3>
              <p className="text-xs text-muted-foreground">Quick access to features</p>
            </div>
            <Layers className="h-4 w-4 text-muted-foreground" />
          </div>

          {bLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-10 rounded-lg" />
              ))}
            </div>
          ) : moduleCards.length === 0 ? (
            <div className="py-8 text-center text-sm text-muted-foreground">
              No modules configured
            </div>
          ) : (
            <div className="max-h-96 space-y-1.5 overflow-y-auto">
              {moduleCards.map((mod) => {
                const Icon = moduleIcons[mod.key] ?? Package;
                const capState = mod.capabilityState ?? mod.status;
                const isEnabled = mod.enabled;
                return (
                  <button
                    key={mod.key}
                    disabled={!isEnabled}
                    onClick={() => router.push(mod.route)}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-lg border border-border/40 px-3 py-2.5 text-left transition",
                      isEnabled
                        ? "hover:bg-muted/50 cursor-pointer"
                        : "opacity-50 cursor-not-allowed"
                    )}
                  >
                    <div className="rounded-md bg-muted/60 p-1.5">
                      <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-medium">{mod.label}</p>
                      <p className="truncate text-[10px] text-muted-foreground">
                        {mod.description}
                      </p>
                    </div>
                    {!isEnabled && (
                      <Badge
                        variant="outline"
                        className="shrink-0 text-[10px] text-muted-foreground"
                      >
                        {capState?.replace(/_/g, " ") ?? "disabled"}
                      </Badge>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </Card>
      </div>

      {/* Wallet Summary Strip */}
      <Card className="border-border/60 bg-card/60 p-5 backdrop-blur-xl">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold">Wallet Balances</h3>
            <p className="text-xs text-muted-foreground">Commerce settlement wallets</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="text-xs"
            onClick={() => router.push("/commerce/wallets")}
          >
            View all
          </Button>
        </div>
        {wLoading ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-20 rounded-xl" />
            ))}
          </div>
        ) : wallets.length === 0 ? (
          <div className="py-6 text-center text-sm text-muted-foreground">
            No wallets yet
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {wallets.slice(0, 4).map((w) => {
              const c = CURRENCIES.find((x) => x.code === w.currency);
              return (
                <div
                  key={w.id}
                  className="rounded-xl border border-border/60 bg-background/40 p-4"
                >
                  <div className="flex items-center gap-2">
                    <div className="grid h-8 w-8 place-items-center rounded-lg bg-primary/10 text-xs font-bold text-primary">
                      {c?.flag ?? w.currency}
                    </div>
                    <div>
                      <p className="text-xs font-medium">{w.currency}</p>
                      <p className="text-[10px] text-muted-foreground">
                        {w.type === "settlement"
                          ? "Commerce Settlement"
                          : w.type}
                      </p>
                    </div>
                  </div>
                  <p className="mt-2 font-mono text-lg font-semibold tabular-nums">
                    {formatCurrency(w.balance, w.currency, {
                      compact: true,
                    })}
                  </p>
                  <div className="mt-1 flex gap-3 text-[10px] text-muted-foreground">
                    <span>
                      Avail{" "}
                      {formatCurrency(w.available, w.currency, {
                        compact: true,
                      })}
                    </span>
                    <span>
                      Res{" "}
                      {formatCurrency(w.reserved, w.currency, {
                        compact: true,
                      })}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}