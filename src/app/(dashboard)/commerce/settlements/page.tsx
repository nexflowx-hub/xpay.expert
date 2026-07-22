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
} from "lucide-react";
import { useSettlements } from "@/hooks/use-queries";
import {
  PageHeader,
  ErrorState,
  EmptyState,
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
import { formatCurrency, formatDate, cn } from "@/lib/utils";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { DataTableFilters, Settlement } from "@/types";

const STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: "", label: "All Statuses" },
  { value: "pending", label: "Pending" },
  { value: "available", label: "Available" },
  { value: "released", label: "Released" },
  { value: "processing", label: "Processing" },
];

const settlementStatusConfig: Record<
  string,
  { label: string; className: string }
> = {
  pending: {
    label: "Pending",
    className: "bg-amber-500/12 text-amber-400 border-amber-500/25",
  },
  available: {
    label: "Available",
    className: "bg-emerald-500/12 text-emerald-400 border-emerald-500/25",
  },
  released: {
    label: "Released",
    className: "bg-emerald-500/12 text-emerald-400 border-emerald-500/25",
  },
  processing: {
    label: "Processing",
    className: "bg-sky-500/12 text-sky-400 border-sky-500/25",
  },
};

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

  const settlements: Settlement[] =
    (settlementsPage as { data?: Settlement[] } | null)?.data ?? [];
  const meta = (settlementsPage as { meta?: { page: number; limit: number; total: number; pages: number } } | null)?.meta;
  const totalPages = meta?.pages ?? 1;
  const totalItems = meta?.total ?? 0;

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

      {/* Info Banner */}
      <Alert className="border-border/60 bg-card/60 backdrop-blur-xl">
        <Info className="h-4 w-4 text-sky-400" />
        <AlertDescription className="text-xs text-muted-foreground">
          Settlements represent the settlement of processed payments into your
          Commerce Settlement Wallet. This is money coming IN from payment
          processing, separate from payouts (money going OUT).
        </AlertDescription>
      </Alert>

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
                <TableHead className="text-xs font-medium text-right">Provider Fee</TableHead>
                <TableHead className="text-xs font-medium text-right">XPAY Fee</TableHead>
                <TableHead className="text-xs font-medium text-right">Merchant Net</TableHead>
                <TableHead className="text-xs font-medium text-right">Available</TableHead>
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
                      return (
                        <TableRow key={s.id} className="border-border/30">
                          <TableCell className="font-mono text-xs text-primary">
                            {s.batch}
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
                            −{formatCurrency(s.providerFee, s.currency)}
                          </TableCell>
                          <TableCell className="text-right font-mono text-xs tabular-nums text-rose-400">
                            −{formatCurrency(s.xpayFee, s.currency)}
                          </TableCell>
                          <TableCell className="text-right font-mono text-sm font-medium tabular-nums">
                            {formatCurrency(s.merchantNet, s.currency)}
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
                return (
                  <motion.div key={s.id} {...fadeUp}>
                    <Card className="border-border/60 bg-card/60 p-4 backdrop-blur-xl">
                      <div className="flex items-center justify-between">
                        <div className="min-w-0">
                          <p className="truncate font-mono text-xs text-primary">
                            {s.batch}
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