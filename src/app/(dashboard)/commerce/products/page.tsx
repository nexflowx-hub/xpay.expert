"use client";

import * as React from "react";
import { motion } from "framer-motion";
import {
  Package,
  Inbox,
  DollarSign,
  ShoppingCart,
  BarChart3,
} from "lucide-react";
import { useProducts } from "@/hooks/use-queries";
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
import { formatCurrency, cn } from "@/lib/utils";
import type { Product } from "@/types";

export default function ProductsPage() {
  const {
    data: productsData,
    isLoading,
    isError,
    refetch,
  } = useProducts();

  const products: Product[] = Array.isArray(productsData)
    ? productsData
    : (productsData as { data?: Product[] } | null)?.data ?? [];

  if (isError) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader title="Products" description="Manage your product catalog." />
        <ErrorState
          message="Failed to load products. The backend may be unreachable."
          onRetry={() => refetch()}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Products"
        description="Manage your product catalog."
      />

      {/* Desktop Table */}
      <Card className="hidden border-border/60 bg-card/60 backdrop-blur-xl md:block">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-border/60 text-left text-xs text-muted-foreground">
                <TableHead className="text-xs font-medium">Name</TableHead>
                <TableHead className="text-xs font-medium text-right">Price</TableHead>
                <TableHead className="text-xs font-medium">Currency</TableHead>
                <TableHead className="text-xs font-medium">Status</TableHead>
                <TableHead className="text-xs font-medium text-right">Sales</TableHead>
                <TableHead className="text-xs font-medium text-right">Stock</TableHead>
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
                : products.length === 0
                  ? (
                      <TableRow>
                        <TableCell colSpan={6}>
                          <EmptyState
                            icon={Package}
                            title="No products yet"
                            description="Create products in your stores to start selling."
                          />
                        </TableCell>
                      </TableRow>
                    )
                  : products.map((p) => (
                      <TableRow key={p.id} className="border-border/30">
                        <TableCell>
                          <div className="flex items-center gap-2.5">
                            <div className="grid h-8 w-8 place-items-center rounded-lg bg-primary/10 text-xs font-bold text-primary">
                              {p.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="text-sm font-medium">{p.name}</p>
                              {p.description && (
                                <p className="max-w-[200px] truncate text-xs text-muted-foreground">
                                  {p.description}
                                </p>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-mono text-sm tabular-nums">
                          {formatCurrency(p.price, p.currency)}
                        </TableCell>
                        <TableCell>
                          <span className="text-xs">{p.currency}</span>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={cn(
                              "text-[10px] font-medium",
                              p.active
                                ? "bg-emerald-500/12 text-emerald-400 border-emerald-500/25"
                                : "bg-muted text-muted-foreground border-border"
                            )}
                          >
                            {p.active ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-mono text-sm tabular-nums">
                          {p.sales}
                        </TableCell>
                        <TableCell className="text-right font-mono text-sm tabular-nums">
                          {p.stock ?? "∞"}
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
          : products.length === 0
            ? (
                <EmptyState
                  icon={Package}
                  title="No products yet"
                  description="Create products in your stores to start selling."
                />
              )
            : products.map((p) => (
                <motion.div key={p.id} {...fadeUp}>
                  <Card className="border-border/60 bg-card/60 p-4 backdrop-blur-xl">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="grid h-10 w-10 place-items-center rounded-lg bg-primary/10 text-sm font-bold text-primary">
                          {p.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold">
                            {p.name}
                          </p>
                          {p.description && (
                            <p className="truncate text-xs text-muted-foreground">
                              {p.description}
                            </p>
                          )}
                        </div>
                      </div>
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-[10px] font-medium",
                          p.active
                            ? "bg-emerald-500/12 text-emerald-400 border-emerald-500/25"
                            : "bg-muted text-muted-foreground border-border"
                        )}
                      >
                        {p.active ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    <div className="mt-3 grid grid-cols-3 gap-2">
                      <div className="rounded-lg bg-background/40 p-2">
                        <DollarSign className="h-3 w-3 text-emerald-400" />
                        <p className="mt-1 font-mono text-xs font-semibold tabular-nums">
                          {formatCurrency(p.price, p.currency)}
                        </p>
                        <p className="text-[10px] text-muted-foreground">Price</p>
                      </div>
                      <div className="rounded-lg bg-background/40 p-2">
                        <ShoppingCart className="h-3 w-3 text-sky-400" />
                        <p className="mt-1 font-mono text-xs font-semibold tabular-nums">
                          {p.sales}
                        </p>
                        <p className="text-[10px] text-muted-foreground">Sales</p>
                      </div>
                      <div className="rounded-lg bg-background/40 p-2">
                        <BarChart3 className="h-3 w-3 text-muted-foreground" />
                        <p className="mt-1 text-xs font-medium">
                          {p.stock ?? "∞"}
                        </p>
                        <p className="text-[10px] text-muted-foreground">Stock</p>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
      </div>
    </div>
  );
}