"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Wallet as WalletIcon,
  Send,
  Lock,
  Clock,
  Coins,
  WalletCards,
  Inbox,
  TrendingUp,
  Receipt,
  Info,
  CircleDollarSign,
  ArrowDownFromLine,
  Banknote,
} from "lucide-react";
import { useWallets, useTransactionStats, usePlatformBootstrap, useMerchantPayoutSummary } from "@/hooks/use-queries";
import {
  StatCard,
  PageHeader,
  ErrorState,
  EmptyState,
  fadeUp,
} from "@/components/shared";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { formatCurrency, formatNumber, cn } from "@/lib/utils";
import { CURRENCIES } from "@/config";
import type { Wallet, WalletSummary, CapabilityState } from "@/types";

const TYPE_STYLES: Record<string, { label: string; className: string }> = {
  settlement: {
    label: "Commerce Settlement",
    className: "bg-primary/12 text-primary border-primary/25",
  },
  fiat: {
    label: "Fiat",
    className: "bg-emerald-500/12 text-emerald-400 border-emerald-500/25",
  },
  crypto: {
    label: "Crypto",
    className: "bg-amber-500/12 text-amber-400 border-amber-500/25",
  },
  card: {
    label: "Card",
    className: "bg-violet-500/12 text-violet-400 border-violet-500/25",
  },
};

