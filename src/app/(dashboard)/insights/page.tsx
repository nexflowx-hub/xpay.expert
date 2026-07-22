"use client";

import * as React from "react";
import { motion } from "framer-motion";
import {
  DollarSign, TrendingUp, Target, ShieldCheck, Activity,
  CalendarRange, ArrowUpRight, ArrowDownRight, Globe, BarChart3,
} from "lucide-react";
import { useAnalyticsOverview } from "@/hooks/use-queries";
import { PageHeader, StatCard, ErrorState } from "@/components/shared";
import { AreaTrend, BarTrend, DonutChart, CHART_COLORS } from "@/components/shared/charts";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
} from "@/components/ui/select";
import {
  formatCurrency, formatNumber, formatPercent, cn,
} from "@/lib/utils";
import { COUNTRY_LIST } from "@/config";

const methodLabel: Record<string, string> = {
  visa: "Visa", mastercard: "Mastercard", pix: "Pix", mbway: "MBWay",
  apple_pay: "Apple Pay", google_pay: "Google Pay", crypto: "Crypto", sepa: "SEPA", wise: "Wise", amex: "Amex",
};

export default function InsightsPage() {
  const { data: a, isLoading, isError, refetch } = useAnalyticsOverview();
  const [range, setRange] = React.useState<string>("30d");

  if (isError) return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Insights" description="Performance, conversion and revenue intelligence." breadcrumbs={[{ label: "Insights" }]} />
      <ErrorState message="Failed to load analytics. Check your connection or try again." onRetry={() => refetch()} />
    </div>
  );

  const topByLtv = a?.topCustomers ?? [];
  const maxLtv = topByLtv[0]?.ltv ?? 1;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Insights"
        description="Performance, conversion and revenue intelligence across your merchant account."
        breadcrumbs={[{ label: "Insights" }]}
        actions={
          <Select value={range} onValueChange={setRange}>
            <SelectTrigger size="sm" className="h-8 w-[140px] gap-1.5">
              <CalendarRange className="h-3.5 w-3.5 text-muted-foreground" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
        }
      />

      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {isLoading || !a ? (
          Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)
        ) : (
          <>
            <StatCard label="Revenue" value={a.revenue} change={a.revenueChange} icon={DollarSign} accent="blue" format={(n) => formatCurrency(n, "EUR", { compact: true })} />
            <StatCard label="Volume" value={a.volume} change={a.volumeChange} icon={TrendingUp} accent="green" format={(n) => formatCurrency(n, "EUR", { compact: true })} />
            <StatCard label="Conversion" value={a.conversion} change={a.conversionChange} icon={Target} accent="violet" format={(n) => formatPercent(n)} />
            <StatCard label="Approval" value={a.approvalRate} change={a.approvalChange} icon={ShieldCheck} accent="green" format={(n) => formatPercent(n)} />
            <StatCard label="Risk score" value={a.riskScore} change={a.riskChange} icon={Activity} accent="amber" format={(n) => Math.round(n).toString()} />
          </>
        )}
      </div>

      {/* Revenue + Currency distribution */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2 border-border/60 bg-card/60 p-5 backdrop-blur-xl">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold">Revenue trend</h3>
              <p className="text-xs text-muted-foreground">Net revenue &middot; {range}</p>
            </div>
            <Badge variant="outline" className="gap-1 border-emerald-500/25 bg-emerald-500/12 text-emerald-400">
              <ArrowUpRight className="h-3 w-3" /> {a?.revenueChange ?? 0}%
            </Badge>
          </div>
          {isLoading || !a ? <Skeleton className="h-64 w-full" /> : (
            <AreaTrend
              data={(a?.revenueSeries ?? [])}
              dataKey="value"
              xKey="date"
              color="oklch(0.62 0.21 258)"
              height={260}
              formatter={(v) => formatCurrency(v, "EUR", { compact: true })}
            />
          )}
        </Card>

        <Card className="border-border/60 bg-card/60 p-5 backdrop-blur-xl">
          <div className="mb-4">
            <h3 className="text-sm font-semibold">Currency distribution</h3>
            <p className="text-xs text-muted-foreground">Volume share by currency</p>
          </div>
          {isLoading || !a ? <Skeleton className="h-64 w-full" /> : (
            <DonutChart
              data={(a?.currencies ?? []).map((c) => ({ name: c.currency, value: c.volume }))}
              height={260}
              formatter={(v) => formatCurrency(v, "EUR", { compact: true })}
            />
          )}
        </Card>
      </div>

      {/* Volume + Payment methods */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2 border-border/60 bg-card/60 p-5 backdrop-blur-xl">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold">Volume trend</h3>
              <p className="text-xs text-muted-foreground">Gross payment volume &middot; {range}</p>
            </div>
            <Badge variant="outline" className="gap-1 border-emerald-500/25 bg-emerald-500/12 text-emerald-400">
              <ArrowUpRight className="h-3 w-3" /> {a?.volumeChange ?? 0}%
            </Badge>
          </div>
          {isLoading || !a ? <Skeleton className="h-64 w-full" /> : (
            <AreaTrend
              data={(a?.volumeSeries ?? [])}
              dataKey="value"
              xKey="date"
              color="oklch(0.70 0.17 158)"
              height={260}
              formatter={(v) => formatCurrency(v, "EUR", { compact: true })}
            />
          )}
        </Card>

        <Card className="border-border/60 bg-card/60 p-5 backdrop-blur-xl">
          <div className="mb-4 flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-primary" />
            <div>
              <h3 className="text-sm font-semibold">Payment methods</h3>
              <p className="text-xs text-muted-foreground">Volume by method</p>
            </div>
          </div>
          {isLoading || !a ? <Skeleton className="h-64 w-full" /> : (
            <BarTrend
              data={(a?.paymentMethods ?? []).map((p) => ({ name: methodLabel[p.method] ?? p.method, value: p.volume }))}
              dataKey="value"
              xKey="name"
              color="oklch(0.66 0.20 300)"
              height={260}
              formatter={(v) => formatCurrency(v, "EUR", { compact: true })}
            />
          )}
        </Card>
      </div>

      {/* Top customers */}
      <Card className="border-border/60 bg-card/60 p-5 backdrop-blur-xl">
        <div className="mb-4">
          <h3 className="text-sm font-semibold">Top customers by lifetime value</h3>
          <p className="text-xs text-muted-foreground">Best performing customers</p>
        </div>
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
          {isLoading || !a
            ? Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-10" />)
            : topByLtv.map((c, i) => {
                const pct = (c.ltv / maxLtv) * 100;
                return (
                  <div key={i} className="flex flex-col gap-1">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="grid h-5 w-5 place-items-center rounded-md bg-muted/60 text-[10px] font-semibold text-muted-foreground">{i + 1}</span>
                        <span className="truncate font-medium">{c.name}</span>
                      </div>
                      <span className="font-mono tabular-nums">{formatCurrency(c.ltv, "EUR", { compact: true })}</span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted/50">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ delay: i * 0.05, duration: 0.5 }}
                        className="h-full rounded-full"
                        style={{ background: CHART_COLORS[i % CHART_COLORS.length] }}
                      />
                    </div>
                  </div>
                );
              })}
        </div>
      </Card>
    </div>
  );
}