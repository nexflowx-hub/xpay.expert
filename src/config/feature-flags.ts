"use client";

/**
 * XPay.Expert — Centralized Feature Flags
 *
 * Single source of truth for feature availability.
 * Do NOT scatter boolean checks across components.
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
