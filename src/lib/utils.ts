import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const currencySymbols: Record<string, string> = {
  EUR: "€",
  USD: "$",
  BRL: "R$",
  GBP: "£",
  USDT: "₮",
  BTC: "₿",
};

export function toFiniteNumber(value: unknown, fallback = 0): number {
  if (value === null || value === undefined) return fallback;
  if (typeof value === "number") return Number.isFinite(value) ? value : fallback;
  if (typeof value === "string") {
    const n = Number(value);
    return Number.isFinite(n) ? n : fallback;
  }
  return fallback;
}

export function formatCurrency(value: unknown, currency = "EUR", opts?: { compact?: boolean }) {
  const safe = toFiniteNumber(value);
  const symbol = currencySymbols[currency] ?? "";
  if (opts?.compact && Math.abs(safe) >= 1000) {
    if (Math.abs(safe) >= 1_000_000)
      return `${symbol}${(safe / 1_000_000).toFixed(2)}M`;
    return `${symbol}${(safe / 1000).toFixed(1)}k`;
  }
  return `${symbol}${safe.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function formatNumber(value: unknown, opts?: { compact?: boolean }) {
  const safe = toFiniteNumber(value);
  if (opts?.compact) {
    if (Math.abs(safe) >= 1_000_000) return `${(safe / 1_000_000).toFixed(2)}M`;
    if (Math.abs(safe) >= 1000) return `${(safe / 1000).toFixed(1)}k`;
  }
  return safe.toLocaleString("en-US");
}

export function formatPercent(value: unknown, dp = 1) {
  return `${toFiniteNumber(value).toFixed(dp)}%`;
}

export function formatDate(iso: string, opts?: { withTime?: boolean }) {
  const d = new Date(iso);
  if (opts?.withTime) {
    return d.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const sec = Math.floor(diff / 1000);
  if (sec < 60) return `${sec}s ago`;
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.floor(hr / 24);
  return `${day}d ago`;
}

export function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function maskKey(key: string) {
  if (key.length <= 8) return key;
  return `${key.slice(0, 8)}${"•".repeat(20)}${key.slice(-4)}`;
}