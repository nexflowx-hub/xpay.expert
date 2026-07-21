"use client";

import * as React from "react";
import { motion } from "framer-motion";
import {
  Users,
  Search,
  Inbox,
  Crown,
  UserCheck,
  UserX,
  UserPlus,
} from "lucide-react";
import { useCustomers } from "@/hooks/use-queries";
import {
  PageHeader,
  ErrorState,
  EmptyState,
  fadeUp,
} from "@/components/shared";
import { StatusBadge } from "@/components/shared/badges";
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
import { Badge } from "@/components/ui/badge";
import { formatCurrency, cn } from "@/lib/utils";
import type { DataTableFilters, Customer } from "@/types";

const SEGMENT_OPTIONS: { value: string; label: string }[] = [
  { value: "", label: "All Segments" },
  { value: "vip", label: "VIP" },
  { value: "regular", label: "Regular" },
  { value: "new", label: "New" },
  { value: "at_risk", label: "At Risk" },
];

const segmentConfig: Record<string, { label: string; className: string }> = {
  vip: {
    label: "VIP",
    className: "bg-amber-500/12 text-amber-400 border-amber-500/25",
  },
  regular: {
    label: "Regular",
    className: "bg-emerald-500/12 text-emerald-400 border-emerald-500/25",
  },
  new: {
    label: "New",
    className: "bg-sky-500/12 text-sky-400 border-sky-500/25",
  },
  at_risk: {
    label: "At Risk",
    className: "bg-rose-500/12 text-rose-400 border-rose-500/25",
  },
};

export default function CustomersPage() {
  const [filters, setFilters] = React.useState<DataTableFilters>({
    page: 1,
    limit: 50,
  });

  const {
    data: customersData,
    isLoading,
    isError,
    refetch,
  } = useCustomers(filters);

  const customers: Customer[] = Array.isArray(customersData)
    ? customersData
    : (customersData as { data?: Customer[] } | null)?.data ?? [];

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
        <PageHeader title="Customers" description="View and manage your customer base." />
        <ErrorState
          message="Failed to load customers. The backend may be unreachable."
          onRetry={() => refetch()}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Customers"
        description="View and manage your customer base."
      />

      {/* Filter Bar */}
      <Card className="border-border/60 bg-card/60 p-4 backdrop-blur-xl">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative min-w-[200px] flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={filters.search ?? ""}
              onChange={(e) => updateFilter("search", e.target.value)}
              className="h-9 w-full rounded-md border border-input bg-transparent px-3 pl-9 py-1 text-sm shadow-xs transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
          </div>
          <Select
            value={filters.search?.includes("segment") ? "" : ""}
            onValueChange={(v) => updateFilter("search", v ? `segment:${v}` : undefined)}
          >
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Segment" />
            </SelectTrigger>
            <SelectContent>
              {SEGMENT_OPTIONS.map((s) => (
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
                <TableHead className="text-xs font-medium">Name</TableHead>
                <TableHead className="text-xs font-medium">Email</TableHead>
                <TableHead className="text-xs font-medium">Country</TableHead>
                <TableHead className="text-xs font-medium text-right">LTV</TableHead>
                <TableHead className="text-xs font-medium text-right">Orders</TableHead>
                <TableHead className="text-xs font-medium">Segment</TableHead>
                <TableHead className="text-xs font-medium">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading
                ? Array.from({ length: 10 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell colSpan={7}>
                        <Skeleton className="my-1 h-8" />
                      </TableCell>
                    </TableRow>
                  ))
                : customers.length === 0
                  ? (
                      <TableRow>
                        <TableCell colSpan={7}>
                          <EmptyState
                            icon={Users}
                            title="No customers found"
                            description="Customers will appear here once they make their first purchase."
                          />
                        </TableCell>
                      </TableRow>
                    )
                  : customers.map((c) => (
                      <TableRow key={c.id} className="border-border/30">
                        <TableCell>
                          <div className="flex items-center gap-2.5">
                            <div className="grid h-8 w-8 place-items-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                              {c.name
                                .split(" ")
                                .map((w) => w[0])
                                .slice(0, 2)
                                .join("")
                                .toUpperCase()}
                            </div>
                            <span className="text-sm font-medium">{c.name}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {c.email}
                        </TableCell>
                        <TableCell className="text-xs">{c.country}</TableCell>
                        <TableCell className="text-right font-mono text-sm tabular-nums">
                          {formatCurrency(c.ltv, "EUR", { compact: true })}
                        </TableCell>
                        <TableCell className="text-right font-mono text-sm tabular-nums">
                          {c.orders}
                        </TableCell>
                        <TableCell>
                          <SegmentBadge segment={c.segment} />
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={c.status} />
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
          : customers.length === 0
            ? (
                <EmptyState
                  icon={Users}
                  title="No customers found"
                  description="Customers will appear here once they make their first purchase."
                />
              )
            : customers.map((c) => (
                <motion.div key={c.id} {...fadeUp}>
                  <Card className="border-border/60 bg-card/60 p-4 backdrop-blur-xl">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="grid h-10 w-10 place-items-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                          {c.name
                            .split(" ")
                            .map((w) => w[0])
                            .slice(0, 2)
                            .join("")
                            .toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold">
                            {c.name}
                          </p>
                          <p className="truncate text-xs text-muted-foreground">
                            {c.email}
                          </p>
                        </div>
                      </div>
                      <StatusBadge status={c.status} />
                    </div>
                    <div className="mt-3 grid grid-cols-3 gap-2">
                      <div className="rounded-lg bg-background/40 p-2">
                        <p className="text-[10px] text-muted-foreground">LTV</p>
                        <p className="font-mono text-xs font-semibold tabular-nums">
                          {formatCurrency(c.ltv, "EUR", { compact: true })}
                        </p>
                      </div>
                      <div className="rounded-lg bg-background/40 p-2">
                        <p className="text-[10px] text-muted-foreground">Orders</p>
                        <p className="font-mono text-xs font-semibold tabular-nums">
                          {c.orders}
                        </p>
                      </div>
                      <div className="rounded-lg bg-background/40 p-2">
                        <p className="text-[10px] text-muted-foreground">Country</p>
                        <p className="text-xs font-medium">{c.country}</p>
                      </div>
                    </div>
                    <div className="mt-2">
                      <SegmentBadge segment={c.segment} />
                    </div>
                  </Card>
                </motion.div>
              ))}
      </div>
    </div>
  );
}

function SegmentBadge({ segment }: { segment: string }) {
  const cfg = segmentConfig[segment] ?? {
    label: segment,
    className: "bg-muted text-muted-foreground border-border",
  };
  return (
    <Badge variant="outline" className={cn("text-[10px] font-medium", cfg.className)}>
      {cfg.label}
    </Badge>
  );
}