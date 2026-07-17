"use client";

import { cn } from "@/lib/utils";

/**
 * Official XPay.Expert logo — circuit-board X emblem with
 * "XPay EXPERT" text on a dark face.
 *
 * The logo PNG features a modern circuit-board design with a glowing X symbol.
 * Integrates naturally with the app's dark theme (#0B1220).
 *
 * Used in the sidebar, topbar, auth branded panel, splash screen, PWA.
 */
export function XSymbol({ className, withRing = false }: { className?: string; withRing?: boolean }) {
  return (
    <img
      src="/logo-symbol.svg"
      alt="XPay"
      className={cn("shrink-0", className)}
      draggable={false}
    />
  );
}