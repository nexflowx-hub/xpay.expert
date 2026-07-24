// ============================================================
// XPay — Domain Types
// ============================================================

export type UserRole = "merchant" | "admin" | "guest";
export type AppView =
  | "landing"
  | "login"
  | "forgot"
  | "reset"
  | "merchant"
  | "admin";

// ---- Auth ----
export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  company?: string;
  merchantId?: string;
  tier?: string;
  twoFactorEnabled?: boolean;
}

export interface AuthSession {
  accessToken: string;
  expiresAt: number; // epoch ms
  user: User;
}

export interface LoginPayload {
  email: string;
  password: string;
  remember?: boolean;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  companyName: string;
}

/**
 * Raw envelope returned by the backend on POST auth/login.
 * API Contract v3.1 shape:
 * { success: true, data: { token: "JWT", merchant: { id, name, email } } }
 */
export interface AuthEnvelope {
  success: boolean;
  data: {
    token: string;
    merchant: {
      id: string;
      name: string;
      email: string;
    };
  };
  error?: {
    code: string;
    message: string;
  };
}

/** Shape returned by auth/login and auth/register (after envelope mapping) */
export type AuthResponse = AuthSession;

/**
 * Standard API response envelope (API Contract v3.1).
 * Success: { success: true, data: T, meta?: {} }
 * Error:   { success: false, error: { code: "ERROR_CODE", message: "..." } }
 */
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  meta?: Record<string, unknown>;
  error?: {
    code: string;
    message: string;
  };
  // Legacy field (backwards compat)
  message?: string;
}

// ---- Wallets (API Contract v3.1) ----
export type CurrencyCode = "EUR" | "USD" | "BRL" | "USDT" | "GBP" | "BTC";

export interface Wallet {
  id: string;
  currency: CurrencyCode;
  balance: number;
  available: number;
  reserved: number;
  pending: number;
  type: "fiat" | "crypto" | "card" | "settlement";
  label?: string;
  cardLast4?: string;
  changePct?: number;
  color?: string;
  ledgerDomain?: string;
}

export interface WalletSummary {
  totalBalance: number;
  totalAvailable: number;
  totalReserved: number;
  totalPending: number;
  currencies: number;
}

export interface WalletsResponse {
  wallets: Wallet[];
  summary: WalletSummary;
}

export interface WalletMovement {
  id: string;
  currency: CurrencyCode;
  amount: number;
  direction: "in" | "out";
  status: string;
  createdAt: string;
  walletId?: string;
  type?: "deposit" | "withdraw" | "swap" | "payment" | "fee" | "payout" | "settlement";
  reference?: string;
}

// ---- Transactions / Payments ----
export type TxStatus =
  | "succeeded"
  | "pending"
  | "failed"
  | "refunded"
  | "disputed"
  | "authorized";

export type PaymentMethod =
  | "visa"
  | "mastercard"
  | "amex"
  | "pix"
  | "mbway"
  | "apple_pay"
  | "google_pay"
  | "crypto"
  | "sepa"
  | "wise";

export interface Transaction {
  id: string;
  reference: string;
  customer: string;
  customerEmail: string;
  amount: number;
  currency: CurrencyCode;
  amountEur: number;
  status: TxStatus;
  method: PaymentMethod;
  country: string;
  gateway: string;
  createdAt: string;
  riskScore: number;
  fee: number;
  metadata?: Record<string, string>;
  events?: TxEvent[];
}

export interface TxEvent {
  id: string;
  type: string;
  label: string;
  createdAt: string;
  detail?: string;
}

// ---- Analytics (API Contract v3.1: GET /analytics/overview) ----
export interface AnalyticsOverview {
  wallet: {
    totalBalance: number;
    availableBalance: number;
    currencies: number;
  };
  transactions: {
    today: number;
    month: number;
    total: number;
    successRate: number;
    volumeToday: number;
    volumeMonth: number;
  };
  recentTransactions: Transaction[];
  revenue?: number;
  revenueChange?: number;
  volume?: number;
  volumeChange?: number;
  conversion?: number;
  conversionChange?: number;
  approvalRate?: number;
  approvalChange?: number;
  riskScore?: number;
  riskChange?: number;
  revenueSeries?: { date: string; value: number }[];
  volumeSeries?: { date: string; value: number }[];
  paymentMethods?: { method: PaymentMethod; share: number; volume: number }[];
  currencies?: { currency: CurrencyCode; share: number; volume: number }[];
  topCustomers?: { name: string; ltv: number; orders: number }[];
  realtime?: { id: string; label: string; amount: number; currency: CurrencyCode; ago: string }[];
}

