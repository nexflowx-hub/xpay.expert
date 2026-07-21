"use client";

import { useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  XCircle,
  Loader2,
  Ban,
  AlertTriangle,
  Eye,
  Copy,
  ArrowLeftRight,
  Banknote,
  Send,
  ShieldCheck,
  MapPin,
  FileText,
  MessageSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PageHeader, ErrorState, StatusBadge } from "@/components/shared";
import {
  useAdminMerchantPayout,
  useApproveMerchantPayout,
  useQuoteMerchantPayoutFx,
  useProcessMerchantPayout,
  useMarkMerchantPayoutPaid,
  useRejectMerchantPayout,
} from "@/hooks/use-queries";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { MerchantPayoutStatus, MerchantPayout } from "@/types";

// ---- Status badge for payout statuses ----

const PAYOUT_STATUS_CFG: Record<
  MerchantPayoutStatus,
  { className: string; icon: typeof Clock; label: string }
> = {
  pending_review: { className: "bg-amber-500/12 text-amber-400 border-amber-500/25", icon: Clock, label: "Pending Review" },
  fx_pending: { className: "bg-sky-500/12 text-sky-400 border-sky-500/25", icon: ArrowLeftRight, label: "FX Pending" },
  approved: { className: "bg-emerald-500/12 text-emerald-400 border-emerald-500/25", icon: CheckCircle2, label: "Approved" },
  processing: { className: "bg-violet-500/12 text-violet-400 border-violet-500/25", icon: Loader2, label: "Processing" },
  paid: { className: "bg-emerald-500/12 text-emerald-400 border-emerald-500/25", icon: CheckCircle2, label: "Paid" },
  rejected: { className: "bg-rose-500/12 text-rose-400 border-rose-500/25", icon: XCircle, label: "Rejected" },
  cancelled: { className: "bg-muted text-muted-foreground border-border", icon: Ban, label: "Cancelled" },
};

function PayoutStatusBadge({ status }: { status: MerchantPayoutStatus }) {
  const cfg = PAYOUT_STATUS_CFG[status];
  const Icon = cfg.icon;
  return (
    <Badge variant="outline" className={`gap-1 font-medium ${cfg.className}`}>
      <Icon className="h-3 w-3" />
      {cfg.label}
    </Badge>
  );
}

// ---- Info row helper ----

function InfoRow({ label, value, mono }: { label: string; value: string | null | undefined; mono?: boolean }) {
  if (value === null || value === undefined || value === "") return null;
  return (
    <div className="flex items-start justify-between gap-4 py-1.5">
      <span className="text-xs text-muted-foreground shrink-0">{label}</span>
      <span className={`text-xs text-right font-medium break-all ${mono ? "font-mono" : ""}`}>
        {value}
      </span>
    </div>
  );
}

// ---- Approve Dialog ----

