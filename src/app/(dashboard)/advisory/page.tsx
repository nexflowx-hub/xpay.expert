"use client";

import { motion } from "framer-motion";
import {
  Briefcase,
  FolderOpen,
  FileText,
  MessageSquare,
  ChevronRight,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared";
import { fadeUp } from "@/components/shared";
import { cn } from "@/lib/utils";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";

interface AdvisoryArea {
  icon: LucideIcon;
  title: string;
  description: string;
  href: string;
  disabled?: boolean;
  badge?: string;
}

const areas: AdvisoryArea[] = [
  {
    icon: Briefcase,
    title: "Services",
    description:
      "Browse our catalog of business formation, payments setup and compliance services.",
    href: "/advisory/services",
  },
  {
    icon: FolderOpen,
    title: "Cases",
    description:
      "Track your service requests, proposals and progress in one place.",
    href: "/advisory/cases",
    disabled: true,
    badge: "Coming Soon",
  },
  {
    icon: FileText,
    title: "Documents",
    description:
      "Upload, manage and track your business documents and compliance files.",
    href: "/advisory/documents",
    disabled: true,
    badge: "Coming Soon",
  },
  {
    icon: MessageSquare,
    title: "Messages",
    description:
      "Communicate directly with your advisor about ongoing services.",
    href: "/advisory/messages",
    disabled: true,
    badge: "Coming Soon",
  },
];

export default function AdvisoryPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="XPay Advisory"
        description="Business formation, payments setup and international operations."
        breadcrumbs={[{ label: "Advisory" }]}
      />

      {/* Hero banner */}
      <motion.div
        {...fadeUp}
        className="relative overflow-hidden rounded-2xl border border-amber-500/20 bg-gradient-to-br from-amber-950/60 via-amber-900/20 to-slate-950/60 p-6 sm:p-8"
      >
        <div className="pointer-events-none absolute -right-12 -top-12 h-48 w-48 rounded-full bg-amber-500/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-8 -left-8 h-32 w-32 rounded-full bg-amber-600/10 blur-2xl" />
        <div className="relative">
          <h2 className="text-xl font-semibold text-white sm:text-2xl">
            Expert guidance for global commerce
          </h2>
          <p className="mt-2 max-w-xl text-sm text-amber-100/70">
            From company formation to payment integration and compliance — get
            professional advisory to launch and scale your business internationally.
          </p>
          <div className="mt-4 flex items-center gap-2">
            <Badge variant="outline" className="border-amber-500/30 text-amber-300 text-xs">
              EU & US
            </Badge>
            <Badge variant="outline" className="border-amber-500/30 text-amber-300 text-xs">
              End-to-end
            </Badge>
            <Badge variant="outline" className="border-amber-500/30 text-amber-300 text-xs">
              Dedicated advisor
            </Badge>
          </div>
        </div>
      </motion.div>

      {/* Area cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {areas.map((a, idx) => (
          <motion.div
            key={a.title}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: idx * 0.06, ease: "easeOut" }}
          >
            {a.disabled ? (
              <Card className="group relative h-full border-border/60 bg-card/60 backdrop-blur-xl p-5 opacity-80">
                <div className="flex items-start justify-between">
                  <div className="rounded-lg bg-amber-500/10 p-2.5 text-amber-400">
                    <a.icon className="h-5 w-5" />
                  </div>
                  {a.badge && (
                    <Badge variant="outline" className="border-muted-foreground/20 text-muted-foreground text-[10px]">
                      {a.badge}
                    </Badge>
                  )}
                </div>
                <h3 className="mt-4 text-sm font-semibold text-foreground">
                  {a.title}
                </h3>
                <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                  {a.description}
                </p>
              </Card>
            ) : (
              <Link href={a.href} className="block">
                <Card className="group relative h-full border-border/60 bg-card/60 backdrop-blur-xl p-5 transition hover:border-amber-500/30">
                  <div className="flex items-start justify-between">
                    <div className="rounded-lg bg-amber-500/10 p-2.5 text-amber-400 transition group-hover:bg-amber-500/15">
                      <a.icon className="h-5 w-5" />
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground transition group-hover:text-amber-400" />
                  </div>
                  <h3 className="mt-4 text-sm font-semibold text-foreground">
                    {a.title}
                  </h3>
                  <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                    {a.description}
                  </p>
                </Card>
              </Link>
            )}
          </motion.div>
        ))}
      </div>

      {/* Footer */}
      <p className="text-center text-xs text-muted-foreground">
        Powered by Atlas Advisory
      </p>
    </div>
  );
}