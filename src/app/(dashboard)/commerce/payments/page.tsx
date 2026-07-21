"use client";

import * as React from "react";
import { motion } from "framer-motion";
import {
  Receipt,
  DollarSign,
  CheckCircle2,
  Clock,
  XCircle,
  Search,
  ChevronLeft,
  ChevronRight,
  Inbox,
} from "lucide-react";
import { useTransactions, useTransactionStats } from "@/hooks/use-queries";
import {
  PageHeader,
  ErrorState,
  EmptyState,
  StatCard,
  fadeUp,
} from "@/components/shared";
import { StatusBadge, MethodBadge } from "@/components/shared/badges";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
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
import { formatCurrency, formatDate, cn } from "@/lib/utils";
import { CURRENCIES } from "@/config";
import type { DataTableFilters, Transaction } from "@/types";

const STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: "", label: "All Statuses" },
  { value: "succeeded", label: "Succeeded" },
  { value: "pending", label: "Pending" },
  { value: "failed", label: "Failed" },
  { value: "refunded", label: "Refunded" },
  { value: "disputed", label: "Disputed" },
  { value: "authorized", label: "Authorized" },
];

const GATEWAY_OPTIONS: { value: string; label: string }[] = [
  { value: "", label: "All Gateways" },
  { value: "stripe", label: "Stripe" },
  { value: "adyen", label: "Adyen" },
  { value: "redunicre", label: "Redunicre" },
  { value: "ebanx", label: "EBANX" },
];

const PAGE_SIZE = 15;

interface TxStats {
  total?: number;
  succeeded?: number;
  pending?: number;
  failed?: number;
  volume?: number;
}

