"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { BootstrapStore } from "@/types";
import { XP_STORAGE_KEYS } from "@/lib/storage/xp-storage";

interface WorkspaceState {
  selectedStoreId: string | null;
  stores: BootstrapStore[];
  setSelectedStoreId: (id: string | null) => void;
  setStores: (stores: BootstrapStore[]) => void;
  getSelectedStore: () => BootstrapStore | null;

  /** Validate that the selected store still exists in the current store list */
  validateSelection: () => void;
}

export const useWorkspaceStore = create<WorkspaceState>()(
  persist(
    (set, get) => ({
      selectedStoreId: null,
      stores: [],

      setSelectedStoreId: (id) => {
        set({ selectedStoreId: id });
      },

      setStores: (stores) => {
        const current = get().selectedStoreId;
        // If no store selected or selected store doesn't exist, default to "All Stores"
        if (!current || !stores.find((s) => s.id === current)) {
          set({ stores, selectedStoreId: null });
        } else {
          set({ stores });
        }
      },

      getSelectedStore: () => {
        const { selectedStoreId, stores } = get();
        if (!selectedStoreId) return null;
        return stores.find((s) => s.id === selectedStoreId) ?? null;
      },

      validateSelection: () => {
        const { selectedStoreId, stores } = get();
        if (selectedStoreId && !stores.find((s) => s.id === selectedStoreId)) {
          set({ selectedStoreId: null });
        }
      },
    }),
    {
      name: XP_STORAGE_KEYS.workspace,
      version: 1,
      partialize: (s) => ({
        selectedStoreId: s.selectedStoreId,
        // Do NOT persist stores list — it comes from bootstrap
      }),
    }
  )
);