// ---- Risk ----
export interface RiskProfile {
  score: number;
  reservePct: number;
  chargebackRate: number;
  trustStatus: "trusted" | "standard" | "elevated" | "high_risk";
  alerts: RiskAlert[];
  recommendations: string[];
  history: { date: string; score: number; chargebacks: number }[];
}

export interface RiskAlert {
  id: string;
  severity: "low" | "medium" | "high" | "critical";
  title: string;
  description: string;
  createdAt: string;
}

// ---- Customers ----
export interface Customer {
  id: string;
  name: string;
  email: string;
  country: string;
  ltv: number;
  avgOrder: number;
  orders: number;
  segment: "vip" | "regular" | "new" | "at_risk";
  firstSeen: string;
  lastSeen: string;
  status: "active" | "inactive" | "blocked";
}

// ---- Commerce ----
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: CurrencyCode;
  image?: string;
  active: boolean;
  sales: number;
  stock?: number;
  createdAt: string;
}

export interface Store {
  id: string;
  name: string;
  domain: string;
  status: "active" | "paused" | "draft";
  products: number;
  revenue: number;
  currency: CurrencyCode;
  createdAt: string;
  storeCode?: string;
}

export interface PaymentLink {
  id: string;
  name: string;
  url: string;
  amount: number;
  currency: CurrencyCode;
  status: "active" | "inactive";
  visits: number;
  conversions: number;
  createdAt: string;
}

export interface Invoice {
  id: string;
  number: string;
  customer: string;
  amount: number;
  currency: CurrencyCode;
  status: "paid" | "open" | "overdue" | "draft" | "void";
  dueDate: string;
  createdAt: string;
}

export interface Subscription {
  id: string;
  customer: string;
  plan: string;
  amount: number;
  currency: CurrencyCode;
  status: "active" | "trialing" | "past_due" | "canceled";
  interval: "month" | "year";
  currentPeriodEnd: string;
}

// ---- Developers ----
export interface ApiKey {
  id: string;
  name: string;
  prefix: string;
  lastFour: string;
  fullKey?: string;
  scopes: string[];
  createdAt: string;
  lastUsedAt?: string;
  environment: "live" | "test";
  storeId?: string;
  storeName?: string;
  storeCode?: string;
  keyPreview?: string;
}

export interface Webhook {
  id: string;
  url: string;
  events: string[];
  status: "active" | "disabled";
  secret: string;
  lastDeliveryAt?: string;
  successRate: number;
  createdAt: string;
  storeId?: string;
  storeName?: string;
  storeCode?: string;
}

// ---- Treasury ----
export interface TreasuryOverview {
  totalLiquidity: number;
  reserve: number;
  pendingPayouts: number;
  netFlow: number;
  liquidityChange: number;
  cashFlowSeries: { date: string; inflow: number; outflow: number }[];
  settlementSeries: { date: string; value: number }[];
  balances: { currency: CurrencyCode; amount: number; changePct: number }[];
}

// ---- Admin ----
export interface AdminMerchant {
  id: string;
  name: string;
  email: string;
  country: string;
  status: "active" | "frozen" | "suspended" | "pending";
  riskScore: number;
  revenue: number;
  volume: number;
  createdAt: string;
  kycStatus: "approved" | "pending" | "rejected" | "not_submitted";
}

export interface KycReview {
  id: string;
  merchantName: string;
  merchantId: string;
  country: string;
  submittedAt: string;
  documents: KycDocument[];
  status: "pending" | "approved" | "rejected";
  riskFlags: string[];
}

export interface KycDocument {
  id: string;
  name: string;
  type: "passport" | "id_card" | "selfie" | "address_proof" | "article";
  pages: number;
  sizeKb: number;
}

