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
  privateRequestWithSecurity,
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
  Settlement,
  SettlementListResponse,
  SettlementOverview,
  MerchantPayout,
  MerchantPayoutOptions,
  MerchantPayoutValidation,
  CreateMerchantPayoutPayload,
  MerchantPayoutListResponse,
  AdminFxQuotePayload,
  AdminProcessingPayload,
  AdminPaidPayload,
  AdminRejectPayload,
  WalletMovement,
} from "@/types";

import type {
  SecurityPurposeInfo,
  SecurityChallengeRequest,
  SecurityChallengeResponse,
  SecurityChallengeVerifyRequest,
  SecurityChallengeVerifyResponse,
} from "@/types/security";
import type {
  DeveloperApiKey,
  DeveloperApiKeyCreatePayload,
  DeveloperApiKeyCreateResponse,
  MerchantWebhook,
  MerchantWebhookCreatePayload,
  MerchantWebhookCreateResponse,
  MerchantWebhookUpdatePayload,
  ProviderWebhook,
} from "@/types/developer-v2";
import type {
  BankingCapabilities,
  BankingAccount,
  BankingAccountTransaction,
  BankingBeneficiary,
  BankingBeneficiaryCreatePayload,
  BankingTransfer,
  BankingTransferCreatePayload,
  BankingFxQuote,
  BankingFxQuotePayload,
  BankingStatement,
} from "@/types/banking";

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

// ---- Wallets (Private) ----

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

// ---- Settlements (Private) ----

export const settlementEndpoints = {
  list: (filters?: DataTableFilters) =>
    privateRequestData<unknown>({
      method: "GET",
      url: "settlements/batches",
      params: filters,
    }),
};

// ---- Settlement Overview (Private) ----

export const settlementOverviewEndpoints = {
  get: () =>
    privateRequestData<unknown>({
      method: "GET",
      url: "settlements/overview",
    }),
};

// ---- Merchant Payouts (Private) ----

export const merchantPayoutEndpoints = {
  options: () =>
    privateRequestData<MerchantPayoutOptions>({
      method: "GET",
      url: "merchant/payouts/options",
    }),

  validate: (payload: CreateMerchantPayoutPayload) =>
    privateRequestData<MerchantPayoutValidation>({
      method: "POST",
      url: "merchant/payouts/validate",
      data: payload,
    }),

  create: (payload: CreateMerchantPayoutPayload, idempotencyKey: string) =>
    privateRequestData<MerchantPayout>({
      method: "POST",
      url: "merchant/payouts",
      data: payload,
      headers: {
        "Idempotency-Key": idempotencyKey,
      },
    }),

  list: (filters?: { status?: string; limit?: number; offset?: number }) =>
    privateRequestData<MerchantPayoutListResponse>({
      method: "GET",
      url: "merchant/payouts",
      params: filters,
    }),

  get: (id: string) =>
    privateRequestData<MerchantPayout>({
      method: "GET",
      url: `merchant/payouts/${id}`,
    }),

  cancel: (id: string, reason?: string) =>
    privateRequestData<MerchantPayout>({
      method: "POST",
      url: `merchant/payouts/${id}/cancel`,
      data: reason ? { reason } : undefined,
    }),
};

// ---- Admin Merchant Payouts (Private - Admin) ----

