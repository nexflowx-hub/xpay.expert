"use client";

import * as React from "react";
import { motion } from "framer-motion";
import {
  PiggyBank,
  Search,
  ChevronLeft,
  ChevronRight,
  Inbox,
  Info,
  AlertTriangle,
  Lock,
  DollarSign,
  Percent,
  CalendarClock,
  ArrowDownToLine,
  BarChart3,
} from "lucide-react";
import { useSettlements, useSettlementOverview } from "@/hooks/use-queries";
import {
  PageHeader,
  ErrorState,
  EmptyState,
  StatCard,
  fadeUp,
} from "@/components/shared";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate, cn } from "@/lib/utils";
import type { DataTableFilters, Settlement } from "@/types";

const STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: "", label: "All Statuses" },
  { value: "pending_provider", label: "A aguardar fornecedor" },
  { value: "pending_review", label: "Em revisao" },
  { value: "held", label: "Retido" },
  { value: "scheduled", label: "Agendado" },
  { value: "partially_released", label: "Parcialmente libertado" },
  { value: "ready", label: "Disponivel" },
  { value: "released", label: "Libertado" },
  { value: "cancelled", label: "Cancelado" },
  { value: "pending", label: "Pending" },
  { value: "available", label: "Available" },
  { value: "processing", label: "Processing" },
];

const settlementStatusConfig: Record<
  string,
  { label: string; className: string }
> = {
  pending_provider: {
    label: "A aguardar fornecedor",
    className: "bg-amber-500/12 text-amber-400 border-amber-500/25",
  },
  pending_review: {
    label: "Em revisao",
    className: "bg-amber-500/12 text-amber-400 border-amber-500/25",
  },
  held: {
    label: "Retido",
    className: "bg-rose-500/12 text-rose-400 border-rose-500/25",
  },
  scheduled: {
    label: "Agendado",
    className: "bg-sky-500/12 text-sky-400 border-sky-500/25",
  },
  partially_released: {
    label: "Parcialmente libertado",
    className: "bg-violet-500/12 text-violet-400 border-violet-500/25",
  },
  ready: {
    label: "Disponivel",
    className: "bg-emerald-500/12 text-emerald-400 border-emerald-500/25",
  },
  released: {
    label: "Libertado",
    className: "bg-emerald-500/12 text-emerald-400 border-emerald-500/25",
  },
  cancelled: {
    label: "Cancelado",
    className: "bg-muted text-muted-foreground border-border",
  },
  pending: {
    label: "Pending",
    className: "bg-amber-500/12 text-amber-400 border-amber-500/25",
  },
  available: {
    label: "Available",
    className: "bg-emerald-500/12 text-emerald-400 border-emerald-500/25",
  },
  processing: {
    label: "Processing",
    className: "bg-sky-500/12 text-sky-400 border-sky-500/25",
  },
};

// Fee label — never call it Revenue in merchant view
function getFeeLabel(s: Settlement): string {
  if (s.feeClassification === "merchant_cost_unclassified") {
    return "Custo em reconciliacao";
  }
  if (s.feeBasis === "legacy_recorded_fee") {
    return "Taxas historicas";
  }
  return "Custos de processamento";
}

const PAGE_SIZE = 15;

