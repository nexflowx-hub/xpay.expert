"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User } from "@/types";
import { authEndpoints } from "@/lib/api/endpoints";
import {
  XP_STORAGE_KEYS,
  clearAuthenticationStorage,
  migrateClientStorage,
} from "@/lib/storage/xp-storage";
import {
  setPrivateAccessToken,
  registerUnauthorizedHandler,
} from "@/lib/api/private-client";

export type SessionStatus =
  | "hydrating"
  | "checking"
  | "authenticated"
  | "unauthenticated";

interface AuthState {
  user: User | null;
  accessToken: string | null;
  authenticated: boolean;
  isLoading: boolean;
  hydrated: boolean;
  sessionChecked: boolean;
  sessionStatus: SessionStatus;
  networkError: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (data: {
    name: string;
    email: string;
    password: string;
    companyName: string;
  }) => Promise<User>;
  logout: () => void;
  hydrate: () => void;
  retrySession: () => void;
  clearSession: () => void;
}

export const useAuth = create<AuthState>()(
  persist(
    (set, get) => {
      // Client-side bootstrap
      if (typeof window !== "undefined") {
        migrateClientStorage();
        // Register 401 handler from private client
        registerUnauthorizedHandler(() => {
          get().clearSession();
          // Redirect to login
          if (typeof window !== "undefined" && window.location.pathname !== "/login") {
            window.location.href = "/login";
          }
        });
      }

      return {
        user: null,
        accessToken: null,
        authenticated: false,
        isLoading: false,
        hydrated: false,
        sessionChecked: false,
        sessionStatus: "hydrating",
        networkError: false,

        login: async (email: string, password: string) => {
          set({ isLoading: true });
          try {
            const data = await authEndpoints.login(email, password);
            const token: string = data.token;
            const merchantData = data.merchant;

            const user: User = {
              id: merchantData.id,
              name: merchantData.name,
              email: merchantData.email,
              role: merchantData.role || "merchant",
              company: merchantData.company,
              merchantId: merchantData.merchantId || merchantData.id,
              tier: merchantData.tier,
            };

            // Set token in private client
            setPrivateAccessToken(token);

            set({
              user,
              accessToken: token,
              authenticated: true,
              isLoading: false,
              hydrated: true,
              sessionChecked: true,
              sessionStatus: "authenticated",
              networkError: false,
            });
            return user;
          } catch (e) {
            set({ isLoading: false });
            throw e;
          }
        },

        register: async (data) => {
          set({ isLoading: true });
          try {
            const resp = await authEndpoints.register(data);
            const token: string = resp.token;
            const merchantData = resp.merchant;

            const user: User = {
              id: merchantData.id,
              name: merchantData.name,
              email: merchantData.email,
              role: merchantData.role || "merchant",
              company: merchantData.company,
              merchantId: merchantData.merchantId || merchantData.id,
              tier: merchantData.tier,
            };

            setPrivateAccessToken(token);

            set({
              user,
              accessToken: token,
              authenticated: true,
              isLoading: false,
              hydrated: true,
              sessionChecked: true,
              sessionStatus: "authenticated",
              networkError: false,
            });
            return user;
          } catch (e) {
            set({ isLoading: false });
            throw e;
          }
        },

        logout: () => {
          authEndpoints.logout().catch(() => {});
          get().clearSession();
        },

        clearSession: () => {
          clearAuthenticationStorage();
          setPrivateAccessToken(null);
          set({
            user: null,
            accessToken: null,
            authenticated: false,
            isLoading: false,
            sessionChecked: true,
            sessionStatus: "unauthenticated",
            networkError: false,
          });
        },

        hydrate: () => {
          const state = get();
          const token = state.accessToken;
          const user = state.user;

          if (token && user) {
            // Set token in private client immediately
            setPrivateAccessToken(token);
            set({
              authenticated: true,
              hydrated: true,
              sessionStatus: "checking",
              sessionChecked: false,
            });

            // Validate session server-side
            authEndpoints
              .me()
              .then((meUser) => {
                if (meUser) {
                  set({
                    user: meUser as User,
                    authenticated: true,
                    sessionChecked: true,
                    sessionStatus: "authenticated",
                    networkError: false,
                  });
                } else {
                  get().clearSession();
                }
              })
              .catch((err: any) => {
                const status = err?.status;
                if (status === 401 || status === 403) {
                  get().clearSession();
                } else {
                  // Network error — don't clear session
                  set({
                    sessionChecked: true,
                    sessionStatus: "unauthenticated",
                    networkError: true,
                  });
                }
              });
          } else {
            set({
              user: null,
              accessToken: null,
              authenticated: false,
              hydrated: true,
              sessionChecked: true,
              sessionStatus: "unauthenticated",
              networkError: false,
            });
          }
        },

        retrySession: () => {
          set({
            sessionStatus: "checking",
            sessionChecked: false,
            networkError: false,
          });
          get().hydrate();
        },
      };
    },
    {
      name: XP_STORAGE_KEYS.auth,
      version: 1,
      partialize: (s) => ({
        accessToken: s.accessToken,
        user: s.user,
        authenticated: s.authenticated,
      }),
      onRehydrateStorage: () => (state) => {
        // When rehydrated, set the token in private client
        if (state?.accessToken) {
          setPrivateAccessToken(state.accessToken);
        }
      },
    }
  )
);