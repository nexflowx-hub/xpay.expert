"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAdminStore } from "@/stores/admin";
import { useAuth } from "@/stores/auth";
import {
  authEndpoints,
  platformEndpoints,
  profileEndpoints,
  storeEndpoints,
  apiKeyEndpoints,
  webhookEndpoints,
  walletEndpoints,
  transactionEndpoints,
  analyticsEndpoints,
  riskEndpoints,
  treasuryEndpoints,
  customerEndpoints,
  productEndpoints,
  paymentLinkEndpoints,
  invoiceEndpoints,
  subscriptionEndpoints,
  settlementEndpoints,
  merchantPayoutEndpoints,
  adminMerchantPayoutEndpoints,
  adminSettlementEndpoints,
  adminMerchantEndpoints,
  adminKycEndpoints,
  adminSystemEndpoints,
  transactionDetailEndpoints,
  walletMovementEndpoints,
  kycEndpoints,
} from "@/lib/api/endpoints";
import { fetchPlatformCapabilities } from "@/lib/api/capabilities-api";
import {
  securityEndpoints,
  developerApiKeysV2Endpoints,
  merchantWebhookEndpoints,
  providerWebhookEndpoints,
  bankingEndpoints,
} from "@/lib/api/endpoints";
import type {
  CreateStorePayload,
  UpdateStorePayload,
  CreateApiKeyPayload,
  CreateWebhookPayload,
  UpdateWebhookPayload,
  DataTableFilters,
  CreateMerchantPayoutPayload,
  AdminFxQuotePayload,
  AdminProcessingPayload,
  AdminPaidPayload,
  AdminRejectPayload,
} from "@/types";
import type {
  SecurityChallengeRequest,
  SecurityChallengeVerifyRequest,
  SecurityPurposeInfo,
  SecurityChallengeResponse,
  SecurityChallengeVerifyResponse,
} from "@/types/security";
import type {
  DeveloperApiKeyCreatePayload,
  MerchantWebhookCreatePayload,
  MerchantWebhookUpdatePayload,
} from "@/types/developer-v2";
import type {
  BankingBeneficiaryCreatePayload,
  BankingTransferCreatePayload,
  BankingFxQuotePayload,
} from "@/types/banking";

// Query key factory
export const queryKeys = {
  authMe: ["auth", "me"] as const,
  platformBootstrap: ["platform", "bootstrap"] as const,
  merchantProfile: ["merchant", "profile"] as const,
  stores: ["stores"] as const,
  storeDetail: (id: string) => ["stores", id] as const,
  apiKeys: ["api-keys"] as const,
  webhooks: ["webhooks"] as const,
  wallets: ["wallets"] as const,
  walletMovements: (filters?: DataTableFilters) => ["wallets", "movements", filters] as const,
  transactions: (filters?: DataTableFilters) => ["transactions", filters] as const,
  transactionStats: ["transactions", "stats"] as const,
  analyticsOverview: ["analytics", "overview"] as const,
  riskProfile: ["risk", "profile"] as const,
  treasuryOverview: ["treasury", "overview"] as const,
  customers: (filters?: DataTableFilters) => ["customers", filters] as const,
  products: ["products"] as const,
  paymentLinks: ["payment-links"] as const,
  invoices: ["invoices"] as const,
  subscriptions: ["subscriptions"] as const,
  // Settlements
  settlements: (filters?: DataTableFilters) => ["settlements", filters] as const,
  // Merchant Payouts
  merchantPayouts: (filters?: { status?: string; limit?: number; offset?: number }) => ["merchant", "payouts", filters] as const,
  merchantPayout: (id: string) => ["merchant", "payouts", id] as const,
  merchantPayoutOptions: ["merchant", "payouts", "options"] as const,
  // Admin Payouts
  adminPayouts: (filters?: { status?: string; merchantId?: string; method?: string; limit?: number; offset?: number }) => ["admin", "payouts", filters] as const,
  adminPayout: (id: string) => ["admin", "payouts", id] as const,
  // Admin Settlements
  adminSettlements: (filters?: DataTableFilters) => ["admin", "settlements", filters] as const,
  // Admin Merchants
  adminMerchants: ["admin", "merchants"] as const,
  // Admin KYC
  adminKyc: ["admin", "kyc"] as const,
  // Admin System
  adminHealth: ["admin", "health"] as const,
  adminRevenue: ["admin", "revenue"] as const,
  // Platform Capabilities
  platformCapabilities: ["platform", "capabilities"] as const,
  // Transaction Detail
  transactionDetail: (id: string) => ["transactions", id] as const,
  // KYC Status
  kycStatus: ["kyc", "status"] as const,
  securityPurposes: ["security", "purposes"] as const,
  developerApiKeysV2: ["developer", "api-keys", "v2"] as const,
  bankingCapabilities: ["banking", "capabilities"] as const,
  bankingAccounts: ["banking", "accounts"] as const,
  bankingAccount: (id: string) => ["banking", "accounts", id] as const,
  bankingAccountTransactions: (id: string, filters?: DataTableFilters) => ["banking", "accounts", id, "transactions", filters] as const,
  bankingBeneficiaries: ["banking", "beneficiaries"] as const,
  bankingTransfers: ["banking", "transfers"] as const,
  bankingTransfer: (id: string) => ["banking", "transfers", id] as const,
  bankingStatements: ["banking", "statements"] as const,
  merchantWebhooks: ["merchant", "webhooks"] as const,
  providerWebhooks: ["provider", "webhooks"] as const,
};