export interface SystemHealth {
  status: "operational" | "degraded" | "outage";
  uptime: number;
  services: { name: string; status: "operational" | "degraded" | "outage"; latencyMs: number }[];
  queues: { name: string; pending: number; processing: number; throughput: number }[];
  workers: { name: string; active: number; idle: number; region: string }[];
}

// ---- Generic API ----
export interface Paginated<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  total?: number;
  page?: number;
  pageSize?: number;
}

export interface ApiError {
  message: string;
  code?: string;
  status?: number;
  details?: Record<string, unknown>;
}

export interface DataTableFilters {
  search?: string;
  status?: string;
  country?: string;
  currency?: string;
  method?: string;
  gateway?: string;
  from?: string;
  to?: string;
  page?: number;
  limit?: number;
  pageSize?: number;
  sortBy?: string;
  sortDir?: "asc" | "desc";
  reference?: string;
}

// ---- Phase 2: Bootstrap & Capabilities ----

export interface BootstrapOnboarding {
  percentage: number;
  steps: { key: string; label: string; completed: boolean }[];
  currentStep: string;
  completed: boolean;
}

export interface BootstrapKpi {
  key: string;
  label: string;
  value: number | string;
  change?: number;
  changeLabel?: string;
  icon?: string;
}

export interface BootstrapAlert {
  id: string;
  severity: "info" | "warning" | "error" | "success";
  title: string;
  message: string;
  action?: { label: string; route: string };
  createdAt: string;
}

export interface BootstrapRecentActivity {
  id: string;
  type: string;
  title: string;
  description: string;
  timestamp: string;
  meta?: Record<string, unknown>;
}

export interface BootstrapBalance {
  currency: CurrencyCode;
  available: number;
  reserved: number;
  total: number;
}

export interface BootstrapSystemStatus {
  status: "operational" | "degraded" | "maintenance";
  message?: string;
}

export interface BootstrapModuleCard {
  key: string;
  label: string;
  description: string;
  route: string;
  icon: string;
  enabled: boolean;
  capability?: string;
  capabilityState?: CapabilityState;
  status?: "active" | "coming_soon" | "requires_verification" | "provider_required" | "requires_higher_tier" | "sandbox_only";
}

export type CapabilityState =
  | "enabled"
  | "coming_soon"
  | "requires_verification"
  | "provider_required"
  | "requires_higher_tier"
  | "sandbox_only";

export interface BootstrapCapabilities {
  [key: string]: boolean | CapabilityState;
}

export interface BootstrapQuickAction {
  key: string;
  label: string;
  icon: string;
  route: string;
  requiresCapability?: string;
}

export interface BootstrapStore {
  id: string;
  name: string;
  domain?: string;
  currency: CurrencyCode;
  status: "active" | "paused" | "draft";
  products?: number;
  revenue?: number;
  createdAt?: string;
  storeCode?: string;
}

export interface BootstrapWorkspace {
  selectedStoreId: string | null;
  stores: BootstrapStore[];
}

export interface BootstrapProduct {
  name: string;
  logo?: string;
  label?: string;
}

export interface BootstrapOrganization {
  id: string;
  name: string;
  company?: string;
  email: string;
  tier?: string;
  kycStatus?: string;
  createdAt?: string;
}

export interface BootstrapEnvironment {
  name: string;
  type: "production" | "staging" | "lab" | "sandbox";
  apiBaseUrl: string;
}

export interface PlatformBootstrap {
  product: BootstrapProduct;
  organization: BootstrapOrganization;
  environment: BootstrapEnvironment;
  onboarding: BootstrapOnboarding;
  capabilities: BootstrapCapabilities;
  moduleCards: BootstrapModuleCard[];
  kpis: BootstrapKpi[];
  alertCount: number;
  alerts: BootstrapAlert[];
  quickActions: BootstrapQuickAction[];
  recentActivity: BootstrapRecentActivity[];
  balances: BootstrapBalance[];
  systemStatus: BootstrapSystemStatus;
  workspace: BootstrapWorkspace;
  attentionCounts?: {
    payments?: number;
    disputes?: number;
    payouts?: number;
    kyc?: number;
  };
}

