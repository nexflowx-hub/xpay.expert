"use client";

import * as React from "react";
import { useRouter, useParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  AlertTriangle,
  Loader2,
  RefreshCw,
  Copy,
  CheckCircle2,
  XCircle,
  Clock,
  ShieldCheck,
  Banknote,
  Inbox,
} from "lucide-react";
import { useMerchantPayout, useCancelMerchantPayout } from "@/hooks/use-queries";
import { PageHeader, ErrorState, EmptyState, fadeUp } from "@/components/shared";
import { formatCurrency, formatDate, cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import type {
  MerchantPayout,
  MerchantPayoutStatus,
  MerchantPayoutMethod,
  MerchantPayoutDestination,
} from "@/types";

// ---- Status badge ----
const payoutStatusConfig: Record<
  MerchantPayoutStatus,
  { label: string; className: string; icon: React.ElementType }
> = {
  pending_review: {
    label: "Pending Review",
    className: "bg-amber-500/12 text-amber-400 border-amber-500/25",
    icon: Clock,
  },
  fx_pending: {
    label: "FX Pending",
    className: "bg-orange-500/12 text-orange-400 border-orange-500/25",
    icon: Clock,
  },
  approved: {
    label: "Approved",
    className: "bg-sky-500/12 text-sky-400 border-sky-500/25",
    icon: CheckCircle2,
  },
  processing: {
    label: "Processing",
    className: "bg-sky-500/12 text-sky-400 border-sky-500/25",
    icon: Loader2,
  },
  paid: {
    label: "Paid",
    className: "bg-emerald-500/12 text-emerald-400 border-emerald-500/25",
    icon: CheckCircle2,
  },
  rejected: {
    label: "Rejected",
    className: "bg-rose-500/12 text-rose-400 border-rose-500/25",
    icon: XCircle,
  },
  cancelled: {
    label: "Cancelled",
    className: "bg-muted text-muted-foreground border-border",
    icon: XCircle,
  },
};

function PayoutStatusBadge({ status }: { status: MerchantPayoutStatus }) {
  const cfg = payoutStatusConfig[status];
  const Icon = cfg.icon;
  return (
    <Badge variant="outline" className={cn("gap-1 font-medium", cfg.className)}>
      <Icon className="h-3 w-3" />
      {cfg.label}
    </Badge>
  );
}

const methodLabels: Record<MerchantPayoutMethod, string> = {
  SEPA_INSTANT: "SEPA Instant",
  PIX: "PIX",
  USDT_TRC20: "USDT TRC20",
  USDT_ERC20: "USDT ERC20",
  MANUAL: "Manual",
};

// ---- Timeline events derived from timestamps ----
interface TimelineEvent {
  label: string;
  timestamp: string;
  icon: React.ElementType;
  color: string;
}

function deriveTimeline(payout: MerchantPayout): TimelineEvent[] {
  const events: TimelineEvent[] = [];

  const pairs: { ts: string | null | undefined; label: string; icon: React.ElementType; color: string }[] = [
    { ts: payout.createdAt, label: "Created", icon: Clock, color: "text-sky-400" },
    { ts: payout.reviewedAt, label: "Reviewed", icon: ShieldCheck, color: "text-amber-400" },
    { ts: payout.approvedAt, label: "Approved", icon: CheckCircle2, color: "text-emerald-400" },
    { ts: payout.processingAt, label: "Processing", icon: Loader2, color: "text-sky-400" },
    { ts: payout.paidAt, label: "Paid", icon: Banknote, color: "text-emerald-400" },
    { ts: payout.rejectedAt, label: "Rejected", icon: XCircle, color: "text-rose-400" },
    { ts: payout.cancelledAt, label: "Cancelled", icon: XCircle, color: "text-muted-foreground" },
  ];

  for (const p of pairs) {
    if (p.ts) {
      events.push({
        label: p.label,
        timestamp: p.ts,
        icon: p.icon,
        color: p.color,
      });
    }
  }

  return events;
}

// ---- Copy to clipboard helper ----
function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = React.useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="ml-1.5 inline-flex items-center text-muted-foreground transition hover:text-foreground"
      title="Copy"
    >
      {copied ? (
        <CheckCircle2 className="h-3 w-3 text-emerald-400" />
      ) : (
        <Copy className="h-3 w-3" />
      )}
    </button>
  );
}

