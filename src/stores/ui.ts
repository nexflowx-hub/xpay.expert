"use client";

import { create } from "zustand";
import type { AppView } from "@/types";

export type ProductArea = "commerce" | "banking" | "advisory" | "admin";

interface UiState {
  appView: AppView;
  productArea: ProductArea;
  sidebarOpen: boolean;
  sidebarCollapsed: boolean;
  commandOpen: boolean;
  notificationsOpen: boolean;
  setAppView: (v: AppView) => void;
  setProductArea: (v: ProductArea) => void;
  setSidebarOpen: (v: boolean) => void;
  toggleSidebar: () => void;
  setCommandOpen: (v: boolean) => void;
  setNotificationsOpen: (v: boolean) => void;
}

export const useUi = create<UiState>((set) => ({
  appView: "landing",
  productArea: "commerce" as ProductArea,
  sidebarOpen: false,
  sidebarCollapsed: false,
  commandOpen: false,
  notificationsOpen: false,
  setAppView: (v) => set({ appView: v }),
  setProductArea: (v) => set({ productArea: v, sidebarOpen: false }),
  setSidebarOpen: (v) => set({ sidebarOpen: v }),
  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
  setCommandOpen: (v) => set({ commandOpen: v }),
  setNotificationsOpen: (v) => set({ notificationsOpen: v }),
}));