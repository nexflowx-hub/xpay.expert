"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useRouter } from "next/navigation";
import {
  cn,
  formatCurrency,
  formatNumber,
  formatPercent,
} from "@/lib/utils";
import { APP_NAME, PAYMENT_METHODS } from "@/config";
import { PAYMENT_LOGOS } from "@/components/shared/payment-logos";
import { XSymbol } from "@/components/shared/x-symbol";
import { sdkSnippets } from "@/lib/sdk-snippets";
import {
  AnimatedCounter,
  GlowCard,
  GradientBorder,
} from "@/components/shared";
import { AnimatedCubeHero } from "@/components/landing/animated-cube-hero";
import { toast } from "sonner";
import {
  Menu,
  X,
  ArrowRight,
  Copy,
  ShieldCheck,
  Globe2,
  Wallet,
  Landmark,
  ShieldAlert,
  ShoppingBag,
  Code2,
  Lock,
  Gauge,
  Webhook,
  Sparkles,
  Github,
  Linkedin,
  Twitter,
  Activity,
  ArrowUpRight,
  CreditCard,
  RefreshCw,
  LineChart,
  ChevronRight,
  Quote,
  Rocket,
  Plug,
} from "lucide-react";
import { useT } from "@/lib/i18n";
import { LanguageSwitcher } from "@/components/shared/language-switcher";

// ----------------------------------------------------------------------------
// Helpers
// ----------------------------------------------------------------------------

const NAV_LINKS = ["nav.product", "nav.pricing", "nav.developers", "nav.enterprise", "nav.docs"];

const LANGS: { id: keyof typeof sdkSnippets; label: string }[] = [
  { id: "curl", label: "cURL" },
  { id: "node", label: "Node" },
  { id: "python", label: "Python" },
  { id: "php", label: "PHP" },
  { id: "go", label: "Go" },
];

const RESPONSE_JSON = `{
  "id": "pay_2k9Lm3QxA1b7",
  "object": "payment",
  "status": "succeeded",
  "amount": 4200,
  "currency": "EUR",
  "method": "pix",
  "customer": "cus_001",
  "description": "Pro Plan — Annual",
  "created": "2025-01-14T09:32:11Z",
  "risk": { "score": 4, "level": "low" }
}`;

function Reveal({
  children,
  delay = 0,
  className,
  y = 18,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
  y?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1], delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function useCopy() {
  return React.useCallback((text: string, label = "Copied") => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(text).then(
        () => toast.success(label),
        () => toast.error("Copy failed")
      );
    } else {
      toast.error("Clipboard unavailable");
    }
  }, []);
}

// ----------------------------------------------------------------------------
// Brand logo
// ----------------------------------------------------------------------------

function BrandLogo({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <XSymbol className="size-8" />
      <span className="text-[17px] font-semibold tracking-tight text-foreground">
        {APP_NAME}
      </span>
    </div>
  );
}

// ----------------------------------------------------------------------------
// Navigation
// ----------------------------------------------------------------------------

