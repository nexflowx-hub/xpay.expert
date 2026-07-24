<div align="center">

<img src="public/logo.svg" alt="XPAY.Expert" width="240" />

<h1>XPAY.Expert — Merchant Dashboard</h1>

<p><strong>Enterprise payment infrastructure. Accept cards, Pix, MBWay, and crypto with one unified API.</strong></p>

<p>
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black" alt="React 19" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/shadcn%2Fui-New%20York-18181B?style=flat-square" alt="shadcn/ui" />
  <img src="https://img.shields.io/badge/License-Proprietary-E5E7EB?style=flat-square" alt="License" />
</p>

</div>

---

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [API Integration](#api-integration)
- [Security Model](#security-model)
- [Key Features](#key-features)
- [Module Status](#module-status)
- [Development](#development)
- [Project Structure](#project-structure)
- [Internationalisation (i18n)](#internationalisation-i18n)
- [PWA Support](#pwa-support)
- [Deployment](#deployment)
- [License](#license)

---

## Overview

**XPAY.Expert** is a production-grade SaaS merchant dashboard for a multi-currency payment processing platform. It provides a comprehensive web interface for merchants to manage payments, wallets, settlements, payouts, risk monitoring, developer tools (API keys, webhooks), and advisory services — all powered by a remote REST API at `https://api.xpay.expert/api/v1`.

The dashboard is a **frontend-only** application with **no direct database connections** and no server-side data layer. All data flows through authenticated API calls to the XPAY.Expert backend.

### Design Principles

- **Zero persisted secrets** — JWT, full API keys, OTP codes, and action tokens are held in memory only; never written to `localStorage` or cookies.
- **Security-first routing** — route guards for merchant and admin areas; `401` triggers session invalidation, `403` preserves it.
- **Server-driven capabilities** — feature availability (banking, advisory, admin console) is determined by backend `capabilities` flags via `GET /platform/capabilities`, with local static fallbacks when the endpoint is unavailable.
- **Mobile-first responsive** — all views designed mobile-first with progressive enhancement for desktop.
- **Error resilience** — query errors stay inside TanStack Query (no error boundary crashes); components render their own `ErrorState` with retry buttons.

---

## Tech Stack

| Category | Technology | Version |
|---|---|---|
| **Framework** | Next.js (App Router) | 16.x |
| **UI Runtime** | React | 19.x |
| **Language** | TypeScript | 5.x |
| **Styling** | Tailwind CSS | 4.x |
| **Component Library** | shadcn/ui (New York style) | latest |
| **Icons** | Lucide React | latest |
| **Server State** | TanStack Query | 5.82+ |
| **Client State** | Zustand | 5.x |
| **HTTP Client** | Axios | 1.18+ |
| **Form Validation** | React Hook Form + Zod | 7.x / 4.x |
| **Animations** | Framer Motion | 12.x |
| **Toast Notifications** | Sonner | 2.x |
| **Theme** | next-themes | 0.4+ |
| **Data Tables** | TanStack React Table | 8.x |
| **Charts** | Recharts | 2.x |
| **Date Utilities** | date-fns | 4.x |
| **Drag & Drop** | dnd-kit | 6.x / 10.x |
| **Rich Text / Markdown** | @mdxeditor/editor, react-markdown | 3.x / 10.x |
| **Syntax Highlighting** | react-syntax-highlighter | 15.x |
| **Icons (Payment)** | Custom SVG (Visa, MC, Pix, MBWay, Bizum, Apple Pay) | — |

---

## Architecture

### App Router Structure

The application uses Next.js 16 App Router with route groups for layout segregation:

```
src/app/
├── page.tsx                    # Landing page (public)
├── layout.tsx                   # Root layout (providers, toaster)
├── not-found.tsx                # Custom 404 page
├── error.tsx                    # Error boundary
├── manifest.ts                  # PWA manifest
├── sitemap.ts                   # SEO sitemap
├── robots.ts                    # SEO robots
├── (auth)/                      # Unauthenticated group
│   ├── layout.tsx               # Auth layout
│   ├── login/page.tsx           # Login
│   └── register/page.tsx        # Registration
├── (dashboard)/                 # Authenticated dashboard (sidebar, header, guards)
│   ├── layout.tsx               # Dashboard shell + MerchantGuard + bootstrap
│   ├── commerce/                # Overview, payments, transactions, settlements,
│   │                             #   payouts (list + new + detail), wallets, customers,
│   │                             #   stores, products, invoices, subscriptions, payment-links
│   ├── banking/                # Accounts, transfers, beneficiaries, fx,
│   │                             #   cards, crypto, statements (DISABLED — placeholder pages)
│   ├── developers/             # Overview, api-keys (v2), webhooks, docs
│   ├── advisory/               # Services, cases, documents, messages
│   ├── admin/                   # Role-gated admin console (AdminGuard)
│   │   ├── layout.tsx           # Admin guard wrapper
│   │   ├── kyc/                # KYC review queue
│   │   ├── risk/               # Risk management
│   │   ├── revenue/            # Revenue analytics
│   │   ├── commerce/            # Merchants, payouts, gateways, settlements
│   │   ├── advisory/            # Advisory management
│   │   └── system/             # Health, workers, logs, queues, feature-flags
│   ├── settings/page.tsx       # Merchant settings
│   ├── support/page.tsx        # Support center
│   ├── risk/page.tsx           # Risk overview
│   └── insights/page.tsx       # Insights & analytics
├── (protected)/                # commerce, developers, marketplace, money
└── api/route.ts                # Next.js API route stub
```

### Component Layers

```
src/components/
├── ui/                  # shadcn/ui primitives (50+ components)
├── landing/             # Public landing page
├── auth/                # Authentication screens (auth-screen.tsx)
├── merchant/            # Dashboard widgets: analytics, payments, wallets, stores,
│                         #   products, customers, invoices, subscriptions, fx,
│                         #   treasury, risk, settings, payment-links, api-keys,
│                         #   webhooks, support, developers (20 components)
├── dashboard/           # Shell (sidebar/header), merchant-guard, admin-guard
├── admin/               # Admin panels: dashboard, analytics, merchants, kyc,
│                         #   risk, compliance, revenue, gateways, health, logs,
│                         #   queues, workers, treasury, flags, support (15 components)
├── shared/              # payment-logos, badges, charts, language-switcher,
│                         #   x-symbol, xpi-chat, index (shared exports)
└── pwa-register.tsx     # PWA install prompt
```

### API Layer

Centralised in `src/lib/api/` with distinct client configurations:

| Client | File | Purpose |
|---|---|---|
| **public-client.ts** | Unauthenticated Axios instance | Login, registration, public endpoints |
| **private-client.ts** | JWT-authenticated Axios instance | All authenticated merchant/admin endpoints |
| **client.ts** | Legacy client | Backward compatibility |
| **endpoints.ts** | Typed endpoint functions | All API calls organised by domain |
| **xpApi.ts** | Extended API utilities | Convenience wrappers |
| **capabilities-api.ts** | Capabilities detection | Dynamic feature flag resolution with fallback |
| **mock.ts** | Mock data generators | Development & demo data |

**Private client interceptor behaviour:**

```typescript
// JWT injected from in-memory reference — never persisted to localStorage
privateApi.interceptors.request.use((config) => {
  if (_accessToken) config.headers.set("Authorization", `Bearer ${_accessToken}`);
  return config;
});
// 401 → clear session, redirect to /login
// 403 → preserve session (access denied, not a session issue)
// Network errors → preserve session (retry available)
```

**Security-aware requests** use `privateRequestWithSecurity<T>(config, actionToken)` which adds the `X-Security-Action` header for sensitive operations (key creation, transfer confirmation, etc.).

### State Management

All stores use **Zustand 5** with optional `persist` middleware:

| Store | File | Purpose |
|---|---|---|
| `useAuth` | `stores/auth.ts` | Authentication, JWT management, session lifecycle |
| `usePlatform` | `stores/platform.ts` | Platform bootstrap data, capabilities |
| `useWorkspace` | `stores/workspace.ts` | Workspace/merchant context switching |
| `useUI` | `stores/ui.ts` | UI state (sidebar, modals) |
| `useAdminStore` | `stores/admin.ts` | Admin capability detection & flags |

The auth store hydrates from storage on app load, validates via `GET /auth/me`, and handles reconnection. Legacy storage keys are automatically migrated on bootstrap via `xp-storage.ts`.

### Configuration

```
src/config/
├── index.ts           # Navigation structure, product area definitions, Lucide icons,
│                       #   currency map, store constants
├── feature-flags.ts   # Static fallback flags (superseded by server capabilities)
└── contacts.ts        # Contact information and support channels
```

### Hooks

| Hook | File | Purpose |
|---|---|---|
| `use-queries.ts` | TanStack Query hooks | All data-fetching & mutation operations |
| `queries.ts` | Query key definitions | Query key factory + invalidation helpers |
| `use-mobile.ts` | Breakpoint detection | Responsive sidebar toggle |
| `use-toast.ts` | Toast hook | Legacy toast (Sonner preferred) |

### Providers

Root providers composed in `src/providers/app-providers.tsx`:

- **QueryClientProvider** (TanStack Query) — `staleTime: 30s`, `retry: 1`, `throwOnError: false`
- **ThemeProvider** (next-themes) — dark mode default, class-based attribute

---

## API Integration

### Backend API

```
Base URL: https://api.xpay.expert/api/v1
```

### API Clients

**Public Client** — No auth header. Used for login, register, public endpoints.

**Private Client** — Injects `Authorization: Bearer <token>` from an in-memory variable (`_accessToken`).

**Security-Aware Client** — Extends private client with `X-Security-Action` header for sensitive operations. Token held in memory only — never persisted.

### Response Envelope

All authenticated endpoints return a standardised envelope:

```json
{ "success": true, "data": { ... }, "meta": { ... } }
```

Error envelope:

```json
{ "success": false, "error": { "code": "ERROR_CODE", "message": "..." } }
```

`privateRequestData<T>()` unwraps the envelope automatically. If `success` is `false`, it throws a normalised `ApiError`.

### Endpoint Catalogue

#### Authentication & Platform

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `auth/login` | Email/password login → JWT + merchant profile |
| `POST` | `auth/register` | Registration → JWT + merchant profile |
| `GET` | `auth/me` | Validate & refresh session |
| `POST` | `auth/logout` | Invalidate server-side session |
| `GET` | `platform/bootstrap` | Platform bootstrap data |
| `GET/PATCH` | `merchant/profile` | Merchant profile read/update |
| `GET` | `platform/capabilities` | Dynamic feature flags (with fallback) |

#### Commerce & Payments

| Method | Endpoint | Description |
|---|---|---|
| `GET/POST` | `merchant/stores`, `merchant/stores/:id` | Store CRUD |
| `GET` | `transactions`, `transactions/:id`, `transactions/stats` | Transactions + statistics |
| `GET` | `analytics/overview` | Dashboard KPIs & charts |
| `GET` | `transactions/stats` | Extended transaction statistics (grossVolume, recordedFees, netAfterRecordedFees) |
| `GET` | `wallets` | Wallet balances |
| `GET` | `wallets/movements` | Wallet movement history |
| `GET` | `risk/profile`, `risk/kyc/status` | Risk profile + KYC status |
| `GET` | `treasury/overview` | Treasury overview |
| `GET` | `customers` | Customer directory |
| `GET/POST/DELETE` | `products` | Product catalogue CRUD |
| `GET` | `payment-links`, `invoices`, `subscriptions` | Read-only listings |
| `GET` | `settlements/overview` | Settlement overview (gross, fees, net, release stats) |
| `GET` | `settlements/batches` | Settlement batches (with partial release support) |
| `GET` | `merchant/payouts/options` | Payout methods |
| `POST` | `merchant/payouts/validate` | Validate payout payload |
| `POST` | `merchant/payouts` | Create payout (`Idempotency-Key` header) |
| `GET` | `merchant/payouts`, `merchant/payouts/:id` | List + detail |
| `POST` | `merchant/payouts/:id/cancel` | Cancel payout |

#### Developer & API Keys

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `api-keys` | List legacy API keys |
| `POST` | `api-keys` | Create legacy API key |
| `DELETE` | `api-keys/:id` | Delete legacy API key |
| `GET` | `developer/api-keys` | List v2 keys (never includes `fullKey`) |
| `POST` | `developer/api-keys` | Create v2 key → `fullKey` returned **once** |
| `POST` | `developer/api-keys/:id/rotate` | Rotate v2 key → new `fullKey` returned **once** |
| `POST` | `developer/api-keys/:id/revoke` | Revoke v2 key permanently |

#### Webhooks

| Method | Endpoint | Description |
|---|---|---|
| `GET/POST/PATCH/DELETE` | `webhooks` | Legacy webhook CRUD |
| `GET/POST/PATCH/DELETE` | `merchant/webhooks` | Merchant v2 webhooks + delivery health |
| `POST` | `merchant/webhooks/:id/rotate-secret` | Rotate secret (security action) |
| `GET` | `provider/webhooks` | Provider webhooks (read-only) |

> **Note:** v2 webhook endpoints (`merchant/webhooks`, `provider/webhooks`) are defined in the frontend but may return 404 if not yet deployed on the backend. Legacy `webhooks` endpoints are always available.

#### Banking (Disabled)

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `banking/capabilities` | Feature capabilities gate |
| `GET` | `banking/accounts`, `.../transactions` | Accounts + history |
| `GET/POST` | `banking/beneficiaries` | Beneficiary management |
| `GET/POST` | `banking/transfers` | Transfer list + create |
| `POST` | `banking/transfers/:id/confirm` | Confirm (requires security action) |
| `POST` | `banking/fx-quotes` | FX rate quotes |
| `GET` | `banking/statements` | Account statements |

> **Banking is currently disabled** (`capabilities.banking = false`). All banking sub-pages render placeholder "Coming Soon" states. Endpoint definitions exist in `endpoints.ts` for when the module is activated.

#### Security & Admin

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `security/purposes` | Available challenge purposes |
| `POST` | `security/challenges/request` | Request 6-digit email OTP |
| `POST` | `security/challenges/verify` | Verify OTP → `actionToken` |
| `POST` | `security/email/complete` | Complete email verification |
| `GET` | `admin/merchants`, `admin/kyc` | Merchant directory + KYC queue |
| `GET` | `admin/health`, `admin/revenue` | System health + revenue |
| `GET/POST` | `admin/merchant-payouts`, `.../:id/*` | Payout management |
| `GET` | `admin/settlements` | Platform-wide settlements |
| `GET` | `admin/gateways` | Gateway configurations |

---

## Security Model

### Authentication Flow

1. User submits credentials to `POST /auth/login`
2. Server returns `{ success: true, data: { token, merchant } }` — JWT + merchant profile
3. Token stored **in memory** (Zustand with localStorage persistence + Axios interceptor variable)
4. On refresh: Zustand `persist` rehydrates from localStorage → validates via `GET /auth/me`
5. Invalid tokens cleared immediately on any `401`

### JWT Lifecycle

| Event | Behaviour |
|---|---|
| **Login** | Token in memory + Zustand (persisted to localStorage) |
| **Page refresh** | Rehydrated → validated via `GET /auth/me` |
| **401** | In-memory token nulled, Zustand cleared, redirect to `/login` |
| **403** | Session preserved (access denied, not a session issue) |
| **Logout** | Server invalidation + client memory/storage clear |
| **Network error** | Session preserved — retry available |

> **No refresh tokens.** A `401` always requires re-authentication.

### Error Handling

All Axios errors normalised into `ApiError`:

```typescript
interface ApiError { message: string; code?: string; status?: number; }
```

| HTTP | Derived Code | UI Behaviour |
|---|---|---|
| `401` | — | Clear session, redirect to login |
| `403` | — | Preserve session, show "Access denied" |
| `409` | `CONFLICT` | "Resource conflict" |
| `429` | `RATE_LIMITED` | "Too many requests" |
| `503` | `SERVICE_UNAVAILABLE` | "Service temporarily unavailable" |
| Network | `ERR_NETWORK` / `ECONNABORTED` | Preserve session, show retry |

### API Keys v2

Strict **reveal-once** policy:
- `GET /developer/api-keys` — metadata only (prefix, last 4 chars). `fullKey` never included.
- `POST /developer/api-keys` — `fullKey` returned once. Never persisted to storage.
- `POST /developer/api-keys/:id/rotate` — old key invalidated, new `fullKey` returned once.
- `POST /developer/api-keys/:id/revoke` — permanent disable.

Key creation and rotation require a completed security challenge (OTP → `actionToken` → `X-Security-Action` header).

### Webhooks

- **Legacy**: CRUD at `/webhooks` (always available)
- **Merchant v2**: CRUD at `/merchant/webhooks` with delivery health metrics (`last24h`, `avgLatencyMs`) and secret rotation via security action
- **Provider v2**: Read-only at `/provider/webhooks`

### Security Challenges

Sensitive operations require a completed challenge flow:

1. `GET /security/purposes` → list available purposes
2. `POST /security/challenges/request` → 6-digit email OTP sent
3. `POST /security/challenges/verify` → `actionToken` returned
4. `actionToken` passed as `X-Security-Action` header on the protected request

Token held **in memory only** — never persisted.

Applies to: API key creation/rotation, transfer confirmation, email verification, webhook secret rotation.

---

## Key Features

### Merchant Dashboard
- **Real-time analytics** — KPI cards, volume charts, transaction breakdowns
- **Payment management** — search, filtering, and detail views for transactions
- **Merchant financial semantics** — fees displayed as costs (never revenue); gross/costs/net separated; wallet buckets (balance, available, reserved, pending) distinct from processing metrics
- **8-card wallet overview** — Total balance, Gross processed, Recorded fees, Net after fees, Pending release, Available for payout, Reserved, Already paid
- **Multi-wallet support** — balance tracking, movement history, deposits, payouts, swaps
- **Payout engine** — summary panel (total paid, in review, reserved, next release), validation, FX quotes, idempotent creation, capability gating
- **Settlements with release calendar** — batch listing, partial release support (scheduled/released/remaining), release availability forecast
- **Multi-store management** — per-store configurations and API key scoping
- **Products, invoices, subscriptions, payment links** — full catalogue management
- **FX & Treasury** — currency conversion, treasury overview with charts

### Developer Tools
- **API Keys v2** — live/test environments, scope management, reveal-once security
- **Webhook management** — legacy CRUD + v2 with delivery health monitoring and secret rotation
- **SDK documentation** — syntax-highlighted code snippets (cURL, JavaScript, Python)
- **In-app code examples** for rapid integration

### Admin Console
- **Merchant directory**, **KYC review queue**, **payout management** (approve/reject/process)
- **System monitoring** — health checks, workers, queues, logs
- **Platform Revenue analytics** — platform take rate (semantically distinct from Merchant cost labels), merchant contribution, regional breakdown
- **Feature flag management**, **gateway configurations**
- **Admin guard** — role-gated access via `GET /platform/capabilities` or fallback probe

### Advisory
- Services, cases, documents, and messages (gated by `capabilities.advisoryCases`, etc.)

### UX & Infrastructure
- **Dark mode** (default) with theme toggle (next-themes, class-based)
- **PWA** — installable with app shortcuts (Dashboard, Payments, Wallets, New Payout)
- **i18n** — 4 languages, automatic browser detection, persisted user preference
- **Responsive** — mobile-first with collapsible sidebar + command palette (`⌘K`)
- **Route guards** — `MerchantGuard` (auth) + `AdminGuard` (role)
- **Toast notifications** (Sonner), skeleton loaders, ARIA attributes, keyboard navigation
- **Command palette** — fuzzy search across navigation, stores, and quick actions

---

## Module Status

| Module | Status | Notes |
|---|---|---|
| Commerce (Overview, Payments, Wallets, Stores, Products) | ✅ Active | Full CRUD where applicable |
| Wallets | ✅ Active | 8-card summary (balance/gross/fees/net/pending/available/reserved/paid) |
| Payouts | ✅ Active | Summary panel + validation + idempotent creation + admin workflow + capability gating |
| Settlements | ✅ Active | Overview stats + batch listing + release calendar + partial release support |
| Customers | ✅ Active | Read-only directory |
| Invoices, Subscriptions, Payment Links | ✅ Active | Read-only listings |
| FX & Treasury | ✅ Active | Wallet swaps, treasury analytics |
| API Keys (v1 + v2) | ✅ Active | Full lifecycle with security challenges |
| Webhooks (Legacy + v2) | ✅ Active | v2 endpoints may 404 if backend not ready |
| Admin Console | ✅ Active | Gated by admin role detection |
| Advisory | ⚠️ Partial | Services visible; cases/documents/messages gated |
| Banking | 🔒 Disabled | `capabilities.banking = false`; all sub-pages are placeholders |

---

## Development

### Prerequisites

- **Node.js** 18+ or **Bun** latest
- **npm** or **bun** package manager

### Environment Variables

Create `.env.local`:

```env
# API base URL (required)
NEXT_PUBLIC_API_URL=https://api.xpay.expert/api/v1
```

| Variable | Description | Default |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | Backend API base URL | `https://api.xpay.expert/api/v1` |

### Getting Started

```bash
# Install dependencies
bun install

# Start development server (port 3000)
bun run dev
```

### Lint & Typecheck

```bash
# ESLint
bun run lint

# TypeScript type checking
npx tsc --noEmit

# Production build (standalone output)
bun run build
```

---

## Project Structure

```
src/
├── app/                           # App Router pages & layouts
│   ├── (auth)/                    # Login, register
│   ├── (dashboard)/               # All authenticated pages
│   │   ├── commerce/              # Payments, wallets, payouts, stores, products...
│   │   ├── banking/               # Accounts, transfers, FX, beneficiaries... (disabled)
│   │   ├── developers/            # API keys v2, webhooks, docs
│   │   ├── advisory/              # Services, cases, documents, messages
│   │   └── admin/                  # KYC, risk, revenue, commerce, system
│   ├── (protected)/               # commerce, developers, marketplace, money
│   └── api/                       # Next.js API routes
│
├── components/
│   ├── ui/                        # shadcn/ui primitives (50+)
│   ├── landing/                   # Public landing page
│   ├── auth/                      # Authentication screens
│   ├── merchant/                  # Dashboard widgets (20+)
│   ├── dashboard/                 # Shell, merchant-guard, admin-guard
│   ├── admin/                     # Admin panels (15+)
│   ├── shared/                    # Reusable components (badges, charts, etc.)
│   └── pwa-register.tsx           # PWA install prompt
│
├── lib/
│   ├── api/                       # client, private-client, public-client,
│   │                               #   endpoints, xpApi, capabilities-api, mock
│   ├── i18n/                      # index.ts (store, useT), locales.ts (dictionaries)
│   ├── pwa/register-sw.ts         # Service worker registration
│   ├── storage/xp-storage.ts       # Storage management & legacy key migration
│   ├── sdk-snippets.ts            # SDK code templates (cURL, JS, Python)
│   └── utils.ts                   # General utilities (cn, formatCurrency, etc.)
│
├── types/                         # index (870+ lines), security, developer-v2, banking
├── stores/                        # auth, platform, workspace, ui, admin (Zustand)
├── hooks/                         # use-queries, queries, use-mobile, use-toast
├── config/                        # Navigation, feature-flags, contacts
└── providers/app-providers.tsx    # Root providers (QueryClient + ThemeProvider)
```

---

## Internationalisation (i18n)

4 languages with client-side locale switching:

| Code | Language |
|---|---|
| `en` | English (default) |
| `pt-BR` | Portuguese (Brazil) |
| `fr` | French |
| `es` | Spanish |

- **Store**: Zustand + `persist` (key: `xp-locale`)
- **Detection**: Browser language → timezone → `en`
- **Usage**: `useT()` hook returns `t(key)` for active locale
- **Dictionaries**: `src/lib/i18n/locales.ts`
- **Component**: `src/components/shared/language-switcher.tsx`

```typescript
import { useT } from "@/lib/i18n";
function MyComponent() {
  const t = useT();
  return <h1>{t("nav.dashboard")}</h1>;
}
```

Persisted user choices are never overridden by auto-detection.

---

## PWA Support

Fully installable Progressive Web App:

- **Manifest**: `src/app/manifest.ts` — name, icons (SVG + 192/512 + maskable), theme (`#0B1220`)
- **Service Worker**: `public/sw.js` — caching & offline support
- **Shortcuts**: Dashboard, Payments, Wallets, New Payout
- **Install Prompt**: `src/components/pwa-register.tsx`
- **Display**: `standalone` mode with `minimal-ui` fallback
- **Categories**: finance, business, productivity, developer

---

## Deployment

### Build

Next.js `standalone` output for minimal deployment:

```bash
bun run build
# Output: .next/standalone/ (self-contained server)
# Build script copies public/ assets and .next/static/ into standalone dir
```

### Environments

| Environment | `NEXT_PUBLIC_API_URL` |
|---|---|
| Production | `https://api.xpay.expert/api/v1` |
| Staging | `https://staging-api.xpay.expert/api/v1` |
| Development | `https://api.xpay.expert/api/v1` |

### Production Run

```bash
NODE_ENV=production node .next/standalone/server.js
```

### Checklist

1. Set `NEXT_PUBLIC_API_URL` for target environment
2. Ensure API is accessible from deployment origin (CORS)
3. Copy `public/` assets with standalone output (handled by build script)
4. Run the standalone server

---

## License

Proprietary. All rights reserved. This software is the confidential and proprietary information of XPAY.Expert. Unauthorized copying, distribution, or modification is strictly prohibited.
