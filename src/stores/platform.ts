"use client";

import { create } from "zustand";
import type { PlatformBootstrap } from "@/types";

interface PlatformState {
  bootstrap: PlatformBootstrap | null;
  isLoading: boolean;
  error: string | null;
  setBootstrap: (data: PlatformBootstrap) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clear: () => void;

  // Derived helpers
  getOnboarding: () => PlatformBootstrap["onboarding"] | null;
  getCapabilities: () => PlatformBootstrap["capabilities"] | null;
  isCapabilityEnabled: (key: string) => boolean;
  getModuleCard: (key: string) => PlatformBootstrap["moduleCards"][0] | undefined;
}

export const usePlatformStore = create<PlatformState>()((set, get) => ({
  bootstrap: null,
  isLoading: false,
  error: null,

  setBootstrap: (data) => set({ bootstrap: data, isLoading: false, error: null }),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error, isLoading: false }),

  clear: () =>
    set({
      bootstrap: null,
      isLoading: false,
      error: null,
    }),

  getOnboarding: () => get().bootstrap?.onboarding ?? null,

  getCapabilities: () => get().bootstrap?.capabilities ?? null,

  isCapabilityEnabled: (key: string) => {
    const caps = get().bootstrap?.capabilities;
    if (!caps) return false;
    const val = caps[key];
    if (typeof val === "boolean") return val;
    if (val === "enabled") return true;
    return false;
  },

  getModuleCard: (key: string) => {
    return get().bootstrap?.moduleCards?.find((m) => m.key === key);
  },
}));