const defaultOptions = {
  staleTime: 30 * 1000,
  retry: 1,
  refetchOnWindowFocus: false,
};

// ---- Auth ----

export function useAuthMe() {
  return useQuery({
    queryKey: queryKeys.authMe,
    queryFn: () => authEndpoints.me(),
    ...defaultOptions,
    enabled: false,
  });
}

// ---- Platform Bootstrap ----

export function usePlatformBootstrap(enabled = true) {
  return useQuery({
    queryKey: queryKeys.platformBootstrap,
    queryFn: async () => {
      const data = await platformEndpoints.bootstrap();
      return data;
    },
    ...defaultOptions,
    enabled,
    retry: 0,
  });
}

// ---- Merchant Profile ----

export function useMerchantProfile() {
  return useQuery({
    queryKey: queryKeys.merchantProfile,
    queryFn: () => profileEndpoints.get(),
    ...defaultOptions,
  });
}

export function useUpdateMerchantProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { name?: string; company?: string }) =>
      profileEndpoints.update(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.merchantProfile });
      qc.invalidateQueries({ queryKey: queryKeys.platformBootstrap });
      toast.success("Profile updated successfully");
    },
    onError: (err: { message?: string }) => {
      toast.error(err?.message || "Failed to update profile");
    },
  });
}

// ---- Stores ----

export function useStores() {
  return useQuery({
    queryKey: queryKeys.stores,
    queryFn: () => storeEndpoints.list(),
    ...defaultOptions,
  });
}

export function useCreateStore() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateStorePayload) => storeEndpoints.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.stores });
      qc.invalidateQueries({ queryKey: queryKeys.platformBootstrap });
      toast.success("Store created successfully");
    },
    onError: (err: { message?: string }) => {
      toast.error(err?.message || "Failed to create store");
    },
  });
}

export function useStore(id: string) {
  return useQuery({
    queryKey: queryKeys.storeDetail(id),
    queryFn: () => storeEndpoints.get(id),
    ...defaultOptions,
    enabled: !!id,
  });
}

export function useUpdateStore(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateStorePayload) => storeEndpoints.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.stores });
      qc.invalidateQueries({ queryKey: queryKeys.storeDetail(id) });
      qc.invalidateQueries({ queryKey: queryKeys.platformBootstrap });
      toast.success("Store updated");
    },
    onError: (err: { message?: string }) => {
      toast.error(err?.message || "Failed to update store");
    },
  });
}

// ---- API Keys ----

export function useApiKeys() {
  return useQuery({
    queryKey: queryKeys.apiKeys,
    queryFn: () => apiKeyEndpoints.list(),
    ...defaultOptions,
  });
}

export function useCreateApiKey() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateApiKeyPayload) => apiKeyEndpoints.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.apiKeys });
      toast.success("API Key created — copy it now, it won't be shown again");
    },
    onError: (err: { message?: string }) => {
      toast.error(err?.message || "Failed to create API Key");
    },
  });
}

export function useDeleteApiKey() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiKeyEndpoints.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.apiKeys });
      toast.success("API Key revoked");
    },
    onError: (err: { message?: string }) => {
      toast.error(err?.message || "Failed to revoke API Key");
    },
  });
}

