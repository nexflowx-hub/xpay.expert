import axios, { type AxiosInstance, type AxiosRequestConfig, type InternalAxiosRequestConfig } from "axios";
import type { ApiError, ApiResponse } from "@/types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.xpay.expert/api/v1";

// In-memory token reference — set by auth store
let _accessToken: string | null = null;

export function setPrivateAccessToken(token: string | null) {
  _accessToken = token;
}

export function getPrivateAccessToken(): string | null {
  return _accessToken;
}

/**
 * Private API client — JWT is injected via request interceptor.
 * On 401: clears session and redirects to login (NO refresh token).
 * On 403: does NOT clear session (access denied, not session issue).
 */
export const privateApi: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: { "Content-Type": "application/json" },
});

// Request interceptor: inject JWT
privateApi.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (_accessToken) {
      config.headers.set("Authorization", `Bearer ${_accessToken}`);
    }
    return config;
  },
  (err) => Promise.reject(err)
);

// Response interceptor: 401 → clear session
let _handleUnauthorized: (() => void) | null = null;

export function registerUnauthorizedHandler(fn: () => void) {
  _handleUnauthorized = fn;
}

let unauthorizedGuard = false;
privateApi.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      if (!unauthorizedGuard) {
        unauthorizedGuard = true;
        // Clear token immediately
        _accessToken = null;
        _handleUnauthorized?.();
        setTimeout(() => { unauthorizedGuard = false; }, 2000);
      }
    }
    return Promise.reject(normalizeError(error));
  }
);

function normalizeError(err: unknown): ApiError {
  if (axios.isAxiosError(err)) {
    if (err.code === "ECONNABORTED") return { message: "Request timed out.", code: err.code, status: 0 };
    if (err.code === "ERR_NETWORK") return { message: "Network error — could not reach the API.", code: err.code, status: 0 };
    const httpStatus = err.response?.status;
    const data = err.response?.data as { message?: string; error?: { code?: string; message?: string }; code?: string } | undefined;
    const message = data?.error?.message || data?.message || err.message;
    const code = data?.error?.code || data?.code;
    // Derive error code from HTTP status when not explicitly provided
    const derivedCode = code ?? (
      httpStatus === 409 ? "CONFLICT" :
      httpStatus === 429 ? "RATE_LIMITED" :
      httpStatus === 503 ? "SERVICE_UNAVAILABLE" :
      undefined
    );
    return { message, code: derivedCode, status: httpStatus };
  }
  return { message: "Unexpected error", status: 500 };
}

/** Raw request — returns full response data */
export async function privateRequest<T>(config: AxiosRequestConfig): Promise<T> {
  const res = await privateApi(config);
  return res.data as T;
}

/** Unwraps { success, data } envelope, optionally adding X-Security-Action header */
export async function privateRequestWithSecurity<T>(
  config: AxiosRequestConfig,
  actionToken?: string,
): Promise<T> {
  const merged: AxiosRequestConfig = { ...config };
  if (actionToken) {
    merged.headers = {
      ...config.headers,
      "X-Security-Action": actionToken,
    };
  }
  return privateRequestData<T>(merged);
}

/** Unwraps { success, data } envelope */
export async function privateRequestData<T>(config: AxiosRequestConfig): Promise<T> {
  const res = await privateApi(config);
  const envelope = res.data as ApiResponse<T>;
  if (envelope && typeof envelope === "object" && "success" in envelope) {
    if (!envelope.success) {
      throw { message: envelope.error?.message || envelope.message || "Request failed.", code: envelope.error?.code, status: res.status } as ApiError;
    }
    return envelope.data as T;
  }
  return res.data as T;
}