// ---- Detail row ----
function DetailRow({
  label,
  value,
  mono,
  copyable,
}: {
  label: string;
  value: string | number | null | undefined;
  mono?: boolean;
  copyable?: boolean;
}) {
  if (value === null || value === undefined || value === "") {
    return null;
  }
  return (
    <div className="flex items-start justify-between gap-4 py-2">
      <p className="shrink-0 text-xs text-muted-foreground">{label}</p>
      <p className={cn("text-right text-sm", mono && "font-mono")}>
        {String(value)}
        {copyable && <CopyButton text={String(value)} />}
      </p>
    </div>
  );
}

// ---- Destination details renderer ----
function DestinationDetails({
  destination,
}: {
  destination: MerchantPayoutDestination;
}) {
  const method = destination.method;
  return (
    <div className="flex flex-col">
      <DetailRow label="Method" value={methodLabels[method]} />
      <DetailRow label="Beneficiary" value={destination.beneficiaryName} />

      {method === "SEPA_INSTANT" && (
        <>
          <DetailRow label="IBAN" value={destination.iban} mono copyable />
          <DetailRow label="BIC" value={destination.bic} mono />
          <DetailRow label="Bank" value={destination.bankName} />
          <DetailRow label="Country" value={destination.country} />
          <DetailRow label="Reference" value={destination.paymentReference} />
        </>
      )}

      {method === "PIX" && (
        <>
          <DetailRow label="Key Type" value={destination.keyType} />
          <DetailRow label="Key Value" value={destination.keyValue} mono copyable />
          <DetailRow label="Tax ID" value={destination.taxId} mono />
          <DetailRow label="Bank" value={destination.bankName} />
          <DetailRow label="Country" value={destination.country} />
        </>
      )}

      {(method === "USDT_TRC20" || method === "USDT_ERC20") && (
        <>
          <DetailRow label="Wallet Address" value={destination.walletAddress} mono copyable />
          <DetailRow label="Network" value={destination.network} />
        </>
      )}

      {method === "MANUAL" && (
        <>
          <DetailRow label="Country" value={destination.country} />
          <DetailRow label="Network" value={destination.network} />
          <DetailRow label="Instructions" value={destination.instructions} />
        </>
      )}
    </div>
  );
}

