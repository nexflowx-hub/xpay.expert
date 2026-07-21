/**
 * XPay.Expert — Platform Capabilities API
 *
 * Primary: GET /platform/capabilities
 * Fallback (until backend publishes the route):
 *   GET /admin/merchant-payouts?limit=1 → 200 = admin, 403 = not admin
 */

import { privateRequestData } from "@/lib/api/private-client";
import type { PlatformCapabilities } from "@/types";

let capabilitiesCache: PlatformCapabilities | null = null;
let capabilitiesFetching: Promise<PlatformCapabilities | null> | null = null;

/**
 * Fetches platform capabilities with caching.
 * Uses /platform/capabilities when available, falls back to admin probe.
 */
export async function fetchPlatformCapabilities(): Promise<PlatformCapabilities | null> {
  if (capabilitiesCache) return capabilitiesCache;
  if (capabilitiesFetching) return capabilitiesFetching;

  capabilitiesFetching = _fetchCapabilities().finally(() => {
    capabilitiesFetching = null;
  });

  return capabilitiesFetching;
}

async function _fetchCapabilities(): Promise<PlatformCapabilities | null> {
  try {
    // Try the canonical endpoint first
    const data = await privateRequestData<PlatformCapabilities>({
      method: "GET",
      url: "platform/capabilities",
    });
    capabilitiesCache = data;
    return data;
  } catch (err: unknown) {
    const error = err as { status?: number };

    // If 404, the backend hasn't published the route yet — use fallback
    if (error?.status === 404) {
      return _fallbackCapabilities();
    }

    // If 401, session is invalid (handled by interceptor)
    if (error?.status === 401) {
      return null;
    }

    // Other errors — return null, allow retry
    return null;
  }
}

/**
 * Temporary fallback: probe admin access to determine isPlatformAdmin.
 * Remove when /platform/capabilities is live.
 */
async function _fallbackCapabilities(): Promise<PlatformCapabilities | null> {
  try {
    await privateRequestData<{ data: unknown[] }>({
      method: "GET",
      url: "admin/merchant-payouts",
      params: { limit: 1 },
    });

    // 200 → is admin
    const caps: PlatformCapabilities = {
      contract: { name: "XPAY.PlatformCapabilities", version: "fallback", commerceApi: "v1" },
      application: { name: "XPAY.Expert", version: "unknown", environment: "pilot" },
      identity: { merchantId: "", email: "", roles: ["merchant", "platform_admin"], isPlatformAdmin: true },
      capabilities: {
        commerce: true,
        merchantPayouts: true,
        settlements: true,
        adminConsole: true,
        banking: false,
        advisory: true,
        advisoryCases: false,
        advisoryDocuments: false,
        advisoryMessages: false,
      },
      operations: { payoutExecution: "manual", payoutFx: "manual", settlementRelease: "manual" },
      controls: { kycGate: false, payoutLimits: false, destinationEncryption: false, fourEyesApproval: false },
      notifications: { telegram: false, discord: false, email: false, whatsapp: false },
      generatedAt: new Date().toISOString(),
    };
    capabilitiesCache = caps;
    return caps;
  } catch (err: unknown) {
    const error = err as { status?: number };

    if (error?.status === 403) {
      // Not admin
      const caps: PlatformCapabilities = {
        contract: { name: "XPAY.PlatformCapabilities", version: "fallback", commerceApi: "v1" },
        application: { name: "XPAY.Expert", version: "unknown", environment: "pilot" },
        identity: { merchantId: "", email: "", roles: ["merchant"], isPlatformAdmin: false },
        capabilities: {
          commerce: true,
          merchantPayouts: true,
          settlements: true,
          adminConsole: false,
          banking: false,
          advisory: true,
          advisoryCases: false,
          advisoryDocuments: false,
          advisoryMessages: false,
        },
        operations: { payoutExecution: "manual", payoutFx: "manual", settlementRelease: "manual" },
        controls: { kycGate: false, payoutLimits: false, destinationEncryption: false, fourEyesApproval: false },
        notifications: { telegram: false, discord: false, email: false, whatsapp: false },
        generatedAt: new Date().toISOString(),
      };
      capabilitiesCache = caps;
      return caps;
    }

    return null;
  }
}

/** Clear the capabilities cache (e.g. on logout) */
export function clearCapabilitiesCache(): void {
  capabilitiesCache = null;
  capabilitiesFetching = null;
}