export const adminMerchantPayoutEndpoints = {
  list: (filters?: { status?: string; merchantId?: string; method?: string; limit?: number; offset?: number }) =>
    privateRequestData<MerchantPayoutListResponse>({
      method: "GET",
      url: "admin/merchant-payouts",
      params: filters,
    }),

  get: (id: string) =>
    privateRequestData<MerchantPayout>({
      method: "GET",
      url: `admin/merchant-payouts/${id}`,
    }),

  quoteFx: (id: string, payload: AdminFxQuotePayload) =>
    privateRequestData<MerchantPayout>({
      method: "POST",
      url: `admin/merchant-payouts/${id}/fx-quote`,
      data: payload,
    }),

  approve: (id: string, note?: string) =>
    privateRequestData<MerchantPayout>({
      method: "POST",
      url: `admin/merchant-payouts/${id}/approve`,
      data: note ? { note } : undefined,
    }),

  processing: (id: string, payload: AdminProcessingPayload) =>
    privateRequestData<MerchantPayout>({
      method: "POST",
      url: `admin/merchant-payouts/${id}/processing`,
      data: payload,
    }),

  paid: (id: string, payload: AdminPaidPayload) =>
    privateRequestData<MerchantPayout>({
      method: "POST",
      url: `admin/merchant-payouts/${id}/paid`,
      data: payload,
    }),

  reject: (id: string, payload: AdminRejectPayload) =>
    privateRequestData<MerchantPayout>({
      method: "POST",
      url: `admin/merchant-payouts/${id}/reject`,
      data: payload,
    }),
};

// ---- Admin Settlements (Private - Admin) ----

export const adminSettlementEndpoints = {
  list: (filters?: DataTableFilters) =>
    privateRequestData<SettlementListResponse>({
      method: "GET",
      url: "admin/settlements",
      params: filters,
    }),
};

// ---- Admin Merchants (Private - Admin) ----

export const adminMerchantEndpoints = {
  list: () =>
    privateRequestData<Paginated<import("@/types").AdminMerchant>>({
      method: "GET",
      url: "admin/merchants",
    }),
};

// ---- Admin KYC (Private - Admin) ----

export const adminKycEndpoints = {
  queue: () =>
    privateRequestData<import("@/types").KycReview[]>({
      method: "GET",
      url: "admin/kyc",
    }),
};

// ---- Admin System (Private - Admin) ----

export const adminSystemEndpoints = {
  health: () =>
    privateRequestData<import("@/types").SystemHealth>({
      method: "GET",
      url: "admin/health",
    }),

  revenue: () =>
    privateRequestData<{ total: number; series: { date: string; value: number }[] }>({
      method: "GET",
      url: "admin/revenue",
    }),
};

// ---- Transaction Detail (Private) ----

export const transactionDetailEndpoints = {
  get: (id: string) =>
    privateRequestData<Transaction>({
      method: "GET",
      url: `transactions/${id}`,
    }),
};

// ---- Wallet Movements (Private) ----

export const walletMovementEndpoints = {
  list: (filters?: DataTableFilters) =>
    privateRequestData<Paginated<WalletMovement>>({
      method: "GET",
      url: "wallets/movements",
      params: filters,
    }),
};

// ---- KYC Status (Private) ----

export const kycEndpoints = {
  status: () =>
    privateRequestData<{ status: string; level: string; requiredDocuments: string[]; submittedAt?: string; verifiedAt?: string }>({
      method: "GET",
      url: "risk/kyc/status",
    }),
};
// ---- Security Challenges (Private) ----

export const securityEndpoints = {
  purposes: () =>
    privateRequestData<SecurityPurposeInfo[]>({
      method: "GET",
      url: "security/purposes",
    }),
  requestChallenge: (data: SecurityChallengeRequest) =>
    privateRequestData<SecurityChallengeResponse>({
      method: "POST",
      url: "security/challenges/request",
      data,
    }),
  verifyChallenge: (data: SecurityChallengeVerifyRequest) =>
    privateRequestData<SecurityChallengeVerifyResponse>({
      method: "POST",
      url: "security/challenges/verify",
      data,
    }),
  completeEmailVerification: (actionToken: string) =>
    privateRequestWithSecurity<void>(
      { method: "POST", url: "security/email/complete" },
      actionToken,
    ),
};

// ---- Developer API Keys v2 (Private) ----