function NavBar() {
  const router = useRouter();
  const t = useT();
  const [open, setOpen] = React.useState(false);
  const [scrolled, setScrolled] = React.useState(false);

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-300",
        scrolled
          ? "border-b border-border/60 bg-background/70 backdrop-blur-xl"
          : "border-b border-transparent bg-transparent"
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-8">
        <BrandLogo />

        <nav className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((l) => (
            <a
              key={l}
              href="#"
              onClick={(e) => e.preventDefault()}
              className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {t(l)}
            </a>
          ))}
          <a
            href="/support"
            className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Support
          </a>
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <LanguageSwitcher variant="full" />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/login")}
            className="text-muted-foreground hover:text-foreground"
          >
            {t("common.signin")}
          </Button>
          <Button
            size="sm"
            onClick={() => router.push("/register")}
            className="glow-blue-sm"
          >
            {t("common.signup")}
            <ArrowRight className="size-3.5" />
          </Button>
        </div>

        <button
          aria-label={t("nav.toggleMenu")}
          className="grid size-9 place-items-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground md:hidden"
          onClick={() => setOpen((o) => !o)}
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="overflow-hidden border-b border-border/60 bg-background/95 backdrop-blur-xl md:hidden"
          >
            <div className="flex flex-col gap-1 px-5 py-4">
              {NAV_LINKS.map((l) => (
                <a
                  key={l}
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    setOpen(false);
                  }}
                  className="rounded-md px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground"
                >
                  {t(l)}
                </a>
              ))}
              <Separator className="my-2" />
              <LanguageSwitcher variant="full" className="w-full justify-start" />
              <Button
                variant="ghost"
                onClick={() => { router.push("/login"); setOpen(false); }}
                className="justify-start"
              >
                {t("common.signin")}
              </Button>
              <Button onClick={() => { router.push("/register"); setOpen(false); }} className="justify-center">
                {t("common.signup")}
                <ArrowRight className="size-4" />
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

// ----------------------------------------------------------------------------
// Section: Hero
// ----------------------------------------------------------------------------

function Hero() {
  const router = useRouter();
  const t = useT();
  return (
    <section className="relative overflow-hidden">
      {/* ambient backgrounds */}
      <div className="pointer-events-none absolute inset-0 bg-radial-blue" />
      <div className="pointer-events-none absolute inset-0 bg-grid mask-fade-b opacity-50" />
      <div className="pointer-events-none absolute -top-40 left-1/2 size-[680px] -translate-x-1/2 rounded-full bg-primary/20 blur-[140px]" />

      {/* floating particles */}
      <div className="pointer-events-none absolute inset-0">
        {[
          { l: "12%", t: "30%", s: 6 },
          { l: "82%", t: "22%", s: 4 },
          { l: "68%", t: "70%", s: 5 },
          { l: "28%", t: "72%", s: 4 },
          { l: "45%", t: "16%", s: 3 },
        ].map((p, i) => (
          <span
            key={i}
            className="absolute rounded-full bg-primary/40 blur-[2px] animate-pulse-glow"
            style={{ left: p.l, top: p.t, width: p.s, height: p.s }}
          />
        ))}
      </div>

      <div className="relative mx-auto grid max-w-7xl grid-cols-1 gap-12 px-5 pb-16 pt-16 sm:px-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(480px,1.1fr)] lg:items-center lg:gap-10 lg:pb-24 lg:pt-24">
        {/* Left: copy */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col justify-center"
        >
          <Badge
            variant="outline"
            className="mb-5 w-fit gap-1.5 border-primary/30 bg-primary/10 py-1 pl-2 pr-3 text-primary"
          >
            <Sparkles className="size-3.5" />
            <span className="text-xs font-medium">
              {t("hero.badge")}
            </span>
          </Badge>

          <h1 className="text-balance text-4xl font-semibold leading-[1.05] tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            {t("hero.title")}{" "}
            <span className="bg-gradient-to-r from-primary via-blue-400 to-cyan-300 bg-clip-text text-transparent text-glow">
              {t("hero.titleAccent")}
            </span>
          </h1>

          <p className="mt-5 max-w-xl text-pretty text-base text-muted-foreground sm:text-lg">
            {t("hero.subtitle")}
          </p>

          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <Button
              size="lg"
              onClick={() => router.push("/register")}
              className="glow-blue-sm h-11 px-6 text-sm"
            >
              {t("hero.cta1")}
              <ArrowRight className="size-4" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => router.push("/register")}
              className="h-11 border-border/70 bg-background/40 px-6 text-sm backdrop-blur"
            >
              {t("hero.cta2")}
            </Button>
          </div>

          <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck className="size-3.5 text-primary" />
              {t("hero.trust")}
            </span>
          </div>
        </motion.div>

        {/* Right: animated modular cube */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{
            duration: 0.8,
            ease: [0.16, 1, 0.3, 1],
            delay: 0.15,
          }}
          className="relative flex min-w-0 items-center"
        >
          <AnimatedCubeHero
            className="
              h-[420px] w-full
              sm:h-[500px]
              lg:h-[560px]
              xl:h-[620px]
            "
          />
        </motion.div>
      </div>
    </section>
  );
}

