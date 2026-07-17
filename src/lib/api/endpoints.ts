/**
 * XPay.Expert — API Endpoint Functions
 * 
 * All endpoints use the real backend.
 * Public endpoints use publicApi (no JWT).
 * Private endpoints use privateApi (with JWT).
 */
import {
  publicRequestData,
  publicRequest,
} from "./public-client";
import {
  privateRequestData,
  privateRequest,
} from "./private-client";
import type {
  User,
  PlatformBootstrap,
  MerchantProfile,
  Store,
  CreateStorePayload,
  UpdateStorePayload,
  ApiKey,
  CreateApiKeyPayload,
  CreateApiKeyResponse,
  Webhook,
  CreateWebhookPayload,
  UpdateWebhookPayload,
  CreateWebhookResponse,
  WalletsResponse,
  Paginated,
  Transaction,
  DataTableFilters,
  AnalyticsOverview,
  RiskProfile,
  TreasuryOverview,
  Customer,
  Product,
  PaymentLink,
  Invoice,
  Subscription,
  AuthEnvelope,
} from "@/types";

// ---- Auth (Public) ----

export const authEndpoints = {
  login: (email: string, password: string) =>
    publicRequestData<{ token: string; merchant: { id: string; name: string; email: string; role?: string; company?: string; merchantId?: string; tier?: string } }>({
      method: "POST",
      url: "auth/login",
      data: { email, password },
    }),

  register: (data: { name: string; email: string; password: string; companyName: string }) =>
    publicRequestData<{ token: string; merchant: { id: string; name: string; email: string; role?: string; company?: string; merchantId?: string; tier?: string } }>({
      method: "POST",
      url: "auth/register",
      data,
    }),

  me: () =>
    privateRequestData<User>({
      method: "GET",
      url: "auth/me",
    }),

  logout: () =>
    privateRequest<void>({
      method: "POST",
      url: "auth/logout",
    }),
};

// ---- Platform Bootstrap (Private) ----

export const platformEndpoints = {
  bootstrap: () =>
    privateRequestData<PlatformBootstrap>({
      method: "GET",
      url: "platform/bootstrap",
    }),
};

// ---- Merchant Profile (Private) ----

export const profileEndpoints = {
  get: () =>
    privateRequestData<MerchantProfile>({
      method: "GET",
      url: "merchant/profile",
    }),

  update: (data: { name?: string; company?: string }) =>
    privateRequestData<MerchantProfile>({
      method: "PATCH",
      url: "merchant/profile",
      data,
    }),
};

// ---- Stores (Private) ----

export const storeEndpoints = {
  list: () =>
    privateRequestData<Store[]>({
      method: "GET",
      url: "merchant/stores",
    }),

  create: (data: CreateStorePayload) =>
    privateRequestData<Store>({
      method: "POST",
      url: "merchant/stores",
      data,
    }),

  get: (id: string) =>
    privateRequestData<Store>({
      method: "GET",
      url: `merchant/stores/${id}`,
    }),

  update: (id: string, data: UpdateStorePayload) =>
    privateRequestData<Store>({
      method: "PATCH",
      url: `merchant/stores/${id}`,
      data,
    }),
};

// ---- API Keys (Private) ----

export const apiKeyEndpoints = {
  list: () =>
    privateRequestData<ApiKey[]>({
      method: "GET",
      url: "api-keys",
    }),

  create: (data: CreateApiKeyPayload) =>
    privateRequestData<CreateApiKeyResponse>({
      method: "POST",
      url: "api-keys",
      data,
    }),

  delete: (id: string) =>
    privateRequestData<void>({
      method: "DELETE",
      url: `api-keys/${id}`,
    }),
};

// ---- Webhooks (Private) ----

export const webhookEndpoints = {
  list: () =>
    privateRequestData<Webhook[]>({
      method: "GET",
      url: "webhooks",
    }),

  create: (data: CreateWebhookPayload) =>
    privateRequestData<CreateWebhookResponse>({
      method: "POST",
      url: "webhooks",
      data,
    }),

  update: (id: string, data: UpdateWebhookPayload) =>
    privateRequestData<Webhook>({
      method: "PATCH",
      url: `webhooks/${id}`,
      data,
    }),

  delete: (id: string) =>
    privateRequestData<void>({
      method: "DELETE",
      url: `webhooks/${id}`,
    }),
};

// ---- Wallets (Private - Read Only) ----

export const walletEndpoints = {
  list: () =>
    privateRequestData<WalletsResponse>({
      method: "GET",
      url: "wallets",
    }),
};

// ---- Transactions (Private) ----

export const transactionEndpoints = {
  list: (filters?: DataTableFilters) =>
    privateRequestData<Paginated<Transaction>>({
      method: "GET",
      url: "transactions",
      params: filters,
    }),

  stats: () =>
    privateRequestData<{
      total: number;
      succeeded: number;
      pending: number;
      failed: number;
      volume: number;
    }>({
      method: "GET",
      url: "transactions/stats",
    }),
};

// ---- Analytics (Private) ----

export const analyticsEndpoints = {
  overview: () =>
    privateRequestData<AnalyticsOverview>({
      method: "GET",
      url: "analytics/overview",
    }),
};

// ---- Risk (Private) ----

export const riskEndpoints = {
  profile: () =>
    privateRequestData<RiskProfile>({
      method: "GET",
      url: "risk/profile",
    }),
};

// ---- Treasury (Private) ----

export const treasuryEndpoints = {
  overview: () =>
    privateRequestData<TreasuryOverview>({
      method: "GET",
      url: "treasury/overview",
    }),
};

// ---- Customers (Private) ----

export const customerEndpoints = {
  list: (filters?: DataTableFilters) =>
    privateRequestData<Paginated<Customer>>({
      method: "GET",
      url: "customers",
      params: filters,
    }),
};

// ---- Products (Private) ----

export const productEndpoints = {
  list: () =>
    privateRequestData<Product[]>({
      method: "GET",
      url: "products",
    }),

  create: (data: Partial<Product>) =>
    privateRequestData<Product>({
      method: "POST",
      url: "products",
      data,
    }),

  delete: (id: string) =>
    privateRequestData<void>({
      method: "DELETE",
      url: `products/${id}`,
    }),
};

// ---- Payment Links (Private) ----

export const paymentLinkEndpoints = {
  list: () =>
    privateRequestData<PaymentLink[]>({
      method: "GET",
      url: "payment-links",
    }),
};

// ---- Invoices (Private) ----

export const invoiceEndpoints = {
  list: () =>
    privateRequestData<Invoice[]>({
      method: "GET",
      url: "invoices",
    }),
};

// ---- Subscriptions (Private) ----

export const subscriptionEndpoints = {
  list: () =>
    privateRequestData<Subscription[]>({
      method: "GET",
      url: "subscriptions",
    }),
};