export default function SettlementsPage() {
  const [filters, setFilters] = React.useState<DataTableFilters>({
    page: 1,
    limit: PAGE_SIZE,
    sortBy: "createdAt",
    sortDir: "desc",
  });

  const {
    data: settlementsPage,
    isLoading,
    isError,
    refetch,
  } = useSettlements(filters);

  const {
    data: overview,
  } = useSettlementOverview();

  const settlements: Settlement[] =
    (settlementsPage as { data?: Settlement[] } | null)?.data ?? [];
  const meta = (settlementsPage as { meta?: { page: number; limit: number; total: number; pages: number } } | null)?.meta;
  const totalPages = meta?.pages ?? 1;
  const totalItems = meta?.total ?? 0;

  // Check if overview is all zero but transactions have volume
  const overviewAllZero = overview
    ? overview.totalGross === 0 &&
      overview.totalProviderFee === 0 &&
      overview.totalPlatformFee === 0 &&
      overview.totalMerchantNet === 0
    : false;

  // Derive release calendar entries from settlements with scheduled/partial release
  const releaseEntries = React.useMemo(() => {
    return settlements.filter(
      (s) =>
        s.status === "scheduled" ||
        s.status === "partially_released" ||
        s.status === "ready" ||
        (s.scheduledFor && s.status !== "released" && s.status !== "cancelled")
    );
  }, [settlements]);

  const isLegacyFee = overview?.feeBasis === "legacy_recorded_fee";
  const isUnclassified = overview?.feeClassification === "merchant_cost_unclassified";

  const overviewFeeLabel = isUnclassified
    ? "Taxas registadas — classificacao em reconciliacao"
    : isLegacyFee
      ? "Taxas historicas registadas"
      : "Custos de processamento";

  function updateFilter(key: keyof DataTableFilters, value: string | number | undefined) {
    setFilters((prev) => ({
      ...prev,
      [key]: key === "page" ? (typeof value === "number" ? value : undefined) : (value || undefined),
      page: key !== "page" ? 1 : (typeof value === "number" ? value : prev.page),
    }));
  }

  if (isError) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader title="Settlements" description="Track payment settlements into your Commerce Settlement Wallet." />
        <ErrorState
          message="Failed to load settlements. The backend may be unreachable."
          onRetry={() => refetch()}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Settlements"
        description="Track payment settlements into your Commerce Settlement Wallet."
      />

      {/* Overview Stat Cards */}
      {overview && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Bruto processado"
            value={overview.totalGross}
            icon={DollarSign}
            accent="green"
            format={(n) => formatCurrency(n, overview.currency, { compact: true })}
          />
          <StatCard
            label={overviewFeeLabel}
            value={overview.totalProviderFee + overview.totalPlatformFee}
            icon={Percent}
            accent="rose"
            format={(n) => formatCurrency(n, overview.currency, { compact: true })}
          />
          <StatCard
            label="Liquido do Merchant"
            value={overview.totalMerchantNet}
            icon={DollarSign}
            accent="blue"
            format={(n) => formatCurrency(n, overview.currency, { compact: true })}
          />
          <StatCard
            label="Batches libertados"
            value={overview.releasedCount}
            icon={PiggyBank}
            accent="green"
            format={(n) => n.toString()}
          />
          <StatCard
            label="Batches em revisao"
            value={overview.pendingReviewCount}
            icon={AlertTriangle}
            accent="amber"
            format={(n) => n.toString()}
          />
          <StatCard
            label="Batches retidos"
            value={overview.heldCount}
            icon={Lock}
            accent="rose"
            format={(n) => n.toString()}
          />
          <StatCard
            label="Total agendado para liberacao"
            value={overview.totalScheduled ?? 0}
            icon={CalendarClock}
            accent="blue"
            format={(n) => formatCurrency(n, overview.currency, { compact: true })}
          />
          <StatCard
            label="Valor remanescente"
            value={overview.totalRemaining ?? 0}
            icon={BarChart3}
            accent="violet"
            format={(n) => formatCurrency(n, overview.currency, { compact: true })}
          />
        </div>
      )}

      {/* Warning if overview is all zero */}
      {overviewAllZero && (
        <Alert className="border-amber-500/40 bg-amber-500/5 backdrop-blur-xl">
          <Info className="h-4 w-4 text-amber-400" />
          <AlertDescription className="text-xs text-amber-300">
            Settlement Ledger ainda nao reconstruido. Consulte o resumo historico de Transactions.
          </AlertDescription>
        </Alert>
      )}

      {/* Info Banner — Merchant semantic */}
      <Alert className="border-border/60 bg-card/60 backdrop-blur-xl">
        <Info className="h-4 w-4 text-sky-400" />
        <AlertDescription className="text-xs text-muted-foreground">
          Settlements representam a liquidacao dos pagamentos processados para a sua Commerce Settlement Wallet.
          Os custos de processamento (taxas do fornecedor e da plataforma) sao despesas deduzidas ao Merchant, nao receita.
          Os valores agendados tornam-se disponiveis para payout apenas apos confirmacao e liberacao do Settlement.
        </AlertDescription>
      </Alert>

      {/* Release Calendar */}
      {!isLoading && releaseEntries.length > 0 && (
        <Card className="border-border/60 bg-card/60 backdrop-blur-xl">
          <div className="flex items-center justify-between border-b border-border/60 px-5 py-4">
            <div className="flex items-center gap-2">
              <CalendarClock className="h-4 w-4 text-sky-400" />
              <div>
                <h3 className="text-sm font-semibold">Calendario de liberacoes</h3>
                <p className="text-xs text-muted-foreground">Previsao de disponibilidade dos Settlements</p>
              </div>
            </div>
            <Badge variant="outline" className="border-sky-500/25 text-xs text-sky-400 bg-sky-500/10">
              {releaseEntries.length} agendados
            </Badge>
          </div>

          <div className="p-5">
            <Alert className="mb-4 border-border/60 bg-background/40">
              <Info className="h-4 w-4 text-sky-400" />
              <AlertDescription className="text-xs text-muted-foreground">
                A data de liberacao e uma previsao operacional. O valor torna-se disponivel para payout apenas depois da confirmacao e liberacao do Settlement.
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              {releaseEntries.map((s) => {
                const sc = settlementStatusConfig[s.status] ?? {
                  label: s.status,
                  className: "bg-muted text-muted-foreground border-border",
                };
                const hasPartial = s.releasedAmount !== undefined && s.releasedAmount > 0;
                const remaining = s.remainingAmount ?? (s.scheduledAmount ?? s.merchantNet) - (s.releasedAmount ?? 0);
                return (
                  <motion.div key={s.id} {...fadeUp}>
                    <div className="flex flex-col gap-2 rounded-lg border border-border/40 bg-background/40 p-4 sm:flex-row sm:items-center sm:gap-4">
                      <div className="flex min-w-0 flex-1 items-center gap-3">
                        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-sky-500/10 text-sky-400">
                          <CalendarClock className="h-4 w-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-xs font-medium">{s.storeName ?? "—"}</p>
                          <p className="text-[10px] text-muted-foreground">
                            {s.storeCode ?? s.batch}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-right sm:grid-cols-3">
                        <div>
                          <p className="text-[10px] text-muted-foreground">Previsto</p>
                          <p className="font-mono text-xs font-semibold tabular-nums">
                            {formatCurrency(s.scheduledAmount ?? s.merchantNet, s.currency)}
                          </p>
                        </div>
                        {hasPartial && (
                          <div>
                            <p className="text-[10px] text-muted-foreground">Ja liberado</p>
                            <p className="font-mono text-xs font-medium tabular-nums text-emerald-400">
                              {formatCurrency(s.releasedAmount!, s.currency)}
                            </p>
                          </div>
                        )}
                        <div>
                          <p className="text-[10px] text-muted-foreground">{hasPartial ? "Remanescente" : "Montante"}</p>
                          <p className="font-mono text-xs font-medium tabular-nums text-amber-400">
                            {formatCurrency(remaining, s.currency)}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between gap-2 sm:flex-col sm:items-end">
                        <Badge
                          variant="outline"
                          className={cn("text-[10px] font-medium", sc.className)}
                        >
                          {sc.label}
                        </Badge>
                        <p className="text-[10px] text-muted-foreground">
                          {s.scheduledFor
                            ? formatDate(s.scheduledFor)
                            : s.providerAvailableDate
                              ? formatDate(s.providerAvailableDate)
                              : "—"}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </Card>
      )}

      {/* Filter Bar */}
      <Card className="border-border/60 bg-card/60 p-4 backdrop-blur-xl">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative min-w-[180px] flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by batch..."
              value={filters.search ?? ""}
              onChange={(e) => updateFilter("search", e.target.value)}
              className="h-9 w-full rounded-md border border-input bg-transparent px-3 pl-9 py-1 text-sm shadow-xs transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
          </div>
          <Select
            value={filters.status ?? ""}
            onValueChange={(v) => updateFilter("status", v)}
          >
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((s) => (
                <SelectItem key={s.value} value={s.value}>
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Desktop Table */}
      <Card className="hidden border-border/60 bg-card/60 backdrop-blur-xl md:block">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-border/60 text-left text-xs text-muted-foreground">
                <TableHead className="text-xs font-medium">Batch</TableHead>
                <TableHead className="text-xs font-medium">Store</TableHead>
                <TableHead className="text-xs font-medium">Provider</TableHead>
                <TableHead className="text-xs font-medium text-right">Txns</TableHead>
                <TableHead className="text-xs font-medium text-right">Gross</TableHead>
                <TableHead className="text-xs font-medium text-right">Processing Costs</TableHead>
                <TableHead className="text-xs font-medium text-right">Merchant Net</TableHead>
                <TableHead className="text-xs font-medium text-right">Released</TableHead>
                <TableHead className="text-xs font-medium text-right">Available date</TableHead>
                <TableHead className="text-xs font-medium">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading
                ? Array.from({ length: 8 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell colSpan={10}>
                        <Skeleton className="my-1 h-8" />
                      </TableCell>
                    </TableRow>
                  ))
                : settlements.length === 0
                  ? (
                      <TableRow>
                        <TableCell colSpan={10}>
                          <EmptyState
                            icon={PiggyBank}
                            title="No settlements found"
                            description="Settlements will appear here once payments are processed and settled."
                          />
                        </TableCell>
                      </TableRow>
                    )
                  : settlements.map((s) => {
                      const sc = settlementStatusConfig[s.status] ?? {
                        label: s.status,
                        className: "bg-muted text-muted-foreground border-border",
                      };
                      const batchLabel = s.storeCode ?? s.batch;
                      const totalFees = s.providerFee + s.xpayFee;
                      const hasPartial = s.releasedAmount !== undefined && s.releasedAmount > 0;
                      return (
                        <TableRow key={s.id} className="border-border/30">
                          <TableCell className="font-mono text-xs text-primary">
                            {batchLabel}
                          </TableCell>
                          <TableCell className="text-sm">
                            {s.storeName ?? "—"}
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {s.provider}
                          </TableCell>
                          <TableCell className="text-right font-mono text-sm tabular-nums">
                            {s.transactionCount}
                          </TableCell>
                          <TableCell className="text-right font-mono text-sm tabular-nums">
                            {formatCurrency(s.gross, s.currency)}
                          </TableCell>
                          <TableCell className="text-right font-mono text-xs tabular-nums text-rose-400">
                            −{formatCurrency(totalFees, s.currency)}
                          </TableCell>
                          <TableCell className="text-right font-mono text-sm font-medium tabular-nums">
                            {formatCurrency(s.merchantNet, s.currency)}
                          </TableCell>
                          <TableCell className="text-right font-mono text-xs tabular-nums">
                            {hasPartial ? (
                              <span className="text-emerald-400">
                                {formatCurrency(s.releasedAmount!, s.currency)}
                                <span className="ml-1 text-muted-foreground">
                                  / {formatCurrency(s.scheduledAmount ?? s.merchantNet, s.currency)}
                                </span>
                              </span>
                            ) : (
                              <span className="text-muted-foreground">—</span>
                            )}
                          </TableCell>
                          <TableCell className="text-right text-xs text-muted-foreground">
                            {formatDate(s.providerAvailableDate)}
                          </TableCell>
                          <TableCell>
                            <span
                              className={cn(
                                "inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium",
                                sc.className
                              )}
                            >
                              {sc.label}
                            </span>
                          </TableCell>
                        </TableRow>
                      );
                    })}
            </TableBody>
          </Table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-border/60 px-5 py-3">
            <p className="text-xs text-muted-foreground">
              {totalItems} settlement{totalItems !== 1 ? "s" : ""}
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={filters.page === 1}
                onClick={() => updateFilter("page", (filters.page ?? 1) - 1)}
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </Button>
              <span className="text-xs tabular-nums">
                {filters.page ?? 1} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={(filters.page ?? 1) >= totalPages}
                onClick={() => updateFilter("page", (filters.page ?? 1) + 1)}
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Mobile Cards */}
      <div className="flex flex-col gap-3 md:hidden">
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-44 rounded-xl" />
            ))
          : settlements.length === 0
            ? (
                <EmptyState
                  icon={PiggyBank}
                  title="No settlements found"
                  description="Settlements will appear here once payments are processed and settled."
                />
              )
            : settlements.map((s) => {
                const sc = settlementStatusConfig[s.status] ?? {
                  label: s.status,
                  className: "bg-muted text-muted-foreground border-border",
                };
                const batchLabel = s.storeCode ?? s.batch;
                const totalFees = s.providerFee + s.xpayFee;
                const hasPartial = s.releasedAmount !== undefined && s.releasedAmount > 0;
                return (
                  <motion.div key={s.id} {...fadeUp}>
                    <Card className="border-border/60 bg-card/60 p-4 backdrop-blur-xl">
                      <div className="flex items-center justify-between">
                        <div className="min-w-0">
                          <p className="truncate font-mono text-xs text-primary">
                            {batchLabel}
                          </p>
                          <p className="mt-0.5 text-xs text-muted-foreground">
                            {s.storeName ?? "—"} · {s.provider}
                          </p>
                        </div>
                        <span
                          className={cn(
                            "shrink-0 rounded-md border px-2 py-0.5 text-xs font-medium",
                            sc.className
                          )}
                        >
                          {sc.label}
                        </span>
                      </div>

                      <div className="mt-3 grid grid-cols-2 gap-2">
                        <div className="rounded-lg bg-background/40 p-2">
                          <p className="text-[10px] text-muted-foreground">Gross</p>
                          <p className="font-mono text-xs font-medium tabular-nums">
                            {formatCurrency(s.gross, s.currency)}
                          </p>
                        </div>
                        <div className="rounded-lg bg-background/40 p-2">
                          <p className="text-[10px] text-muted-foreground">
                            Merchant Net
                          </p>
                          <p className="font-mono text-xs font-semibold tabular-nums text-emerald-400">
                            {formatCurrency(s.merchantNet, s.currency)}
                          </p>
                        </div>
                        <div className="rounded-lg bg-background/40 p-2">
                          <p className="text-[10px] text-muted-foreground">
                            Processing Costs
                          </p>
                          <p className="font-mono text-xs tabular-nums text-rose-400">
                            −{formatCurrency(totalFees, s.currency)}
                          </p>
                        </div>
                        {hasPartial && (
                          <div className="rounded-lg bg-background/40 p-2">
                            <p className="text-[10px] text-muted-foreground">
                              Released
                            </p>
                            <p className="font-mono text-xs tabular-nums text-sky-400">
                              {formatCurrency(s.releasedAmount!, s.currency)}
                            </p>
                          </div>
                        )}
                      </div>

                      <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                        <span>{s.transactionCount} transactions</span>
                        <span>Available {formatDate(s.providerAvailableDate)}</span>
                      </div>
                    </Card>
                  </motion.div>
                );
              })}

        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-3 pt-2">
            <Button
              variant="outline"
              size="sm"
              disabled={filters.page === 1}
              onClick={() => updateFilter("page", (filters.page ?? 1) - 1)}
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              Previous
            </Button>
            <span className="text-xs tabular-nums">
              {filters.page ?? 1} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={(filters.page ?? 1) >= totalPages}
              onClick={() => updateFilter("page", (filters.page ?? 1) + 1)}
            >
              Next
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
