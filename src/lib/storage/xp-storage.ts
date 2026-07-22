/**
 * XPay.Expert — Centralized Storage Module
 * 
 * Storage keys specific to XPay.Expert.
 * Only stores the access token — no refresh token, no passwords.
 */

export const XP_STORAGE_KEYS = {
  auth: "xpay-expert-auth-v1",
  preferences: "xpay-expert-prefs-v1",
  workspace: "xpay-expert-workspace-v1",
} as const;

export const APP_STORAGE_VERSION = "2026.07.18.1";

/** Clear all authentication storage — does NOT touch preferences or workspace */
export function clearAuthenticationStorage(): void {
  try {
    localStorage.removeItem(XP_STORAGE_KEYS.auth);
  } catch {
    // Storage unavailable (SSR, private mode)
  }
}

/** Clear ALL XPay.Expert storage (used for full reset) */
export function clearAllStorage(): void {
  try {
    Object.values(XP_STORAGE_KEYS).forEach((key) => localStorage.removeItem(key));
  } catch {
    // Storage unavailable
  }
}

/** Migrate client storage — called once on app bootstrap */
export function migrateClientStorage(): void {
  // Remove any legacy keys from Phase 1
  const legacyKeys = [
    "xp-auth-v2",
    "xp-auth-v1",
    "xp-auth",
    "xp-local",
    "xp_preferences",
    "xp-preferences-v1",
    "xp-workspace-v1",
    "xp-access-token",
    "xp-refresh-token",
    "xpay-expert-auth-v0",
  ];
  try {
    legacyKeys.forEach((key) => localStorage.removeItem(key));
  } catch {
    // ignore
  }
}