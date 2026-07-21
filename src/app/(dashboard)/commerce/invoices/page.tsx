"use client";

import * as React from "react";
import { motion } from "framer-motion";
import {
  FileText,
  Inbox,
} from "lucide-react";
import { useInvoices } from "@/hooks/use-queries";
import {
  PageHeader,
  ErrorState,
  EmptyState,
  fadeUp,
} from "@/components/shared";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate, cn } from "@/lib/utils";
import type { Invoice } from "@/types";

const invoiceStatusConfig: Record<
  string,
  { label: string; className: string }
> = {
  paid: {
    label: "Paid",
    className: "bg-emerald-500/12 text-emerald-400 border-emerald-500/25",
  },
  open: {
    label: "Open",
    className: "bg-sky-500/12 text-sky-400 border-sky-500/25",
  },
  overdue: {
    label: "Overdue",
    className: "bg-rose-500/12 text-rose-400 border-rose-500/25",
  },
  draft: {
    label: "Draft",
    className: "bg-muted text-muted-foreground border-border",
  },
  void: {
    label: "Void",
    className: "bg-muted text-muted-foreground border-border",
  },
};

function InvoiceStatusBadge({ status }: { status: string }) {
  const cfg = invoiceStatusConfig[status] ?? {
    label: status,
    className: "bg-muted text-muted-foreground border-border",
  };
  return (
    <Badge variant="outline" className={cn("text-[10px] font-medium", cfg.className)}>
      {cfg.label}
    </Badge>
  );
}

export default function InvoicesPage() {
  const {
    data: invoicesData,
    isLoading,
    isError,
    refetch,
  } = useInvoices();

  const invoices: Invoice[] = Array.isArray(invoicesData)
    ? invoicesData
    : (invoicesData as { data?: Invoice[] } | null)?.data ?? [];

  if (isError) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader title="Invoices" description="View and manage all invoices." />
        <ErrorState
          message="Failed to load invoices. The backend may be unreachable."
          onRetry={() => refetch()}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Invoices"
        description="View and manage all invoices."
      />

      {/* Desktop Table */}
      <Card className="hidden border-border/60 bg-card/60 backdrop-blur-xl md:block">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-border/60 text-left text-xs text-muted-foreground">
                <TableHead className="text-xs font-medium">Number</TableHead>
                <TableHead className="text-xs font-medium">Customer</TableHead>
                <TableHead className="text-xs font-medium text-right">Amount</TableHead>
                <TableHead className="text-xs font-medium">Status</TableHead>
                <TableHead className="text-xs font-medium text-right">Due Date</TableHead>
                <TableHead className="text-xs font-medium text-right">Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading
                ? Array.from({ length: 8 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell colSpan={6}>
                        <Skeleton className="my-1 h-8" />
                      </TableCell>
                    </TableRow>
                  ))
                : invoices.length === 0
                  ? (
                      <TableRow>
                        <TableCell colSpan={6}>
                          <EmptyState
                            icon={FileText}
                            title="No invoices yet"
                            description="Invoices will appear here once they are created."
                          />
                        </TableCell>
                      </TableRow>
                    )
                  : invoices.map((inv) => (
                      <TableRow key={inv.id} className="border-border/30">
                        <TableCell className="font-mono text-xs text-primary">
                          {inv.number}
                        </TableCell>
                        <TableCell className="text-sm font-medium">
                          {inv.customer}
                        </TableCell>
                        <TableCell className="text-right font-mono text-sm tabular-nums">
                          {formatCurrency(inv.amount, inv.currency)}
                        </TableCell>
                        <TableCell>
                          <InvoiceStatusBadge status={inv.status} />
                        </TableCell>
                        <TableCell className="text-right text-xs text-muted-foreground">
                          {formatDate(inv.dueDate)}
                        </TableCell>
                        <TableCell className="text-right text-xs text-muted-foreground">
                          {formatDate(inv.createdAt)}
                        </TableCell>
                      </TableRow>
                    ))}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Mobile Cards */}
      <div className="flex flex-col gap-3 md:hidden">
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-32 rounded-xl" />
            ))
          : invoices.length === 0
            ? (
                <EmptyState
                  icon={FileText}
                  title="No invoices yet"
                  description="Invoices will appear here once they are created."
                />
              )
            : invoices.map((inv) => (
                <motion.div key={inv.id} {...fadeUp}>
                  <Card className="border-border/60 bg-card/60 p-4 backdrop-blur-xl">
                    <div className="flex items-start justify-between">
                      <div className="min-w-0 flex-1">
                        <p className="font-mono text-xs text-primary">
                          {inv.number}
                        </p>
                        <p className="mt-0.5 text-sm font-medium">
                          {inv.customer}
                        </p>
                      </div>
                      <InvoiceStatusBadge status={inv.status} />
                    </div>

                    <div className="mt-3 flex items-center justify-between">
                      <div>
                        <p className="font-mono text-lg font-semibold tabular-nums">
                          {formatCurrency(inv.amount, inv.currency)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {inv.currency}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">Due</p>
                        <p className="text-xs font-medium">
                          {formatDate(inv.dueDate)}
                        </p>
                      </div>
                    </div>

                    <p className="mt-2 text-right text-[10px] text-muted-foreground">
                      Created {formatDate(inv.createdAt)}
                    </p>
                  </Card>
                </motion.div>
              ))}
      </div>
    </div>
  );
}