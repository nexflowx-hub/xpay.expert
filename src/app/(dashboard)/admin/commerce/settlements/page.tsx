"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader, StatusBadge, EmptyState, ErrorState, CurrencyBadge } from "@/components/shared";
import { useAdminSettlements } from "@/hooks/use-queries";
import { formatCurrency, formatDate } from "@/lib/utils";
import { DataTableFilters, Settlement } from "@/types";
import { PiggyBank } from "lucide-react";

export default function AdminSettlementsPage() {
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<DataTableFilters>({ page: 1, limit: 10 });

  const { data, isLoading, isError, refetch } = useAdminSettlements(filters);

  const settlements: Settlement[] = Array.isArray(data?.data) ? data.data : [];
  const meta = data?.meta;

  function handlePage(p: number) {
    setPage(p);
    setFilters((f) => ({ ...f, page: p }));
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Settlements"
          description="All platform settlement batches"
          breadcrumbs={[{ label: "Admin" }, { label: "Operations" }, { label: "Settlements" }]}
        />
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-14 rounded-lg" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="space-y-6">
        <PageHeader title="Settlements" breadcrumbs={[{ label: "Admin" }, { label: "Operations" }, { label: "Settlements" }]} />
        <ErrorState message="Failed to load settlements" onRetry={() => refetch()} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Settlements"
        description={`${meta?.total ?? 0} settlement batches`}
        breadcrumbs={[{ label: "Admin" }, { label: "Operations" }, { label: "Settlements" }]}
      />

      {settlements.length === 0 && (
        <EmptyState icon={PiggyBank} title="No settlements" description="No settlement batches found" />
      )}

      {settlements.length > 0 && (
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
                  <TableHead>Batch</TableHead>
                  <TableHead>Merchant</TableHead>
                  <TableHead>Store</TableHead>
                  <TableHead>Provider</TableHead>
                  <TableHead className="text-right">Tx Count</TableHead>
                  <TableHead className="text-right">Gross</TableHead>
                  <TableHead className="text-right">Provider Fee</TableHead>
                  <TableHead className="text-right">XPAY Fee</TableHead>
                  <TableHead className="text-right">Merchant Net</TableHead>
                  <TableHead>Available</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {settlements.map((s) => (
                  <TableRow key={s.id} className="border-border/40">
                    <TableCell className="font-mono text-xs">{s.batch}</TableCell>
                    <TableCell className="font-medium">{s.merchantName}</TableCell>
                    <TableCell className="text-muted-foreground">{s.storeName ?? "—"}</TableCell>
                    <TableCell className="text-muted-foreground">{s.provider}</TableCell>
                    <TableCell className="text-right font-mono text-sm tabular-nums">{s.transactionCount}</TableCell>
                    <TableCell className="text-right font-mono text-sm tabular-nums">
                      <CurrencyBadge currency={s.currency} amount={s.gross} />
                    </TableCell>
                    <TableCell className="text-right font-mono text-sm tabular-nums text-rose-400">
                      -{formatCurrency(s.providerFee, s.currency)}
                    </TableCell>
                    <TableCell className="text-right font-mono text-sm tabular-nums text-rose-400">
                      -{formatCurrency(s.xpayFee, s.currency)}
                    </TableCell>
                    <TableCell className="text-right font-mono text-sm tabular-nums font-medium">
                      {formatCurrency(s.merchantNet, s.currency)}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">{formatDate(s.providerAvailableDate)}</TableCell>
                    <TableCell><StatusBadge status={s.status} /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </motion.div>

          {/* Mobile Cards */}
          <div className="space-y-3 lg:hidden">
            {settlements.map((s) => (
              <motion.div
                key={s.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="rounded-xl border border-border/60 bg-card/60 p-4 backdrop-blur-xl space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-mono text-xs text-muted-foreground">{s.batch}</p>
                      <p className="text-sm font-semibold">{s.merchantName}</p>
                    </div>
                    <StatusBadge status={s.status} />
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-muted-foreground">Provider</span>
                      <p className="font-medium">{s.provider}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Tx Count</span>
                      <p className="font-mono font-medium">{s.transactionCount}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Gross</span>
                      <p className="font-mono font-medium"><CurrencyBadge currency={s.currency} amount={s.gross} /></p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Merchant Net</span>
                      <p className="font-mono font-medium">{formatCurrency(s.merchantNet, s.currency)}</p>
                    </div>
                  </div>
                  <p className="text-[10px] text-muted-foreground/60">
                    Available {formatDate(s.providerAvailableDate)}
                  </p>
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