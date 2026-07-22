"use client";

import * as React from "react";
import { motion } from "framer-motion";
import {
  Store,
  Plus,
  Inbox,
  RefreshCw,
  Globe,
  DollarSign,
  Package,
} from "lucide-react";
import { useStores, useCreateStore } from "@/hooks/use-queries";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { formatCurrency, formatDate, cn } from "@/lib/utils";
import { CURRENCIES } from "@/config";
import type { Store as StoreType, CurrencyCode } from "@/types";

export default function StoresPage() {
  const {
    data: stores,
    isLoading,
    isError,
    refetch,
  } = useStores();

  const createStore = useCreateStore();

  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [formName, setFormName] = React.useState("");
  const [formDomain, setFormDomain] = React.useState("");
  const [formCurrency, setFormCurrency] = React.useState<CurrencyCode>("EUR");

  const storesList: StoreType[] = (Array.isArray(stores) ? stores : (stores as { data?: StoreType[] } | null)?.data) ?? [];

  function resetForm() {
    setFormName("");
    setFormDomain("");
    setFormCurrency("EUR");
  }

  function handleCreate() {
    if (!formName.trim()) return;
    createStore.mutate(
      {
        name: formName.trim(),
        domain: formDomain.trim() || undefined,
        currency: formCurrency,
      },
      {
        onSuccess: () => {
          setDialogOpen(false);
          resetForm();
        },
      }
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader title="Stores" description="Manage your commerce stores." />
        <ErrorState
          message="Failed to load stores. The backend may be unreachable."
          onRetry={() => refetch()}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Stores"
        description="Manage your commerce stores."
        actions={
          <Button
            size="sm"
            className="gap-1.5"
            onClick={() => setDialogOpen(true)}
          >
            <Plus className="h-3.5 w-3.5" />
            Create Store
          </Button>
        }
      />

      {/* Desktop Table */}
      <Card className="hidden border-border/60 bg-card/60 backdrop-blur-xl md:block">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-border/60 text-left text-xs text-muted-foreground">
                <TableHead className="text-xs font-medium">Name</TableHead>
                <TableHead className="text-xs font-medium">Domain</TableHead>
                <TableHead className="text-xs font-medium">Currency</TableHead>
                <TableHead className="text-xs font-medium">Status</TableHead>
                <TableHead className="text-xs font-medium text-right">Products</TableHead>
                <TableHead className="text-xs font-medium text-right">Revenue</TableHead>
                <TableHead className="text-xs font-medium text-right">Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading
                ? Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell colSpan={7}>
                        <Skeleton className="my-1 h-8" />
                      </TableCell>
                    </TableRow>
                  ))
                : storesList.length === 0
                  ? (
                      <TableRow>
                        <TableCell colSpan={7}>
                          <EmptyState
                            icon={Store}
                            title="No stores yet"
                            description="Create your first store to start selling online."
                            action={
                              <Button
                                size="sm"
                                className="gap-1.5"
                                onClick={() => setDialogOpen(true)}
                              >
                                <Plus className="h-3.5 w-3.5" />
                                Create Store
                              </Button>
                            }
                          />
                        </TableCell>
                      </TableRow>
                    )
                  : storesList.map((store) => (
                      <TableRow key={store.id} className="border-border/30">
                        <TableCell>
                          <div className="flex items-center gap-2.5">
                            <div className="grid h-8 w-8 place-items-center rounded-lg bg-primary/10 text-xs font-bold text-primary">
                              {store.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="text-sm font-medium">{store.name}</p>
                              {store.storeCode && (
                                <p className="text-xs text-muted-foreground">
                                  {store.storeCode}
                                </p>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Globe className="h-3 w-3" />
                            {store.domain || "—"}
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-xs font-medium">
                            {store.currency}
                          </span>
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={store.status} />
                        </TableCell>
                        <TableCell className="text-right font-mono text-sm tabular-nums">
                          {store.products ?? 0}
                        </TableCell>
                        <TableCell className="text-right font-mono text-sm tabular-nums">
                          {formatCurrency(store.revenue, store.currency, {
                            compact: true,
                          })}
                        </TableCell>
                        <TableCell className="text-right text-xs text-muted-foreground">
                          {formatDate(store.createdAt)}
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
          ? Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-40 rounded-xl" />
            ))
          : storesList.length === 0
            ? (
                <EmptyState
                  icon={Store}
                  title="No stores yet"
                  description="Create your first store to start selling online."
                  action={
                    <Button
                      size="sm"
                      className="gap-1.5"
                      onClick={() => setDialogOpen(true)}
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Create Store
                    </Button>
                  }
                />
              )
            : storesList.map((store) => (
                <motion.div key={store.id} {...fadeUp}>
                  <Card className="border-border/60 bg-card/60 p-4 backdrop-blur-xl">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="grid h-10 w-10 place-items-center rounded-lg bg-primary/10 text-sm font-bold text-primary">
                          {store.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-semibold">{store.name}</p>
                          {store.domain && (
                            <p className="text-xs text-muted-foreground">
                              {store.domain}
                            </p>
                          )}
                        </div>
                      </div>
                      <StatusBadge status={store.status} />
                    </div>
                    <div className="mt-4 grid grid-cols-3 gap-3">
                      <div className="rounded-lg bg-background/40 p-2.5 text-center">
                        <Package className="mx-auto h-3.5 w-3.5 text-muted-foreground" />
                        <p className="mt-1 font-mono text-sm font-semibold tabular-nums">
                          {store.products ?? 0}
                        </p>
                        <p className="text-[10px] text-muted-foreground">Products</p>
                      </div>
                      <div className="rounded-lg bg-background/40 p-2.5 text-center">
                        <DollarSign className="mx-auto h-3.5 w-3.5 text-emerald-400" />
                        <p className="mt-1 font-mono text-sm font-semibold tabular-nums">
                          {formatCurrency(store.revenue, store.currency, {
                            compact: true,
                          })}
                        </p>
                        <p className="text-[10px] text-muted-foreground">Revenue</p>
                      </div>
                      <div className="rounded-lg bg-background/40 p-2.5 text-center">
                        <Globe className="mx-auto h-3.5 w-3.5 text-muted-foreground" />
                        <p className="mt-1 text-sm font-medium">{store.currency}</p>
                        <p className="text-[10px] text-muted-foreground">Currency</p>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
      </div>

      {/* Create Store Dialog */}
      <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Store className="h-4 w-4 text-primary" />
              Create Store
            </DialogTitle>
            <DialogDescription>
              Add a new commerce store to your account.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="store-name">Store Name</Label>
              <Input
                id="store-name"
                placeholder="My Store"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="store-domain">Domain (optional)</Label>
              <Input
                id="store-domain"
                placeholder="shop.example.com"
                value={formDomain}
                onChange={(e) => setFormDomain(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="store-currency">Currency</Label>
              <Select
                value={formCurrency}
                onValueChange={(v) => setFormCurrency(v as CurrencyCode)}
              >
                <SelectTrigger id="store-currency" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CURRENCIES.map((c) => (
                    <SelectItem key={c.code} value={c.code}>
                      {c.flag} {c.code} — {c.symbol}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDialogOpen(false);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreate}
              disabled={!formName.trim() || createStore.isPending}
              className="gap-1.5"
            >
              {createStore.isPending ? (
                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Plus className="h-3.5 w-3.5" />
              )}
              Create Store
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}