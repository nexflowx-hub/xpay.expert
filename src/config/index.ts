import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  Wallet,
  ArrowLeftRight,
  Banknote,
  Landmark,
  Store,
  Package,
  Users,
  Repeat,
  Link2,
  FileText,
  BarChart3,
  ShieldCheck,
  Code2,
  KeyRound,
  Webhook,
  Settings,
  LifeBuoy,
  Receipt,
  Building2,
  ScrollText,
  Server,
  Flag,
  Activity,
  Cpu,
  Gauge,
  Wallet2,
  Send,
  CreditCard,
  PiggyBank,
  BookOpen,
  Briefcase,
  TrendingUp,
  AlertTriangle,
  HandCoins,
  Lock,
  CircleDollarSign,
  FileCheck,
  Scale,
} from "lucide-react";

export interface NavItem {
  id: string;
  label: string;
  /** i18n key for the label, e.g. "nav.dashboard" */
  tKey?: string;
  icon: LucideIcon;
  badge?: string;
  /** Real route path for navigation */
  route: string;
}

export interface NavSection {
  id: string;
  label: string;
  /** i18n key for the section label, e.g. "sec.overview" */
  tKey?: string;
  items: NavItem[];
}

export type ProductArea = "commerce" | "banking" | "advisory" | "admin";

export interface ProductConfig {
  id: ProductArea;
  label: string;
  tKey?: string;
  /** Accent gradient: from/to */
  accentFrom: string;
  accentTo: string;
  /** Text color for accent */
  accentText: string;
  /** Route prefix for this product */
  routePrefix: string;
}

export const PRODUCT_AREAS: ProductConfig[] = [
  {
    id: "commerce",
    label: "Commerce",
    tKey: "product.commerce",
    accentFrom: "from-primary",
    accentTo: "to-primary/40",
    accentText: "text-primary",
    routePrefix: "/commerce",
  },
  {
    id: "banking",
    label: "Banking",
    tKey: "product.banking",
    accentFrom: "from-emerald-500",
    accentTo: "to-emerald-500/40",
    accentText: "text-emerald-400",
    routePrefix: "/banking",
  },
  {
    id: "advisory",
    label: "Advisory",
    tKey: "product.advisory",
    accentFrom: "from-amber-500",
    accentTo: "to-amber-500/40",
    accentText: "text-amber-400",
    routePrefix: "/advisory",
  },
  {
    id: "admin",
    label: "Admin",
    tKey: "product.admin",
    accentFrom: "from-rose-500",
    accentTo: "to-rose-500/40",
    accentText: "text-rose-400",
    routePrefix: "/admin",
  },
];

export const commerceNav: NavSection[] = [
  {
    id: "overview", label: "Overview", tKey: "sec.overview",
    items: [
      { id: "dashboard", label: "Dashboard", tKey: "nav.dashboard", icon: LayoutDashboard, route: "/commerce/overview" },
      { id: "analytics", label: "Analytics", tKey: "nav.analytics", icon: BarChart3, route: "/insights" },
      { id: "risk", label: "Risk Center", tKey: "nav.risk", icon: ShieldCheck, route: "/risk" },
    ],
  },
  {
    id: "money", label: "Money Movement", tKey: "sec.money",
    items: [
      { id: "payments", label: "Payments", tKey: "nav.payments", icon: Receipt, route: "/commerce/payments" },
      { id: "wallets", label: "Wallets", tKey: "nav.wallets", icon: Wallet, route: "/commerce/wallets" },
      { id: "settlements", label: "Settlements", tKey: "nav.settlements", icon: PiggyBank, route: "/commerce/settlements" },
      { id: "payouts", label: "Payouts", tKey: "nav.payouts", icon: Send, route: "/commerce/payouts" },
    ],
  },
  {
    id: "commerce", label: "Commerce", tKey: "sec.commerce",
    items: [
      { id: "stores", label: "Stores", tKey: "nav.stores", icon: Store, route: "/commerce/stores" },
      { id: "products", label: "Products", tKey: "nav.products", icon: Package, route: "/commerce/products" },
      { id: "customers", label: "Customers", tKey: "nav.customers", icon: Users, route: "/commerce/customers" },
      { id: "subscriptions", label: "Subscriptions", tKey: "nav.subscriptions", icon: Repeat, route: "/commerce/subscriptions" },
      { id: "payment-links", label: "Payment Links", tKey: "nav.paymentLinks", icon: Link2, route: "/commerce/payment-links" },
      { id: "invoices", label: "Invoices", tKey: "nav.invoices", icon: FileText, route: "/commerce/invoices" },
    ],
  },
  {
    id: "developers", label: "Developers", tKey: "sec.developers",
    items: [
      { id: "developers", label: "Overview", tKey: "nav.developers", icon: Code2, route: "/developers/overview" },
      { id: "api-keys", label: "API Keys", tKey: "nav.apiKeys", icon: KeyRound, route: "/developers/api-keys" },
      { id: "webhooks", label: "Webhooks", tKey: "nav.webhooks", icon: Webhook, route: "/developers/webhooks" },
      { id: "docs", label: "Docs", tKey: "nav.docs", icon: BookOpen, route: "/developers/docs" },
    ],
  },
  {
    id: "system", label: "System", tKey: "sec.system",
    items: [
      { id: "settings", label: "Settings", tKey: "nav.settings", icon: Settings, route: "/settings" },
      { id: "support", label: "Support", tKey: "nav.support", icon: LifeBuoy, route: "/support" },
    ],
  },
];

