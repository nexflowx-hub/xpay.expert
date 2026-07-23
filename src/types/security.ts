// ============================================================
// XPay — Security Challenge Types
// ============================================================

export type SecurityPurpose =
  | "verify_email"
  | "confirm_live_api_key_creation"
  | "confirm_api_key_rotation"
  | "confirm_webhook_secret_rotation"
  | "confirm_new_payout_destination"
  | "confirm_payout_request"
  | "confirm_banking_transfer"
  | "confirm_profile_email_change"
  | "confirm_password_change"
  | "confirm_sensitive_settings_change";

export interface SecurityPurposeInfo {
  purpose: SecurityPurpose;
  label: string;
  description: string;
}

export interface SecurityChallengeRequest {
  purpose: SecurityPurpose;
  resourceType?: string;
  resourceId?: string;
}

export interface SecurityChallengeResponse {
  challengeId: string;
  expiresAt: string;
}

export interface SecurityChallengeVerifyRequest {
  challengeId: string;
  code: string;
}

export interface SecurityChallengeVerifyResponse {
  actionToken: string;
  expiresAt: string;
}