// ---- Webhooks ----

export function useWebhooks() {
  return useQuery({
    queryKey: queryKeys.webhooks,
    queryFn: () => webhookEndpoints.list(),
    ...defaultOptions,
  });
}

export function useCreateWebhook() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateWebhookPayload) => webhookEndpoints.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.webhooks });
      toast.success("Webhook created — save the secret now");
    },
    onError: (err: { message?: string }) => {
      toast.error(err?.message || "Failed to create webhook");
    },
  });
}

export function useUpdateWebhook(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateWebhookPayload) => webhookEndpoints.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.webhooks });
      toast.success("Webhook updated");
    },
    onError: (err: { message?: string }) => {
      toast.error(err?.message || "Failed to update webhook");
    },
  });
}

export function useDeleteWebhook() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => webhookEndpoints.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.webhooks });
      toast.success("Webhook deleted");
    },
    onError: (err: { message?: string }) => {
      toast.error(err?.message || "Failed to delete webhook");
    },
  });
}

// ---- Wallets ----

export function useWallets() {
  return useQuery({
    queryKey: queryKeys.wallets,
    queryFn: () => walletEndpoints.list(),
    ...defaultOptions,
  });
}

// ---- Transactions ----

export function useTransactions(filters?: DataTableFilters) {
  return useQuery({
    queryKey: queryKeys.transactions(filters),
    queryFn: () => transactionEndpoints.list(filters),
    ...defaultOptions,
  });
}

export function useTransactionStats() {
  return useQuery({
    queryKey: queryKeys.transactionStats,
    queryFn: () => transactionEndpoints.stats(),
    ...defaultOptions,
  });
}

// ---- Analytics ----

export function useAnalyticsOverview() {
  return useQuery({
    queryKey: queryKeys.analyticsOverview,
    queryFn: () => analyticsEndpoints.overview(),
    ...defaultOptions,
  });
}

// ---- Risk ----

export function useRiskProfile() {
  return useQuery({
    queryKey: queryKeys.riskProfile,
    queryFn: () => riskEndpoints.profile(),
    ...defaultOptions,
  });
}

// ---- Treasury ----

export function useTreasuryOverview() {
  return useQuery({
    queryKey: queryKeys.treasuryOverview,
    queryFn: () => treasuryEndpoints.overview(),
    ...defaultOptions,
  });
}

// ---- Customers ----

export function useCustomers(filters?: DataTableFilters) {
  return useQuery({
    queryKey: queryKeys.customers(filters),
    queryFn: () => customerEndpoints.list(filters),
    ...defaultOptions,
  });
}

// ---- Products ----

export function useProducts() {
  return useQuery({
    queryKey: queryKeys.products,
    queryFn: () => productEndpoints.list(),
    ...defaultOptions,
  });
}

// ---- Payment Links ----

export function usePaymentLinks() {
  return useQuery({
    queryKey: queryKeys.paymentLinks,
    queryFn: () => paymentLinkEndpoints.list(),
    ...defaultOptions,
  });
}

// ---- Invoices ----

export function useInvoices() {
  return useQuery({
    queryKey: queryKeys.invoices,
    queryFn: () => invoiceEndpoints.list(),
    ...defaultOptions,
  });
}

// ---- Subscriptions ----

export function useSubscriptions() {
  return useQuery({
    queryKey: queryKeys.subscriptions,
    queryFn: () => subscriptionEndpoints.list(),
    ...defaultOptions,
  });
}

// ---- Settlements ----

export function useSettlements(filters?: DataTableFilters) {
  return useQuery({
    queryKey: queryKeys.settlements(filters),
    queryFn: () => settlementEndpoints.list(filters),
    ...defaultOptions,
  });
}

// ---- Merchant Payout Options ----

export function useMerchantPayoutOptions() {
  return useQuery({
    queryKey: queryKeys.merchantPayoutOptions,
    queryFn: () => merchantPayoutEndpoints.options(),
    ...defaultOptions,
    retry: 0,
  });
}

// ---- Validate Merchant Payout ----

export function useValidateMerchantPayout() {
  return useMutation({
    mutationFn: (payload: CreateMerchantPayoutPayload) =>
      merchantPayoutEndpoints.validate(payload),
  });
}

// ---- Create Merchant Payout ----

