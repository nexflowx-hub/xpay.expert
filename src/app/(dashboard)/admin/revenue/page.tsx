"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader, StatCard, ErrorState, Sparkline } from "@/components/shared";
import { useAdminRevenue } from "@/hooks/use-queries";
import { formatCurrency } from "@/lib/utils";
import { Banknote, TrendingUp } from "lucide-react";

export default function AdminRevenuePage() {
  const { data, isLoading, isError, refetch } = useAdminRevenue();

  const total = (data as { total?: number } | undefined)?.total ?? 0;
  const series = (data as { series?: { date: string; value: number }[] } | undefined)?.series ?? [];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Revenue"
          description="Platform revenue metrics"
          breadcrumbs={[{ label: "Admin" }, { label: "Revenue" }]}
        />
        <Skeleton className="h-40 rounded-xl" />
        <Skeleton className="h-60 rounded-xl" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="space-y-6">
        <PageHeader title="Revenue" breadcrumbs={[{ label: "Admin" }, { label: "Revenue" }]} />
        <ErrorState message="Failed to load revenue data" onRetry={() => refetch()} />
      </div>
    );
  }

  const chartValues = series.map((s) => s.value);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Revenue"
        description="Platform revenue metrics"
        breadcrumbs={[{ label: "Admin" }, { label: "Revenue" }]}
      />

      <StatCard
        label="Total Revenue"
        value={total}
        icon={Banknote}
        accent="green"
        format={(v) => formatCurrency(v, "EUR")}
      />

      {series.length > 0 && (
        <Card className="border-border/60 bg-card/60 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <TrendingUp className="h-4 w-4 text-primary" />
              Revenue Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Sparkline data={chartValues} height={120} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}