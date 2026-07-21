# Task 3 — Merchant Payout Wizard, List & Detail Pages

## Files Created

### 1. `/src/app/(dashboard)/commerce/payouts/page.tsx` — Payout List Page
- "use client" page using `useMerchantPayouts(filters)` hook
- **Filter bar**: Status dropdown (all 7 statuses), Method dropdown (5 methods), Currency dropdown (6 currencies), Refresh button
- **Desktop table** with columns: Ticket (monospace primary), Requested date, Source amount + currency, Payout amount + currency, Method, Beneficiary, Status (colored badge), FX status
- **Mobile card layout** showing key info in 2x2 grid, hidden on md+
- **Status badges** with correct colors: pending_review=amber, fx_pending=orange, approved=blue, processing=blue, paid=green, rejected=red, cancelled=gray
- **Pagination** with page/total display and prev/next buttons
- **Empty state** with Inbox icon, contextual message based on active filters, and CTA
- **Loading skeletons** for both table and card views
- **Error state** with retry button
- "New Payout" button navigates to `/commerce/payouts/new`
- Each row/card is clickable → navigates to `/commerce/payouts/[id]`
- Client-side filtering for method and currency on top of server-side status filter

### 2. `/src/app/(dashboard)/commerce/payouts/new/page.tsx` — 5-Step Payout Wizard
- **State machine**: source → destination → validation → confirmation → created
- **Step indicator** at top showing all 5 steps with icons, connecting lines, and active/completed states
- **Step 1 — Source**: Wallet selector (settlement type only), amount input with currency suffix, balance display, validation (amount > 0, ≤ available)
- **Step 2 — Destination**: Method selector cards (SEPA_INSTANT, PIX, USDT_TRC20, USDT_ERC20, MANUAL) with icons and descriptions. Dynamic form fields per method:
  - SEPA: beneficiaryName*, IBAN*, BIC, bankName, country*, paymentReference
  - PIX: beneficiaryName*, keyType* (CPF/CNPJ/EMAIL/PHONE/EVP), keyValue*, taxId, bankName, country (fixed Brazil)
  - USDT_TRC20/ERC20: beneficiaryName*, walletAddress*, network (read-only)
  - MANUAL: beneficiaryName*, country*, network*, instructions* (textarea)
- **Step 3 — Validation**: Calls `useValidateMerchantPayout()`, shows loading/error/success states, displays source/payout amounts, FX status, initial status, available after reservation, destination summary. Error state with retry.
- **Step 4 — Confirmation**: WARNING card about reservation, full summary of all details, "Create Payout" button. Idempotency key generated ONCE via `crypto.randomUUID()` stored in `useRef`. Retries reuse same key. Error display includes error.code.
- **Step 5 — Created**: Success icon, ticket code, status, reserved amount, method, beneficiary, FX notice. "View Payout" and "Create Another" buttons.
- **Security**: No localStorage/Zustand for destination data, no console logging of sensitive data, all state cleared on completion/cancel
- **No `any` type** used

### 3. `/src/app/(dashboard)/commerce/payouts/[id]/page.tsx` — Payout Detail Page
- Uses `useMerchantPayout(id)` with id from `useParams()`
- **Back button** to `/commerce/payouts`
- **Financial Summary card**: Source amount/currency, payout amount/currency, method, network, FX details (required, status, rate, provider, reference)
- **Status card**: Current status with colored badge, created/updated timestamps, review note, rejection reason (in red alert box)
- **Destination card**: Full method-specific fields (IBAN, BIC, PIX key, wallet address, etc.) via `DestinationDetails` component
- **References card**: Ticket code, idempotency key, provider reference, external reference, ledger domain, merchant name — all with copy-to-clipboard buttons
- **Timeline**: Derived from non-null timestamps (createdAt, reviewedAt, approvedAt, processingAt, paidAt, rejectedAt, cancelledAt). Only shows actual timestamps. No invented events. Vertical line with icons and colors.
- **Cancel Payout**: AlertDialog confirmation, only visible for `pending_review` or `fx_pending` status, calls `useCancelMerchantPayout()` mutation
- **States**: Loading skeleton (4 cards), error state with retry, "Payout not found" empty state
- **No `any` type** used

## Lint/TypeScript Results
- All 3 new files pass ESLint with zero errors
- All 3 new files pass TypeScript type checking with zero errors
- Pre-existing errors in other files (admin routes, etc.) are unrelated