// ---- Phase 2: Merchant Profile ----
export interface MerchantProfile {
  id: string;
  name: string;
  email: string;
  company?: string;
  phone?: string;
  country?: string;
  avatarUrl?: string;
  tier?: string;
  kycStatus?: string;
  createdAt: string;
}

// ---- Phase 2: API Key creation ----
export interface CreateApiKeyPayload {
  storeId: string;
  name: string;
  environment: "test" | "live";
  scopes: string[];
}

export interface CreateApiKeyResponse {
  id: string;
  name: string;
  environment: string;
  scopes: string[];
  keyPreview: string;
  fullKey: string;
  storeId: string;
  createdAt: string;
}

// ---- Phase 2: Webhook ----
export interface CreateWebhookPayload {
  url: string;
  events: string[];
  storeId?: string;
  active?: boolean;
}

export interface UpdateWebhookPayload {
  url?: string;
  events?: string[];
  active?: boolean;
}

export interface CreateWebhookResponse {
  id: string;
  url: string;
  events: string[];
  status: string;
  secret: string;
  storeId?: string;
  createdAt: string;
}

// ---- Phase 2: Store ----
export interface CreateStorePayload {
  name: string;
  domain?: string;
  currency: CurrencyCode;
}

export interface UpdateStorePayload {
  name?: string;
  domain?: string;
  currency?: CurrencyCode;
  status?: "active" | "paused" | "draft";
}

// ---- Phase 2: Settlements ----
export interface Settlement {
  id: string;
  batch: string;
  merchantId: string;
  merchantName: string;
  storeId?: string;
  storeName?: string;
  provider: string;
  transactionCount: number;
  gross: number;
  currency: CurrencyCode;
  providerFee: number;
  xpayFee: number;
  merchantNet: number;
  providerAvailableDate: string;
  status: "pending_provider" | "pending_review" | "held" | "ready" | "released" | "pending" | "available" | "processing";
  createdAt: string;
  releasedAt?: string;
}