// ---- Main Component ----
export default function PayoutDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const {
    data: payout,
    isLoading,
    isError,
    refetch,
  } = useMerchantPayout(id);

  const cancelMutation = useCancelMerchantPayout();

  // Whether the cancel button should be visible
  const canCancel =
    payout?.status === "pending_review" || payout?.status === "fx_pending";

  function handleCancel() {
    cancelMutation.mutate(
      { id },
      {
        onSuccess: () => {
          // Query is invalidated by the mutation hook
        },
      }
    );
  }

  // Loading
  if (isLoading) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader
          title="Payout Detail"
          breadcrumbs={[
            { label: "Commerce", href: "/commerce" },
            { label: "Payouts", href: "/commerce/payouts" },
            { label: "..." },
          ]}
          actions={
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/commerce/payouts")}
            >
              <ArrowLeft className="mr-1 h-3.5 w-3.5" />
              Back
            </Button>
          }
        />
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Skeleton className="h-52 rounded-xl" />
          <Skeleton className="h-52 rounded-xl" />
          <Skeleton className="h-52 rounded-xl" />
          <Skeleton className="h-52 rounded-xl" />
        </div>
      </div>
    );
  }

  // Error (non-404)
  if (isError) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader
          title="Payout Detail"
          breadcrumbs={[
            { label: "Commerce", href: "/commerce" },
            { label: "Payouts", href: "/commerce/payouts" },
            { label: "..." },
          ]}
          actions={
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/commerce/payouts")}
            >
              <ArrowLeft className="mr-1 h-3.5 w-3.5" />
              Back
            </Button>
          }
        />
        <ErrorState
          message="Failed to load payout details"
          onRetry={() => refetch()}
        />
      </div>
    );
  }

  // Not found
  if (!payout) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader
          title="Payout Detail"
          breadcrumbs={[
            { label: "Commerce", href: "/commerce" },
            { label: "Payouts", href: "/commerce/payouts" },
            { label: id.slice(0, 8) + "..." },
          ]}
          actions={
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/commerce/payouts")}
            >
              <ArrowLeft className="mr-1 h-3.5 w-3.5" />
              Back
            </Button>
          }
        />
        <EmptyState
          icon={Inbox}
          title="Payout not found"
          description="The payout you're looking for doesn't exist or has been removed."
          action={
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push("/commerce/payouts")}
            >
              Back to Payouts
            </Button>
          }
        />
      </div>
    );
  }

  const timeline = deriveTimeline(payout);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Payout Detail"
        breadcrumbs={[
          { label: "Commerce", href: "/commerce" },
          { label: "Payouts", href: "/commerce/payouts" },
          { label: payout.ticketCode },
        ]}
        actions={
          <div className="flex items-center gap-2">
            {canCancel && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5 text-rose-400 hover:text-rose-300"
                  >
                    <XCircle className="h-3.5 w-3.5" />
                    Cancel Payout
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Cancel this payout?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will cancel payout{" "}
                      <span className="font-mono font-medium text-foreground">
                        {payout.ticketCode}
                      </span>
                      . The reserved amount will be released back to your
                      settlement wallet. This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Keep Payout</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleCancel}
                      disabled={cancelMutation.isPending}
                      className="bg-rose-600 text-white hover:bg-rose-700"
                    >
                      {cancelMutation.isPending ? (
                        <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                      ) : null}
                      Confirm Cancellation
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/commerce/payouts")}
            >
              <ArrowLeft className="mr-1 h-3.5 w-3.5" />
              Back
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Financial Summary */}
        <motion.div {...fadeUp}>
          <Card className="border-border/60 bg-card/60 p-5 backdrop-blur-xl">
            <h3 className="text-sm font-semibold">Financial Summary</h3>
            <Separator className="my-4 bg-border/60" />
            <div className="flex flex-col">
              <DetailRow
                label="Source Amount"
                value={`${formatCurrency(payout.sourceAmount, payout.sourceCurrency)} ${payout.sourceCurrency}`}
                mono
              />
              <DetailRow
                label="Payout Amount"
                value={`${formatCurrency(payout.payoutAmount, payout.payoutCurrency)} ${payout.payoutCurrency}`}
                mono
              />
              <DetailRow label="Method" value={methodLabels[payout.method]} />
              <DetailRow label="Network" value={payout.network} />
              {payout.fxRequired && (
                <>
                  <DetailRow
                    label="FX Required"
                    value="Yes"
                  />
                  <DetailRow
                    label="FX Status"
                    value={payout.fxStatus || "Pending"}
                  />
                  {payout.fxRate && (
                    <DetailRow
                      label="FX Rate"
                      value={payout.fxRate.toString()}
                      mono
                    />
                  )}
                  {payout.fxProvider && (
                    <DetailRow label="FX Provider" value={payout.fxProvider} />
                  )}
                  {payout.fxReference && (
                    <DetailRow
                      label="FX Reference"
                      value={payout.fxReference}
                      mono
                      copyable
                    />
                  )}
                </>
              )}
              {!payout.fxRequired && (
                <DetailRow label="FX Required" value="No" />
              )}
            </div>
          </Card>
        </motion.div>

        {/* Status */}
        <motion.div {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.05 }}>
          <Card className="border-border/60 bg-card/60 p-5 backdrop-blur-xl">
            <h3 className="text-sm font-semibold">Status</h3>
            <Separator className="my-4 bg-border/60" />
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">Current Status</p>
                <PayoutStatusBadge status={payout.status} />
              </div>
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">Created</p>
                <p className="text-sm">{formatDate(payout.createdAt, { withTime: true })}</p>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">Last Updated</p>
                <p className="text-sm">{formatDate(payout.updatedAt, { withTime: true })}</p>
              </div>
              {payout.reviewNote && (
                <div className="rounded-lg border border-border/60 bg-background/40 p-3">
                  <p className="text-xs text-muted-foreground">Review Note</p>
                  <p className="mt-1 text-sm">{payout.reviewNote}</p>
                </div>
              )}
              {payout.rejectionReason && (
                <div className="rounded-lg border border-rose-500/30 bg-rose-500/5 p-3">
                  <p className="text-xs text-rose-300">Rejection Reason</p>
                  <p className="mt-1 text-sm text-rose-200/90">
                    {payout.rejectionReason}
                  </p>
                </div>
              )}
            </div>
          </Card>
        </motion.div>

        {/* Destination */}
        <motion.div {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.1 }}>
          <Card className="border-border/60 bg-card/60 p-5 backdrop-blur-xl">
            <h3 className="text-sm font-semibold">Destination</h3>
            <Separator className="my-4 bg-border/60" />
            <DestinationDetails destination={payout.destination} />
            <Separator className="my-3 bg-border/40" />
            <DetailRow label="Beneficiary" value={payout.beneficiaryName} />
            <DetailRow label="Country" value={payout.beneficiaryCountry} />
          </Card>
        </motion.div>

        {/* References */}
        <motion.div {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.15 }}>
          <Card className="border-border/60 bg-card/60 p-5 backdrop-blur-xl">
            <h3 className="text-sm font-semibold">References</h3>
            <Separator className="my-4 bg-border/60" />
            <div className="flex flex-col">
              <DetailRow
                label="Ticket Code"
                value={payout.ticketCode}
                mono
                copyable
              />
              <DetailRow
                label="Idempotency Key"
                value={payout.idempotencyKey}
                mono
                copyable
              />
              <DetailRow
                label="Provider Reference"
                value={payout.providerReference}
                mono
                copyable
              />
              <DetailRow
                label="External Reference"
                value={payout.externalReference}
                mono
                copyable
              />
              <DetailRow label="Ledger Domain" value={payout.ledgerDomain} mono />
              <DetailRow label="Merchant" value={payout.merchantName} />
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Timeline */}
      {timeline.length > 0 && (
        <motion.div {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.2 }}>
          <Card className="border-border/60 bg-card/60 p-5 backdrop-blur-xl">
            <h3 className="text-sm font-semibold">Timeline</h3>
            <Separator className="my-4 bg-border/60" />
            <div className="relative ml-2 border-l-2 border-border/60 pl-6">
              {timeline.map((event, i) => {
                const Icon = event.icon;
                const isLast = i === timeline.length - 1;
                return (
                  <div
                    key={event.label}
                    className={cn("relative pb-6", isLast && "pb-0")}
                  >
                    {/* Dot */}
                    <div className="absolute -left-[31px] top-0.5 grid h-5 w-5 place-items-center rounded-full border-2 border-border/60 bg-background">
                      <Icon
                        className={cn("h-2.5 w-2.5", event.color)}
                      />
                    </div>
                    <div className="flex items-baseline justify-between gap-4">
                      <div>
                        <p className="text-sm font-medium">{event.label}</p>
                      </div>
                      <p className="shrink-0 text-xs text-muted-foreground">
                        {formatDate(event.timestamp, { withTime: true })}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </motion.div>
      )}
    </div>
  );
}