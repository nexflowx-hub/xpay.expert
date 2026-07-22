"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Search,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Eye,
  HandCoins,
  Clock,
  CheckCircle2,
  Loader2,
  Ban,
  XCircle,
  ArrowLeftRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  PageHeader,
  StatusBadge,
  EmptyState,
  ErrorState,
} from "@/components/shared";
import { useAdminMerchantPayouts } from "@/hooks/use-queries";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { MerchantPayout, MerchantPayoutStatus } from "@/types";

const STATUS_OPTIONS = [
  { value: "all", label: "All Statuses" },
  { value: "pending_review", label: "Pending Review" },
  { value: "fx_pending", label: "FX Pending" },
  { value: "approved", label: "Approved" },
  { value: "processing", label: "Processing" },
  { value: "paid", label: "Paid" },
  { value: "rejected", label: "Rejected" },
];

const METHOD_OPTIONS = [
  { value: "all", label: "All Methods" },
  { value: "SEPA_INSTANT", label: "SEPA Instant" },
  { value: "PIX", label: "PIX" },
  { value: "USDT_TRC20", label: "USDT TRC20" },
  { value: "USDT_ERC20", label: "USDT ERC20" },
  { value: "MANUAL", label: "Manual" },
];

const PAYOUT_STATUS_COLORS: Record<MerchantPayoutStatus, { className: string; icon: typeof Clock }> = {
  pending_review: { className: "bg-amber-500/12 text-amber-400 border-amber-500/25", icon: Clock },
  fx_pending: { className: "bg-sky-500/12 text-sky-400 border-sky-500/25", icon: ArrowLeftRight },
  approved: { className: "bg-emerald-500/12 text-emerald-400 border-emerald-500/25", icon: CheckCircle2 },
  processing: { className: "bg-violet-500/12 text-violet-400 border-violet-500/25", icon: Loader2 },
  paid: { className: "bg-emerald-500/12 text-emerald-400 border-emerald-500/25", icon: CheckCircle2 },
  rejected: { className: "bg-rose-500/12 text-rose-400 border-rose-500/25", icon: XCircle },
  cancelled: { className: "bg-muted text-muted-foreground border-border", icon: Ban },
};

function PayoutStatusBadge({ status }: { status: MerchantPayoutStatus }) {
  const cfg = PAYOUT_STATUS_COLORS[status] ?? {
    className: "bg-muted text-muted-foreground border-border",
    icon: Clock,
  };
  const Icon = cfg.icon;
  return (
    <Badge variant="outline" className={`gap-1 font-medium ${cfg.className}`}>
      <Icon className="h-3 w-3" />
      {status.replace(/_/g, " ")}
    </Badge>
  );
}

