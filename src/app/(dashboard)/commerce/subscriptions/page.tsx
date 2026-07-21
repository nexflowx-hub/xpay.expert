"use client";

import * as React from "react";
import { motion } from "framer-motion";
import {
  Repeat,
  Inbox,
} from "lucide-react";
import { useSubscriptions } from "@/hooks/use-queries";
import {
  PageHeader,
  ErrorState,
  EmptyState,
  fadeUp,
} from "@/components/shared";
import { StatusBadge } from "@/components/shared/badges";
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
import type { Subscription } from "@/types";

const intervalLabel: Record<string, string> = {
  month: "Monthly",
  year: "Yearly",
};

export default function SubscriptionsPage() {
  const {
    data: subsData,
    isLoading,
    isError,
    refetch,
  } = useSubscriptions();

  const subscriptions: Subscription[] = Array.isArray(subsData)
    ? subsData
    : (subsData as { data?: Subscription[] } | null)?.data ?? [];

  if (isError) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader title="Subscriptions" description="View and manage recurring subscriptions." />
        <ErrorState
          message="Failed to load subscriptions. The backend may be unreachable."
          onRetry={() => refetch()}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Subscriptions"
        description="View and manage recurring subscriptions."
      />

      {/* Desktop Table */}
      <Card className="hidden border-border/60 bg-card/60 backdrop-blur-xl md:block">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-border/60 text-left text-xs text-muted-foreground">
                <TableHead className="text-xs font-medium">Customer</TableHead>
                <TableHead className="text-xs font-medium">Plan</TableHead>
                <TableHead className="text-xs font-medium text-right">Amount</TableHead>
                <TableHead className="text-xs font-medium">Status</TableHead>
                <TableHead className="text-xs font-medium">Interval</TableHead>
                <TableHead className="text-xs font-medium text-right">Period End</TableHead>
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
                : subscriptions.length === 0
                  ? (
                      <TableRow>
                        <TableCell colSpan={6}>
                          <EmptyState
                            icon={Repeat}
                            title="No subscriptions yet"
                            description="Subscriptions will appear here once customers subscribe to recurring plans."
                          />
                        </TableCell>
                      </TableRow>
                    )
                  : subscriptions.map((sub) => (
                      <TableRow key={sub.id} className="border-border/30">
                        <TableCell className="text-sm font-medium">
                          {sub.customer}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className="bg-primary/8 text-primary border-primary/20 text-xs"
                          >
                            {sub.plan}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-mono text-sm tabular-nums">
                          {formatCurrency(sub.amount, sub.currency)}
                          <span className="ml-1 text-xs text-muted-foreground">
                            /{sub.interval}
                          </span>
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={sub.status} />
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {intervalLabel[sub.interval] ?? sub.interval}
                        </TableCell>
                        <TableCell className="text-right text-xs text-muted-foreground">
                          {formatDate(sub.currentPeriodEnd)}
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
              <Skeleton key={i} className="h-36 rounded-xl" />
            ))
          : subscriptions.length === 0
            ? (
                <EmptyState
                  icon={Repeat}
                  title="No subscriptions yet"
                  description="Subscriptions will appear here once customers subscribe to recurring plans."
                />
              )
            : subscriptions.map((sub) => (
                <motion.div key={sub.id} {...fadeUp}>
                  <Card className="border-border/60 bg-card/60 p-4 backdrop-blur-xl">
                    <div className="flex items-start justify-between">
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold">
                          {sub.customer}
                        </p>
                        <div className="mt-1 flex items-center gap-2">
                          <Badge
                            variant="outline"
                            className="bg-primary/8 text-primary border-primary/20 text-[10px]"
                          >
                            {sub.plan}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {intervalLabel[sub.interval] ?? sub.interval}
                          </span>
                        </div>
                      </div>
                      <StatusBadge status={sub.status} />
                    </div>

                    <div className="mt-3 flex items-center justify-between">
                      <div>
                        <p className="font-mono text-lg font-semibold tabular-nums">
                          {formatCurrency(sub.amount, sub.currency)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {sub.currency} / {sub.interval}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">
                          Period ends
                        </p>
                        <p className="text-xs font-medium">
                          {formatDate(sub.currentPeriodEnd)}
                        </p>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
      </div>
    </div>
  );
}