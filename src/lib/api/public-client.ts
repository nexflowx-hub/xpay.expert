import axios, { type AxiosInstance, type AxiosRequestConfig } from "axios";
import type { ApiError, ApiResponse } from "@/types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.xpay.expert/api/v1";

/**
 * Public API client — NO JWT attached.
 * Used for: login, register, forgot password, reset password.
 */
export const publicApi: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: { "Content-Type": "application/json" },
});

function normalizeError(err: unknown): ApiError {
  if (axios.isAxiosError(err)) {
    if (err.code === "ECONNABORTED") return { message: "Request timed out.", code: err.code, status: 0 };
    if (err.code === "ERR_NETWORK") return { message: "Network error — could not reach the API.", code: err.code, status: 0 };
    const data = err.response?.data as { message?: string; error?: { code?: string; message?: string }; code?: string } | undefined;
    return { message: data?.error?.message || data?.message || err.message, code: data?.error?.code || data?.code, status: err.response?.status };
  }
  return { message: "Unexpected error", status: 500 };
}

/** Raw request — returns the full response data */
export async function publicRequest<T>(config: AxiosRequestConfig): Promise<T> {
  const res = await publicApi(config);
  return res.data as T;
}

/** Unwraps { success, data } envelope */
export async function publicRequestData<T>(config: AxiosRequestConfig): Promise<T> {
  const res = await publicApi(config);
  const envelope = res.data as ApiResponse<T>;
  if (envelope && typeof envelope === "object" && "success" in envelope) {
    if (!envelope.success) {
      throw { message: envelope.error?.message || envelope.message || "Request failed.", code: envelope.error?.code, status: res.status } as ApiError;
    }
    return envelope.data as T;
  }
  return res.data as T;
}