export function useCreateMerchantPayout() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ payload, idempotencyKey }: { payload: CreateMerchantPayoutPayload; idempotencyKey: string }) =>
      merchantPayoutEndpoints.create(payload, idempotencyKey),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.wallets });
      qc.invalidateQueries({ queryKey: queryKeys.merchantPayouts() });
      qc.invalidateQueries({ queryKey: queryKeys.platformBootstrap });
      qc.invalidateQueries({ queryKey: queryKeys.treasuryOverview });
    },
  });
}

// ---- Merchant Payouts List ----

export function useMerchantPayouts(filters?: { status?: string; limit?: number; offset?: number }) {
  return useQuery({
    queryKey: queryKeys.merchantPayouts(filters),
    queryFn: () => merchantPayoutEndpoints.list(filters),
    ...defaultOptions,
  });
}

// ---- Merchant Payout Detail ----

export function useMerchantPayout(id: string) {
  return useQuery({
    queryKey: queryKeys.merchantPayout(id),
    queryFn: () => merchantPayoutEndpoints.get(id),
    ...defaultOptions,
    enabled: !!id,
  });
}

// ---- Cancel Merchant Payout ----

export function useCancelMerchantPayout() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      merchantPayoutEndpoints.cancel(id, reason),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.wallets });
      qc.invalidateQueries({ queryKey: queryKeys.merchantPayouts() });
      qc.invalidateQueries({ queryKey: queryKeys.treasuryOverview });
      toast.success("Payout cancelled");
    },
    onError: (err: { message?: string; code?: string }) => {
      toast.error(err?.message || err?.code || "Failed to cancel payout");
    },
  });
}

// ---- Admin Capability (Hook) ----

export function useAdminCapability() {
  const store = useAdminStore();

  return {
    isPlatformAdmin: store.isPlatformAdmin,
    adminCapabilityStatus: store.adminCapabilityStatus,
    checkAdminCapability: store.checkAdminCapability,
  };
}

// ---- Admin Merchant Payouts ----

export function useAdminMerchantPayouts(filters?: { status?: string; merchantId?: string; method?: string; limit?: number; offset?: number }) {
  return useQuery({
    queryKey: queryKeys.adminPayouts(filters),
    queryFn: () => adminMerchantPayoutEndpoints.list(filters),
    ...defaultOptions,
  });
}

export function useAdminMerchantPayout(id: string) {
  return useQuery({
    queryKey: queryKeys.adminPayout(id),
    queryFn: () => adminMerchantPayoutEndpoints.get(id),
    ...defaultOptions,
    enabled: !!id,
  });
}

export function useQuoteMerchantPayoutFx() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: AdminFxQuotePayload }) =>
      adminMerchantPayoutEndpoints.quoteFx(id, payload),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: queryKeys.adminPayout(vars.id) });
      qc.invalidateQueries({ queryKey: queryKeys.adminPayouts() });
      toast.success("FX quote applied");
    },
    onError: (err: { message?: string; code?: string }) => {
      toast.error(err?.message || err?.code || "Failed to quote FX");
    },
  });
}

export function useApproveMerchantPayout() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, note }: { id: string; note?: string }) =>
      adminMerchantPayoutEndpoints.approve(id, note),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: queryKeys.adminPayout(vars.id) });
      qc.invalidateQueries({ queryKey: queryKeys.adminPayouts() });
      toast.success("Payout approved");
    },
    onError: (err: { message?: string; code?: string }) => {
      toast.error(err?.message || err?.code || "Failed to approve payout");
    },
  });
}

export function useProcessMerchantPayout() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: AdminProcessingPayload }) =>
      adminMerchantPayoutEndpoints.processing(id, payload),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: queryKeys.adminPayout(vars.id) });
      qc.invalidateQueries({ queryKey: queryKeys.adminPayouts() });
      toast.success("Payout marked as processing");
    },
    onError: (err: { message?: string; code?: string }) => {
      toast.error(err?.message || err?.code || "Failed to process payout");
    },
  });
}

export function useMarkMerchantPayoutPaid() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: AdminPaidPayload }) =>
      adminMerchantPayoutEndpoints.paid(id, payload),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: queryKeys.adminPayout(vars.id) });
      qc.invalidateQueries({ queryKey: queryKeys.adminPayouts() });
      qc.invalidateQueries({ queryKey: queryKeys.wallets });
      qc.invalidateQueries({ queryKey: queryKeys.treasuryOverview });
      toast.success("Payout marked as paid");
    },
    onError: (err: { message?: string; code?: string }) => {
      toast.error(err?.message || err?.code || "Failed to mark payout as paid");
    },
  });
}