export const developerApiKeysV2Endpoints = {
  list: () =>
    privateRequestData<DeveloperApiKey[]>({
      method: "GET",
      url: "developer/api-keys",
    }),
  create: (data: DeveloperApiKeyCreatePayload, actionToken?: string) =>
    privateRequestWithSecurity<DeveloperApiKeyCreateResponse>(
      { method: "POST", url: "developer/api-keys", data },
      actionToken,
    ),
  rotate: (id: string, actionToken: string) =>
    privateRequestWithSecurity<DeveloperApiKeyCreateResponse>(
      { method: "POST", url: `developer/api-keys/${id}/rotate` },
      actionToken,
    ),
  revoke: (id: string) =>
    privateRequestData<void>({
      method: "POST",
      url: `developer/api-keys/${id}/revoke`,
    }),
};

// ---- Merchant Webhooks v2 (Private) ----

export const merchantWebhookEndpoints = {
  list: () =>
    privateRequestData<MerchantWebhook[]>({
      method: "GET",
      url: "merchant/webhooks",
    }),
  create: (data: MerchantWebhookCreatePayload) =>
    privateRequestData<MerchantWebhookCreateResponse>({
      method: "POST",
      url: "merchant/webhooks",
      data,
    }),
  update: (id: string, data: MerchantWebhookUpdatePayload) =>
    privateRequestData<MerchantWebhook>({
      method: "PATCH",
      url: `merchant/webhooks/${id}`,
      data,
    }),
  delete: (id: string) =>
    privateRequestData<void>({
      method: "DELETE",
      url: `merchant/webhooks/${id}`,
    }),
  rotateSecret: (id: string, actionToken: string) =>
    privateRequestWithSecurity<{ secret: string }>(
      { method: "POST", url: `merchant/webhooks/${id}/rotate-secret` },
      actionToken,
    ),
};

// ---- Provider Webhooks (Private) ----

export const providerWebhookEndpoints = {
  list: () =>
    privateRequestData<ProviderWebhook[]>({
      method: "GET",
      url: "provider/webhooks",
    }),
};

// ---- Banking (Private) ----

export const bankingEndpoints = {
  capabilities: () =>
    privateRequestData<BankingCapabilities>({
      method: "GET",
      url: "banking/capabilities",
    }),
  accounts: () =>
    privateRequestData<BankingAccount[]>({
      method: "GET",
      url: "banking/accounts",
    }),
  account: (id: string) =>
    privateRequestData<BankingAccount>({
      method: "GET",
      url: `banking/accounts/${id}`,
    }),
  accountTransactions: (id: string, filters?: DataTableFilters) =>
    privateRequestData<Paginated<BankingAccountTransaction>>({
      method: "GET",
      url: `banking/accounts/${id}/transactions`,
      params: filters,
    }),
  beneficiaries: () =>
    privateRequestData<BankingBeneficiary[]>({
      method: "GET",
      url: "banking/beneficiaries",
    }),
  createBeneficiary: (data: BankingBeneficiaryCreatePayload) =>
    privateRequestData<BankingBeneficiary>({
      method: "POST",
      url: "banking/beneficiaries",
      data,
    }),
  transfers: () =>
    privateRequestData<BankingTransfer[]>({
      method: "GET",
      url: "banking/transfers",
    }),
  transfer: (id: string) =>
    privateRequestData<BankingTransfer>({
      method: "GET",
      url: `banking/transfers/${id}`,
    }),
  createTransfer: (data: BankingTransferCreatePayload, idempotencyKey: string) =>
    privateRequestData<BankingTransfer>({
      method: "POST",
      url: "banking/transfers",
      data,
      headers: { "Idempotency-Key": idempotencyKey },
    }),
  confirmTransfer: (id: string, actionToken: string) =>
    privateRequestWithSecurity<BankingTransfer>(
      { method: "POST", url: `banking/transfers/${id}/confirm` },
      actionToken,
    ),
  cancelTransfer: (id: string) =>
    privateRequestData<BankingTransfer>({
      method: "POST",
      url: `banking/transfers/${id}/cancel`,
    }),
  createFxQuote: (data: BankingFxQuotePayload) =>
    privateRequestData<BankingFxQuote>({
      method: "POST",
      url: "banking/fx-quotes",
      data,
    }),
  statements: () =>
    privateRequestData<BankingStatement[]>({
      method: "GET",
      url: "banking/statements",
    }),
};
