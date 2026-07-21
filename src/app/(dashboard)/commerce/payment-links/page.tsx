"use client";

import * as React from "react";
import { motion } from "framer-motion";
import {
  Link2,
  Inbox,
  ExternalLink,
  Copy,
  Eye,
  MousePointerClick,
} from "lucide-react";
import { usePaymentLinks } from "@/hooks/use-queries";
import {
  PageHeader,
  ErrorState,
  EmptyState,
  fadeUp,
} from "@/components/shared";
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
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate, cn, timeAgo } from "@/lib/utils";
import { toast } from "sonner";
import type { PaymentLink } from "@/types";

function truncateUrl(url: string, maxLen = 50): string {
  if (url.length <= maxLen) return url;
  return url.slice(0, maxLen - 3) + "...";
}

function copyToClipboard(text: string) {
  navigator.clipboard.writeText(text).then(
    () => toast.success("URL copied to clipboard"),
    () => toast.error("Failed to copy")
  );
}

export default function PaymentLinksPage() {
  const {
    data: linksData,
    isLoading,
    isError,
    refetch,
  } = usePaymentLinks();

  const links: PaymentLink[] = Array.isArray(linksData)
    ? linksData
    : (linksData as { data?: PaymentLink[] } | null)?.data ?? [];

  if (isError) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader title="Payment Links" description="Create and manage shareable payment links." />
        <ErrorState
          message="Failed to load payment links. The backend may be unreachable."
          onRetry={() => refetch()}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Payment Links"
        description="Create and manage shareable payment links."
      />

      {/* Desktop Table */}
      <Card className="hidden border-border/60 bg-card/60 backdrop-blur-xl md:block">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-border/60 text-left text-xs text-muted-foreground">
                <TableHead className="text-xs font-medium">Name</TableHead>
                <TableHead className="text-xs font-medium">URL</TableHead>
                <TableHead className="text-xs font-medium text-right">Amount</TableHead>
                <TableHead className="text-xs font-medium">Status</TableHead>
                <TableHead className="text-xs font-medium text-right">Visits</TableHead>
                <TableHead className="text-xs font-medium text-right">Conversions</TableHead>
                <TableHead className="text-xs font-medium text-right">Created</TableHead>
                <TableHead className="text-xs font-medium"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading
                ? Array.from({ length: 8 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell colSpan={8}>
                        <Skeleton className="my-1 h-8" />
                      </TableCell>
                    </TableRow>
                  ))
                : links.length === 0
                  ? (
                      <TableRow>
                        <TableCell colSpan={8}>
                          <EmptyState
                            icon={Link2}
                            title="No payment links yet"
                            description="Create a payment link to start accepting payments via a shareable URL."
                          />
                        </TableCell>
                      </TableRow>
                    )
                  : links.map((link) => {
                      const convRate =
                        link.visits > 0
                          ? ((link.conversions / link.visits) * 100).toFixed(1)
                          : "0.0";
                      return (
                        <TableRow key={link.id} className="border-border/30">
                          <TableCell>
                            <div className="flex items-center gap-2.5">
                              <div className="grid h-8 w-8 place-items-center rounded-lg bg-primary/10">
                                <Link2 className="h-4 w-4 text-primary" />
                              </div>
                              <span className="text-sm font-medium">
                                {link.name}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1.5">
                              <span className="max-w-[200px] truncate font-mono text-xs text-muted-foreground">
                                {truncateUrl(link.url)}
                              </span>
                              <button
                                onClick={() => copyToClipboard(link.url)}
                                className="shrink-0 rounded p-0.5 transition hover:bg-muted"
                                title="Copy URL"
                              >
                                <Copy className="h-3 w-3 text-muted-foreground" />
                              </button>
                            </div>
                          </TableCell>
                          <TableCell className="text-right font-mono text-sm tabular-nums">
                            {formatCurrency(link.amount, link.currency)}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={cn(
                                "text-[10px] font-medium",
                                link.status === "active"
                                  ? "bg-emerald-500/12 text-emerald-400 border-emerald-500/25"
                                  : "bg-muted text-muted-foreground border-border"
                              )}
                            >
                              {link.status === "active" ? "Active" : "Inactive"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1 text-xs text-muted-foreground">
                              <Eye className="h-3 w-3" />
                              <span className="font-mono tabular-nums">
                                {link.visits}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1 text-xs text-muted-foreground">
                              <MousePointerClick className="h-3 w-3" />
                              <span className="font-mono tabular-nums">
                                {link.conversions}
                              </span>
                              <span className="text-[10px]">({convRate}%)</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-right text-xs text-muted-foreground">
                            {formatDate(link.createdAt)}
                          </TableCell>
                          <TableCell>
                            <a
                              href={link.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="rounded p-1.5 transition hover:bg-muted"
                            >
                              <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
                            </a>
                          </TableCell>
                        </TableRow>
                      );
                    })}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Mobile Cards */}
      <div className="flex flex-col gap-3 md:hidden">
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-40 rounded-xl" />
            ))
          : links.length === 0
            ? (
                <EmptyState
                  icon={Link2}
                  title="No payment links yet"
                  description="Create a payment link to start accepting payments via a shareable URL."
                />
              )
            : links.map((link) => (
                <motion.div key={link.id} {...fadeUp}>
                  <Card className="border-border/60 bg-card/60 p-4 backdrop-blur-xl">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="grid h-10 w-10 place-items-center rounded-lg bg-primary/10">
                          <Link2 className="h-4 w-4 text-primary" />
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold">
                            {link.name}
                          </p>
                          <p className="max-w-[200px] truncate font-mono text-xs text-muted-foreground">
                            {truncateUrl(link.url, 35)}
                          </p>
                        </div>
                      </div>
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-[10px] font-medium",
                          link.status === "active"
                            ? "bg-emerald-500/12 text-emerald-400 border-emerald-500/25"
                            : "bg-muted text-muted-foreground border-border"
                        )}
                      >
                        {link.status === "active" ? "Active" : "Inactive"}
                      </Badge>
                    </div>

                    <div className="mt-3 grid grid-cols-3 gap-2">
                      <div className="rounded-lg bg-background/40 p-2">
                        <p className="text-[10px] text-muted-foreground">Amount</p>
                        <p className="mt-0.5 font-mono text-xs font-semibold tabular-nums">
                          {formatCurrency(link.amount, link.currency)}
                        </p>
                      </div>
                      <div className="rounded-lg bg-background/40 p-2">
                        <p className="text-[10px] text-muted-foreground">Visits</p>
                        <p className="mt-0.5 font-mono text-xs font-semibold tabular-nums">
                          {link.visits}
                        </p>
                      </div>
                      <div className="rounded-lg bg-background/40 p-2">
                        <p className="text-[10px] text-muted-foreground">Conv.</p>
                        <p className="mt-0.5 font-mono text-xs font-semibold tabular-nums">
                          {link.conversions}
                          <span className="text-[10px] text-muted-foreground">
                            {" "}
                            (
                            {link.visits > 0
                              ? (
                                  (link.conversions / link.visits) *
                                  100
                                ).toFixed(1)
                              : "0.0"}
                            %)
                          </span>
                        </p>
                      </div>
                    </div>

                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        {formatDate(link.createdAt)}
                      </span>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 gap-1 text-xs"
                          onClick={() => copyToClipboard(link.url)}
                        >
                          <Copy className="h-3 w-3" />
                          Copy
                        </Button>
                        <a
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 gap-1 text-xs"
                          >
                            <ExternalLink className="h-3 w-3" />
                            Open
                          </Button>
                        </a>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
      </div>
    </div>
  );
}