export default function PaymentsPage() {
  const [filters, setFilters] = React.useState<DataTableFilters>({
    page: 1,
    limit: PAGE_SIZE,
    sortBy: "createdAt",
    sortDir: "desc",
  });

  const {
    data: txPage,
    isLoading,
    isError,
    refetch,
  } = useTransactions(filters);

  const { data: stats, isLoading: sLoading } = useTransactionStats();

  const transactions: Transaction[] =
    (txPage as { data?: Transaction[] } | null)?.data ?? [];
  const meta = (txPage as { meta?: { page: number; limit: number; total: number; pages: number } } | null)?.meta;
  const totalPages = meta?.pages ?? 1;
  const totalItems = meta?.total ?? 0;

  const statsData = stats as TxStats | null;

  function updateFilter(key: keyof DataTableFilters, value: string | number | undefined) {
    setFilters((prev) => ({
      ...prev,
      [key]: value || undefined,
      page: key !== "page" ? 1 : value,
    }));
  }

  if (isError) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader title="Payments" description="View and manage all payment transactions." />
        <ErrorState
          message="Failed to load payments. The backend may be unreachable."
          onRetry={() => refetch()}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Payments"
        description="View and manage all payment transactions."
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        {sLoading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))
        ) : (
          <>
            <StatCard
              label="Total"
              value={statsData?.total ?? 0}
              icon={Receipt}
              accent="blue"
              format={(n) => n.toLocaleString()}
            />
            <StatCard
              label="Succeeded"
              value={statsData?.succeeded ?? 0}
              icon={CheckCircle2}
              accent="green"
              format={(n) => n.toLocaleString()}
            />
            <StatCard
              label="Pending"
              value={statsData?.pending ?? 0}
              icon={Clock}
              accent="amber"
              format={(n) => n.toLocaleString()}
            />
            <StatCard
              label="Failed"
              value={statsData?.failed ?? 0}
              icon={XCircle}
              accent="rose"
              format={(n) => n.toLocaleString()}
            />
            <StatCard
              label="Volume"
              value={statsData?.volume ?? 0}
              icon={DollarSign}
              accent="green"
              format={(n) => formatCurrency(n, "EUR", { compact: true })}
            />
          </>
        )}
      </div>

      {/* Filter Bar */}
      <Card className="border-border/60 bg-card/60 p-4 backdrop-blur-xl">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative min-w-[180px] flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by reference..."
              value={filters.reference ?? ""}
              onChange={(e) => updateFilter("reference", e.target.value)}
              className="pl-9"
            />
          </div>
          <Select
            value={filters.status ?? ""}
            onValueChange={(v) => updateFilter("status", v)}
          >
            <SelectTrigger className="w-[150px]">
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
          <Select
            value={filters.gateway ?? ""}
            onValueChange={(v) => updateFilter("gateway", v)}
          >
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Gateway" />
            </SelectTrigger>
            <SelectContent>
              {GATEWAY_OPTIONS.map((g) => (
                <SelectItem key={g.value} value={g.value}>
                  {g.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={filters.currency ?? ""}
            onValueChange={(v) => updateFilter("currency", v)}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Currency" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Currencies</SelectItem>
              {CURRENCIES.map((c) => (
                <SelectItem key={c.code} value={c.code}>
                  {c.flag} {c.code}
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
                <TableHead className="text-xs font-medium">Reference</TableHead>
                <TableHead className="text-xs font-medium">Customer</TableHead>
                <TableHead className="text-xs font-medium text-right">Amount</TableHead>
                <TableHead className="text-xs font-medium">Currency</TableHead>
                <TableHead className="text-xs font-medium">Method</TableHead>
                <TableHead className="text-xs font-medium">Status</TableHead>
                <TableHead className="text-xs font-medium">Country</TableHead>
                <TableHead className="text-xs font-medium text-right">Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading
                ? Array.from({ length: 10 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell colSpan={8}>
                        <Skeleton className="my-1 h-8" />
                      </TableCell>
                    </TableRow>
                  ))
                : transactions.length === 0
                  ? (
                      <TableRow>
                        <TableCell colSpan={8}>
                          <EmptyState
                            icon={Inbox}
                            title="No payments found"
                            description="No transactions match the current filters."
                          />
                        </TableCell>
                      </TableRow>
                    )
                  : transactions.map((tx) => (
                      <TableRow key={tx.id} className="border-border/30">
                        <TableCell className="font-mono text-xs text-primary">
                          {tx.reference}
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="text-sm font-medium">{tx.customer}</p>
                            <p className="text-xs text-muted-foreground">
                              {tx.customerEmail}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-mono text-sm tabular-nums">
                          {formatCurrency(tx.amount, tx.currency)}
                        </TableCell>
                        <TableCell>
                          <span className="text-xs">{tx.currency}</span>
                        </TableCell>
                        <TableCell>
                          <MethodBadge method={tx.method} />
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={tx.status} />
                        </TableCell>
                        <TableCell>
                          <span className="text-xs">{tx.country}</span>
                        </TableCell>
                        <TableCell className="text-right text-xs text-muted-foreground">
                          {formatDate(tx.createdAt)}
                        </TableCell>
                      </TableRow>
                    ))}
            </TableBody>
          </Table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-border/60 px-5 py-3">
            <p className="text-xs text-muted-foreground">
              {totalItems} transaction{totalItems !== 1 ? "s" : ""}
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
          ? Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-32 rounded-xl" />
            ))
          : transactions.length === 0
            ? (
                <EmptyState
                  icon={Inbox}
                  title="No payments found"
                  description="No transactions match the current filters."
                />
              )
            : transactions.map((tx) => (
                <motion.div key={tx.id} {...fadeUp}>
                  <Card className="border-border/60 bg-card/60 p-4 backdrop-blur-xl">
                    <div className="flex items-center justify-between">
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-mono text-xs text-primary">
                          {tx.reference}
                        </p>
                        <p className="mt-0.5 text-sm font-medium">{tx.customer}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-mono text-sm font-semibold tabular-nums">
                          {formatCurrency(tx.amount, tx.currency)}
                        </p>
                        <p className="text-xs text-muted-foreground">{tx.currency}</p>
                      </div>
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <MethodBadge method={tx.method} />
                        <span className="text-xs text-muted-foreground">{tx.country}</span>
                      </div>
                      <StatusBadge status={tx.status} />
                    </div>
                    <p className="mt-2 text-right text-xs text-muted-foreground">
                      {formatDate(tx.createdAt)}
                    </p>
                  </Card>
                </motion.div>
              ))}

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