function ApproveDialog({
  open,
  onOpenChange,
  onConfirm,
  isPending,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onConfirm: (note?: string) => void;
  isPending: boolean;
}) {
  const [note, setNote] = useState("");
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Approve Payout</DialogTitle>
          <DialogDescription>
            Are you sure you want to approve this payout? This allows it to proceed to processing.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 py-2">
          <Label htmlFor="approve-note">Note (optional)</Label>
          <Textarea
            id="approve-note"
            placeholder="Add a review note…"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
            Cancel
          </Button>
          <Button onClick={() => onConfirm(note || undefined)} disabled={isPending}>
            {isPending && <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />}
            Approve Payout
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ---- FX Quote Dialog ----

function FxQuoteDialog({
  open,
  onOpenChange,
  onConfirm,
  isPending,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onConfirm: (payload: { payoutAmount: number; fxRate: number; fxProvider: string; fxReference: string; note?: string }) => void;
  isPending: boolean;
}) {
  const [payoutAmount, setPayoutAmount] = useState("");
  const [fxRate, setFxRate] = useState("");
  const [fxProvider, setFxProvider] = useState("");
  const [fxReference, setFxReference] = useState("");
  const [note, setNote] = useState("");

  const valid =
    payoutAmount !== "" && Number(payoutAmount) > 0 &&
    fxRate !== "" && Number(fxRate) > 0 &&
    fxProvider.trim() !== "" &&
    fxReference.trim() !== "";

  function handleSubmit() {
    onConfirm({
      payoutAmount: Number(payoutAmount),
      fxRate: Number(fxRate),
      fxProvider: fxProvider.trim(),
      fxReference: fxReference.trim(),
      note: note || undefined,
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Quote FX</DialogTitle>
          <DialogDescription>Enter the FX quote details for this payout.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="fx-payout-amount">Payout Amount</Label>
            <Input
              id="fx-payout-amount"
              type="number"
              step="0.01"
              placeholder="0.00"
              value={payoutAmount}
              onChange={(e) => setPayoutAmount(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="fx-rate">FX Rate</Label>
            <Input
              id="fx-rate"
              type="number"
              step="0.000001"
              placeholder="1.000000"
              value={fxRate}
              onChange={(e) => setFxRate(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="fx-provider">FX Provider</Label>
            <Input
              id="fx-provider"
              placeholder="e.g. Wise, OFX"
              value={fxProvider}
              onChange={(e) => setFxProvider(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="fx-reference">FX Reference</Label>
            <Input
              id="fx-reference"
              placeholder="Reference ID"
              value={fxReference}
              onChange={(e) => setFxReference(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="fx-note">Note (optional)</Label>
            <Textarea
              id="fx-note"
              placeholder="Optional note…"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={2}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isPending || !valid}>
            {isPending && <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />}
            Apply FX Quote
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ---- Processing Dialog ----

function ProcessingDialog({
  open,
  onOpenChange,
  onConfirm,
  isPending,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onConfirm: (payload: { providerReference: string; externalReference?: string; note?: string }) => void;
  isPending: boolean;
}) {
  const [providerReference, setProviderReference] = useState("");
  const [externalReference, setExternalReference] = useState("");
  const [note, setNote] = useState("");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Mark as Processing</DialogTitle>
          <DialogDescription>
            Provide the provider reference to mark this payout as being processed externally.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="proc-provider-ref">Provider Reference *</Label>
            <Input
              id="proc-provider-ref"
              placeholder="Provider transaction reference"
              value={providerReference}
              onChange={(e) => setProviderReference(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="proc-external-ref">External Reference (optional)</Label>
            <Input
              id="proc-external-ref"
              placeholder="External reference"
              value={externalReference}
              onChange={(e) => setExternalReference(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="proc-note">Note (optional)</Label>
            <Textarea
              id="proc-note"
              placeholder="Optional note…"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={2}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
            Cancel
          </Button>
          <Button
            onClick={() =>
              onConfirm({
                providerReference: providerReference.trim(),
                externalReference: externalReference.trim() || undefined,
                note: note || undefined,
              })
            }
            disabled={isPending || !providerReference.trim()}
          >
            {isPending && <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />}
            Mark as Processing
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ---- PAID Dialog (Strongest Confirmation) ----

function PaidDialog({
  open,
  onOpenChange,
  onConfirm,
  isPending,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onConfirm: (payload: { providerReference?: string; externalReference?: string; note: string }) => void;
  isPending: boolean;
}) {
  const [providerReference, setProviderReference] = useState("");
  const [externalReference, setExternalReference] = useState("");
  const [note, setNote] = useState("");
  const [confirmText, setConfirmText] = useState("");

  const hasRef = providerReference.trim() !== "" || externalReference.trim() !== "";
  const hasNote = note.trim() !== "";
  const confirmed = confirmText === "PAID";
  const canSubmit = hasRef && hasNote && confirmed;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-400" />
            Confirm PAID
          </DialogTitle>
          <DialogDescription>
            This action <strong className="text-rose-400">permanently reduces the Merchant Wallet balance</strong>. Confirm
            only after the external transfer has been executed.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-3 text-xs text-amber-400">
            <strong>WARNING:</strong> This is an irreversible financial operation. The merchant wallet will be debited.
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="paid-provider-ref">Provider Reference</Label>
            <Input
              id="paid-provider-ref"
              placeholder="Provider transaction reference"
              value={providerReference}
              onChange={(e) => setProviderReference(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="paid-external-ref">External Reference</Label>
            <Input
              id="paid-external-ref"
              placeholder="External reference"
              value={externalReference}
              onChange={(e) => setExternalReference(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="paid-note">Note *</Label>
            <Textarea
              id="paid-note"
              placeholder="Required confirmation note…"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={2}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="paid-confirm">
              Type <strong>PAID</strong> to confirm
            </Label>
            <Input
              id="paid-confirm"
              placeholder='Type "PAID" here'
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              className={confirmText === "PAID" ? "border-emerald-500/50" : ""}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={() =>
              onConfirm({
                providerReference: providerReference.trim() || undefined,
                externalReference: externalReference.trim() || undefined,
                note: note.trim(),
              })
            }
            disabled={isPending || !canSubmit}
          >
            {isPending && <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />}
            Confirm PAID
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ---- Reject Dialog ----

function RejectDialog({
  open,
  onOpenChange,
  onConfirm,
  isPending,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onConfirm: (reason: string) => void;
  isPending: boolean;
}) {
  const [reason, setReason] = useState("");
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reject Payout</DialogTitle>
          <DialogDescription>
            Provide a reason for rejecting this payout. This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 py-2">
          <Label htmlFor="reject-reason">Rejection Reason *</Label>
          <Textarea
            id="reject-reason"
            placeholder="Explain why this payout is being rejected…"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={3}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={() => onConfirm(reason.trim())}
            disabled={isPending || !reason.trim()}
          >
            {isPending && <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />}
            Reject Payout
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ---- Detail labels ----

function DetailLabel({ children }: { children: React.ReactNode }) {
  return <span className="text-xs text-muted-foreground">{children}</span>;
}
function DetailValue({ children, mono }: { children: React.ReactNode; mono?: boolean }) {
  return (
    <span className={`text-sm font-medium ${mono ? "font-mono" : ""}`}>
      {children}
    </span>
  );
}

// ---- Timeline ----

interface TimelineEntry {
  label: string;
  timestamp: string | null | undefined;
  icon: typeof Clock;
  color: string;
}

function TimelineCard({ payout }: { payout: MerchantPayout }) {
  const entries: TimelineEntry[] = [
    { label: "Created", timestamp: payout.createdAt, icon: Clock, color: "text-muted-foreground" },
    { label: "Reviewed", timestamp: payout.reviewedAt, icon: Eye, color: "text-sky-400" },
    { label: "Approved", timestamp: payout.approvedAt, icon: CheckCircle2, color: "text-emerald-400" },
    { label: "Processing", timestamp: payout.processingAt, icon: Loader2, color: "text-violet-400" },
    { label: "Paid", timestamp: payout.paidAt, icon: Banknote, color: "text-emerald-400" },
    { label: "Rejected", timestamp: payout.rejectedAt, icon: XCircle, color: "text-rose-400" },
    { label: "Cancelled", timestamp: payout.cancelledAt, icon: Ban, color: "text-muted-foreground" },
  ];

  const visible = entries.filter((e) => e.timestamp);

  if (visible.length === 0) return null;

  return (
    <Card className="border-border/60 bg-card/60 backdrop-blur-xl">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm">Timeline</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-0">
          {visible.map((e, i) => {
            const Icon = e.icon;
            return (
              <div key={e.label} className="relative flex gap-3 pb-4 last:pb-0">
                {i < visible.length - 1 && (
                  <div className="absolute left-[9px] top-5 h-full w-px bg-border/60" />
                )}
                <div className="relative mt-0.5">
                  <div className={`flex h-5 w-5 items-center justify-center rounded-full border border-border/60 bg-background ${e.color}`}>
                    <Icon className="h-3 w-3" />
                  </div>
                </div>
                <div>
                  <p className="text-xs font-medium text-foreground">{e.label}</p>
                  <p className="text-[10px] text-muted-foreground">
                    {formatDate(e.timestamp!, { withTime: true })}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

// ---- Main Page ----

export default function AdminPayoutDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = params.id;

  const { data: payout, isLoading, isError, refetch } = useAdminMerchantPayout(id);
  const approveMutation = useApproveMerchantPayout();
  const fxQuoteMutation = useQuoteMerchantPayoutFx();
  const processMutation = useProcessMerchantPayout();
  const paidMutation = useMarkMerchantPayoutPaid();
  const rejectMutation = useRejectMerchantPayout();

  // Dialog states
  const [approveOpen, setApproveOpen] = useState(false);
  const [fxOpen, setFxOpen] = useState(false);
  const [processingOpen, setProcessingOpen] = useState(false);
  const [paidOpen, setPaidOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);

  // Action handlers
  function handleApprove(note?: string) {
    approveMutation.mutate(
      { id, note },
      { onSuccess: () => setApproveOpen(false) }
    );
  }

  function handleFxQuote(payload: { payoutAmount: number; fxRate: number; fxProvider: string; fxReference: string; note?: string }) {
    fxQuoteMutation.mutate(
      { id, payload },
      { onSuccess: () => setFxOpen(false) }
    );
  }

  function handleProcessing(payload: { providerReference: string; externalReference?: string; note?: string }) {
    processMutation.mutate(
      { id, payload },
      { onSuccess: () => setProcessingOpen(false) }
    );
  }

  function handlePaid(payload: { providerReference?: string; externalReference?: string; note: string }) {
    paidMutation.mutate(
      { id, payload },
      { onSuccess: () => setPaidOpen(false) }
    );
  }

  function handleReject(reason: string) {
    rejectMutation.mutate(
      { id, payload: { reason } },
      { onSuccess: () => setRejectOpen(false) }
    );
  }

  const anyMutationPending =
    approveMutation.isPending ||
    fxQuoteMutation.isPending ||
    processMutation.isPending ||
    paidMutation.isPending ||
    rejectMutation.isPending;

  const status: MerchantPayoutStatus | undefined = payout?.status;

  const showApprove = status === "pending_review";
  const showFxQuote = status === "fx_pending";
  const showProcessing = status === "approved";
  const showPaid = status === "processing";
  const showReject = status === "pending_review" || status === "fx_pending" || status === "approved" || status === "processing";
  const showActions = showApprove || showFxQuote || showProcessing || showPaid || showReject;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Skeleton className="h-9 w-9 rounded-lg" />
          <Skeleton className="h-7 w-48" />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-40 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (isError || !payout) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" size="sm" onClick={() => router.push("/admin/commerce/payouts")}>
          <ArrowLeft className="mr-1.5 h-4 w-4" />
          Back to Payouts
        </Button>
        <ErrorState message="Failed to load payout details" onRetry={() => refetch()} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/admin/commerce/payouts")}
          >
            <ArrowLeft className="mr-1.5 h-4 w-4" />
            Back
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-semibold">{payout.ticketCode}</h1>
              <PayoutStatusBadge status={payout.status} />
            </div>
            <p className="text-xs text-muted-foreground">{payout.id}</p>
          </div>
        </div>
        {showActions && (
          <div className="flex items-center gap-2 flex-wrap">
            {showApprove && (
              <>
                <Button size="sm" onClick={() => setApproveOpen(true)}>
                  <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />
                  Approve
                </Button>
                <Button size="sm" variant="destructive" onClick={() => setRejectOpen(true)}>
                  <XCircle className="mr-1.5 h-3.5 w-3.5" />
                  Reject
                </Button>
              </>
            )}
            {showFxQuote && (
              <>
                <Button size="sm" onClick={() => setFxOpen(true)}>
                  <ArrowLeftRight className="mr-1.5 h-3.5 w-3.5" />
                  Quote FX
                </Button>
                <Button size="sm" variant="destructive" onClick={() => setRejectOpen(true)}>
                  <XCircle className="mr-1.5 h-3.5 w-3.5" />
                  Reject
                </Button>
              </>
            )}
            {showProcessing && (
              <>
                <Button size="sm" onClick={() => setProcessingOpen(true)}>
                  <Send className="mr-1.5 h-3.5 w-3.5" />
                  Mark Processing
                </Button>
                <Button size="sm" variant="destructive" onClick={() => setRejectOpen(true)}>
                  <XCircle className="mr-1.5 h-3.5 w-3.5" />
                  Reject
                </Button>
              </>
            )}
            {showPaid && (
              <>
                <Button size="sm" variant="destructive" className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => setPaidOpen(true)}>
                  <Banknote className="mr-1.5 h-3.5 w-3.5" />
                  Mark Paid
                </Button>
                <Button size="sm" variant="destructive" onClick={() => setRejectOpen(true)}>
                  <XCircle className="mr-1.5 h-3.5 w-3.5" />
                  Reject
                </Button>
              </>
            )}
          </div>
        )}
      </div>

      {/* Cards Grid */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {/* Merchant Info */}
        <Card className="border-border/60 bg-card/60 backdrop-blur-xl">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              <ShieldCheck className="h-4 w-4 text-primary" />
              Merchant Info
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-0">
            <InfoRow label="Name" value={payout.merchantName} />
            <InfoRow label="Email" value={payout.merchantEmail} />
            <InfoRow label="Merchant ID" value={payout.merchantId} mono />
          </CardContent>
        </Card>

        {/* Wallet Info */}
        <Card className="border-border/60 bg-card/60 backdrop-blur-xl">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Banknote className="h-4 w-4 text-primary" />
              Wallet
            </CardTitle>
          </CardHeader>
          <CardContent>
            <InfoRow label="Wallet ID" value={payout.walletId} mono />
            <InfoRow label="Ledger Domain" value={payout.ledgerDomain} />
          </CardContent>
        </Card>

        {/* Financial Summary */}
        <Card className="border-border/60 bg-card/60 backdrop-blur-xl">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              <FileText className="h-4 w-4 text-primary" />
              Financial Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-0">
            <InfoRow
              label="Source Amount"
              value={`${formatCurrency(payout.sourceAmount, payout.sourceCurrency)} ${payout.sourceCurrency}`}
              mono
            />
            <InfoRow
              label="Payout Amount"
              value={`${formatCurrency(payout.payoutAmount, payout.payoutCurrency)} ${payout.payoutCurrency}`}
              mono
            />
            <InfoRow label="Method" value={payout.method.replace(/_/g, " ")} />
            <InfoRow label="Network" value={payout.network} />
            {payout.fxRequired && (
              <>
                <div className="my-2 border-t border-border/40" />
                <DetailLabel>FX Details</DetailLabel>
                <InfoRow
                  label="FX Rate"
                  value={payout.fxRate !== null ? payout.fxRate.toString() : null}
                  mono
                />
                <InfoRow label="FX Provider" value={payout.fxProvider} />
                <InfoRow label="FX Reference" value={payout.fxReference} mono />
                <InfoRow label="FX Status" value={payout.fxStatus} />
              </>
            )}
          </CardContent>
        </Card>

        {/* Destination */}
        <Card className="border-border/60 bg-card/60 backdrop-blur-xl">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              <MapPin className="h-4 w-4 text-primary" />
              Destination
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-0">
            <InfoRow label="Beneficiary" value={payout.destination.beneficiaryName} />
            <InfoRow label="Method" value={payout.destination.method.replace(/_/g, " ")} />
            <InfoRow label="Country" value={payout.destination.country} />
            {payout.destination.iban && <InfoRow label="IBAN" value={payout.destination.iban} mono />}
            {payout.destination.bic && <InfoRow label="BIC" value={payout.destination.bic} mono />}
            {payout.destination.bankName && <InfoRow label="Bank" value={payout.destination.bankName} />}
            {payout.destination.paymentReference && <InfoRow label="Payment Ref" value={payout.destination.paymentReference} mono />}
            {payout.destination.keyType && <InfoRow label="PIX Key Type" value={payout.destination.keyType} />}
            {payout.destination.keyValue && <InfoRow label="PIX Key" value={payout.destination.keyValue} mono />}
            {payout.destination.taxId && <InfoRow label="Tax ID" value={payout.destination.taxId} mono />}
            {payout.destination.walletAddress && <InfoRow label="Wallet" value={payout.destination.walletAddress} mono />}
            {payout.destination.instructions && <InfoRow label="Instructions" value={payout.destination.instructions} />}
          </CardContent>
        </Card>

        {/* References */}
        <Card className="border-border/60 bg-card/60 backdrop-blur-xl">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              <FileText className="h-4 w-4 text-primary" />
              References
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-0">
            <InfoRow label="Provider Ref" value={payout.providerReference} mono />
            <InfoRow label="External Ref" value={payout.externalReference} mono />
            <InfoRow label="Idempotency Key" value={payout.idempotencyKey} mono />
            <InfoRow label="Ticket Code" value={payout.ticketCode} mono />
          </CardContent>
        </Card>

        {/* Notes */}
        {(payout.reviewNote || payout.rejectionReason) && (
          <Card className="border-border/60 bg-card/60 backdrop-blur-xl">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm">
                <MessageSquare className="h-4 w-4 text-primary" />
                Notes
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {payout.reviewNote && (
                <div>
                  <DetailLabel>Review Note</DetailLabel>
                  <p className="mt-1 rounded-lg bg-muted/30 p-3 text-xs">{payout.reviewNote}</p>
                </div>
              )}
              {payout.rejectionReason && (
                <div>
                  <DetailLabel className="text-rose-400">Rejection Reason</DetailLabel>
                  <p className="mt-1 rounded-lg bg-rose-500/5 border border-rose-500/20 p-3 text-xs text-rose-300">
                    {payout.rejectionReason}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Timeline */}
        <TimelineCard payout={payout} />
      </div>

      {/* ---- Dialogs ---- */}
      <ApproveDialog
        open={approveOpen}
        onOpenChange={setApproveOpen}
        onConfirm={handleApprove}
        isPending={approveMutation.isPending}
      />
      <FxQuoteDialog
        open={fxOpen}
        onOpenChange={setFxOpen}
        onConfirm={handleFxQuote}
        isPending={fxQuoteMutation.isPending}
      />
      <ProcessingDialog
        open={processingOpen}
        onOpenChange={setProcessingOpen}
        onConfirm={handleProcessing}
        isPending={processMutation.isPending}
      />
      <PaidDialog
        open={paidOpen}
        onOpenChange={setPaidOpen}
        onConfirm={handlePaid}
        isPending={paidMutation.isPending}
      />
      <RejectDialog
        open={rejectOpen}
        onOpenChange={setRejectOpen}
        onConfirm={handleReject}
        isPending={rejectMutation.isPending}
      />
    </div>
  );
}