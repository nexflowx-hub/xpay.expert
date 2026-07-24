"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Send,
  Plus,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Inbox,
  ArrowUpRight,
  Info,
  Banknote,
  Clock,
  Lock,
  ShieldAlert,
  CalendarClock,
  Wallet,
} from "lucide-react";
import { useMerchantPayouts, usePlatformBootstrap, useMerchantPayoutSummary } from "@/hooks/use-queries";
import {
  PageHeader,
  ErrorState,
  EmptyState,
  StatCard,
  fadeUp,
} from "@/components/shared";
import { formatCurrency, formatDate, cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
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
import type {
  MerchantPayout,
  MerchantPayoutStatus,
  MerchantPayoutMethod,
  CurrencyCode,
} from "@/types";

// ---- Status badge config ----
const payoutStatusConfig: Record<
  MerchantPayoutStatus,
  { label: string; className: string }
> = {
  pending_review: {
    label: "Pending Review",
    className: "bg-amber-500/12 text-amber-400 border-amber-500/25",
  },
  fx_pending: {
    label: "FX Pending",
    className: "bg-orange-500/12 text-orange-400 border-orange-500/25",
  },
  approved: {
    label: "Approved",
    className: "bg-sky-500/12 text-sky-400 border-sky-500/25",
  },
  processing: {
    label: "Processing",
    className: "bg-sky-500/12 text-sky-400 border-sky-500/25",
  },
  paid: {
    label: "Paid",
    className: "bg-emerald-500/12 text-emerald-400 border-emerald-500/25",
  },
  rejected: {
    label: "Rejected",
    className: "bg-rose-500/12 text-rose-400 border-rose-500/25",
  },
  cancelled: {
    label: "Cancelled",
    className: "bg-muted text-muted-foreground border-border",
  },
};

function PayoutStatusBadge({ status }: { status: MerchantPayoutStatus }) {
  const cfg = payoutStatusConfig[status];
  return (
    <Badge variant="outline" className={cn("gap-1 font-medium", cfg.className)}>
      {cfg.label}
    </Badge>
  );
}

const methodLabels: Record<MerchantPayoutMethod, string> = {
  SEPA_INSTANT: "SEPA Instant",
  PIX: "PIX",
  USDT_TRC20: "USDT TRC20",
  USDT_ERC20: "USDT ERC20",
  MANUAL: "Manual",
};

const ALL_STATUSES: { value: string; label: string }[] = [
  { value: "", label: "All Statuses" },
  { value: "pending_review", label: "Pending Review" },
  { value: "fx_pending", label: "FX Pending" },
  { value: "approved", label: "Approved" },
  { value: "processing", label: "Processing" },
  { value: "paid", label: "Paid" },
  { value: "rejected", label: "Rejected" },
  { value: "cancelled", label: "Cancelled" },
];

const METHOD_FILTERS: { value: string; label: string }[] = [
  { value: "", label: "All Methods" },
  { value: "SEPA_INSTANT", label: "SEPA Instant" },
  { value: "PIX", label: "PIX" },
  { value: "USDT_TRC20", label: "USDT TRC20" },
  { value: "USDT_ERC20", label: "USDT ERC20" },
  { value: "MANUAL", label: "Manual" },
];

const CURRENCY_FILTERS: { value: string; label: string }[] = [
  { value: "", label: "All Currencies" },
  { value: "EUR", label: "EUR" },
  { value: "USD", label: "USD" },
  { value: "BRL", label: "BRL" },
  { value: "GBP", label: "GBP" },
  { value: "USDT", label: "USDT" },
];

const PAGE_SIZE = 10;

// ---- Mobile card for each payout ----
function PayoutMobileCard({ payout }: { payout: MerchantPayout }) {
  const router = useRouter();
  return (
    <Card
      className="cursor-pointer border-border/60 bg-card/60 p-4 backdrop-blur-xl transition hover:border-primary/30"
      onClick={() => router.push(`/commerce/payouts/${payout.id}`)}
    >
      <div className="flex items-start justify-between">
        <div className="min-w-0 flex-1">
          <p className="truncate font-mono text-sm font-medium text-primary">
            {payout.ticketCode}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {formatDate(payout.createdAt)}
          </p>
        </div>
        <PayoutStatusBadge status={payout.status} />
      </div>
      <div className="mt-3 grid grid-cols-2 gap-3">
        <div>
          <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Source</p>
          <p className="mt-0.5 font-mono text-sm">
            {formatCurrency(payout.sourceAmount, payout.sourceCurrency)}
          </p>
        </div>
        <div>
          <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Payout</p>
          <p className="mt-0.5 font-mono text-sm">
            {formatCurrency(payout.payoutAmount, payout.payoutCurrency)}
          </p>
        </div>
        <div>
          <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Method</p>
          <p className="mt-0.5 text-sm">{methodLabels[payout.method]}</p>
        </div>
        <div>
          <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Beneficiary</p>
          <p className="mt-0.5 truncate text-sm">{payout.beneficiaryName}</p>
        </div>
      </div>
    </Card>
  );
}

export default function PayoutsListPage() {
  const router = useRouter();

  const { data: bootstrap } = usePlatformBootstrap();
  const capabilities = bootstrap?.capabilities ?? {};
  const merchantPayoutsCap = capabilities.merchantPayouts;
  const payoutEnabled = merchantPayoutsCap === true || merchantPayoutsCap === "enabled";

  const { data: payoutSummary, isLoading: summaryLoading } = useMerchantPayoutSummary();

  const [statusFilter, setStatusFilter] = React.useState<string>("");
  const [methodFilter, setMethodFilter] = React.useState<string>("");
  const [currencyFilter, setCurrencyFilter] = React.useState<string>("");
  const [page, setPage] = React.useState(1);

  // Build offset from page
  const offset = (page - 1) * PAGE_SIZE;

  // Merge filters (only non-empty)
  const filters: { status?: string; limit?: number; offset?: number } = {
    limit: PAGE_SIZE,
    offset,
  };
  if (statusFilter) filters.status = statusFilter;

  const {
    data: response,
    isLoading,
    isError,
    refetch,
  } = useMerchantPayouts(filters);

  // Client-side filter for method and currency
  const allPayouts: MerchantPayout[] = response?.data ?? [];
  const meta = response?.meta;

  const payouts = React.useMemo(() => {
    let filtered = allPayouts;
    if (methodFilter) {
      filtered = filtered.filter((p) => p.method === methodFilter);
    }
    if (currencyFilter) {
      filtered = filtered.filter(
        (p) =>
          p.sourceCurrency === currencyFilter ||
          p.payoutCurrency === currencyFilter
      );
    }
    return filtered;
  }, [allPayouts, methodFilter, currencyFilter]);

  const totalPages = meta ? meta.pages : 1;

  const handleFilterChange = (setter: React.Dispatch<React.SetStateAction<string>>) => {
    return (value: string) => {
      setter(value);
      setPage(1);
    };
  };

  if (isError) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader
          title="Payouts"
          description="Manage your merchant payout requests"
          breadcrumbs={[
            { label: "Commerce", href: "/commerce" },
            { label: "Payouts" },
          ]}
        />
        <ErrorState
          message="Failed to load payouts. Please try again."
          onRetry={() => refetch()}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Payouts"
        description="Manage your merchant payout requests"
        breadcrumbs={[
          { label: "Commerce", href: "/commerce" },
          { label: "Payouts" },
        ]}
        actions={
          <Button
            size="sm"
            className="gap-1.5"
            onClick={() => router.push("/commerce/payouts/new")}
            disabled={!payoutEnabled}
          >
            <Plus className="h-3.5 w-3.5" />
            New Payout
          </Button>
        }
      />

      {/* Payout Summary Panel */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {summaryLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))
        ) : payoutSummary ? (
          <>
            <StatCard
              label="Total ja pago"
              value={payoutSummary.totalPaid}
              icon={Banknote}
              accent="green"
              format={(n) => formatCurrency(n, payoutSummary.totalPaidCurrency, { compact: true })}
            />
            <StatCard
              label="Payouts em analise"
              value={payoutSummary.inReviewCount}
              icon={Clock}
              accent="amber"
              format={(n) => n.toString()}
            />
            <StatCard
              label="Payouts reservados"
              value={payoutSummary.reservedCount}
              icon={Lock}
              accent="rose"
              format={(n) => n.toString()}
            />
            <StatCard
              label="Total reservado"
              value={payoutSummary.totalReserved}
              icon={ShieldAlert}
              accent="amber"
              format={(n) => formatCurrency(n, payoutSummary.totalPaidCurrency, { compact: true })}
            />
            <StatCard
              label="Proxima liberacao prevista"
              value={0}
              icon={CalendarClock}
              accent="blue"
              format={() => payoutSummary.nextScheduledDate ? formatDate(payoutSummary.nextScheduledDate) : "—"}
            />
            <StatCard
              label="Total de payouts pagos"
              value={payoutSummary.totalPaidOutCount}
              icon={Wallet}
              accent="violet"
              format={(n) => n.toString()}
            />
          </>
        ) : null}
      </div>

      {/* Capability Alert — Security: show history, disable creation */}
      {!payoutEnabled && (
        <Alert className="border-amber-500/40 bg-amber-500/5 backdrop-blur-xl">
          <ShieldAlert className="h-4 w-4 text-amber-400" />
          <AlertTitle className="text-xs font-medium">Payouts capability</AlertTitle>
          <AlertDescription className="text-xs text-muted-foreground">
            Pedidos de payout serao ativados apos a reconciliacao da Wallet.
            Pode consultar o historico e previsoes, mas a criacao de novos payouts esta desativada.
          </AlertDescription>
        </Alert>
      )}

      {/* Filters */}
      <Card className="border-border/60 bg-card/60 p-4 backdrop-blur-xl">
        <div className="flex flex-wrap items-center gap-3">
          <Select
            value={statusFilter}
            onValueChange={handleFilterChange(setStatusFilter)}
          >
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              {ALL_STATUSES.map((s) => (
                <SelectItem key={s.value || "all"} value={s.value || "all"}>
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={methodFilter || "all"}
            onValueChange={(v) =>
              handleFilterChange(setMethodFilter)(v === "all" ? "" : v)
            }
          >
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="All Methods" />
            </SelectTrigger>
            <SelectContent>
              {METHOD_FILTERS.map((m) => (
                <SelectItem key={m.value || "all"} value={m.value || "all"}>
                  {m.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={currencyFilter || "all"}
            onValueChange={(v) =>
              handleFilterChange(setCurrencyFilter)(v === "all" ? "" : v)
            }
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="All Currencies" />
            </SelectTrigger>
            <SelectContent>
              {CURRENCY_FILTERS.map((c) => (
                <SelectItem key={c.value || "all"} value={c.value || "all"}>
                  {c.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            variant="ghost"
            size="sm"
            className="ml-auto gap-1.5"
            onClick={() => refetch()}
            disabled={isLoading}
          >
            <RefreshCw
              className={cn("h-3.5 w-3.5", isLoading && "animate-spin")}
            />
            Refresh
          </Button>
        </div>
      </Card>

      {/* Desktop Table */}
      <motion.div {...fadeUp}>
        <Card className="hidden border-border/60 bg-card/60 backdrop-blur-xl md:block">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-border/60 text-left text-xs text-muted-foreground">
                  <TableHead className="text-xs font-medium">Ticket</TableHead>
                  <TableHead className="text-xs font-medium">Requested</TableHead>
                  <TableHead className="text-xs font-medium text-right">
                    Source
                  </TableHead>
                  <TableHead className="text-xs font-medium text-right">
                    Payout
                  </TableHead>
                  <TableHead className="text-xs font-medium">Method</TableHead>
                  <TableHead className="text-xs font-medium">
                    Beneficiary
                  </TableHead>
                  <TableHead className="text-xs font-medium">Status</TableHead>
                  <TableHead className="text-xs font-medium">FX</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading
                  ? Array.from({ length: 6 }).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell colSpan={8}>
                          <Skeleton className="my-1.5 h-7" />
                        </TableCell>
                      </TableRow>
                    ))
                  : payouts.length === 0
                  ? null
                  : payouts.map((payout) => (
                      <TableRow
                        key={payout.id}
                        className="cursor-pointer border-border/30 transition hover:bg-muted/30"
                        onClick={() =>
                          router.push(`/commerce/payouts/${payout.id}`)
                        }
                      >
                        <TableCell className="font-mono text-xs text-primary">
                          {payout.ticketCode}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {formatDate(payout.createdAt)}
                        </TableCell>
                        <TableCell className="text-right">
                          <span className="font-mono text-xs tabular-nums">
                            {formatCurrency(
                              payout.sourceAmount,
                              payout.sourceCurrency
                            )}
                          </span>
                          <span className="ml-1 text-[10px] text-muted-foreground">
                            {payout.sourceCurrency}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <span className="font-mono text-xs tabular-nums">
                            {formatCurrency(
                              payout.payoutAmount,
                              payout.payoutCurrency
                            )}
                          </span>
                          <span className="ml-1 text-[10px] text-muted-foreground">
                            {payout.payoutCurrency}
                          </span>
                        </TableCell>
                        <TableCell className="text-xs">
                          {methodLabels[payout.method]}
                        </TableCell>
                        <TableCell className="max-w-[140px] truncate text-xs">
                          {payout.beneficiaryName}
                        </TableCell>
                        <TableCell>
                          <PayoutStatusBadge status={payout.status} />
                        </TableCell>
                        <TableCell>
                          {payout.fxRequired ? (
                            <Badge
                              variant="outline"
                              className="gap-1 text-amber-400"
                            >
                              {payout.fxStatus === "accepted"
                                ? "Done"
                                : payout.fxStatus || "Pending"}
                            </Badge>
                          ) : (
                            <span className="text-xs text-muted-foreground">
                              —
                            </span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      </motion.div>

      {/* Mobile Cards */}
      <div className="flex flex-col gap-3 md:hidden">
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-40 rounded-xl" />
            ))
          : payouts.map((payout) => (
              <PayoutMobileCard key={payout.id} payout={payout} />
            ))}
      </div>

      {/* Empty State */}
      {!isLoading && payouts.length === 0 && (
        <EmptyState
          icon={Inbox}
          title="No payouts found"
          description={
            statusFilter || methodFilter || currencyFilter
              ? "Try adjusting your filters to see more results."
              : payoutEnabled
                ? "Create your first payout to send funds to a beneficiary."
                : "Payouts are not yet enabled for your account. History and forecasts will appear here."
          }
          action={
            !statusFilter && !methodFilter && !currencyFilter && payoutEnabled ? (
              <Button
                size="sm"
                className="gap-1.5"
                onClick={() => router.push("/commerce/payouts/new")}
              >
                <Plus className="h-3.5 w-3.5" />
                New Payout
              </Button>
            ) : undefined
          }
        />
      )}

      {/* Pagination */}
      {meta && meta.pages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {page} of {meta.pages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= meta.pages}
            onClick={() => setPage((p) => p + 1)}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
