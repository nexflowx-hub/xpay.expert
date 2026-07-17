"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
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
} from "@/lib/api/endpoints";
import type {
  CreateStorePayload,
  UpdateStorePayload,
  CreateApiKeyPayload,
  CreateWebhookPayload,
  UpdateWebhookPayload,
  DataTableFilters,
} from "@/types";

// Query key factory
export const queryKeys = {
  // Auth
  authMe: ["auth", "me"] as const,
  // Platform
  platformBootstrap: ["platform", "bootstrap"] as const,
  // Profile
  merchantProfile: ["merchant", "profile"] as const,
  // Stores
  stores: ["stores"] as const,
  storeDetail: (id: string) => ["stores", id] as const,
  // API Keys
  apiKeys: ["api-keys"] as const,
  // Webhooks
  webhooks: ["webhooks"] as const,
  // Wallets
  wallets: ["wallets"] as const,
  // Transactions
  transactions: (filters?: DataTableFilters) => ["transactions", filters] as const,
  transactionStats: ["transactions", "stats"] as const,
  // Analytics
  analyticsOverview: ["analytics", "overview"] as const,
  // Risk
  riskProfile: ["risk", "profile"] as const,
  // Treasury
  treasuryOverview: ["treasury", "overview"] as const,
  // Customers
  customers: (filters?: DataTableFilters) => ["customers", filters] as const,
  // Products
  products: ["products"] as const,
  // Payment Links
  paymentLinks: ["payment-links"] as const,
  // Invoices
  invoices: ["invoices"] as const,
  // Subscriptions
  subscriptions: ["subscriptions"] as const,
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
    enabled: false, // Only called manually by auth store hydrate
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
    onError: (err: any) => {
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
    onError: (err: any) => {
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
    onError: (err: any) => {
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
    onError: (err: any) => {
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
    onError: (err: any) => {
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
    onError: (err: any) => {
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
    onError: (err: any) => {
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
    onError: (err: any) => {
      toast.error(err?.message || "Failed to delete webhook");
    },
  });
}

// ---- Wallets (Read Only) ----

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