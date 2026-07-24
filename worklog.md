---
Task ID: 2
Agent: Main Agent
Task: Replace cube with interactive 3D globe network + payment toasts

Work Log:
- Analyzed uploaded video (Maquete reference) with VLM — identified as dark globe with glowing cyan connection arcs
- Video file lost during branch switch (OSS mount issue) — created superior web-based 3D alternative
- Built interactive 3D globe with Three.js: 21 cities, 25 animated arcs, 4000 dot field
- Arcs animate with draw-range progress and fade in/out cycles
- City nodes pulse with glow halos, pointer parallax interaction
- Preserved: live payment notification toasts (Pix, Visa, Apple Pay, Crypto)
- Preserved: bloom, vignette, noise post-processing
- Commit 9712c4c pushed to origin/feat/animated-cube-hero

Stage Summary:
- Cube replaced by interactive globe network visualization
- Payment toasts integrated over globe
- PR #1 on GitHub updated with new commit

---
Task ID: 3
Agent: Task 3 Agent
Task: Backend contract alignment — types, hooks, endpoints, pages

Work Log:
- Updated src/types/index.ts: added totalPending to WalletSummary, extended Settlement status union (pending_provider, pending_review, held, ready, released), updated MerchantPayoutOptions to match backend wrapper contract, added RawSettlementBatch, SettlementOverview, TransactionStatsExtended types
- Updated src/lib/api/endpoints.ts: changed settlement list URL from merchant/settlements to settlements/batches, added settlementOverviewEndpoints (GET settlements/overview), imported SettlementOverview type
- Updated src/hooks/use-queries.ts: added settlementOverviewEndpoints import, added settlementOverview query key, added normalizeSettlementBatch function for snake_case→camelCase normalization, replaced useSettlements to normalize {items, pagination} wrapper, added useSettlementOverview hook with dual camelCase/snake_case field support, rewrote useWallets to normalize all numeric fields with toFiniteNumber, updated useMerchantPayoutOptions to unwrap directly, updated useValidateMerchantPayout to unwrap {validation}, updated useCreateMerchantPayout to unwrap {payout, idempotentReplay}, updated useMerchantPayouts to unwrap {items, pagination}, updated useMerchantPayout to unwrap {payout}
- Rewrote src/app/(dashboard)/commerce/wallets/page.tsx: 7 StatCards (Saldo total, Bruto processado, Taxas registadas, Liquido apos taxas, Pendente de liquidacao, Disponivel para payout, Reservado), uses both useWallets and useTransactionStats, currency badge, reconciliation pending alert, feeBasis-aware labels, explanation Alert
- Rewrote src/app/(dashboard)/commerce/settlements/page.tsx: 7 overview StatCards from useSettlementOverview, updated STATUS_OPTIONS and statusConfig with 7 new statuses (pending_provider, pending_review, held, ready, released + fallbacks), Alert when ledger not yet reconstructed, table column rename XPAY Fee→Platform Fee
- Updated src/app/(dashboard)/commerce/payouts/page.tsx: added usePlatformBootstrap capability check, disabled New Payout button when merchantPayouts not enabled, added info Alert for pending capability
- Created src/components/shared/capability-placeholder-page.tsx: reusable placeholder with lock icon, reason, planned modules badges, back button
- Exported CapabilityPlaceholderPage from src/components/shared/index.tsx
- Created src/app/(dashboard)/banking/overview/page.tsx and src/app/(dashboard)/advisory/overview/page.tsx using CapabilityPlaceholderPage
- Updated src/components/dashboard/shell.tsx ProductSwitcher: added usePlatformCapabilities hook, capability-gated navigation for banking/advisory with toast notifications, "Em breve" badge for disabled areas in dropdown
- Updated src/lib/i18n/locales.ts: added nav.settlements, nav.payouts, nav.accounts, nav.transactions, nav.liquidity, nav.compliance, nav.credit, nav.portfolio, nav.insights, nav.riskAssessment, nav.alerts, nav.recommendations, nav.reports, nav.auditLog, sec.treasury, sec.lending, sec.riskCompliance, sec.reports to all 4 locale blocks (EN, PT-BR, FR, ES)
- Fixed downstream type compatibility in commerce/overview/page.tsx and commerce/payouts/new/page.tsx for useWallets shape change
- Fixed duplicate released key in settlements statusConfig
- Fixed MerchantPayoutOptions usage in payouts/new to handle object-based methods array

