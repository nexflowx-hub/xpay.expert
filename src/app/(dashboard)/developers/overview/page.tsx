"use client";

import { motion } from "framer-motion";
import {
  KeyRound,
  Webhook,
  BookOpen,
  ArrowRight,
  Terminal,
  Package,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageHeader, fadeUp } from "@/components/shared";
import { sdkSnippets } from "@/lib/sdk-snippets";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";

interface QuickLink {
  icon: LucideIcon;
  title: string;
  description: string;
  href: string;
}

const quickLinks: QuickLink[] = [
  {
    icon: KeyRound,
    title: "API Keys",
    description: "Create and manage your API credentials.",
    href: "/developers/api-keys",
  },
  {
    icon: Webhook,
    title: "Webhooks",
    description: "Configure real-time event notifications.",
    href: "/developers/webhooks",
  },
  {
    icon: BookOpen,
    title: "Documentation",
    description: "API reference, guides and SDK docs.",
    href: "/developers/docs",
  },
];

interface IntegrationGuide {
  icon: LucideIcon;
  title: string;
  description: string;
  badge?: string;
}

const guides: IntegrationGuide[] = [
  {
    icon: Terminal,
    title: "REST API",
    description:
      "Integrate with our full REST API. Create payments, manage wallets and handle webhooks.",
  },
  {
    icon: Package,
    title: "SDKs",
    description:
      "Official SDKs for Node.js, Python, PHP and Go with type-safe interfaces.",
  },
];

export default function DevelopersOverviewPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Developers"
        description="Integrate XPay into your application"
        breadcrumbs={[{ label: "Developers" }]}
      />

      {/* Quick links */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {quickLinks.map((l, idx) => (
          <motion.div
            key={l.title}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: idx * 0.06, ease: "easeOut" }}
          >
            <Link href={l.href} className="block">
              <Card className="group h-full border-border/60 bg-card/60 backdrop-blur-xl p-5 transition hover:border-primary/30">
                <div className="flex items-start justify-between">
                  <div className="rounded-lg bg-primary/10 p-2.5 text-primary transition group-hover:bg-primary/15">
                    <l.icon className="h-5 w-5" />
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground transition group-hover:text-primary" />
                </div>
                <h3 className="mt-4 text-sm font-semibold text-foreground">
                  {l.title}
                </h3>
                <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                  {l.description}
                </p>
              </Card>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Integration guides */}
      <motion.div {...fadeUp}>
        <Card className="border-border/60 bg-card/60 backdrop-blur-xl p-5">
          <h2 className="mb-4 text-sm font-semibold text-foreground">
            Integration Guides
          </h2>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {guides.map((g) => (
              <div
                key={g.title}
                className="flex items-start gap-3 rounded-lg border border-border/40 bg-background/40 p-4"
              >
                <div className="rounded-lg bg-primary/10 p-2 text-primary">
                  <g.icon className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-foreground">
                    {g.title}
                  </h3>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {g.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </motion.div>

      {/* SDK code snippet */}
      <motion.div {...fadeUp}>
        <Card className="border-border/60 bg-card/60 backdrop-blur-xl p-5">
          <h2 className="mb-4 text-sm font-semibold text-foreground">
            Quick Start
          </h2>
          <pre className="max-h-80 overflow-y-auto rounded-lg bg-black/60 p-4 text-xs leading-relaxed text-zinc-300 scrollbar-thin">
            <code>{sdkSnippets.node}</code>
          </pre>
          <div className="mt-3 flex items-center gap-2">
            <Badge variant="outline" className="text-[10px]">
              Node.js
            </Badge>
            <Badge variant="outline" className="text-[10px]">
              Python
            </Badge>
            <Badge variant="outline" className="text-[10px]">
              PHP
            </Badge>
            <Badge variant="outline" className="text-[10px]">
              Go
            </Badge>
            <Badge variant="outline" className="text-[10px]">
              cURL
            </Badge>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}