export default function AdminPayoutsPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("all");
  const [methodFilter, setMethodFilter] = useState("all");
  const [merchantId, setMerchantId] = useState("");
  const [search, setSearch] = useState("");

  const filters: {
    status?: string;
    merchantId?: string;
    method?: string;
    limit?: number;
    offset?: number;
  } = {
    limit: 10,
    offset: (page - 1) * 10,
  };
  if (statusFilter !== "all") filters.status = statusFilter;
  if (methodFilter !== "all") filters.method = methodFilter;
  if (merchantId.trim()) filters.merchantId = merchantId.trim();

  const { data, isLoading, isError, refetch, isRefetching } = useAdminMerchantPayouts(filters);

  const payouts: MerchantPayout[] = Array.isArray(data?.data) ? data.data : [];
  const meta = data?.meta;

  // Client-side search filtering
  const filtered = useMemo(() => {
    if (!search.trim()) return payouts;
    const q = search.toLowerCase();
    return payouts.filter(
      (p) =>
        p.ticketCode.toLowerCase().includes(q) ||
        p.merchantName.toLowerCase().includes(q) ||
        p.beneficiaryName.toLowerCase().includes(q)
    );
  }, [payouts, search]);

  // KPI counts — use all-status query for accurate counts
  const { data: allData } = useAdminMerchantPayouts({ limit: 1000 });
  const allPayouts: MerchantPayout[] = Array.isArray(allData?.data) ? allData.data : [];

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = {
      pending_review: 0,
      fx_pending: 0,
      approved: 0,
      processing: 0,
      paid: 0,
      rejected: 0,
    };
    for (const p of allPayouts) {
      if (p.status in counts) counts[p.status]++;
    }
    return counts;
  }, [allPayouts]);

  const kpis = [
    { key: "pending_review", label: "Pending Review", icon: Clock, accent: "text-amber-400 bg-amber-500/10" },
    { key: "fx_pending", label: "FX Pending", icon: ArrowLeftRight, accent: "text-sky-400 bg-sky-500/10" },
    { key: "approved", label: "Approved", icon: CheckCircle2, accent: "text-emerald-400 bg-emerald-500/10" },
    { key: "processing", label: "Processing", icon: Loader2, accent: "text-violet-400 bg-violet-500/10" },
    { key: "paid", label: "Paid", icon: CheckCircle2, accent: "text-emerald-400 bg-emerald-500/10" },
    { key: "rejected", label: "Rejected", icon: XCircle, accent: "text-rose-400 bg-rose-500/10" },
  ] as const;

  function handlePage(p: number) {
    setPage(p);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Payout Operations"
        description="Manage merchant payout queue"
        breadcrumbs={[
          { label: "Admin" },
          { label: "Operations" },
          { label: "Payouts" },
        ]}
        actions={
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isRefetching}
          >
            <RefreshCw className={`mr-1.5 h-3.5 w-3.5 ${isRefetching ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        }
      />

      {/* KPI Row */}
      {!isLoading && !isError && (
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
          {kpis.map((kpi) => {
            const Icon = kpi.icon;
            return (
              <Card
                key={kpi.key}
                className="border-border/60 bg-card/60 backdrop-blur-xl py-3"
              >
                <CardContent className="flex flex-col items-center gap-1.5 p-3">
                  <div className={`rounded-md p-1.5 ${kpi.accent}`}>
                    <Icon className="h-3.5 w-3.5" />
                  </div>
                  <span className="text-lg font-semibold tabular-nums">
                    {statusCounts[kpi.key]}
                  </span>
                  <span className="text-[10px] text-muted-foreground text-center leading-tight">
                    {kpi.label}
                  </span>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:flex-wrap">
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Ticket, merchant, beneficiary…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map((o) => (
              <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={methodFilter} onValueChange={(v) => { setMethodFilter(v); setPage(1); }}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {METHOD_OPTIONS.map((o) => (
              <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input
          placeholder="Merchant ID"
          value={merchantId}
          onChange={(e) => { setMerchantId(e.target.value); setPage(1); }}
          className="w-full sm:w-44"
        />
      </div>

      {isLoading && (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-14 rounded-lg" />
          ))}
        </div>
      )}

      {isError && !isLoading && (
        <ErrorState message="Failed to load payouts" onRetry={() => refetch()} />
      )}

      {!isLoading && !isError && filtered.length === 0 && (
        <EmptyState
          icon={HandCoins}
          title="No payouts found"
          description={
            search || statusFilter !== "all" || methodFilter !== "all" || merchantId
              ? "Try adjusting your filters"
              : "No payout tickets in the queue"
          }
        />
      )}

      {!isLoading && !isError && filtered.length > 0 && (
        <>
          {/* Desktop Table */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="hidden lg:block overflow-x-auto rounded-xl border border-border/60 bg-card/60 backdrop-blur-xl"
          >
            <Table>
              <TableHeader>
                <TableRow className="border-border/60 hover:bg-transparent">
                  <TableHead>Ticket</TableHead>
                  <TableHead>Merchant</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Payout</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Beneficiary</TableHead>
                  <TableHead>FX Status</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((p) => (
                  <TableRow key={p.id} className="border-border/40">
                    <TableCell className="font-mono text-xs">{p.ticketCode}</TableCell>
                    <TableCell>
                      <div>
                        <p className="text-sm font-medium">{p.merchantName}</p>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-sm tabular-nums">
                      {formatCurrency(p.sourceAmount, p.sourceCurrency)}
                    </TableCell>
                    <TableCell className="font-mono text-sm tabular-nums font-medium">
                      {formatCurrency(p.payoutAmount, p.payoutCurrency)}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">{p.method.replace(/_/g, " ")}</Badge>
                    </TableCell>
                    <TableCell className="text-sm">{p.beneficiaryName}</TableCell>
                    <TableCell>
                      {p.fxStatus ? (
                        <StatusBadge status={p.fxStatus} />
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell><PayoutStatusBadge status={p.status} /></TableCell>
                    <TableCell className="text-xs text-muted-foreground">{formatDate(p.createdAt)}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.push(`/admin/commerce/payouts/${p.id}`)}
                      >
                        <Eye className="mr-1 h-3.5 w-3.5" />
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </motion.div>

          {/* Mobile Cards */}
          <div className="space-y-3 lg:hidden">
            {filtered.map((p) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="rounded-xl border border-border/60 bg-card/60 p-4 backdrop-blur-xl space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-mono text-xs text-muted-foreground">{p.ticketCode}</p>
                      <p className="text-sm font-semibold">{p.merchantName}</p>
                    </div>
                    <PayoutStatusBadge status={p.status} />
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-muted-foreground">Source</span>
                      <p className="font-mono font-medium">{formatCurrency(p.sourceAmount, p.sourceCurrency)}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Payout</span>
                      <p className="font-mono font-medium">{formatCurrency(p.payoutAmount, p.payoutCurrency)}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Method</span>
                      <p className="font-medium">{p.method.replace(/_/g, " ")}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Beneficiary</span>
                      <p className="font-medium">{p.beneficiaryName}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-1">
                    <p className="text-[10px] text-muted-foreground/60">{formatDate(p.createdAt)}</p>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs"
                      onClick={() => router.push(`/admin/commerce/payouts/${p.id}`)}
                    >
                      <Eye className="mr-1 h-3 w-3" />
                      View
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Pagination */}
          {meta && meta.pages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                Page {meta.page} of {meta.pages} ({meta.total} total)
              </p>
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => handlePage(page - 1)}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= meta.pages}
                  onClick={() => handlePage(page + 1)}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}