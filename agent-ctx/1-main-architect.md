# Task 1 — Core Layout, Navigation & Routing Infrastructure

## Agent: Main Architect

## Files Created/Modified

### Created (6 files)
1. **`/src/components/dashboard/merchant-guard.tsx`** — Client-side guard that checks `useAuth()` authentication. Redirects to `/login` if unauthenticated. Shows spinner during hydration/checking.

2. **`/src/components/dashboard/admin-guard.tsx`** — Client-side guard requiring both authentication AND `isPlatformAdmin === true` from admin store. On 403, shows "Access Denied" with retry option. **NEVER clears a valid session on 403.** Shows loading states during auth hydration and admin capability check.

3. **`/src/app/(dashboard)/layout.tsx`** — Wraps all `(dashboard)` routes with `MerchantGuard` → `DashboardShell`. This is the primary dashboard layout for Phase 3 file-based routing.

4. **`/src/app/(dashboard)/admin/layout.tsx`** — Wraps admin routes with `AdminGuard`. Nested inside `(dashboard)` so it gets both MerchantGuard (from parent) and AdminGuard (from this layout).

### Modified (8 files)
5. **`/src/config/index.ts`** — Complete rewrite of navigation config:
   - `commerceNav`: 5 sections with real unique routes (`/commerce/overview`, `/insights`, `/risk`, `/commerce/payments`, `/commerce/wallets`, `/commerce/settlements`, `/commerce/payouts`, `/commerce/stores`, `/commerce/products`, `/commerce/customers`, `/commerce/subscriptions`, `/commerce/payment-links`, `/commerce/invoices`, `/developers/overview`, `/developers/api-keys`, `/developers/webhooks`, `/developers/docs`, `/settings`, `/support`)
   - `bankingNav`: 3 sections (Overview, Treasury, Lending)
   - `advisoryNav`: 3 sections (Overview, Risk & Compliance, Reports)
   - `adminNav`: 3 sections with real unique routes (`/admin`, `/admin/commerce/merchants`, `/admin/kyc`, `/admin/revenue`, `/admin/commerce/payouts`, `/admin/commerce/settlements`, `/admin/commerce/gateways`, `/admin/risk`, `/admin/system/health`, `/admin/system/workers`, `/admin/system/queues`, `/admin/system/logs`, `/admin/system/feature-flags`)
   - `PRODUCT_AREAS` config with accent colors per product (commerce=primary, banking=emerald, advisory=amber, admin=rose)
   - `NAV_MAP`, `getProductAreaFromPath()` helper
   - Kept all existing exports: `PAYMENT_METHODS`, `CURRENCIES`, `COUNTRY_LIST`, `APP_NAME`, `API_BASE_URL`

6. **`/src/components/dashboard/shell.tsx`** — Complete rewrite:
   - **Product Switcher**: Dropdown at top of sidebar, switches between Commerce/Banking/Advisory/Admin (admin only if `isPlatformAdmin`). Each product has its own accent gradient color.
   - **Workspace Switcher**: Uses real data from `useAuth().user.company` and `useWorkspaceStore.stores`. Shows "All Stores" option + store list. NO hardcoded names.
   - **Notifications Panel**: Empty state with Bell icon — "No new notifications". NO hardcoded notification items.
   - **Navigation**: Uses `router.push(item.route)` for real file-based routing. Active state determined by pathname matching.
   - **Mode determination**: `getProductAreaFromPath(pathname)` — `/admin/**` → admin, `/banking/**` → banking, `/advisory/**` → advisory, rest → commerce.
   - **Sidebar**: Responsive with desktop (collapsible) and mobile (Sheet). Content changes based on product area.
   - **Command Palette**: Shows nav items for current product area without hardcoded quick actions.
   - **XpIA Chat, Language Switcher, Theme Toggle**: Retained.
   - Removed `mode` prop — now auto-detects from pathname.

7. **`/src/app/page.tsx`** — Updated root page:
   - If not authenticated: shows landing page (via `dynamic` import, not `lazy` inside render)
   - If authenticated: redirects to `/commerce/overview`
   - Network error handling retained
   - Bootstrap store hydration retained

8. **`/src/app/(protected)/money/page.tsx`** — Fixed broken `WalletsPageRoute` reference → now uses `redirect("/commerce/wallets")` (server-side redirect).

9. **`/src/app/(protected)/layout.tsx`** — Updated to redirect old Phase 2 routes to their new Phase 3 locations. Uses `OLD_ROUTE_REDIRECTS` map.

10. **`/src/app/(protected)/commerce/page.tsx`** — Fixed broken `StoresPageRoute` reference → now renders `StoresPage` directly.

11. **`/src/app/(protected)/insights/page.tsx`** — Fixed broken `AnalyticsPageRoute` reference → now renders `AnalyticsPage` directly.

12. **`/src/lib/api/xpApi.ts`** — Removed `refreshToken: token` from `mapEnvelopeToSession()`. `AuthSession` type no longer includes `refreshToken`.

13. **`/src/lib/api/client.ts`** — Updated comment to explicitly state 403 does NOT clear session. Code already only handled 401.

14. **`/src/lib/api/private-client.ts`** — Updated comment to explicitly state 403 does NOT clear session.

### Deleted (2 files)
15. **`/src/components/dashboard/view-router.tsx`** — Removed (replaced by file-based routing).
16. **`/src/components/dashboard/dashboard-guard.tsx`** — Removed (replaced by `merchant-guard.tsx`).

## Key Design Decisions
- `DashboardShell` no longer takes a `mode` prop — it auto-detects from `usePathname()`
- Product switcher navigates to the default route for each product area
- Admin guard probes `admin/merchant-payouts?limit=1` and never clears session on 403
- All nav items have unique `route` strings for proper `router.push()` navigation
- Legacy `(protected)` routes kept working with redirect mappings