export const bankingNav: NavSection[] = [
  {
    id: "banking-overview", label: "Overview", tKey: "sec.overview",
    items: [
      { id: "banking-dashboard", label: "Dashboard", tKey: "nav.dashboard", icon: LayoutDashboard, route: "/banking/overview" },
      { id: "banking-accounts", label: "Accounts", tKey: "nav.accounts", icon: Landmark, route: "/banking/accounts" },
      { id: "banking-transactions", label: "Transactions", tKey: "nav.transactions", icon: CreditCard, route: "/banking/transactions" },
    ],
  },
  {
    id: "banking-treasury", label: "Treasury", tKey: "sec.treasury",
    items: [
      { id: "banking-fx", label: "FX", tKey: "nav.fx", icon: ArrowLeftRight, route: "/banking/fx" },
      { id: "banking-liquidity", label: "Liquidity", tKey: "nav.liquidity", icon: CircleDollarSign, route: "/banking/liquidity" },
      { id: "banking-compliance", label: "Compliance", tKey: "nav.compliance", icon: FileCheck, route: "/banking/compliance" },
    ],
  },
  {
    id: "banking-lending", label: "Lending", tKey: "sec.lending",
    items: [
      { id: "banking-credit", label: "Credit", tKey: "nav.credit", icon: Briefcase, route: "/banking/credit" },
      { id: "banking-portfolio", label: "Portfolio", tKey: "nav.portfolio", icon: TrendingUp, route: "/banking/portfolio" },
    ],
  },
];

export const advisoryNav: NavSection[] = [
  {
    id: "advisory-overview", label: "Overview", tKey: "sec.overview",
    items: [
      { id: "advisory-dashboard", label: "Dashboard", tKey: "nav.dashboard", icon: LayoutDashboard, route: "/advisory/overview" },
      { id: "advisory-insights", label: "Insights", tKey: "nav.insights", icon: BarChart3, route: "/advisory/insights" },
    ],
  },
  {
    id: "advisory-risk", label: "Risk & Compliance", tKey: "sec.riskCompliance",
    items: [
      { id: "advisory-risk-assessment", label: "Risk Assessment", tKey: "nav.riskAssessment", icon: Scale, route: "/advisory/risk-assessment" },
      { id: "advisory-alerts", label: "Alerts", tKey: "nav.alerts", icon: AlertTriangle, route: "/advisory/alerts" },
      { id: "advisory-recommendations", label: "Recommendations", tKey: "nav.recommendations", icon: TrendingUp, route: "/advisory/recommendations" },
    ],
  },
  {
    id: "advisory-reports", label: "Reports", tKey: "sec.reports",
    items: [
      { id: "advisory-reports-overview", label: "Reports", tKey: "nav.reports", icon: FileText, route: "/advisory/reports" },
      { id: "advisory-audit", label: "Audit Log", tKey: "nav.auditLog", icon: Lock, route: "/advisory/audit" },
    ],
  },
];

