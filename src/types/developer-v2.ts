// ============================================================
// XPay — Developer v2 Types (API Keys v2, Webhooks v2)
// ============================================================

// ---- API Keys v2 ----

export interface DeveloperApiKey {
  id: string;
  storeId: string;
  storeCode: string;
  storeName: string;
  keyPrefix: string;
  keyLastFour: string;
  environment: "live" | "test";
  scopes: string[];
  status: "active" | "revoked" | "expired";
  lastUsedAt: string | null;
  expiresAt: string | null;
  revokedAt: string | null;
  createdAt: string;
}

export interface DeveloperApiKeyCreatePayload {
  storeId: string;
  name: string;
  environment: "test" | "live";
  scopes: string[];
}

export interface DeveloperApiKeyCreateResponse {
  id: string;
  fullKey: string;
  keyPrefix: string;
  keyLastFour: string;
  environment: string;
  scopes: string[];
  revealPolicy: string;
}

// ---- Merchant Webhooks ----

export interface MerchantWebhook {
  id: string;
  url: string;
  events: string[];
  status: "active" | "disabled";
  secret?: string;
  secretLastFour?: string;
  storeId?: string;
  storeName?: string;
  storeCode?: string;
  deliveryHealth?: {
    last24h: { success: number; failed: number };
    avgLatencyMs: number | null;
  lastDeliveryAt: string | null;
  lastSuccessAt: string | null;
    lastFailureAt: string | null;
  };
  createdAt: string;
  updatedAt?: string;
}

export interface MerchantWebhookCreatePayload {
  url: string;
  events: string[];
  storeId?: string;
}

export interface MerchantWebhookCreateResponse {
  id: string;
  url: string;
  events: string[];
  status: string;
  secret: string;
  storeId?: string;
  createdAt: string;
}

export interface MerchantWebhookUpdatePayload {
  url?: string;
  events?: string[];
  active?: boolean;
}

export interface MerchantWebhookRotateSecretResponse {
  secret: string;
}

// ---- Provider Webhooks ----

export interface ProviderWebhook {
  id: string;
  provider: string;
  url: string;
  events: string[];
  status: string;
  createdAt: string;
}