// ----------------------------------------------------------------------------
// Section: Trust bar (marquee)
// ----------------------------------------------------------------------------

const TRUST_LOGOS = [
  "NIMBUS",
  "QUANTA",
  "VERTEX",
  "HELIX",
  "ORBITAL",
  "MERIDIAN",
];

function TrustBar() {
  const t = useT();
  const row = [...TRUST_LOGOS, ...TRUST_LOGOS];
  return (
    <section className="border-y border-border/40 bg-background/40 py-10">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <p className="mb-6 text-center text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
          {t("trust.label")}
        </p>
        <div className="relative overflow-hidden [mask-image:linear-gradient(to_right,transparent,#000_12%,#000_88%,transparent)] [-webkit-mask-image:linear-gradient(to_right,transparent,#000_12%,#000_88%,transparent)]">
          <div className="flex w-max animate-[xp-marquee_28s_linear_infinite] items-center gap-14">
            {row.map((name, i) => (
              <span
                key={i}
                className="select-none text-xl font-semibold tracking-tight text-muted-foreground/55 transition-colors hover:text-foreground"
              >
                {name}
              </span>
            ))}
          </div>
        </div>
      </div>
      <style>{`@keyframes xp-marquee{from{transform:translateX(0)}to{transform:translateX(-50%)}}`}</style>
    </section>
  );
}

// ----------------------------------------------------------------------------
// Section: Stats
// ----------------------------------------------------------------------------

