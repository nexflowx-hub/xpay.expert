"use client";

import { motion } from "framer-motion";
import {
  LifeBuoy,
  BookOpen,
  Mail,
  MessageSquare,
  ExternalLink,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PageHeader, EmptyState, fadeUp } from "@/components/shared";
import Link from "next/link";

interface SupportLink {
  icon: React.ElementType;
  title: string;
  description: string;
  href?: string;
  external?: boolean;
}

const supportLinks: SupportLink[] = [
  {
    icon: BookOpen,
    title: "Documentation",
    description: "Browse our API docs, guides and integration tutorials.",
    href: "/developers/docs",
  },
  {
    icon: Mail,
    title: "Email Support",
    description: "Get in touch with our team at support@xpay.expert.",
    href: "mailto:support@xpay.expert",
    external: true,
  },
];

export default function SupportPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Support"
        description="Get help and contact our team"
        breadcrumbs={[{ label: "Support" }]}
      />

      {/* Quick links */}
      <motion.div {...fadeUp}>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {supportLinks.map((link, idx) => {
            const Wrapper = link.external ? "a" : Link;
            const linkProps = link.external
              ? { href: link.href, target: "_blank", rel: "noopener noreferrer" }
              : { href: link.href ?? "/" };
            return (
              <motion.div
                key={link.title}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: idx * 0.06, ease: "easeOut" }}
              >
                <Wrapper {...linkProps} className="block">
                  <Card className="group h-full border-border/60 bg-card/60 backdrop-blur-xl p-5 transition hover:border-primary/30">
                    <div className="flex items-start justify-between">
                      <div className="rounded-lg bg-primary/10 p-2.5 text-primary transition group-hover:bg-primary/15">
                        <link.icon className="h-5 w-5" />
                      </div>
                      {link.external && (
                        <ExternalLink className="h-4 w-4 text-muted-foreground transition group-hover:text-primary" />
                      )}
                    </div>
                    <h3 className="mt-4 text-sm font-semibold text-foreground">
                      {link.title}
                    </h3>
                    <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                      {link.description}
                    </p>
                  </Card>
                </Wrapper>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Tickets section — empty state */}
      <motion.div {...fadeUp}>
        <Card className="border-border/60 bg-card/60 backdrop-blur-xl p-5">
          <div className="mb-4">
            <h3 className="flex items-center gap-2 text-sm font-semibold">
              <MessageSquare className="h-4 w-4 text-primary" />
              Support Tickets
            </h3>
            <p className="text-xs text-muted-foreground">
              Track your support requests and responses.
            </p>
          </div>
          <EmptyState
            icon={LifeBuoy}
            title="No support tickets yet"
            description="When you open a support request, it will appear here for tracking."
          />
        </Card>
      </motion.div>
    </div>
  );
}