export interface SettlementListResponse {
  data: Settlement[];
  meta: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

// ============================================================
// Phase 3: Merchant Payout Types
// ============================================================

export type MerchantPayoutStatus =
  | "pending_review"
  | "fx_pending"
  | "approved"
  | "processing"
  | "paid"
  | "rejected"
  | "cancelled";

export type MerchantPayoutMethod =
  | "SEPA_INSTANT"
  | "PIX"
  | "USDT_TRC20"
  | "USDT_ERC20"
  | "MANUAL";

export type PixKeyType =
  | "CPF"
  | "CNPJ"
  | "EMAIL"
  | "PHONE"
  | "EVP";

export interface MerchantPayoutDestination {
  method: MerchantPayoutMethod;
  beneficiaryName: string;
  country?: string;
  // SEPA
  iban?: string;
  bic?: string;
  bankName?: string;
  paymentReference?: string;
  // PIX
  keyType?: PixKeyType;
  keyValue?: string;
  taxId?: string;
  // Crypto
  walletAddress?: string;
  network?: string;
  // Manual
  instructions?: string;
}

export interface MerchantPayout {
  id: string;
  ledgerDomain: string;
  ticketCode: string;
  merchantId: string;
  merchantName: string;
  merchantEmail: string;
  walletId: string;
  sourceCurrency: CurrencyCode;
  sourceAmount: number;
  payoutCurrency: CurrencyCode;
  payoutAmount: number;
  method: MerchantPayoutMethod;
  network: string;
  destination: MerchantPayoutDestination;
  beneficiaryName: string;
  beneficiaryCountry: string;
  status: MerchantPayoutStatus;
  fxRequired: boolean;
  fxStatus: MerchantPayoutFxStatus | null;
  fxRate: number | null;
  fxProvider: string | null;
  fxReference: string | null;
  reviewNote: string | null;
  rejectionReason: string | null;
  providerReference: string | null;
  externalReference: string | null;
  idempotencyKey: string;
  createdAt: string;
  updatedAt: string;
  reviewedAt?: string | null;
  approvedAt?: string | null;
  processingAt?: string | null;
  paidAt?: string | null;
  rejectedAt?: string | null;
  cancelledAt?: string | null;
}

export interface MerchantPayoutOptions {
  ledgerDomain: string;
  executionMode: string;
  fxMode: string;
  automaticExecution: boolean;
  automaticFx: boolean;
  methods: Array<{
    code: MerchantPayoutMethod;
    payoutCurrency: CurrencyCode;
    network?: string;
    pixKeyTypes?: PixKeyType[];
    destinationFields: string[];
  }>;
}

export interface MerchantPayoutValidation {
  sourceCurrency: CurrencyCode;
  sourceAmount: number;
  payoutCurrency: CurrencyCode;
  payoutAmount: number;
  fxRequired: boolean;
  fxStatus: MerchantPayoutFxStatus | null;
  initialStatus: MerchantPayoutStatus;
  availableAfterReservation: number;
  destination: MerchantPayoutDestination;
}

export interface CreateMerchantPayoutPayload {
  walletId: string;
  sourceAmount: number;
  method: MerchantPayoutMethod;
  destination: MerchantPayoutDestination;
}

export interface MerchantPayoutListResponse {
  data: MerchantPayout[];
  meta: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

export interface AdminFxQuotePayload {
  payoutAmount: number;
  fxRate: number;
  fxProvider: string;
  fxReference: string;
  note?: string;
}

export interface AdminProcessingPayload {
  providerReference: string;
  externalReference?: string;
  note?: string;
}

export interface AdminPaidPayload {
  providerReference?: string;
  externalReference?: string;
  note: string;
}

export interface AdminRejectPayload {
  reason: string;
}

// ---- Admin Capability ----
export type AdminCapabilityStatus = "loading" | "true" | "false" | "unknown";

// ============================================================
// Phase 3/4: Platform Capabilities
// ============================================================

export type MerchantPayoutFxStatus =
  | "not_required"
  | "pending_quote"
  | "quoted"
  | "accepted"
  | "rejected";

export interface PlatformCapabilities {
  contract: {
    name: string;
    version: string;
    commerceApi: string;
  };
  application: {
    name: string;
    version: string;
    environment: string;
  };
  identity: {
    merchantId: string;
    email: string;
    roles: string[];
    isPlatformAdmin: boolean;
  };
  capabilities: {
    commerce: boolean;
    merchantPayouts: boolean;
    settlements: boolean;
    adminConsole: boolean;
    banking: boolean;
    advisory: boolean;
    advisoryCases: boolean;
    advisoryDocuments: boolean;
    advisoryMessages: boolean;
  };
  operations: {
    payoutExecution: string;
    payoutFx: string;
    settlementRelease: string;
  };
  controls: {
    kycGate: boolean;
    payoutLimits: boolean;
    destinationEncryption: boolean;
    fourEyesApproval: boolean;
  };
  notifications: {
    telegram: boolean;
    discord: boolean;
    email: boolean;
    whatsapp: boolean;
  };
  generatedAt: string;
}

// ---- Raw settlement batch from backend (snake_case) ----
export interface RawSettlementBatch {
  id: string;
  merchant_id: string;
  store_id: string;
  store_name: string;
  store_code: string;
  gateway_vault_id: string;
  provider: string;
  currency: CurrencyCode;
  business_date: string;
  status: string;
  transaction_count: number;
  gross_amount: number;
  provider_fee: number;
  platform_fee: number;
  merchant_net: number;
  provider_available_at: string;
  ready_at?: string;
  released_at?: string;
  created_at: string;
}

// ---- Settlement overview from GET settlements/overview ----
export interface SettlementOverview {
  totalGross: number;
  totalProviderFee: number;
  totalPlatformFee: number;
  totalMerchantNet: number;
  pendingReviewCount: number;
  heldCount: number;
  releasedCount: number;
  currency: CurrencyCode;
}

// ---- Transaction stats extended ----
export interface TransactionStatsExtended {
  total: number;
  succeeded: number;
  pending: number;
  failed: number;
  volume: number;
  grossVolume?: number;
  recordedFees?: number;
  netAfterRecordedFees?: number;
  feeBasis?: string;
  reconciliationStatus?: string;
}