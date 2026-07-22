"use client";

import { motion } from "framer-motion";
import {
  Landmark,
  Users,
  ArrowLeftRight,
  RefreshCw,
  CreditCard,
  Bitcoin,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/shared";
import { fadeUp } from "@/components/shared";
import type { LucideIcon } from "lucide-react";

interface BankingFeature {
  icon: LucideIcon;
  title: string;
  description: string;
}

const features: BankingFeature[] = [
  {
    icon: Landmark,
    title: "Multi-currency Accounts",
    description:
      "Hold and manage balances in EUR, USD, GBP, BRL and more with dedicated IBANs.",
  },
  {
    icon: Users,
    title: "Beneficiaries",
    description:
      "Save and manage frequent payees for faster domestic and cross-border transfers.",
  },
  {
    icon: ArrowLeftRight,
    title: "Transfers",
    description:
      "Send SEPA, SWIFT and instant payments to any bank account worldwide.",
  },
  {
    icon: RefreshCw,
    title: "FX",
    description:
      "Convert between currencies at competitive rates with real-time quotes.",
  },
  {
    icon: CreditCard,
    title: "Cards",
    description:
      "Issue virtual and physical debit cards for your business expenses.",
  },
  {
    icon: Bitcoin,
    title: "Crypto",
    description:
      "Buy, sell and hold cryptocurrency directly from your business account.",
  },
];

export default function BankingPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="XPay Banking"
        description="Business accounts, transfers, cards and FX."
        breadcrumbs={[
          { label: "Banking" },
        ]}
        actions={
          <Badge className="gap-1.5 bg-emerald-500/15 text-emerald-400 border-emerald-500/25 hover:bg-emerald-500/20">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
            </span>
            Private Beta
          </Badge>
        }
      />

      {/* Hero banner */}
      <motion.div
        {...fadeUp}
        className="relative overflow-hidden rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-emerald-950/60 via-emerald-900/20 to-slate-950/60 p-6 sm:p-8"
      >
        <div className="pointer-events-none absolute -right-12 -top-12 h-48 w-48 rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-8 -left-8 h-32 w-32 rounded-full bg-emerald-600/10 blur-2xl" />
        <div className="relative">
          <h2 className="text-xl font-semibold text-white sm:text-2xl">
            Full-service business banking
          </h2>
          <p className="mt-2 max-w-xl text-sm text-emerald-100/70">
            Manage your company finances end-to-end. Multi-currency accounts,
            global transfers, FX, cards and crypto — all in one place.
          </p>
          <div className="mt-4 flex items-center gap-2">
            <Badge variant="outline" className="border-emerald-500/30 text-emerald-300 text-xs">
              Invite only
            </Badge>
            <Badge variant="outline" className="border-emerald-500/30 text-emerald-300 text-xs">
              EU regulated
            </Badge>
            <Badge variant="outline" className="border-emerald-500/30 text-emerald-300 text-xs">
              SEPA & SWIFT
            </Badge>
          </div>
        </div>
      </motion.div>

      {/* Feature cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((f, idx) => (
          <motion.div
            key={f.title}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: idx * 0.06, ease: "easeOut" }}
          >
            <Card className="group relative h-full border-border/60 bg-card/60 backdrop-blur-xl p-5 transition hover:border-emerald-500/30">
              <div className="flex items-start justify-between">
                <div className="rounded-lg bg-emerald-500/10 p-2.5 text-emerald-400 transition group-hover:bg-emerald-500/15">
                  <f.icon className="h-5 w-5" />
                </div>
                <Badge variant="outline" className="border-muted-foreground/20 text-muted-foreground text-[10px]">
                  Coming Soon
                </Badge>
              </div>
              <h3 className="mt-4 text-sm font-semibold text-foreground">
                {f.title}
              </h3>
              <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                {f.description}
              </p>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}