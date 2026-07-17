/**
 * XPay — Contact configuration
 * Update these values to change contact info across the app.
 */
export const CONTACTS = {
  telegram: {
    channel: "@XPay_Expert",
    channelUrl: "https://t.me/XPay_Expert",
    manager: "@XPay_Manager",
    managerUrl: "https://t.me/XPay_Manager",
  },
  discord: {
    url: "https://discord.gg/UCf6zscQSw",
    label: "XPay Community",
  },
  whatsapp: {
    number: "5562992887416",
    label: "+55 62 99288-7416",
    url: "https://wa.me/5562992887416",
  },
  email: {
    address: "contact@xpay.expert",
    url: "mailto:contact@xpay.expert",
  },
} as const;

export const SUPPORT_SERVICES = [
  {
    icon: "Zap",
    title: "Payments Infrastructure",
    description: "Accept cards, Pix, MBWay, Bizum and crypto through a single API. 120+ currencies, 45 countries.",
  },
  {
    icon: "Wallet",
    title: "Multi-Currency Wallets",
    description: "Hold, convert and settle in EUR, USD, BRL, GBP, USDT and BTC. Real-time FX at mid-market rates.",
  },
  {
    icon: "ShieldCheck",
    title: "Risk & Compliance",
    description: "AI-powered fraud scoring, velocity rules, chargeback protection. PCI DSS Level 1, SOC 2 Type II.",
  },
  {
    icon: "Code2",
    title: "Developer Platform",
    description: "Typed SDKs (Node, Python, PHP, Go), webhooks, API explorer. Go from signup to first payment in minutes.",
  },
  {
    icon: "Banknote",
    title: "Treasury & FX",
    description: "Unified liquidity, reserves, cashflow. Hedge exposure across currencies with instant settlement.",
  },
  {
    icon: "BarChart3",
    title: "Analytics & Insights",
    description: "Revenue, conversion funnels, country breakdown, payment method distribution. Real-time dashboards.",
  },
] as const;
