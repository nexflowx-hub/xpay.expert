"use client";

import { create } from "zustand";
import { fetchPlatformCapabilities, clearCapabilitiesCache } from "@/lib/api/capabilities-api";
import type { PlatformCapabilities } from "@/types";

interface AdminState {
  isPlatformAdmin: boolean;
  adminCapabilityStatus: "loading" | "true" | "false" | "unknown";
  capabilities: PlatformCapabilities | null;
  checkAdminCapability: () => Promise<void>;
  resetCapability: () => void;
}

export const useAdminStore = create<AdminState>()((set) => ({
  isPlatformAdmin: false,
  adminCapabilityStatus: "loading",
  capabilities: null,

  checkAdminCapability: async () => {
    set({ adminCapabilityStatus: "loading" });
    try {
      const caps = await fetchPlatformCapabilities();
      if (caps) {
        set({
          isPlatformAdmin: caps.identity.isPlatformAdmin === true,
          adminCapabilityStatus: caps.identity.isPlatformAdmin ? "true" : "false",
          capabilities: caps,
        });
      } else {
        set({ isPlatformAdmin: false, adminCapabilityStatus: "unknown" });
      }
    } catch {
      set({ isPlatformAdmin: false, adminCapabilityStatus: "unknown" });
    }
  },

  resetCapability: () => {
    clearCapabilitiesCache();
    set({ isPlatformAdmin: false, adminCapabilityStatus: "loading", capabilities: null });
  },
}));