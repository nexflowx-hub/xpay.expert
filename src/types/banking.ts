// ============================================================
// XPay — Banking Types
// ============================================================

export interface BankingFeatures {
  accounts: boolean;
  balances: boolean;
  beneficiaries: boolean;
  transfers: boolean;
  fxQuotes: boolean;
  statements: boolean;
  cards: boolean;
  cryptoWithdrawals: boolean;
  automaticExternalExecution: boolean;
}

export interface BankingCapabilities {
  status: "private_beta" | "active" | "coming_soon";
  providerMode: "manual" | "automatic";
  features: BankingFeatures;
}

export interface BankingAccount {
  id: string;
  accountCode: string;
  currency: string;
  accountType: string;
  status: string;
  provider: string;
  bankName?: string;
  country?: string;
  ibanMasked?: string;
  ledgerBalance: number;
}

export interface BankingAccountTransaction {
  id: string;
  accountId: string;
  type: string;
  amount: number;
  currency: string;
  description: string;
  reference?: string;
  status: string;
  counterpartName?: string;
  counterpartIbanMasked?: string;
  createdAt: string;
}

export interface BankingBeneficiary {
  id: string;
  beneficiaryType: string;
  name: string;
  country: string;
  currency: string;
  destinationMasked: {
    iban?: string;
  };
  status: string;
  createdAt: string;
}

export interface BankingBeneficiaryCreatePayload {
  beneficiaryType: string;
  name: string;
  country: string;
  currency: string;
  destinationMasked: {
    iban?: string;
  };
}

export type BankingTransferStatus =
  | "draft"
  | "pending_confirmation"
  | "pending_review"
  | "approved"
  | "submitted"
  | "processing"
  | "completed"
  | "failed"
  | "reversed"
  | "cancelled";

export interface BankingTransfer {
  id: string;
  sourceAccountId: string;
  beneficiaryId: string;
  amount: number;
  currency: string;
  description: string;
  status: BankingTransferStatus;
  idempotencyKey: string;
  fxRate?: number;
  fxAmount?: number;
  createdAt: string;
  updatedAt: string;
  submittedAt?: string;
  completedAt?: string;
  failedReason?: string;
}

export interface BankingTransferCreatePayload {
  sourceAccountId: string;
  beneficiaryId: string;
  amount: number;
  currency: string;
  description: string;
}

export interface BankingFxQuote {
  id: string;
  sourceCurrency: string;
  targetCurrency: string;
  sourceAmount: number;
  targetAmount: number;
  rate: number;
  expiresAt: string;
  provider: string;
}

export interface BankingFxQuotePayload {
  sourceAccountId: string;
  sourceCurrency: string;
  targetCurrency: string;
  sourceAmount: number;
}

export interface BankingStatementEntry {
  id: string;
  date: string;
  type: string;
  amount: number;
  currency: string;
  description: string;
  reference?: string;
  balance: number;
}

export interface BankingStatement {
  id: string;
  accountId: string;
  currency: string;
  periodStart: string;
  periodEnd: string;
  openingBalance: number;
  closingBalance: number;
  entries: BankingStatementEntry[];
}