export default function CommerceWalletsPage() {
  const router = useRouter();

  const {
    data: walletsRes,
    isLoading: walletsLoading,
    isError: walletsError,
    refetch: refetchWallets,
  } = useWallets();

  const {
    data: statsRes,
    isLoading: statsLoading,
  } = useTransactionStats();

  const { data: bootstrap } = usePlatformBootstrap();

  const { data: payoutSummary, isLoading: payoutSummaryLoading } = useMerchantPayoutSummary();

  const wallets: Wallet[] =
    (walletsRes as unknown as { wallets?: Wallet[] } | null)?.wallets ?? [];
  const summary: WalletSummary | null =
    (walletsRes as unknown as { summary?: WalletSummary } | null)?.summary ?? null;

  const stats = statsRes as Record<string, unknown> | null;
  const volume = Number(stats?.volume ?? 0);
  const grossVolume = Number(stats?.grossVolume ?? volume);
  const recordedFees = Number(stats?.recordedFees ?? 0);
  const netAfterRecordedFees = Number(stats?.netAfterRecordedFees ?? 0);
  const feeBasis = String(stats?.feeBasis ?? "");
  const feeClassification = String(stats?.feeClassification ?? "");
  const reconciliationStatus = String(stats?.reconciliationStatus ?? "");

  const capabilities = bootstrap?.capabilities ?? {};

  const merchantPayoutsEnabled =
    capabilities.merchantPayouts === true ||
    (capabilities.merchantPayouts as CapabilityState) === "enabled";

  const isLegacyFee = feeBasis === "legacy_recorded_fee";
  const isUnclassifiedFee = feeClassification === "merchant_cost_unclassified";

  // Fee label logic per merchant perspective
  const feeLabel = isUnclassifiedFee
    ? "Taxas registadas — classificacao em reconciliacao"
    : isLegacyFee
      ? "Taxas historicas registadas"
      : "Taxas registadas";

  const isLoading = walletsLoading || statsLoading;

  if (walletsError) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader
          title="Wallets"
          description="Commerce Settlement Wallets — track balances, reserved funds, and request payouts."
        />
        <ErrorState
          message="Failed to load wallets. The backend may be unreachable."
          onRetry={() => refetchWallets()}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Wallets"
        description="Commerce Settlement Wallets — track balances, reserved funds, and request payouts."
      />

      {/* Merchant Financial Summary — 8 Stat Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {isLoading ? (
          Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))
        ) : (
          <>
            {/* 1. Saldo total — Wallet operational bucket */}
            <StatCard
              label="Saldo total"
              value={summary?.totalBalance ?? 0}
              icon={WalletCards}
              accent="blue"
              format={(n) => formatCurrency(n, "EUR", { compact: true })}
            />
            {/* 2. Bruto processado — Historical processing metric */}
            <StatCard
              label="Bruto processado"
              value={grossVolume}
              icon={TrendingUp}
              accent="green"
              format={(n) => formatCurrency(n, "EUR", { compact: true })}
            />
            {/* 3. Taxas registadas — COST, never Revenue */}
            <StatCard
              label={feeLabel}
              value={recordedFees}
              icon={Receipt}
              accent="rose"
              format={(n) => formatCurrency(n, "EUR", { compact: true })}
            />
            {/* 4. Liquido apos taxas — Historical processing metric */}
            <StatCard
              label="Liquido apos taxas"
              value={netAfterRecordedFees}
              icon={Coins}
              accent="violet"
              format={(n) => formatCurrency(n, "EUR", { compact: true })}
            />
            {/* 5. Pendente de liberacao — Wallet operational bucket */}
            <StatCard
              label="Pendente de liberacao"
              value={summary?.totalPending ?? 0}
              icon={Clock}
              accent="amber"
              format={(n) => formatCurrency(n, "EUR", { compact: true })}
            />
            {/* 6. Disponivel para payout — Wallet operational bucket */}
            <StatCard
              label="Disponivel para payout"
              value={summary?.totalAvailable ?? 0}
              icon={CircleDollarSign}
              accent="green"
              format={(n) => formatCurrency(n, "EUR", { compact: true })}
            />
            {/* 7. Reservado — Wallet operational bucket */}
            <StatCard
              label="Reservado"
              value={summary?.totalReserved ?? 0}
              icon={Lock}
              accent="amber"
              format={(n) => formatCurrency(n, "EUR", { compact: true })}
            />
            {/* 8. Ja pago — Historical payout outflows */}
            <StatCard
              label="Ja pago"
              value={payoutSummary?.totalPaid ?? 0}
              icon={Banknote}
              accent="violet"
              format={(n) => formatCurrency(n, payoutSummary?.totalPaidCurrency ?? "EUR", { compact: true })}
            />
          </>
        )}
      </div>

      {/* Currencies badge + reconciliation alert */}
      {!isLoading && (
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="border-border/60 text-xs text-muted-foreground">
              {summary?.currencies ?? wallets.length} {summary?.currencies === 1 || wallets.length === 1 ? "moeda" : "moedas"}
            </Badge>
            {reconciliationStatus === "pending" && (
              <Badge variant="outline" className="border-amber-500/40 text-xs text-amber-400 bg-amber-500/10">
                Reconciliacao pendente
              </Badge>
            )}
            {isUnclassifiedFee && (
              <Badge variant="outline" className="border-sky-500/40 text-xs text-sky-400 bg-sky-500/10">
                Taxas em classificacao
              </Badge>
            )}
          </div>

          <Alert className="border-border/60 bg-card/60 backdrop-blur-xl">
            <Info className="h-4 w-4 text-sky-400" />
            <AlertDescription className="text-xs text-muted-foreground">
              Liquido apos taxas representa o volume processado com sucesso menos as taxas registadas.
              E uma metrica historica de processamento e NAO deve ser confundido com o saldo disponivel na Wallet.
              O valor disponivel para payout depende da liquidacao e reconciliacao da Wallet.
            </AlertDescription>
          </Alert>
        </div>
      )}

      {/* Wallet Cards Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-52 rounded-xl" />
          ))}
        </div>
      ) : wallets.length === 0 ? (
        <EmptyState
          icon={WalletIcon}
          title="No wallets yet"
          description="Wallets will be created automatically when you start processing payments."
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {wallets.map((w, i) => {
            const c = CURRENCIES.find((x) => x.code === w.currency);
            const typeStyle = TYPE_STYLES[w.type] ?? TYPE_STYLES.fiat;
            const canPayout =
              !!w.id &&
              w.available > 0 &&
              merchantPayoutsEnabled;

            return (
              <motion.div
                key={w.id}
                {...fadeUp}
                transition={{ ...fadeUp.transition, delay: i * 0.04 }}
              >
                <Card className="relative flex h-full flex-col justify-between overflow-hidden border-border/60 bg-card/60 p-5 backdrop-blur-xl">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="grid h-10 w-10 place-items-center rounded-lg bg-primary/10 text-base font-bold text-primary">
                        {c?.flag ?? w.currency.slice(0, 2)}
                      </div>
                      <div>
                        <p className="text-sm font-semibold">{w.currency}</p>
                        <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
                          {w.label ?? w.type}
                        </p>
                      </div>
                    </div>
                    <Badge
                      variant="outline"
                      className={cn("text-[10px] font-medium", typeStyle.className)}
                    >
                      {typeStyle.label}
                    </Badge>
                  </div>

                  {/* Balance */}
                  <div className="mt-4">
                    <p className="font-mono text-2xl font-semibold tabular-nums">
                      {formatCurrency(w.balance, w.currency, {
                        compact: w.balance >= 100000,
                      })}
                    </p>
                  </div>

                  {/* Breakdown */}
                  <div className="mt-3 grid grid-cols-3 gap-2">
                    <div className="rounded-lg bg-background/40 px-2.5 py-2">
                      <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                        <Coins className="h-3 w-3 text-emerald-400" />
                        Available
                      </div>
                      <p className="mt-0.5 font-mono text-xs font-medium tabular-nums">
                        {formatCurrency(w.available, w.currency, {
                          compact: true,
                        })}
                      </p>
                    </div>
                    <div className="rounded-lg bg-background/40 px-2.5 py-2">
                      <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                        <Lock className="h-3 w-3 text-amber-400" />
                        Reserved
                      </div>
                      <p className="mt-0.5 font-mono text-xs font-medium tabular-nums">
                        {formatCurrency(w.reserved, w.currency, {
                          compact: true,
                        })}
                      </p>
                    </div>
                    <div className="rounded-lg bg-background/40 px-2.5 py-2">
                      <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                        <Clock className="h-3 w-3 text-sky-400" />
                        Pending
                      </div>
                      <p className="mt-0.5 font-mono text-xs font-medium tabular-nums">
                        {formatCurrency(w.pending, w.currency, {
                          compact: true,
                        })}
                      </p>
                    </div>
                  </div>

                  {/* Payout Button */}
                  <div className="mt-4">
                    <Button
                      size="sm"
                      variant="outline"
                      className={cn(
                        "w-full gap-1.5",
                        canPayout &&
                          "border-primary/30 text-primary hover:bg-primary/10"
                      )}
                      disabled={!canPayout}
                      onClick={() =>
                        router.push(
                          `/commerce/payouts/new?walletId=${w.id}`
                        )
                      }
                    >
                      <Send className="h-3.5 w-3.5" />
                      Request Payout
                    </Button>
                    {!canPayout && w.available <= 0 && w.id && (
                      <p className="mt-1.5 text-center text-[10px] text-muted-foreground">
                        No available balance for payout
                      </p>
                    )}
                    {!canPayout && w.available > 0 && !merchantPayoutsEnabled && w.id && (
                      <p className="mt-1.5 text-center text-[10px] text-muted-foreground">
                        Payouts not enabled for your account
                      </p>
                    )}
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