export function useRejectMerchantPayout() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: AdminRejectPayload }) =>
      adminMerchantPayoutEndpoints.reject(id, payload),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: queryKeys.adminPayout(vars.id) });
      qc.invalidateQueries({ queryKey: queryKeys.adminPayouts() });
      qc.invalidateQueries({ queryKey: queryKeys.wallets });
      qc.invalidateQueries({ queryKey: queryKeys.treasuryOverview });
      toast.success("Payout rejected");
    },
    onError: (err: { message?: string; code?: string }) => {
      toast.error(err?.message || err?.code || "Failed to reject payout");
    },
  });
}

// ---- Admin Settlements ----

export function useAdminSettlements(filters?: DataTableFilters) {
  return useQuery({
    queryKey: queryKeys.adminSettlements(filters),
    queryFn: () => adminSettlementEndpoints.list(filters),
    ...defaultOptions,
  });
}

// ---- Admin Merchants ----

export function useAdminMerchants() {
  return useQuery({
    queryKey: queryKeys.adminMerchants,
    queryFn: () => adminMerchantEndpoints.list(),
    ...defaultOptions,
  });
}

// ---- Admin KYC ----

export function useAdminKyc() {
  return useQuery({
    queryKey: queryKeys.adminKyc,
    queryFn: () => adminKycEndpoints.queue(),
    ...defaultOptions,
  });
}

// ---- Admin System ----

export function useAdminHealth() {
  return useQuery({
    queryKey: queryKeys.adminHealth,
    queryFn: () => adminSystemEndpoints.health(),
    ...defaultOptions,
  });
}

export function useAdminRevenue() {
  return useQuery({
    queryKey: queryKeys.adminRevenue,
    queryFn: () => adminSystemEndpoints.revenue(),
    ...defaultOptions,
  });
}

// ---- Platform Capabilities ----

export function usePlatformCapabilities() {
  return useQuery({
    queryKey: queryKeys.platformCapabilities,
    queryFn: () => fetchPlatformCapabilities(),
    ...defaultOptions,
    staleTime: 5 * 60 * 1000, // 5 minutes — capabilities change rarely
    retry: 1,
    enabled: true,
  });
}

// ---- Transaction Detail ----

export function useTransactionDetail(id: string) {
  return useQuery({
    queryKey: queryKeys.transactionDetail(id),
    queryFn: () => transactionDetailEndpoints.get(id),
    ...defaultOptions,
    enabled: !!id,
  });
}

// ---- Wallet Movements ----

export function useWalletMovements(filters?: DataTableFilters) {
  return useQuery({
    queryKey: queryKeys.walletMovements(filters),
    queryFn: () => walletMovementEndpoints.list(filters),
    ...defaultOptions,
  });
}

// ---- KYC Status ----

export function useKycStatus() {
  return useQuery({
    queryKey: queryKeys.kycStatus,
    queryFn: () => kycEndpoints.status(),
    ...defaultOptions,
  });
}

// ---- Security Challenges ----

export function useSecurityPurposes() {
  return useQuery({
    queryKey: queryKeys.securityPurposes,
    queryFn: () => securityEndpoints.purposes(),
    ...defaultOptions,
    staleTime: 5 * 60 * 1000,
  });
}

export function useRequestSecurityChallenge() {
  return useMutation({
    mutationFn: (data: SecurityChallengeRequest) =>
      securityEndpoints.requestChallenge(data),
  });
}

export function useVerifySecurityChallenge() {
  return useMutation({
    mutationFn: (data: SecurityChallengeVerifyRequest) =>
      securityEndpoints.verifyChallenge(data),
  });
}

export function useCompleteEmailVerification() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (actionToken: string) =>
      securityEndpoints.completeEmailVerification(actionToken),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.authMe });
      qc.invalidateQueries({ queryKey: queryKeys.platformBootstrap });
      qc.invalidateQueries({ queryKey: queryKeys.platformCapabilities });
      toast.success("Email verified successfully");
    },
    onError: (err: { message?: string; code?: string; status?: number }) => {
      if (err.status === 429 || err.code === "RATE_LIMITED") {
        toast.error("Rate limited");
      } else {
        toast.error(err?.message || "Failed to verify email");
      }
    },
  });
}

