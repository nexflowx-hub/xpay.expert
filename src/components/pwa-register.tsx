"use client";

import { registerServiceWorker } from "@/lib/pwa/register-sw";

export function PwaRegister() {
  // Register SW on mount (production only)
  if (typeof window !== "undefined") {
    registerServiceWorker();
  }
  return null;
}