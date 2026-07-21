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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader, StatusBadge, ErrorState } from "@/components/shared";
import { useAdminHealth } from "@/hooks/use-queries";
import { formatNumber } from "@/lib/utils";
import type { SystemHealth } from "@/types";
import { Gauge, Server, Activity, Cpu } from "lucide-react";

export default function AdminHealthPage() {
  const { data, isLoading, isError, refetch } = useAdminHealth();
  const health = data as SystemHealth | undefined;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="System Health"
          description="Infrastructure status monitoring"
          breadcrumbs={[{ label: "Admin" }, { label: "Infrastructure" }, { label: "Health" }]}
        />
        <div className="grid gap-4 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-60 rounded-xl" />
      </div>
    );
  }

  if (isError || !health) {
    return (
      <div className="space-y-6">
        <PageHeader title="System Health" breadcrumbs={[{ label: "Admin" }, { label: "Infrastructure" }, { label: "Health" }]} />
        <ErrorState message="Failed to load system health" onRetry={() => refetch()} />
      </div>
    );
  }

  const uptimePct = (health.uptime * 100).toFixed(2);

  return (
    <div className="space-y-6">
      <PageHeader
        title="System Health"
        description="Infrastructure status monitoring"
        breadcrumbs={[{ label: "Admin" }, { label: "Infrastructure" }, { label: "Health" }]}
      />

      {/* Status Overview */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="border-border/60 bg-card/60 backdrop-blur-xl">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
              <Gauge className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Overall Status</p>
              <div className="mt-0.5">
                <StatusBadge status={health.status} />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/60 bg-card/60 backdrop-blur-xl">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10">
              <Activity className="h-5 w-5 text-emerald-400" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Uptime</p>
              <p className="text-lg font-semibold">{uptimePct}%</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/60 bg-card/60 backdrop-blur-xl">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-500/10">
              <Server className="h-5 w-5 text-amber-400" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Services</p>
              <p className="text-lg font-semibold">{health.services.length}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Services Table */}
      <Card className="border-border/60 bg-card/60 backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            <Server className="h-4 w-4 text-primary" />
            Services
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="hidden md:block overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-border/60 hover:bg-transparent">
                  <TableHead>Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Latency (ms)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {health.services.map((s) => (
                  <TableRow key={s.name} className="border-border/40">
                    <TableCell className="font-medium">{s.name}</TableCell>
                    <TableCell><StatusBadge status={s.status} /></TableCell>
                    <TableCell className="text-right font-mono text-sm tabular-nums">{formatNumber(s.latencyMs)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          {/* Mobile */}
          <div className="space-y-3 md:hidden">
            {health.services.map((s) => (
              <div key={s.name} className="flex items-center justify-between rounded-lg border border-border/40 p-3">
                <div>
                  <p className="text-sm font-medium">{s.name}</p>
                  <p className="text-xs text-muted-foreground">{formatNumber(s.latencyMs)}ms</p>
                </div>
                <StatusBadge status={s.status} />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Queues Table */}
      <Card className="border-border/60 bg-card/60 backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            <Activity className="h-4 w-4 text-primary" />
            Queues
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="hidden md:block overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-border/60 hover:bg-transparent">
                  <TableHead>Name</TableHead>
                  <TableHead className="text-right">Pending</TableHead>
                  <TableHead className="text-right">Processing</TableHead>
                  <TableHead className="text-right">Throughput</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {health.queues.map((q) => (
                  <TableRow key={q.name} className="border-border/40">
                    <TableCell className="font-medium">{q.name}</TableCell>
                    <TableCell className="text-right font-mono text-sm tabular-nums">{formatNumber(q.pending)}</TableCell>
                    <TableCell className="text-right font-mono text-sm tabular-nums">{formatNumber(q.processing)}</TableCell>
                    <TableCell className="text-right font-mono text-sm tabular-nums">{formatNumber(q.throughput)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <div className="space-y-3 md:hidden">
            {health.queues.map((q) => (
              <div key={q.name} className="rounded-lg border border-border/40 p-3 space-y-1.5">
                <p className="text-sm font-medium">{q.name}</p>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div><span className="text-muted-foreground">Pending</span><p className="font-mono font-medium">{formatNumber(q.pending)}</p></div>
                  <div><span className="text-muted-foreground">Processing</span><p className="font-mono font-medium">{formatNumber(q.processing)}</p></div>
                  <div><span className="text-muted-foreground">Throughput</span><p className="font-mono font-medium">{formatNumber(q.throughput)}</p></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Workers Table */}
      <Card className="border-border/60 bg-card/60 backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            <Cpu className="h-4 w-4 text-primary" />
            Workers
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="hidden md:block overflow-x-auto">
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
                {health.workers.map((w) => (
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
            {health.workers.map((w) => (
              <div key={w.name} className="rounded-lg border border-border/40 p-3 space-y-1.5">
                <p className="text-sm font-medium">{w.name}</p>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div><span className="text-muted-foreground">Active</span><p className="font-mono font-medium">{formatNumber(w.active)}</p></div>
                  <div><span className="text-muted-foreground">Idle</span><p className="font-mono font-medium">{formatNumber(w.idle)}</p></div>
                  <div><span className="text-muted-foreground">Region</span><p className="font-medium">{w.region}</p></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}