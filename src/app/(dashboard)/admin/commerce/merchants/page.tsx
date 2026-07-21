"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Search } from "lucide-react";
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
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader, StatusBadge, EmptyState, ErrorState } from "@/components/shared";
import { useAdminMerchants } from "@/hooks/use-queries";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { AdminMerchant } from "@/types";
import { Building2 } from "lucide-react";

const STATUS_OPTIONS = [
  { value: "all", label: "All Statuses" },
  { value: "active", label: "Active" },
  { value: "pending", label: "Pending" },
  { value: "frozen", label: "Frozen" },
  { value: "suspended", label: "Suspended" },
];

export default function AdminMerchantsPage() {
  const { data, isLoading, isError, refetch } = useAdminMerchants();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const merchants: AdminMerchant[] = Array.isArray(data?.data) ? data.data : [];

  const filtered = useMemo(() => {
    let list = merchants;
    if (statusFilter !== "all") {
      list = list.filter((m) => m.status === statusFilter);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (m) =>
          m.name.toLowerCase().includes(q) ||
          m.email.toLowerCase().includes(q) ||
          m.country.toLowerCase().includes(q)
      );
    }
    return list;
  }, [merchants, search, statusFilter]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Merchants"
          description="All platform merchants"
          breadcrumbs={[
            { label: "Admin" },
            { label: "Merchants" },
          ]}
        />
        <div className="space-y-4">
          <div className="flex gap-3">
            <Skeleton className="h-9 w-64 rounded-lg" />
            <Skeleton className="h-9 w-40 rounded-lg" />
          </div>
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-14 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Merchants"
          breadcrumbs={[{ label: "Admin" }, { label: "Merchants" }]}
        />
        <ErrorState message="Failed to load merchants" onRetry={() => refetch()} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Merchants"
        description={`${merchants.length} registered merchants`}
        breadcrumbs={[{ label: "Admin" }, { label: "Merchants" }]}
      />

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search name, email, country…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {filtered.length === 0 && (
        <EmptyState
          icon={Building2}
          title="No merchants found"
          description={
            search || statusFilter !== "all"
              ? "Try adjusting your search or filters"
              : "No merchants registered yet"
          }
        />
      )}

      {/* Desktop Table */}
      {filtered.length > 0 && (
        <>
          <motion.div
            {...{ initial: { opacity: 0 }, animate: { opacity: 1 } }}
            className="hidden md:block overflow-x-auto rounded-xl border border-border/60 bg-card/60 backdrop-blur-xl"
          >
            <Table>
              <TableHeader>
                <TableRow className="border-border/60 hover:bg-transparent">
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Country</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Risk Score</TableHead>
                  <TableHead className="text-right">Revenue</TableHead>
                  <TableHead>KYC</TableHead>
                  <TableHead>Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((m) => (
                  <TableRow key={m.id} className="border-border/40">
                    <TableCell className="font-medium">{m.name}</TableCell>
                    <TableCell className="text-muted-foreground">{m.email}</TableCell>
                    <TableCell>{m.country}</TableCell>
                    <TableCell>
                      <StatusBadge status={m.status} />
                    </TableCell>
                    <TableCell className="text-right font-mono text-sm tabular-nums">
                      <span
                        className={
                          m.riskScore >= 60
                            ? "text-rose-400"
                            : m.riskScore >= 30
                              ? "text-amber-400"
                              : "text-emerald-400"
                        }
                      >
                        {m.riskScore}
                      </span>
                    </TableCell>
                    <TableCell className="text-right font-mono text-sm tabular-nums">
                      {formatCurrency(m.revenue, "EUR")}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={m.kycStatus} />
                    </TableCell>
                    <TableCell className="text-muted-foreground text-xs">
                      {formatDate(m.createdAt)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </motion.div>

          {/* Mobile Cards */}
          <div className="space-y-3 md:hidden">
            {filtered.map((m) => (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="rounded-xl border border-border/60 bg-card/60 p-4 backdrop-blur-xl space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-semibold text-foreground">{m.name}</p>
                      <p className="text-xs text-muted-foreground">{m.email}</p>
                    </div>
                    <StatusBadge status={m.status} />
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-muted-foreground">Country</span>
                      <p className="font-medium">{m.country}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Risk Score</span>
                      <p
                        className={`font-mono font-medium ${
                          m.riskScore >= 60
                            ? "text-rose-400"
                            : m.riskScore >= 30
                              ? "text-amber-400"
                              : "text-emerald-400"
                        }`}
                      >
                        {m.riskScore}
                      </p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Revenue</span>
                      <p className="font-mono font-medium">{formatCurrency(m.revenue, "EUR")}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">KYC</span>
                      <div className="mt-0.5">
                        <StatusBadge status={m.kycStatus} />
                      </div>
                    </div>
                  </div>
                  <p className="text-[10px] text-muted-foreground/60">
                    Created {formatDate(m.createdAt)}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}