function StatsBand() {
  const t = useT();
  const stats = [
    {
      value: 18.9,
      labelKey: "stats.processed",
      format: (n: number) => `$${n.toFixed(1)}B`,
    },
    {
      value: 120,
      labelKey: "stats.currencies",
      format: (n: number) => `${formatNumber(n)}+`,
    },
    {
      value: 45,
      labelKey: "stats.countries",
      format: (n: number) => formatNumber(n),
    },
    {
      value: 99.99,
      labelKey: "stats.uptime",
      format: (n: number) => formatPercent(n, 2),
    },
  ];
  return (
    <section className="py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-border/50 bg-border/40 lg:grid-cols-4">
          {stats.map((s, i) => (
            <Reveal
              key={s.labelKey}
              delay={i * 0.08}
              className="bg-background/60 backdrop-blur-xl"
            >
              <div className="flex h-full flex-col items-center justify-center px-4 py-10 text-center">
                <AnimatedCounter
                  value={s.value}
                  format={s.format}
                  className="bg-gradient-to-b from-foreground to-foreground/60 bg-clip-text text-4xl font-semibold tracking-tight text-transparent sm:text-5xl"
                />
                <p className="mt-2 text-xs font-medium uppercase tracking-wider text-muted-foreground sm:text-sm">
                  {t(s.labelKey)}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

// ----------------------------------------------------------------------------
// Section: Payment methods
// ----------------------------------------------------------------------------

function PaymentMethods() {
  const t = useT();
  return (
    <section className="py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <Reveal className="mx-auto max-w-2xl text-center">
          <Badge variant="outline" className="mb-4 border-primary/30 bg-primary/10 text-primary">
            Coverage
          </Badge>
          <h2 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
            {t("pm.title")}
          </h2>
          <p className="mt-3 text-muted-foreground">
            {t("pm.subtitle")}
          </p>
        </Reveal>

        <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {PAYMENT_METHODS.map((m, i) => {
            const Logo = PAYMENT_LOGOS[m.id];
            return (
              <Reveal key={m.id} delay={i * 0.04}>
                <motion.div whileHover={{ y: -4 }} className="h-full">
                  <GlowCard className="group flex h-full items-center gap-4 p-5 transition-colors hover:border-primary/40">
                    <div className="flex h-10 w-16 shrink-0 items-center justify-center">
                      {Logo ? <Logo /> : <span className="text-sm font-medium text-foreground">{m.label}</span>}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-foreground">{m.label}</p>
                      <p className="mt-0.5 text-sm leading-snug text-muted-foreground">
                        {t("pm." + m.id.replace("_", ""))}
                      </p>
                    </div>
                  </GlowCard>
                </motion.div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ----------------------------------------------------------------------------
// Section: Developer
// ----------------------------------------------------------------------------

const DEV_FEATURES = [
  {
    icon: Code2,
    titleKey: "dev.feature1",
    descKey: "dev.feature1d",
  },
  {
    icon: Webhook,
    titleKey: "dev.feature2",
    descKey: "dev.feature2d",
  },
  {
    icon: Plug,
    titleKey: "dev.feature3",
    descKey: "dev.feature3d",
  },
  {
    icon: RefreshCw,
    titleKey: "dev.feature4",
    descKey: "dev.feature4d",
  },
];

function DeveloperSection() {
  const copy = useCopy();
  const t = useT();
  return (
    <section className="py-16 sm:py-24">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-12 px-5 sm:px-8 lg:grid-cols-2 lg:gap-16">
        <Reveal className="flex flex-col justify-center">
          <Badge variant="outline" className="mb-4 w-fit border-primary/30 bg-primary/10 text-primary">
            For developers
          </Badge>
          <h2 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
            {t("dev.title")}
          </h2>
          <p className="mt-4 text-muted-foreground">
            {t("dev.subtitle")}
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {DEV_FEATURES.map((f) => (
              <div
                key={f.titleKey}
                className="rounded-xl border border-border/50 bg-card/40 p-4 backdrop-blur-sm"
              >
                <div className="mb-2 grid size-9 place-items-center rounded-lg bg-primary/10 text-primary">
                  <f.icon className="size-[18px]" />
                </div>
                <h3 className="text-sm font-semibold text-foreground">
                  {t(f.titleKey)}
                </h3>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                  {t(f.descKey)}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-8">
            <Button
              variant="outline"
              onClick={() => copy(sdkSnippets.node, "Install command copied")}
              className="border-border/70 bg-background/40"
            >
              <Code2 className="size-4" />
              npm i @xpay-expert/node
              <Copy className="size-3.5 opacity-60" />
            </Button>
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <Tabs defaultValue="node" className="gap-0">
            <div className="overflow-hidden rounded-2xl border border-border/60 bg-[oklch(0.12_0.012_255)] backdrop-blur-xl">
              {/* terminal header */}
              <div className="flex items-center gap-2 border-b border-border/50 px-4 py-3">
                <div className="flex gap-1.5">
                  <span className="size-3 rounded-full bg-rose-500/80" />
                  <span className="size-3 rounded-full bg-amber-400/80" />
                  <span className="size-3 rounded-full bg-emerald-500/80" />
                </div>
                <span className="ml-2 text-xs text-muted-foreground">
                  payments.create()
                </span>
              </div>

              <TabsList className="m-0 grid w-full grid-cols-5 rounded-none border-b border-border/50 bg-transparent p-0">
                {LANGS.map((l) => (
                  <TabsTrigger
                    key={l.id}
                    value={l.id}
                    className="rounded-none border-b-2 border-transparent py-2.5 text-xs data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:shadow-none"
                  >
                    {l.label}
                  </TabsTrigger>
                ))}
              </TabsList>

              {LANGS.map((l) => (
                <TabsContent key={l.id} value={l.id} className="m-0">
                  <div className="relative">
                    <pre className="scrollbar-thin max-h-[280px] overflow-auto px-5 py-4 font-mono text-[12.5px] leading-relaxed text-foreground/90">
                      <code className="whitespace-pre">{sdkSnippets[l.id]}</code>
                    </pre>
                    <button
                      onClick={() => copy(sdkSnippets[l.id], "Copied to clipboard")}
                      className="absolute right-3 top-3 inline-flex items-center gap-1.5 rounded-md border border-border/60 bg-background/70 px-2.5 py-1.5 text-xs text-muted-foreground backdrop-blur transition-colors hover:text-foreground"
                    >
                      <Copy className="size-3.5" />
                      Copy
                    </button>
                  </div>
                </TabsContent>
              ))}

              {/* response */}
              <div className="border-t border-border/50 bg-background/30">
                <div className="flex items-center justify-between px-5 py-2.5">
                  <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <ArrowUpRight className="size-3.5 text-emerald-400" />
                    200 OK · 142ms
                  </span>
                  <span className="text-[11px] text-muted-foreground">{t("dev.response")}</span>
                </div>
                <pre className="scrollbar-thin overflow-auto px-5 pb-5 font-mono text-[12px] leading-relaxed text-emerald-300/90">
                  <code className="whitespace-pre">{RESPONSE_JSON}</code>
                </pre>
              </div>
            </div>
          </Tabs>
        </Reveal>
      </div>
    </section>
  );
}

// ----------------------------------------------------------------------------
// Section: Features grid
// ----------------------------------------------------------------------------

const FEATURES = [
  {
    icon: Wallet,
    titleKey: "features.wallets",
    descKey: "features.walletsD",
  },
  {
    icon: Landmark,
    titleKey: "features.treasury",
    descKey: "features.treasuryD",
  },
  {
    icon: ShieldAlert,
    titleKey: "features.risk",
    descKey: "features.riskD",
  },
  {
    icon: ShoppingBag,
    titleKey: "features.commerce",
    descKey: "features.commerceD",
  },
  {
    icon: LineChart,
    titleKey: "features.analytics",
    descKey: "features.analyticsD",
  },
  {
    icon: Code2,
    titleKey: "features.developers",
    descKey: "features.developersD",
  },
];

function FeaturesGrid() {
  const t = useT();
  return (
    <section className="py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <Reveal className="mx-auto max-w-2xl text-center">
          <Badge variant="outline" className="mb-4 border-primary/30 bg-primary/10 text-primary">
            Platform
          </Badge>
          <h2 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
            {t("features.title")}
          </h2>
          <p className="mt-3 text-muted-foreground">
            {t("features.subtitle")}
          </p>
        </Reveal>

        <div className="mt-12 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f, i) => (
            <Reveal key={f.titleKey} delay={(i % 3) * 0.06}>
              <GradientBorder className="h-full">
                <motion.div
                  whileHover={{ y: -4 }}
                  className="group flex h-full flex-col rounded-xl bg-card/50 p-6 backdrop-blur-xl"
                >
                  <div className="mb-4 grid size-11 place-items-center rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 text-primary ring-1 ring-inset ring-primary/20">
                    <f.icon className="size-5" />
                  </div>
                  <h3 className="text-base font-semibold text-foreground">
                    {t(f.titleKey)}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {t(f.descKey)}
                  </p>
                  <div className="mt-4 flex items-center text-xs font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">
                    Learn more <ChevronRight className="size-3.5" />
                  </div>
                </motion.div>
              </GradientBorder>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

// ----------------------------------------------------------------------------
// Section: Security
// ----------------------------------------------------------------------------

const SECURITY_PILLARS = [
  {
    icon: CreditCard,
    titleKey: "security.pci",
    descKey: "security.pciD",
  },
  {
    icon: ShieldCheck,
    titleKey: "security.soc",
    descKey: "security.socD",
  },
  {
    icon: Gauge,
    titleKey: "security.uptime",
    descKey: "security.uptimeD",
  },
];

function SecuritySection() {
  const t = useT();
  return (
    <section className="relative overflow-hidden py-16 sm:py-24">
      <div className="pointer-events-none absolute left-1/2 top-1/2 size-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/10 blur-[120px]" />
      <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
        <Reveal className="mx-auto max-w-2xl text-center">
          <Badge variant="outline" className="mb-4 border-primary/30 bg-primary/10 text-primary">
            <ShieldCheck className="size-3.5" />
            Trust & compliance
          </Badge>
          <h2 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
            {t("security.title")}
          </h2>
          <p className="mt-3 text-muted-foreground">
            {t("security.subtitle")}
          </p>
        </Reveal>

        <div className="mt-12 grid grid-cols-1 gap-4 md:grid-cols-3">
          {SECURITY_PILLARS.map((p, i) => (
            <Reveal key={p.titleKey} delay={i * 0.08}>
              <GlowCard glow className="relative h-full overflow-hidden p-6">
                <div className="pointer-events-none absolute -right-10 -top-10 size-32 rounded-full bg-primary/15 blur-2xl" />
                <div className="relative">
                  <div className="mb-4 grid size-12 place-items-center rounded-xl bg-primary/10 text-primary ring-1 ring-inset ring-primary/30">
                    <p.icon className="size-[22px]" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground">
                    {t(p.titleKey)}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {t(p.descKey)}
                  </p>
                </div>
              </GlowCard>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

// ----------------------------------------------------------------------------
// Section: Testimonials
// ----------------------------------------------------------------------------

const TESTIMONIALS = [
  {
    quoteKey: "t1.quote",
    authorKey: "t1.author",
    roleKey: "t1.role",
    initials: "LF",
  },
  {
    quoteKey: "t2.quote",
    authorKey: "t2.author",
    roleKey: "t2.role",
    initials: "CD",
  },
  {
    quoteKey: "t3.quote",
    authorKey: "t3.author",
    roleKey: "t3.role",
    initials: "MB",
  },
];

function Testimonials() {
  const t = useT();
  return (
    <section className="py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <Reveal className="mx-auto max-w-2xl text-center">
          <Badge variant="outline" className="mb-4 border-primary/30 bg-primary/10 text-primary">
            Customers
          </Badge>
          <h2 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
            {t("testimonials.title")}
          </h2>
        </Reveal>

        <div className="mt-12 grid grid-cols-1 gap-4 md:grid-cols-3">
          {TESTIMONIALS.map((tm, i) => (
            <Reveal key={tm.authorKey} delay={i * 0.08}>
              <GlowCard className="flex h-full flex-col p-6">
                <Quote className="size-7 text-primary/40" />
                <p className="mt-4 flex-1 text-[15px] leading-relaxed text-foreground/90">
                  "{t(tm.quoteKey)}"
                </p>
                <div className="mt-6 flex items-center gap-3">
                  <Avatar className="size-9 ring-1 ring-inset ring-primary/30">
                    <AvatarFallback className="bg-primary/15 text-xs font-semibold text-primary">
                      {tm.initials}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      {t(tm.authorKey)}
                    </p>
                    <p className="text-xs text-muted-foreground">{t(tm.roleKey)}</p>
                  </div>
                </div>
              </GlowCard>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

// ----------------------------------------------------------------------------
// Section: Final CTA
// ----------------------------------------------------------------------------

function FinalCTA() {
  const router = useRouter();
  const t = useT();
  return (
    <section className="px-5 py-16 sm:px-8 sm:py-24">
      <Reveal className="mx-auto max-w-5xl">
        <GradientBorder className="relative overflow-hidden rounded-3xl">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/20 via-card/60 to-background/40 px-6 py-14 text-center backdrop-blur-xl sm:px-12 sm:py-20">
            <div className="pointer-events-none absolute -top-24 left-1/2 size-[460px] -translate-x-1/2 rounded-full bg-primary/25 blur-[120px]" />
            <div className="pointer-events-none absolute inset-0 bg-grid opacity-30" />
            <div className="relative">
              <Badge
                variant="outline"
                className="mb-5 border-primary/30 bg-background/40 text-primary backdrop-blur"
              >
                <Rocket className="size-3.5" />
                Get started in minutes
              </Badge>
              <h2 className="mx-auto max-w-2xl text-balance text-3xl font-semibold tracking-tight sm:text-5xl">
                {t("cta.title")}
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-pretty text-muted-foreground">
                {t("cta.subtitle")}
              </p>
              <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Button
                  size="lg"
                  onClick={() => router.push("/register")}
                  className="glow-blue h-12 px-8 text-sm"
                >
                  {t("cta.button")}
                  <ArrowRight className="size-4" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => router.push("/register")}
                  className="h-12 border-border/70 bg-background/40 px-8 text-sm backdrop-blur"
                >
                  {t("cta.secondary")}
                </Button>
              </div>
            </div>
          </div>
        </GradientBorder>
      </Reveal>
    </section>
  );
}

// ----------------------------------------------------------------------------
// Footer
// ----------------------------------------------------------------------------

type FooterLink = string | { key: string };
const FOOTER_COLS: { titleKey: string; links: FooterLink[] }[] = [
  {
    titleKey: "footer.product",
    links: ["Payments", "Wallets & FX", "Treasury", "Risk Engine", "Commerce", "Analytics"],
  },
  {
    titleKey: "footer.developers",
    links: ["Documentation", "API Reference", "SDKs", "Webhooks", "API Explorer", "Status"],
  },
  {
    titleKey: "footer.company",
    links: ["About", "Customers", "Careers", "Press", "Partners", "Contact"],
  },
  {
    titleKey: "footer.resources",
    links: ["Blog", "Guides", "Help Center", "Community", "Changelog", "Roadmap"],
  },
  {
    titleKey: "footer.legal",
    links: [
      { key: "footer.terms" },
      { key: "footer.privacy" },
      { key: "footer.compliance" },
      { key: "footer.security" },
      "DPA",
      "Licenses",
    ],
  },
];

function Footer() {
  const t = useT();
  return (
    <footer className="mt-auto border-t border-border/60 bg-background/60">
      <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8">
        <div className="grid grid-cols-2 gap-10 lg:grid-cols-6">
          <div className="col-span-2">
            <BrandLogo />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted-foreground">
              {t("footer.tagline")}
            </p>
            <div className="mt-5 flex items-center gap-2">
              {[Twitter, Github, Linkedin, Globe2].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  onClick={(e) => e.preventDefault()}
                  className="grid size-9 place-items-center rounded-lg border border-border/60 text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
                >
                  <Icon className="size-4" />
                </a>
              ))}
            </div>
          </div>

          {FOOTER_COLS.map((col) => (
            <div key={col.titleKey}>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground">
                {t(col.titleKey)}
              </h4>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((l, i) => {
                  const label = typeof l === "string" ? l : t(l.key);
                  return (
                    <li key={i}>
                      <a
                        href="#"
                        onClick={(e) => e.preventDefault()}
                        className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                      >
                        {label}
                      </a>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>

        <Separator className="my-8" />

        <div className="flex flex-col items-center justify-between gap-4 text-xs text-muted-foreground sm:flex-row">
          <p>© 2026 {APP_NAME}, Inc. {t("footer.rights")}</p>
          <div className="flex items-center gap-5">
            <span className="inline-flex items-center gap-1.5">
              <span className="size-1.5 rounded-full bg-emerald-400" />
              All systems operational
            </span>
            <span className="opacity-30">·</span>
            <span>Made for the global economy</span>
            <span className="opacity-30">·</span>
            <span className="inline-flex items-center gap-1.5">
              {t("footer.language")}
              <LanguageSwitcher variant="full" />
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}

// ----------------------------------------------------------------------------
// Page
// ----------------------------------------------------------------------------

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <NavBar />
      <main className="flex-1">
        <Hero />
        <TrustBar />
        <StatsBand />
        <PaymentMethods />
        <DeveloperSection />
        <FeaturesGrid />
        <SecuritySection />
        <Testimonials />
        <FinalCTA />
      </main>
      <Footer />
    </div>
  );
}