// ---- Developer API Keys v2 ----

export function useDeveloperApiKeysV2() {
  const auth = useAuth();
  return useQuery({
    queryKey: queryKeys.developerApiKeysV2,
    queryFn: () => developerApiKeysV2Endpoints.list(),
    ...defaultOptions,
    enabled: auth.authenticated,
  });
}

export function useCreateDeveloperApiKeyV2() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ payload, actionToken }: { payload: DeveloperApiKeyCreatePayload; actionToken?: string }) =>
      developerApiKeysV2Endpoints.create(payload, actionToken),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.developerApiKeysV2 });
    },
    onError: (err: { message?: string; code?: string; status?: number }) => {
      if (err.status === 429 || err.code === "RATE_LIMITED") {
        toast.error("Rate limited");
      } else if (err.status === 409 || err.code === "CONFLICT") {
        toast.error("Conflict");
      } else {
        toast.error(err?.message || "Failed to create API Key");
      }
    },
  });
}

export function useRotateDeveloperApiKeyV2() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, actionToken }: { id: string; actionToken: string }) =>
      developerApiKeysV2Endpoints.rotate(id, actionToken),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.developerApiKeysV2 });
    },
    onError: (err: { message?: string; code?: string; status?: number }) => {
      if (err.status === 429 || err.code === "RATE_LIMITED") {
        toast.error("Rate limited");
      } else {
        toast.error(err?.message || "Failed to rotate API Key");
      }
    },
  });
}

export function useRevokeDeveloperApiKeyV2() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      developerApiKeysV2Endpoints.revoke(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.developerApiKeysV2 });
      toast.success("API Key revoked");
    },
    onError: (err: { message?: string }) => {
      toast.error(err?.message || "Failed to revoke API Key");
    },
  });
}

// ---- Merchant Webhooks v2 ----

export function useMerchantWebhooks() {
  return useQuery({
    queryKey: queryKeys.merchantWebhooks,
    queryFn: () => merchantWebhookEndpoints.list(),
    ...defaultOptions,
  });
}

export function useCreateMerchantWebhook() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: MerchantWebhookCreatePayload) =>
      merchantWebhookEndpoints.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.merchantWebhooks });
      toast.success("Webhook created");
    },
    onError: (err: { message?: string; code?: string; status?: number }) => {
      if (err.status === 429 || err.code === "RATE_LIMITED") {
        toast.error("Rate limited");
      } else if (err.status === 409 || err.code === "CONFLICT") {
        toast.error("Conflict");
      } else {
        toast.error(err?.message || "Failed to create webhook");
      }
    },
  });
}

export function useUpdateMerchantWebhook(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: MerchantWebhookUpdatePayload) =>
      merchantWebhookEndpoints.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.merchantWebhooks });
      toast.success("Webhook updated");
    },
    onError: (err: { message?: string }) => {
      toast.error(err?.message || "Failed to update webhook");
    },
  });
}

export function useDeleteMerchantWebhook() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      merchantWebhookEndpoints.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.merchantWebhooks });
      toast.success("Webhook deleted");
    },
    onError: (err: { message?: string }) => {
      toast.error(err?.message || "Failed to delete webhook");
    },
  });
}

export function useRotateMerchantWebhookSecret() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, actionToken }: { id: string; actionToken: string }) =>
      merchantWebhookEndpoints.rotateSecret(id, actionToken),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.merchantWebhooks });
    },
    onError: (err: { message?: string; code?: string; status?: number }) => {
      if (err.status === 429 || err.code === "RATE_LIMITED") {
        toast.error("Rate limited");
      } else {
        toast.error(err?.message || "Failed to rotate webhook secret");
      }
    },
  });
}

// ---- Provider Webhooks ----

export function useProviderWebhooks() {
  return useQuery({
    queryKey: queryKeys.providerWebhooks,
    queryFn: () => providerWebhookEndpoints.list(),
    ...defaultOptions,
  });
}

// ---- Banking ----

export function useBankingCapabilities() {
  const { data: caps } = usePlatformCapabilities();
  return useQuery({
    queryKey: queryKeys.bankingCapabilities,
    queryFn: () => bankingEndpoints.capabilities(),
    ...defaultOptions,
    enabled: caps?.capabilities.banking === true,
    staleTime: 5 * 60 * 1000,
  });
}