export const adminNav: NavSection[] = [
  {
    id: "platform", label: "Platform", tKey: "sec.platform",
    items: [
      { id: "admin-dashboard", label: "Overview", tKey: "nav.adminDashboard", icon: LayoutDashboard, route: "/admin" },
      { id: "admin-merchants", label: "Merchants", tKey: "nav.adminMerchants", icon: Building2, route: "/admin/commerce/merchants" },
      { id: "admin-kyc", label: "KYC Queue", tKey: "nav.adminKyc", icon: ScrollText, route: "/admin/kyc" },
      { id: "admin-revenue", label: "Revenue", tKey: "nav.adminRevenue", icon: Banknote, route: "/admin/revenue" },
    ],
  },
  {
    id: "ops", label: "Operations", tKey: "sec.ops",
    items: [
      { id: "admin-payouts", label: "Payouts", tKey: "nav.payouts", icon: HandCoins, route: "/admin/commerce/payouts" },
      { id: "admin-settlements", label: "Settlements", tKey: "nav.settlements", icon: PiggyBank, route: "/admin/commerce/settlements" },
      { id: "admin-gateways", label: "Gateways", tKey: "nav.adminGateways", icon: Server, route: "/admin/commerce/gateways" },
      { id: "admin-risk", label: "Risk", tKey: "nav.adminRisk", icon: ShieldCheck, route: "/admin/risk" },
    ],
  },
  {
    id: "infra", label: "Infrastructure", tKey: "sec.infra",
    items: [
      { id: "admin-health", label: "System Health", tKey: "nav.adminHealth", icon: Gauge, route: "/admin/system/health" },
      { id: "admin-workers", label: "Workers", tKey: "nav.adminWorkers", icon: Cpu, route: "/admin/system/workers" },
      { id: "admin-queues", label: "Queues", tKey: "nav.adminQueues", icon: Activity, route: "/admin/system/queues" },
      { id: "admin-logs", label: "Logs", tKey: "nav.adminLogs", icon: FileText, route: "/admin/system/logs" },
      { id: "admin-flags", label: "Feature Flags", tKey: "nav.adminFlags", icon: Flag, route: "/admin/system/feature-flags" },
    ],
  },
];

/** Map from product area to its nav sections */
export const NAV_MAP: Record<ProductArea, NavSection[]> = {
  commerce: commerceNav,
  banking: bankingNav,
  advisory: advisoryNav,
  admin: adminNav,
};

/** Get the product area from a pathname */
export function getProductAreaFromPath(pathname: string): ProductArea {
  if (pathname.startsWith("/admin")) return "admin";
  if (pathname.startsWith("/banking")) return "banking";
  if (pathname.startsWith("/advisory")) return "advisory";
  return "commerce";
}

export const PAYMENT_METHODS = [
  { id: "visa", label: "Visa", color: "#1A1F71" },
  { id: "mastercard", label: "Mastercard", color: "#EB001B" },
  { id: "pix", label: "Pix", color: "#00B89C" },
  { id: "apple_pay", label: "Apple Pay", color: "#FFFFFF" },
  { id: "google_pay", label: "Google Pay", color: "#4285F4" },
  { id: "mbway", label: "MBWay", color: "#00B14E" },
  { id: "bizum", label: "Bizum", color: "#00B8A9" },
  { id: "crypto", label: "Crypto", color: "#F7931A" },
  { id: "sepa", label: "SEPA", color: "#003399" },
] as const;

export const CURRENCIES = [
  { code: "EUR", symbol: "€", flag: "🇪🇺" },
  { code: "USD", symbol: "$", flag: "🇺🇸" },
  { code: "BRL", symbol: "R$", flag: "🇧🇷" },
  { code: "GBP", symbol: "£", flag: "🇬🇧" },
  { code: "USDT", symbol: "₮", flag: "◈" },
  { code: "BTC", symbol: "₿", flag: "◉" },
] as const;

export const COUNTRY_LIST = [
  "Portugal",
  "Brazil",
  "United States",
  "United Kingdom",
  "Germany",
  "France",
  "Spain",
  "Netherlands",
  "Ireland",
  "Singapore",
];

export const APP_NAME = "XPay.Expert";
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://api.xpay.expert/api/v1";