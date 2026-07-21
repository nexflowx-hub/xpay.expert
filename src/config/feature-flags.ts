"use client";

/**
 * XPay.Expert — Feature Flags
 *
 * STATIC fallback flags. When /platform/capabilities is available,
 * the UI should prefer capabilities.capabilities.* from the API response.
 * Use isFeatureEnabled() for static checks, or usePlatformCapabilities()
 * for dynamic server-driven checks.
 */
export const features = {
  commerce: true,
  merchantPayouts: true,
  settlements: true,
  adminConsole: true,
  banking: false,
  advisory: true,
  advisoryCases: false,
  advisoryDocuments: false,
  advisoryMessages: false,
  discordNotifications: false,
  emailNotifications: false,
  whatsappNotifications: false,
} as const;

export type FeatureKey = keyof typeof features;

export function isFeatureEnabled(key: FeatureKey): boolean {
  return features[key] === true;
}
