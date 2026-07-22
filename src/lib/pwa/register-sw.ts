"use client";

/**
 * XPay.Expert — PWA Service Worker Registration
 *
 * Registers the service worker only in production and when the browser supports it.
 * Called once from the root layout's client component.
 */

let registered = false;

export function registerServiceWorker(): void {
  if (registered) return;
  if (typeof window === "undefined") return;
  if (!("serviceWorker" in navigator)) return;

  // Only register in production
  if (process.env.NODE_ENV !== "production") return;

  registered = true;

  window.addEventListener("load", async () => {
    try {
      const registration = await navigator.serviceWorker.register("/sw.js", {
        scope: "/",
      });

      // Handle updates
      registration.addEventListener("updatefound", () => {
        const newWorker = registration.installing;
        if (!newWorker) return;

        newWorker.addEventListener("statechange", () => {
          if (
            newWorker.state === "activated" &&
            navigator.serviceWorker.controller
          ) {
            console.log("[PWA] New content available; refresh for updates.");
          }
        });
      });

      console.log("[PWA] Service worker registered successfully.");
    } catch (error) {
      console.warn("[PWA] Service worker registration failed:", error);
    }
  });
}