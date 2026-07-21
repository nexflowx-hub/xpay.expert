"use client";

import { create } from "zustand";
import { privateRequestData } from "@/lib/api/private-client";
import type { MerchantPayout, Paginated } from "@/types";
import type { AdminCapabilityStatus } from "@/types";

interface AdminState {
  isPlatformAdmin: boolean;
  adminCapabilityStatus: AdminCapabilityStatus;
  checkAdminCapability: () => Promise<void>;
  resetCapability: () => void;
}

export const useAdminStore = create<AdminState>()((set) => ({
  isPlatformAdmin: false,
  adminCapabilityStatus: "loading" as AdminCapabilityStatus,

  checkAdminCapability: async () => {
    set({ adminCapabilityStatus: "loading" as AdminCapabilityStatus });
    try {
      // Admin Capability Probe: GET /admin/merchant-payouts?limit=1
      await privateRequestData<Paginated<MerchantPayout>>({
        method: "GET",
        url: "admin/merchant-payouts",
        params: { limit: 1 },
      });
      // HTTP 200 → admin confirmed
      set({ isPlatformAdmin: true, adminCapabilityStatus: "true" as AdminCapabilityStatus });
    } catch (err: unknown) {
      const error = err as { status?: number };
      if (error?.status === 403) {
        // HTTP 403 → not admin
        set({ isPlatformAdmin: false, adminCapabilityStatus: "false" as AdminCapabilityStatus });
      } else if (error?.status === 401) {
        // HTTP 401 → session invalid (handled by interceptor)
        set({ isPlatformAdmin: false, adminCapabilityStatus: "unknown" as AdminCapabilityStatus });
      } else {
        // Other error → unknown state, allow retry
        set({ isPlatformAdmin: false, adminCapabilityStatus: "unknown" as AdminCapabilityStatus });
      }
    }
  },

  resetCapability: () => {
    set({ isPlatformAdmin: false, adminCapabilityStatus: "loading" as AdminCapabilityStatus });
  },
}));