Stage Summary:
- All hooks now properly normalize snake_case API responses with toFiniteNumber
- Settlements endpoint changed to settlements/batches with new overview endpoint
- Wallets page enriched with 7 financial stat cards and transaction stats integration
- Settlements page shows overview stats and handles unreconstructed ledger gracefully
- Payouts page capability-gated via platform bootstrap
- Banking and advisory overview pages use CapabilityPlaceholderPage
- Product switcher capability-aware with toast feedback
- All 4 i18n locales updated with new nav and section keys

---
Task ID: 4
Agent: Main Agent
Task: Finance UI semantic corrections — analytics, fees, payouts, release calendar

Work Log:
- Updated src/types/index.ts: added SettlementBatchStatus union type, extended RawSettlementBatch with partial release fields (scheduled_amount, released_amount, remaining_amount, scheduled_for), feeBasis/feeClassification/feeReconciliationStatus fields; extended Settlement with storeCode, partial release fields, feeBasis, feeClassification; extended SettlementOverview with scheduled/partiallyReleased/ready/cancelled counts, totalScheduled/totalReleased/totalRemaining, nextScheduledDate/Amount, feeBasis/feeClassification; added ReleaseCalendarEntry and PayoutSummary types; extended TransactionStatsExtended with merchantCosts, feeClassification, feeReconciliationStatus, backend compatibility aliases (revenue, revenueSeries, grossVolumeSeries, costSeries, netSeries)
- Updated src/hooks/use-queries.ts: updated normalizeSettlementBatch to include storeCode, partial release fields, feeBasis, feeClassification; updated useSettlementOverview to include all new release calendar fields; added useMerchantPayoutSummary hook (derives totalPaid, inReviewCount, reservedCount, totalReserved from payout list)
- Rewrote src/app/(dashboard)/commerce/wallets/page.tsx: expanded to 8 StatCards (added "Ja pago" / Already Paid); feeClassification-aware label logic (merchant_cost_unclassified shows "Taxas registadas — classificacao em reconciliacao"); legacy_recorded_fee shows "Taxas historicas registadas"; enhanced disclaimer Alert explaining net after fees vs wallet balance distinction; added isUnclassifiedFee badge
- Rewrote src/app/(dashboard)/commerce/settlements/page.tsx: added 8 overview StatCards (added Total agendado para liberacao, Valor remanescente); added Release Calendar section with partial release support (scheduled/released/remaining); added status configs for scheduled, partially_released, cancelled; table columns renamed "Provider Fee"/"Platform Fee" → "Processing Costs" (single merged column); added Released column with partial release display; added release disclaimer Alert; merchant semantic explanation in info Alert
- Rewrote src/app/(dashboard)/commerce/payouts/page.tsx: added 6-card summary panel (Total ja pago, Payouts em analise, Payouts reservados, Total reservado, Proxima liberacao prevista, Total de payouts pagos); security gating shows history but disables creation when capability false; enhanced capability Alert with explicit security messaging
- Fixed fee terminology audit: changed "Revenue" to "Volume" in commerce stores page (merchant view); Admin Revenue page keeps "Revenue" label (platform perspective)
- Updated src/lib/i18n/locales.ts: added 24 finance-specific translation keys (fin.*) in all 4 locales (EN, PT-BR, FR, ES) covering fee labels, wallet labels, payout labels, release calendar labels, disclaimers
- Updated README.md: corrected API endpoints (settlements/batches, settlements/overview), added transactions/stats endpoint; added merchant financial semantics description; updated Key Features with 8-card wallet, payout summary, release calendar; updated Module Status table with detailed notes; clarified Admin Revenue semantic separation
- Validated: tsc --noEmit passes for all changed files; ESLint passes clean

Stage Summary:
- Fees NEVER appear as "Revenue" in any Merchant view (wallets, settlements, payouts, stores, overview)
- Gross/costs/net are presented as separate distinct metrics
- Wallet buckets (balance, available, reserved, pending) are separated from processing metrics (gross, fees, net)
- Paid out amounts shown as historical outflow, not mixed with wallet balance
- Release calendar supports partial releases with scheduled/released/remaining amounts
- Settlements support 6 new statuses (scheduled, partially_released, cancelled + existing)
- Payout summary panel shows 6 derived metrics from payout list
- Security: when merchantPayouts capability is false, history is shown but creation is disabled
- Backend compatibility: frontend prefers new fields (grossVolume, recordedFees, netAfterRecordedFees) but accepts legacy aliases
- Admin Revenue page uses correct "Platform Revenue" semantics, separated from Merchant cost labels
- All 4 i18n locales have 24+ finance keys for consistent labeling
