import axios, {
  type AxiosInstance,
  type AxiosRequestConfig,
  type InternalAxiosRequestConfig,
} from "axios";
import type { ApiError, ApiResponse } from "@/types";
import { API_BASE_URL } from "@/config";
import { getPrivateAccessToken } from "@/lib/api/private-client";

/**
 * XPay.Expert Legacy API client — compatibility layer.
 * Uses the new private-client's token management.
 * 401 → clear session (no refresh token in Phase 2).
 */

let sessionRecoveryRunning = false;
let _onLogout: ((reason?: string) => void) | null = null;
export function registerLogoutHandler(fn: (reason?: string) => void) { _onLogout = fn; }

export const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
});

// Request interceptor: inject JWT from private-client
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getPrivateAccessToken();
    if (token) config.headers.set("Authorization", `Bearer ${token}`);
    return config;
  },
  (err) => Promise.reject(err)
);

// Response interceptor: 401 → clear session
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    const isAuthRoute = typeof original?.url === "string" &&
      (original.url.includes("auth/login") || original.url.includes("auth/register") ||
       original.url.includes("auth/forgot") || original.url.includes("auth/reset") ||
       original.url.includes("auth/logout"));

    if (isAuthRoute) return Promise.reject(normalizeError(error));

    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      handleUnauthorized();
      return Promise.reject(normalizeError(error));
    }
    return Promise.reject(normalizeError(error));
  }
);

function handleUnauthorized() {
  if (sessionRecoveryRunning) return;
  sessionRecoveryRunning = true;
  try {
    _onLogout?.("session_expired");
  } finally {
    setTimeout(() => { sessionRecoveryRunning = false; }, 1000);
  }
}

function normalizeError(err: unknown): ApiError {
  if (axios.isAxiosError(err)) {
    if (err.code === "ECONNABORTED") return { message: "Request timed out.", code: err.code, status: 0 };
    if (err.code === "ERR_NETWORK") return { message: "Network error — could not reach the API.", code: err.code, status: 0 };
    const data = err.response?.data as { message?: string; error?: { code?: string; message?: string }; code?: string } | undefined;
    return { message: data?.error?.message || data?.message || err.message, code: data?.error?.code || data?.code, status: err.response?.status };
  }
  return { message: "Unexpected error", status: 500 };
}

export async function request<T>(config: AxiosRequestConfig): Promise<T> {
  const res = await api(config);
  return res.data as T;
}

export async function requestData<T>(config: AxiosRequestConfig): Promise<T> {
  const res = await api(config);
  const envelope = res.data as ApiResponse<T>;
  if (envelope && typeof envelope === "object" && "success" in envelope) {
    if (!envelope.success) {
      throw { message: envelope.error?.message || envelope.message || "Request failed.", code: envelope.error?.code, status: res.status } as ApiError;
    }
    return envelope.data as T;
  }
  return res.data as T;
}