export function useBankingAccounts() {
  return useQuery({
    queryKey: queryKeys.bankingAccounts,
    queryFn: () => bankingEndpoints.accounts(),
    ...defaultOptions,
  });
}

export function useBankingAccount(id: string) {
  return useQuery({
    queryKey: queryKeys.bankingAccount(id),
    queryFn: () => bankingEndpoints.account(id),
    ...defaultOptions,
    enabled: !!id,
  });
}

export function useBankingAccountTransactions(id: string, filters?: DataTableFilters) {
  return useQuery({
    queryKey: queryKeys.bankingAccountTransactions(id, filters),
    queryFn: () => bankingEndpoints.accountTransactions(id, filters),
    ...defaultOptions,
    enabled: !!id,
  });
}

export function useBankingBeneficiaries() {
  return useQuery({
    queryKey: queryKeys.bankingBeneficiaries,
    queryFn: () => bankingEndpoints.beneficiaries(),
    ...defaultOptions,
  });
}

export function useCreateBankingBeneficiary() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: BankingBeneficiaryCreatePayload) =>
      bankingEndpoints.createBeneficiary(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.bankingBeneficiaries });
      toast.success("Beneficiary created");
    },
    onError: (err: { message?: string; code?: string; status?: number }) => {
      if (err.status === 429 || err.code === "RATE_LIMITED") {
        toast.error("Rate limited");
      } else if (err.status === 409 || err.code === "CONFLICT") {
        toast.error("Conflict");
      } else {
        toast.error(err?.message || "Failed to create beneficiary");
      }
    },
  });
}

export function useBankingTransfers() {
  return useQuery({
    queryKey: queryKeys.bankingTransfers,
    queryFn: () => bankingEndpoints.transfers(),
    ...defaultOptions,
  });
}

export function useBankingTransfer(id: string) {
  return useQuery({
    queryKey: queryKeys.bankingTransfer(id),
    queryFn: () => bankingEndpoints.transfer(id),
    ...defaultOptions,
    enabled: !!id,
  });
}

export function useCreateBankingTransfer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ payload, idempotencyKey }: { payload: BankingTransferCreatePayload; idempotencyKey: string }) =>
      bankingEndpoints.createTransfer(payload, idempotencyKey),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.bankingTransfers });
      qc.invalidateQueries({ queryKey: queryKeys.bankingAccounts });
    },
    onError: (err: { message?: string; code?: string; status?: number }) => {
      if (err.status === 429 || err.code === "RATE_LIMITED") {
        toast.error("Rate limited");
      } else if (err.status === 409 || err.code === "CONFLICT") {
        toast.error("Possible duplicate transfer");
      } else {
        toast.error(err?.message || "Failed to create transfer");
      }
    },
  });
}

export function useConfirmBankingTransfer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, actionToken }: { id: string; actionToken: string }) =>
      bankingEndpoints.confirmTransfer(id, actionToken),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: queryKeys.bankingTransfers });
      qc.invalidateQueries({ queryKey: queryKeys.bankingTransfer(vars.id) });
      qc.invalidateQueries({ queryKey: queryKeys.bankingAccounts });
    },
    onError: (err: { message?: string; code?: string; status?: number }) => {
      if (err.status === 429 || err.code === "RATE_LIMITED") {
        toast.error("Rate limited");
      } else {
        toast.error(err?.message || "Failed to confirm transfer");
      }
    },
  });
}

export function useCancelBankingTransfer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id }: { id: string }) =>
      bankingEndpoints.cancelTransfer(id),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: queryKeys.bankingTransfers });
      qc.invalidateQueries({ queryKey: queryKeys.bankingTransfer(vars.id) });
      qc.invalidateQueries({ queryKey: queryKeys.bankingAccounts });
      toast.success("Transfer cancelled");
    },
    onError: (err: { message?: string }) => {
      toast.error(err?.message || "Failed to cancel transfer");
    },
  });
}

export function useCreateBankingFxQuote() {
  return useMutation({
    mutationFn: (data: BankingFxQuotePayload) =>
      bankingEndpoints.createFxQuote(data),
  });
}

export function useBankingStatements() {
  return useQuery({
    queryKey: queryKeys.bankingStatements,
    queryFn: () => bankingEndpoints.statements(),
    ...defaultOptions,
  });
}
