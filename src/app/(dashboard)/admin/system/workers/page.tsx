"use client";

import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PageHeader, ErrorState, EmptyState } from "@/components/shared";
import { useAdminHealth } from "@/hooks/use-queries";
import { formatNumber } from "@/lib/utils";
import { Cpu } from "lucide-react";

export default function AdminWorkersPage() {
  const { data, isLoading, isError, refetch } = useAdminHealth();
  const health = data as import("@/types").SystemHealth | undefined;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Workers"
          description="Background worker processes"
          breadcrumbs={[{ label: "Admin" }, { label: "Infrastructure" }, { label: "Workers" }]}
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
        <PageHeader title="Workers" breadcrumbs={[{ label: "Admin" }, { label: "Infrastructure" }, { label: "Workers" }]} />
        <ErrorState message="Failed to load workers" onRetry={() => refetch()} />
      </div>
    );
  }

  const workers = health?.workers ?? [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Workers"
        description={`${workers.length} worker processes`}
        breadcrumbs={[{ label: "Admin" }, { label: "Infrastructure" }, { label: "Workers" }]}
      />

      {workers.length === 0 && (
        <EmptyState icon={Cpu} title="No workers found" description="No worker processes are registered." />
      )}

      {workers.length > 0 && (
        <>
          <div className="hidden md:block overflow-x-auto rounded-xl border border-border/60 bg-card/60 backdrop-blur-xl">
            <Table>
              <TableHeader>
                <TableRow className="border-border/60 hover:bg-transparent">
                  <TableHead>Name</TableHead>
                  <TableHead className="text-right">Active</TableHead>
                  <TableHead className="text-right">Idle</TableHead>
                  <TableHead>Region</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {workers.map((w) => (
                  <TableRow key={w.name} className="border-border/40">
                    <TableCell className="font-medium">{w.name}</TableCell>
                    <TableCell className="text-right font-mono text-sm tabular-nums">{formatNumber(w.active)}</TableCell>
                    <TableCell className="text-right font-mono text-sm tabular-nums">{formatNumber(w.idle)}</TableCell>
                    <TableCell>{w.region}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <div className="space-y-3 md:hidden">
            {workers.map((w) => (
              <div key={w.name} className="rounded-xl border border-border/60 bg-card/60 p-4 backdrop-blur-xl space-y-3">
                <p className="text-sm font-semibold">{w.name}</p>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div><span className="text-muted-foreground">Active</span><p className="font-mono font-medium">{formatNumber(w.active)}</p></div>
                  <div><span className="text-muted-foreground">Idle</span><p className="font-mono font-medium">{formatNumber(w.idle)}</p></div>
                  <div><span className="text-muted-foreground">Region</span><p className="font-medium">{w.region}</p></div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}