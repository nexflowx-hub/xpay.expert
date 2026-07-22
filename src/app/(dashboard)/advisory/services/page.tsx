"use client";

import { motion } from "framer-motion";
import {
  Building2,
  Landmark,
  MapPin,
  Flag,
  Wallet,
  ShoppingCart,
  FileCheck,
  MessageSquare,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared";
import type { LucideIcon } from "lucide-react";

interface AdvisoryService {
  icon: LucideIcon;
  title: string;
  description: string;
}

const services: AdvisoryService[] = [
  {
    icon: Building2,
    title: "US LLC Formation",
    description:
      "Register your Delaware or Wyoming LLC with EIN, registered agent and operating agreement.",
  },
  {
    icon: Landmark,
    title: "UK LTD Formation",
    description:
      "Incorporate a UK private limited company with Companies House registration and bank setup.",
  },
  {
    icon: MapPin,
    title: "Portugal LDA",
    description:
      "Set up a Portuguese LDA with NIF, social security registration and local compliance.",
  },
  {
    icon: Flag,
    title: "France SAS/SASU",
    description:
      "Form a French simplified joint-stock company with full legal and tax registration.",
  },
  {
    icon: Wallet,
    title: "Banking & Payment Setup",
    description:
      "Get connected to banking partners and payment processors tailored to your business needs.",
  },
  {
    icon: ShoppingCart,
    title: "Ecommerce Launch",
    description:
      "End-to-end ecommerce setup including platform, payments, shipping and compliance.",
  },
  {
    icon: FileCheck,
    title: "Compliance & Documentation",
    description:
      "Prepare the documentation and compliance framework required for your target markets.",
  },
  {
    icon: MessageSquare,
    title: "Custom Advisory",
    description:
      "Book a session with an advisor for bespoke guidance on your specific business needs.",
  },
];

export default function AdvisoryServicesPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Advisory Services"
        description="Browse our catalog of professional services."
        breadcrumbs={[
          { label: "Advisory" },
          { label: "Services" },
        ]}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {services.map((s, idx) => (
          <motion.div
            key={s.title}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: idx * 0.05, ease: "easeOut" }}
          >
            <Card className="group relative flex h-full flex-col border-border/60 bg-card/60 backdrop-blur-xl p-5 transition hover:border-amber-500/30">
              <div className="rounded-lg bg-amber-500/10 p-2.5 text-amber-400 transition group-hover:bg-amber-500/15">
                <s.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-sm font-semibold text-foreground">
                {s.title}
              </h3>
              <p className="mt-1.5 flex-1 text-xs leading-relaxed text-muted-foreground">
                {s.description}
              </p>
              <div className="mt-4 flex items-center justify-between">
                <Button
                  variant="outline"
                  size="sm"
                  disabled
                  className="text-xs"
                >
                  Learn More
                </Button>
                <Badge variant="outline" className="border-muted-foreground/20 text-muted-foreground text-[10px]">
                  Coming Soon
                </Badge>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}