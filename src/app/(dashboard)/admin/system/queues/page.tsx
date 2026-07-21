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
import { Badge } from "@/components/ui/badge";
import { PageHeader, ErrorState, EmptyState } from "@/components/shared";
import { useAdminHealth } from "@/hooks/use-queries";
import { formatNumber } from "@/lib/utils";
import { Activity } from "lucide-react";

export default function AdminQueuesPage() {
  const { data, isLoading, isError, refetch } = useAdminHealth();
  const health = data as import("@/types").SystemHealth | undefined;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Queues"
          description="Message queue monitoring"
          breadcrumbs={[{ label: "Admin" }, { label: "Infrastructure" }, { label: "Queues" }]}
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
        <PageHeader title="Queues" breadcrumbs={[{ label: "Admin" }, { label: "Infrastructure" }, { label: "Queues" }]} />
        <ErrorState message="Failed to load queues" onRetry={() => refetch()} />
      </div>
    );
  }

  const queues = health?.queues ?? [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Queues"
        description={`${queues.length} message queues`}
        breadcrumbs={[{ label: "Admin" }, { label: "Infrastructure" }, { label: "Queues" }]}
      />

      {queues.length === 0 && (
        <EmptyState icon={Activity} title="No queues found" description="No message queues are registered." />
      )}

      {queues.length > 0 && (
        <>
          <div className="hidden md:block overflow-x-auto rounded-xl border border-border/60 bg-card/60 backdrop-blur-xl">
            <Table>
              <TableHeader>
                <TableRow className="border-border/60 hover:bg-transparent">
                  <TableHead>Name</TableHead>
                  <TableHead className="text-right">Pending</TableHead>
                  <TableHead className="text-right">Processing</TableHead>
                  <TableHead className="text-right">Throughput</TableHead>
                  <TableHead>Load</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {queues.map((q) => {
                  const load = q.pending + q.processing;
                  const loadColor = load > 100 ? "text-rose-400" : load > 50 ? "text-amber-400" : "text-emerald-400";
                  return (
                    <TableRow key={q.name} className="border-border/40">
                      <TableCell className="font-medium">{q.name}</TableCell>
                      <TableCell className="text-right font-mono text-sm tabular-nums">
                        {q.pending > 0 ? (
                          <Badge variant="outline" className="bg-amber-500/10 text-amber-400 border-amber-500/25 font-mono">
                            {formatNumber(q.pending)}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground">0</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right font-mono text-sm tabular-nums">{formatNumber(q.processing)}</TableCell>
                      <TableCell className="text-right font-mono text-sm tabular-nums">{formatNumber(q.throughput)}/s</TableCell>
                      <TableCell>
                        <span className={`text-xs font-mono font-medium ${loadColor}`}>
                          {formatNumber(load)}
                        </span>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
          <div className="space-y-3 md:hidden">
            {queues.map((q) => {
              const load = q.pending + q.processing;
              return (
                <div key={q.name} className="rounded-xl border border-border/60 bg-card/60 p-4 backdrop-blur-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold">{q.name}</p>
                    <Badge variant="outline" className="font-mono text-[10px]">{formatNumber(q.throughput)}/s</Badge>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div><span className="text-muted-foreground">Pending</span><p className="font-mono font-medium">{formatNumber(q.pending)}</p></div>
                    <div><span className="text-muted-foreground">Processing</span><p className="font-mono font-medium">{formatNumber(q.processing)}</p></div>
                    <div><span className="text-muted-foreground">Load</span><p className="font-mono font-medium">{formatNumber(load)}</p></div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}