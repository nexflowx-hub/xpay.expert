"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  CircleDot,
  Loader2,
  RefreshCw,
  AlertTriangle,
  Wallet as WalletIcon,
  Send,
  ArrowUpRight,
  Shield,
  FileCheck,
  PartyPopper,
  Landmark,
  Coins,
  QrCode,
} from "lucide-react";
import {
  useWallets,
  useMerchantPayoutOptions,
  useValidateMerchantPayout,
  useCreateMerchantPayout,
} from "@/hooks/use-queries";
import { PageHeader, ErrorState, fadeUp } from "@/components/shared";
import { formatCurrency, cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { COUNTRY_LIST } from "@/config";
import type {
  Wallet as WalletType,
  MerchantPayoutMethod,
  MerchantPayoutDestination,
  MerchantPayoutOptions,
  MerchantPayoutValidation,
  MerchantPayoutStatus,
  PixKeyType,
  CreateMerchantPayoutPayload,
  MerchantPayout,
  CurrencyCode,
} from "@/types";

// ---- Step definitions ----
type WizardStep = "source" | "destination" | "validation" | "confirmation" | "created";

const STEPS: { key: WizardStep; label: string; icon: React.ElementType }[] = [
  { key: "source", label: "Source", icon: WalletIcon },
  { key: "destination", label: "Destination", icon: Send },
  { key: "validation", label: "Validate", icon: FileCheck },
  { key: "confirmation", label: "Confirm", icon: Shield },
  { key: "created", label: "Done", icon: PartyPopper },
];

const METHOD_INFO: Record<
  MerchantPayoutMethod,
  { label: string; description: string; icon: React.ElementType }
> = {
  SEPA_INSTANT: {
    label: "SEPA Instant",
    description: "Euro bank transfer via SEPA Instant scheme",
    icon: Landmark,
  },
  PIX: {
    label: "PIX",
    description: "Brazilian instant payment via PIX key",
    icon: QrCode,
  },
  USDT_TRC20: {
    label: "USDT (TRC20)",
    description: "Tether on Tron network",
    icon: Coins,
  },
  USDT_ERC20: {
    label: "USDT (ERC20)",
    description: "Tether on Ethereum network",
    icon: Coins,
  },
  MANUAL: {
    label: "Manual Transfer",
    description: "Custom manual payout instructions",
    icon: ArrowUpRight,
  },
};

const PIX_KEY_TYPES: { value: PixKeyType; label: string }[] = [
  { value: "CPF", label: "CPF (Individual)" },
  { value: "CNPJ", label: "CNPJ (Company)" },
  { value: "EMAIL", label: "Email" },
  { value: "PHONE", label: "Phone" },
  { value: "EVP", label: "EVP (Random Key)" },
];

// ---- Step Indicator ----
function StepIndicator({
  currentStep,
  steps,
}: {
  currentStep: WizardStep;
  steps: typeof STEPS;
}) {
  const currentIndex = steps.findIndex((s) => s.key === currentStep);
  return (
    <div className="flex items-center justify-center gap-1 overflow-x-auto pb-2">
      {steps.map((step, i) => {
        const Icon = step.icon;
        const isCompleted = i < currentIndex;
        const isCurrent = i === currentIndex;
        return (
          <React.Fragment key={step.key}>
            {i > 0 && (
              <div
                className={cn(
                  "h-px w-6 sm:w-10",
                  i <= currentIndex ? "bg-primary/40" : "bg-border/60"
                )}
              />
            )}
            <div className="flex flex-col items-center gap-1">
              <div
                className={cn(
                  "grid h-8 w-8 place-items-center rounded-full border text-xs transition",
                  isCompleted &&
                    "border-emerald-500/40 bg-emerald-500/12 text-emerald-400",
                  isCurrent &&
                    "border-primary/40 bg-primary/12 text-primary",
                  !isCompleted &&
                    !isCurrent &&
                    "border-border/60 bg-muted/30 text-muted-foreground"
                )}
              >
                {isCompleted ? (
                  <Check className="h-3.5 w-3.5" />
                ) : (
                  <Icon className="h-3.5 w-3.5" />
                )}
              </div>
              <span
                className={cn(
                  "hidden text-[10px] sm:block",
                  isCurrent ? "font-medium text-foreground" : "text-muted-foreground"
                )}
              >
                {step.label}
              </span>
            </div>
          </React.Fragment>
        );
      })}
    </div>
  );
}

// ---- Main Wizard Component ----
export default function NewPayoutPage() {
  const router = useRouter();

  // Step state
  const [step, setStep] = React.useState<WizardStep>("source");

  // Step 1: Source
  const [selectedWalletId, setSelectedWalletId] = React.useState<string>("");
  const [sourceAmountStr, setSourceAmountStr] = React.useState<string>("");

  // Step 2: Destination
  const [selectedMethod, setSelectedMethod] = React.useState<MerchantPayoutMethod | "">("");
  // SEPA fields
  const [sepaBeneficiary, setSepaBeneficiary] = React.useState("");
  const [sepaIban, setSepaIban] = React.useState("");
  const [sepaBic, setSepaBic] = React.useState("");
  const [sepaBankName, setSepaBankName] = React.useState("");
  const [sepaCountry, setSepaCountry] = React.useState("");
  const [sepaReference, setSepaReference] = React.useState("");
  // PIX fields
  const [pixBeneficiary, setPixBeneficiary] = React.useState("");
  const [pixKeyType, setPixKeyType] = React.useState<PixKeyType | "">("");
  const [pixKeyValue, setPixKeyValue] = React.useState("");
  const [pixTaxId, setPixTaxId] = React.useState("");
  const [pixBankName, setPixBankName] = React.useState("");
  const [pixCountry, setPixCountry] = React.useState("Brazil");
  // Crypto fields (shared)
  const [cryptoBeneficiary, setCryptoBeneficiary] = React.useState("");
  const [cryptoWalletAddress, setCryptoWalletAddress] = React.useState("");
  // Manual fields
  const [manualBeneficiary, setManualBeneficiary] = React.useState("");
  const [manualCountry, setManualCountry] = React.useState("");
  const [manualNetwork, setManualNetwork] = React.useState("");
  const [manualInstructions, setManualInstructions] = React.useState("");

  // Step 3: Validation result
  const [validationResult, setValidationResult] =
    React.useState<MerchantPayoutValidation | null>(null);

  // Step 4: Created payout
  const [createdPayout, setCreatedPayout] =
    React.useState<MerchantPayout | null>(null);
  const [createError, setCreateError] = React.useState<string | null>(null);

  // Idempotency key ref — generated ONCE and never regenerated
  const idempotencyKeyRef = React.useRef<string | null>(null);

  // Queries & mutations
  const { data: walletsRes, isLoading: walletsLoading } = useWallets();
  const {
    data: options,
    isLoading: optionsLoading,
    isError: optionsError,
    refetch: refetchOptions,
  } = useMerchantPayoutOptions();

  const validateMutation = useValidateMerchantPayout();
  const createMutation = useCreateMerchantPayout();

  // Derived: settlement wallets only
  const settlementWallets: WalletType[] = React.useMemo(() => {
    const allWallets = walletsRes?.wallets ?? walletsRes;
    if (!allWallets) return [];
    if (Array.isArray(allWallets)) {
      return allWallets.filter((w: WalletType) => w.type === "settlement");
    }
    return [];
  }, [walletsRes]);

  const selectedWallet = React.useMemo(
    () => settlementWallets.find((w) => w.id === selectedWalletId),
    [settlementWallets, selectedWalletId]
  );

  const sourceAmount = parseFloat(sourceAmountStr) || 0;

  // Build destination object from form state
  const buildDestination = React.useCallback((): MerchantPayoutDestination | null => {
    if (!selectedMethod) return null;
    const base = { method: selectedMethod as MerchantPayoutMethod };

    switch (selectedMethod) {
      case "SEPA_INSTANT":
        if (!sepaBeneficiary.trim() || !sepaIban.trim() || !sepaCountry.trim())
          return null;
        return {
          ...base,
          beneficiaryName: sepaBeneficiary.trim(),
          iban: sepaIban.trim(),
          bic: sepaBic.trim() || undefined,
          bankName: sepaBankName.trim() || undefined,
          country: sepaCountry.trim(),
          paymentReference: sepaReference.trim() || undefined,
        };
      case "PIX":
        if (!pixBeneficiary.trim() || !pixKeyType || !pixKeyValue.trim())
          return null;
        return {
          ...base,
          beneficiaryName: pixBeneficiary.trim(),
          keyType: pixKeyType as PixKeyType,
          keyValue: pixKeyValue.trim(),
          taxId: pixTaxId.trim() || undefined,
          bankName: pixBankName.trim() || undefined,
          country: pixCountry.trim() || "Brazil",
        };
      case "USDT_TRC20":
      case "USDT_ERC20":
        if (!cryptoBeneficiary.trim() || !cryptoWalletAddress.trim())
          return null;
        return {
          ...base,
          beneficiaryName: cryptoBeneficiary.trim(),
          walletAddress: cryptoWalletAddress.trim(),
          network:
            selectedMethod === "USDT_TRC20" ? "TRC20" : "ERC20",
        };
      case "MANUAL":
        if (
          !manualBeneficiary.trim() ||
          !manualCountry.trim() ||
          !manualNetwork.trim() ||
          !manualInstructions.trim()
        )
          return null;
        return {
          ...base,
          beneficiaryName: manualBeneficiary.trim(),
          country: manualCountry.trim(),
          network: manualNetwork.trim(),
          instructions: manualInstructions.trim(),
        };
      default:
        return null;
    }
  }, [
    selectedMethod,
    sepaBeneficiary,
    sepaIban,
    sepaBic,
    sepaBankName,
    sepaCountry,
    sepaReference,
    pixBeneficiary,
    pixKeyType,
    pixKeyValue,
    pixTaxId,
    pixBankName,
    pixCountry,
    cryptoBeneficiary,
    cryptoWalletAddress,
    manualBeneficiary,
    manualCountry,
    manualNetwork,
    manualInstructions,
  ]);

  // Build payload for validation/creation
  const buildPayload = React.useCallback((): CreateMerchantPayoutPayload | null => {
    if (!selectedWalletId || sourceAmount <= 0) return null;
    const dest = buildDestination();
    if (!dest) return null;
    return {
      walletId: selectedWalletId,
      sourceAmount,
      method: dest.method,
      destination: dest,
    };
  }, [selectedWalletId, sourceAmount, buildDestination]);

  // Step validation
  const isSourceValid =
    selectedWalletId !== "" && sourceAmount > 0 && sourceAmount <= (selectedWallet?.available ?? 0);

  const isDestinationValid = buildDestination() !== null;

  const stepIndex = STEPS.findIndex((s) => s.key === step);

  function goNext() {
    if (stepIndex < STEPS.length - 1) {
      setStep(STEPS[stepIndex + 1].key);
    }
  }

  function goBack() {
    if (stepIndex > 0) {
      setStep(STEPS[stepIndex - 1].key);
    }
  }

  // Step 3: Validate
  function handleValidate() {
    const payload = buildPayload();
    if (!payload) return;
    validateMutation.mutate(payload, {
      onSuccess: (data) => {
        setValidationResult(data);
        setCreateError(null);
        goNext();
      },
    });
  }

  // Step 4: Create
  function handleCreate() {
    const payload = buildPayload();
    if (!payload) return;

    // Generate idempotency key ONCE
    if (!idempotencyKeyRef.current) {
      idempotencyKeyRef.current = crypto.randomUUID();
    }

    setCreateError(null);
    createMutation.mutate(
      { payload, idempotencyKey: idempotencyKeyRef.current },
      {
        onSuccess: (data) => {
          setCreatedPayout(data);
          goNext();
        },
        onError: (err: Error & { code?: string }) => {
          setCreateError(err.code || err.message || "Failed to create payout");
        },
      }
    );
  }

  // Reset everything
  function resetWizard() {
    setStep("source");
    setSelectedWalletId("");
    setSourceAmountStr("");
    setSelectedMethod("");
    // SEPA
    setSepaBeneficiary("");
    setSepaIban("");
    setSepaBic("");
    setSepaBankName("");
    setSepaCountry("");
    setSepaReference("");
    // PIX
    setPixBeneficiary("");
    setPixKeyType("");
    setPixKeyValue("");
    setPixTaxId("");
    setPixBankName("");
    setPixCountry("Brazil");
    // Crypto
    setCryptoBeneficiary("");
    setCryptoWalletAddress("");
    // Manual
    setManualBeneficiary("");
    setManualCountry("");
    setManualNetwork("");
    setManualInstructions("");
    // Results
    setValidationResult(null);
    setCreatedPayout(null);
    setCreateError(null);
    idempotencyKeyRef.current = null;
  }

  // Cancel — go back to list
  function handleCancel() {
    resetWizard();
    router.push("/commerce/payouts");
  }

  // ---- Render Steps ----

  // STEP 1: Source
  function renderSource() {
    return (
      <Card className="border-border/60 bg-card/60 p-6 backdrop-blur-xl">
        <h2 className="text-base font-semibold">Select source wallet &amp; amount</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Choose a settlement wallet to fund the payout.
        </p>

        <div className="mt-6 flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="wallet-select">Settlement Wallet</Label>
            {walletsLoading ? (
              <Skeleton className="h-9 w-full" />
            ) : (
              <Select
                value={selectedWalletId}
                onValueChange={(v) => {
                  setSelectedWalletId(v);
                  setSourceAmountStr("");
                }}
              >
                <SelectTrigger id="wallet-select" className="w-full">
                  <SelectValue placeholder="Select a wallet" />
                </SelectTrigger>
                <SelectContent>
                  {settlementWallets.length === 0 ? (
                    <SelectItem value="none" disabled>
                      No settlement wallets found
                    </SelectItem>
                  ) : (
                    settlementWallets.map((w) => (
                      <SelectItem key={w.id} value={w.id}>
                        <span className="flex items-center gap-2">
                          <span>{w.label || w.currency}</span>
                          <span className="text-muted-foreground">
                            — {w.currency} · Avail:{" "}
                            {formatCurrency(w.available, w.currency)}
                          </span>
                        </span>
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            )}
          </div>

          {selectedWallet && (
            <motion.div {...fadeUp}>
              <div className="rounded-lg border border-border/60 bg-background/40 p-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Currency</p>
                    <p className="mt-0.5 font-mono text-sm font-medium">
                      {selectedWallet.currency}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Available</p>
                    <p className="mt-0.5 font-mono text-sm font-medium text-emerald-400">
                      {formatCurrency(
                        selectedWallet.available,
                        selectedWallet.currency
                      )}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Reserved</p>
                    <p className="mt-0.5 font-mono text-sm font-medium">
                      {formatCurrency(
                        selectedWallet.reserved,
                        selectedWallet.currency
                      )}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Balance</p>
                    <p className="mt-0.5 font-mono text-sm font-medium">
                      {formatCurrency(
                        selectedWallet.balance,
                        selectedWallet.currency
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="source-amount">Source Amount</Label>
            <div className="relative">
              <Input
                id="source-amount"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={sourceAmountStr}
                onChange={(e) => setSourceAmountStr(e.target.value)}
                className="pr-16 font-mono"
              />
              {selectedWallet && (
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                  {selectedWallet.currency}
                </span>
              )}
            </div>
            {sourceAmountStr && sourceAmount <= 0 && (
              <p className="text-xs text-rose-400">Amount must be greater than 0</p>
            )}
            {sourceAmountStr &&
              sourceAmount > 0 &&
              selectedWallet &&
              sourceAmount > selectedWallet.available && (
                <p className="text-xs text-rose-400">
                  Amount exceeds available balance of{" "}
                  {formatCurrency(
                    selectedWallet.available,
                    selectedWallet.currency
                  )}
                </p>
              )}
          </div>
        </div>
      </Card>
    );
  }

  // STEP 2: Destination
  function renderDestination() {
    const availableMethods = options?.methods ?? [];
    return (
      <Card className="border-border/60 bg-card/60 p-6 backdrop-blur-xl">
        <h2 className="text-base font-semibold">Select payout method</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Choose how you want to receive the payout.
        </p>

        {optionsError && (
          <div className="mt-4">
            <ErrorState
              message="Failed to load payout options"
              onRetry={() => refetchOptions()}
            />
          </div>
        )}

        {!optionsError && (
          <div className="mt-6 flex flex-col gap-6">
            {/* Method selector */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {optionsLoading
                ? Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-20 rounded-xl" />
                  ))
                : availableMethods.map((m) => {
                    const info = METHOD_INFO[m];
                    const Icon = info.icon;
                    const isActive = selectedMethod === m;
                    return (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setSelectedMethod(m)}
                        className={cn(
                          "flex items-start gap-3 rounded-xl border p-4 text-left transition",
                          isActive
                            ? "border-primary/50 bg-primary/5"
                            : "border-border/60 bg-background/40 hover:border-border"
                        )}
                      >
                        <div
                          className={cn(
                            "mt-0.5 rounded-lg p-1.5",
                            isActive
                              ? "bg-primary/15 text-primary"
                              : "bg-muted/40 text-muted-foreground"
                          )}
                        >
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium">{info.label}</p>
                          <p className="mt-0.5 text-xs text-muted-foreground">
                            {info.description}
                          </p>
                        </div>
                        {isActive && (
                          <CircleDot className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                        )}
                      </button>
                    );
                  })}
            </div>

            {/* Dynamic fields based on method */}
            {selectedMethod === "SEPA_INSTANT" && (
              <motion.div {...fadeUp} className="flex flex-col gap-4">
                <Separator />
                <h3 className="text-sm font-semibold">SEPA Instant Details</h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="flex flex-col gap-1.5 sm:col-span-2">
                    <Label htmlFor="sepa-beneficiary">Beneficiary Name *</Label>
                    <Input
                      id="sepa-beneficiary"
                      value={sepaBeneficiary}
                      onChange={(e) => setSepaBeneficiary(e.target.value)}
                      placeholder="Company or individual name"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5 sm:col-span-2">
                    <Label htmlFor="sepa-iban">IBAN *</Label>
                    <Input
                      id="sepa-iban"
                      value={sepaIban}
                      onChange={(e) => setSepaIban(e.target.value)}
                      placeholder="PT50 0002 0123 1234 5678 9015 4"
                      className="font-mono"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="sepa-bic">BIC (optional)</Label>
                    <Input
                      id="sepa-bic"
                      value={sepaBic}
                      onChange={(e) => setSepaBic(e.target.value)}
                      placeholder="BNPAPTPP"
                      className="font-mono"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="sepa-bank">Bank Name (optional)</Label>
                    <Input
                      id="sepa-bank"
                      value={sepaBankName}
                      onChange={(e) => setSepaBankName(e.target.value)}
                      placeholder="Bank name"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="sepa-country">Country *</Label>
                    <Select value={sepaCountry} onValueChange={setSepaCountry}>
                      <SelectTrigger id="sepa-country">
                        <SelectValue placeholder="Select country" />
                      </SelectTrigger>
                      <SelectContent>
                        {COUNTRY_LIST.map((c) => (
                          <SelectItem key={c} value={c}>
                            {c}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="sepa-ref">Payment Reference (optional)</Label>
                    <Input
                      id="sepa-ref"
                      value={sepaReference}
                      onChange={(e) => setSepaReference(e.target.value)}
                      placeholder="Invoice reference"
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {selectedMethod === "PIX" && (
              <motion.div {...fadeUp} className="flex flex-col gap-4">
                <Separator />
                <h3 className="text-sm font-semibold">PIX Details</h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="flex flex-col gap-1.5 sm:col-span-2">
                    <Label htmlFor="pix-beneficiary">Beneficiary Name *</Label>
                    <Input
                      id="pix-beneficiary"
                      value={pixBeneficiary}
                      onChange={(e) => setPixBeneficiary(e.target.value)}
                      placeholder="Company or individual name"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="pix-key-type">Key Type *</Label>
                    <Select
                      value={pixKeyType}
                      onValueChange={(v) => setPixKeyType(v as PixKeyType)}
                    >
                      <SelectTrigger id="pix-key-type">
                        <SelectValue placeholder="Select key type" />
                      </SelectTrigger>
                      <SelectContent>
                        {PIX_KEY_TYPES.map((kt) => (
                          <SelectItem key={kt.value} value={kt.value}>
                            {kt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="pix-key-value">Key Value *</Label>
                    <Input
                      id="pix-key-value"
                      value={pixKeyValue}
                      onChange={(e) => setPixKeyValue(e.target.value)}
                      placeholder="PIX key value"
                      className="font-mono"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="pix-tax-id">Tax ID (optional)</Label>
                    <Input
                      id="pix-tax-id"
                      value={pixTaxId}
                      onChange={(e) => setPixTaxId(e.target.value)}
                      placeholder="Tax ID"
                      className="font-mono"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="pix-bank">Bank Name (optional)</Label>
                    <Input
                      id="pix-bank"
                      value={pixBankName}
                      onChange={(e) => setPixBankName(e.target.value)}
                      placeholder="Bank name"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label>Country</Label>
                    <Input value="Brazil" disabled />
                  </div>
                </div>
              </motion.div>
            )}

            {(selectedMethod === "USDT_TRC20" ||
              selectedMethod === "USDT_ERC20") && (
              <motion.div {...fadeUp} className="flex flex-col gap-4">
                <Separator />
                <h3 className="text-sm font-semibold">
                  {selectedMethod === "USDT_TRC20"
                    ? "USDT TRC20 Details"
                    : "USDT ERC20 Details"}
                </h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="flex flex-col gap-1.5 sm:col-span-2">
                    <Label htmlFor="crypto-beneficiary">Beneficiary Name *</Label>
                    <Input
                      id="crypto-beneficiary"
                      value={cryptoBeneficiary}
                      onChange={(e) => setCryptoBeneficiary(e.target.value)}
                      placeholder="Company or individual name"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5 sm:col-span-2">
                    <Label htmlFor="crypto-addr">Wallet Address *</Label>
                    <Input
                      id="crypto-addr"
                      value={cryptoWalletAddress}
                      onChange={(e) => setCryptoWalletAddress(e.target.value)}
                      placeholder="0x... or T..."
                      className="font-mono"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label>Network</Label>
                    <Input
                      value={
                        selectedMethod === "USDT_TRC20" ? "TRC20" : "ERC20"
                      }
                      disabled
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {selectedMethod === "MANUAL" && (
              <motion.div {...fadeUp} className="flex flex-col gap-4">
                <Separator />
                <h3 className="text-sm font-semibold">Manual Transfer Details</h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="flex flex-col gap-1.5 sm:col-span-2">
                    <Label htmlFor="manual-beneficiary">Beneficiary Name *</Label>
                    <Input
                      id="manual-beneficiary"
                      value={manualBeneficiary}
                      onChange={(e) => setManualBeneficiary(e.target.value)}
                      placeholder="Company or individual name"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="manual-country">Country *</Label>
                    <Select
                      value={manualCountry}
                      onValueChange={setManualCountry}
                    >
                      <SelectTrigger id="manual-country">
                        <SelectValue placeholder="Select country" />
                      </SelectTrigger>
                      <SelectContent>
                        {COUNTRY_LIST.map((c) => (
                          <SelectItem key={c} value={c}>
                            {c}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="manual-network">Network *</Label>
                    <Input
                      id="manual-network"
                      value={manualNetwork}
                      onChange={(e) => setManualNetwork(e.target.value)}
                      placeholder="e.g. SWIFT, ACH"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5 sm:col-span-2">
                    <Label htmlFor="manual-instructions">Instructions *</Label>
                    <Textarea
                      id="manual-instructions"
                      value={manualInstructions}
                      onChange={(e) => setManualInstructions(e.target.value)}
                      placeholder="Detailed transfer instructions"
                      rows={4}
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        )}
      </Card>
    );
  }

  // STEP 3: Validation
  function renderValidation() {
    if (validateMutation.isPending) {
      return (
        <Card className="flex flex-col items-center justify-center gap-4 border-border/60 bg-card/60 p-12 backdrop-blur-xl">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Validating payout...</p>
        </Card>
      );
    }

    if (validateMutation.isError) {
      const errMsg =
        (validateMutation.error as Error & { code?: string })?.code ||
        validateMutation.error?.message ||
        "Validation failed";
      return (
        <Card className="border-border/60 bg-card/60 p-6 backdrop-blur-xl">
          <div className="flex flex-col items-center gap-4 py-8">
            <div className="rounded-xl bg-rose-500/10 p-3">
              <AlertTriangle className="h-6 w-6 text-rose-400" />
            </div>
            <p className="text-sm font-medium text-foreground">
              Validation Failed
            </p>
            <p className="text-sm text-muted-foreground">{errMsg}</p>
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5"
              onClick={handleValidate}
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Retry Validation
            </Button>
          </div>
        </Card>
      );
    }

    if (!validationResult) {
      return (
        <Card className="border-border/60 bg-card/60 p-6 backdrop-blur-xl">
          <p className="text-sm text-muted-foreground">
            Click "Next" to validate the payout before creation.
          </p>
        </Card>
      );
    }

    const v = validationResult;
    return (
      <Card className="border-border/60 bg-card/60 p-6 backdrop-blur-xl">
        <h2 className="text-base font-semibold">Validation Result</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Review the validated payout details before confirming.
        </p>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="rounded-lg border border-border/60 bg-background/40 p-4">
            <p className="text-xs text-muted-foreground">Source Amount</p>
            <p className="mt-1 font-mono text-lg font-semibold">
              {formatCurrency(v.sourceAmount, v.sourceCurrency)}
            </p>
          </div>
          <div className="rounded-lg border border-border/60 bg-background/40 p-4">
            <p className="text-xs text-muted-foreground">Payout Amount</p>
            <p className="mt-1 font-mono text-lg font-semibold">
              {formatCurrency(v.payoutAmount, v.payoutCurrency)}
            </p>
          </div>
          <div className="rounded-lg border border-border/60 bg-background/40 p-4">
            <p className="text-xs text-muted-foreground">FX Required</p>
            <p className="mt-1 text-sm font-medium">
              {v.fxRequired ? "Yes" : "No"}
            </p>
            {v.fxRequired && v.fxStatus && (
              <Badge
                variant="outline"
                className="mt-1 text-amber-400"
              >
                {v.fxStatus}
              </Badge>
            )}
          </div>
          <div className="rounded-lg border border-border/60 bg-background/40 p-4">
            <p className="text-xs text-muted-foreground">Initial Status</p>
            <p className="mt-1 text-sm font-medium capitalize">
              {v.initialStatus.replace(/_/g, " ")}
            </p>
          </div>
          <div className="rounded-lg border border-border/60 bg-background/40 p-4 sm:col-span-2">
            <p className="text-xs text-muted-foreground">
              Available After Reservation
            </p>
            <p className="mt-1 font-mono text-sm font-semibold">
              {formatCurrency(v.availableAfterReservation, v.sourceCurrency)}
            </p>
          </div>
          <div className="rounded-lg border border-border/60 bg-background/40 p-4 sm:col-span-2">
            <p className="text-xs text-muted-foreground">Destination</p>
            <p className="mt-1 text-sm font-medium">
              {METHOD_INFO[v.destination.method]?.label || v.destination.method}
            </p>
            <p className="mt-0.5 text-sm text-muted-foreground">
              {v.destination.beneficiaryName}
              {v.destination.country && ` · ${v.destination.country}`}
            </p>
          </div>
        </div>
      </Card>
    );
  }

  // STEP 4: Confirmation
  function renderConfirmation() {
    const v = validationResult;
    if (!v || !selectedWallet) return null;

    return (
      <Card className="border-border/60 bg-card/60 p-6 backdrop-blur-xl">
        <h2 className="text-base font-semibold">Confirm Payout</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Please review all details before creating the payout.
        </p>

        {/* Warning */}
        <div className="mt-5 flex items-start gap-3 rounded-lg border border-amber-500/30 bg-amber-500/5 p-4">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-400" />
          <div>
            <p className="text-sm font-medium text-amber-300">
              Funds will be reserved
            </p>
            <p className="mt-0.5 text-xs text-amber-200/70">
              The amount will be reserved from your Commerce Settlement Wallet.
              The transfer is processed manually.
            </p>
          </div>
        </div>

        {/* Summary */}
        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <p className="text-xs text-muted-foreground">Source Wallet</p>
            <p className="mt-0.5 text-sm font-medium">
              {selectedWallet.label || selectedWallet.currency}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Source Amount</p>
            <p className="mt-0.5 font-mono text-sm font-semibold">
              {formatCurrency(v.sourceAmount, v.sourceCurrency)}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Payout Amount</p>
            <p className="mt-0.5 font-mono text-sm font-semibold">
              {formatCurrency(v.payoutAmount, v.payoutCurrency)}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Method</p>
            <p className="mt-0.5 text-sm font-medium">
              {METHOD_INFO[v.destination.method]?.label}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Beneficiary</p>
            <p className="mt-0.5 text-sm">{v.destination.beneficiaryName}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Country</p>
            <p className="mt-0.5 text-sm">
              {v.destination.country || "—"}
            </p>
          </div>
          {v.fxRequired && (
            <div className="sm:col-span-2">
              <p className="text-xs text-muted-foreground">FX Status</p>
              <p className="mt-0.5 text-sm text-amber-400">
                FX will be processed manually
              </p>
            </div>
          )}
        </div>

        {/* Error */}
        {createError && (
          <div className="mt-4 flex items-start gap-3 rounded-lg border border-rose-500/30 bg-rose-500/5 p-4">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-rose-400" />
            <div>
              <p className="text-sm font-medium text-rose-300">
                Payout creation failed
              </p>
              <p className="mt-0.5 text-xs text-rose-200/70">{createError}</p>
            </div>
          </div>
        )}

        {/* Create button */}
        <div className="mt-6 flex justify-end">
          <Button
            className="gap-1.5"
            onClick={handleCreate}
            disabled={createMutation.isPending}
          >
            {createMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <CheckCircle2 className="h-4 w-4" />
            )}
            Create Payout
          </Button>
        </div>
      </Card>
    );
  }

  // STEP 5: Created
  function renderCreated() {
    if (!createdPayout) return null;
    return (
      <Card className="border-border/60 bg-card/60 p-6 backdrop-blur-xl">
        <div className="flex flex-col items-center gap-4 py-6 text-center">
          <div className="rounded-full bg-emerald-500/12 p-4">
            <CheckCircle2 className="h-10 w-10 text-emerald-400" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">Payout Created</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Your payout request has been submitted successfully.
            </p>
          </div>
        </div>

        <div className="mx-auto mt-2 max-w-md grid grid-cols-1 gap-4">
          <div className="rounded-lg border border-border/60 bg-background/40 p-4">
            <p className="text-xs text-muted-foreground">Ticket</p>
            <p className="mt-0.5 font-mono text-sm font-medium text-primary">
              {createdPayout.ticketCode}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-lg border border-border/60 bg-background/40 p-4">
              <p className="text-xs text-muted-foreground">Status</p>
              <p className="mt-0.5 text-sm font-medium capitalize">
                {createdPayout.status.replace(/_/g, " ")}
              </p>
            </div>
            <div className="rounded-lg border border-border/60 bg-background/40 p-4">
              <p className="text-xs text-muted-foreground">Reserved</p>
              <p className="mt-0.5 font-mono text-sm font-semibold">
                {formatCurrency(
                  createdPayout.sourceAmount,
                  createdPayout.sourceCurrency
                )}
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-lg border border-border/60 bg-background/40 p-4">
              <p className="text-xs text-muted-foreground">Method</p>
              <p className="mt-0.5 text-sm font-medium">
                {METHOD_INFO[createdPayout.method]?.label}
              </p>
            </div>
            <div className="rounded-lg border border-border/60 bg-background/40 p-4">
              <p className="text-xs text-muted-foreground">Beneficiary</p>
              <p className="mt-0.5 truncate text-sm">
                {createdPayout.beneficiaryName}
              </p>
            </div>
          </div>
          {createdPayout.fxRequired && (
            <div className="flex items-center gap-2 rounded-lg border border-amber-500/30 bg-amber-500/5 p-3">
              <AlertTriangle className="h-4 w-4 text-amber-400" />
              <p className="text-xs text-amber-300">
                FX will be processed manually
              </p>
            </div>
          )}
        </div>

        <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Button
            variant="outline"
            onClick={() => router.push(`/commerce/payouts/${createdPayout.id}`)}
          >
            View Payout
          </Button>
          <Button
            onClick={() => {
              resetWizard();
            }}
          >
            Create Another
          </Button>
        </div>
      </Card>
    );
  }

  // ---- Determine which step content to show ----
  function renderStepContent() {
    switch (step) {
      case "source":
        return renderSource();
      case "destination":
        return renderDestination();
      case "validation":
        return renderValidation();
      case "confirmation":
        return renderConfirmation();
      case "created":
        return renderCreated();
    }
  }

  // Determine Next button state
  const isNextDisabled =
    (step === "source" && !isSourceValid) ||
    (step === "destination" && !isDestinationValid) ||
    step === "validation" ||
    step === "confirmation" ||
    step === "created";

  const isLastStep = step === "created";
  const isFirstStep = step === "source";
  const isConfirmStep = step === "confirmation";
  const isValidationStep = step === "validation";

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="New Payout"
        description="Create a new merchant payout request"
        breadcrumbs={[
          { label: "Commerce", href: "/commerce" },
          { label: "Payouts", href: "/commerce/payouts" },
          { label: "New" },
        ]}
        actions={
          <Button variant="ghost" size="sm" onClick={handleCancel}>
            Cancel
          </Button>
        }
      />

      {/* Step Indicator */}
      <StepIndicator currentStep={step} steps={STEPS} />

      {/* Step Content */}
      <motion.div
        key={step}
        {...fadeUp}
        className="flex flex-col gap-4"
      >
        {renderStepContent()}

        {/* Navigation Buttons */}
        {!isLastStep && (
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              size="sm"
              onClick={goBack}
              disabled={isFirstStep}
              className="gap-1.5"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back
            </Button>

            {isValidationStep ? (
              <Button
                size="sm"
                className="gap-1.5"
                onClick={handleValidate}
                disabled={validateMutation.isPending}
              >
                {validateMutation.isPending ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <ArrowRight className="h-3.5 w-3.5" />
                )}
                Validate &amp; Continue
              </Button>
            ) : isConfirmStep ? null : (
              <Button
                size="sm"
                className="gap-1.5"
                onClick={goNext}
                disabled={isNextDisabled}
              >
                Next
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
}