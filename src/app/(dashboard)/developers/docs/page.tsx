"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { BookOpen, ExternalLink, Terminal } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PageHeader, EmptyState, fadeUp } from "@/components/shared";
import { sdkSnippets } from "@/lib/sdk-snippets";

const LANGUAGES = ["node", "python", "php", "go", "curl"] as const;
type Language = (typeof LANGUAGES)[number];

export default function DevelopersDocsPage() {
  const [activeLang, setActiveLang] = React.useState<Language>("node");

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Documentation"
        description="API reference, guides and SDK documentation"
        breadcrumbs={[
          { label: "Developers" },
          { label: "Docs" },
        ]}
      />

      <motion.div {...fadeUp}>
        <Card className="border-border/60 bg-card/60 backdrop-blur-xl p-5">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="flex items-center gap-2 text-sm font-semibold">
                <BookOpen className="h-4 w-4 text-primary" />
                API Documentation
              </h3>
              <p className="text-xs text-muted-foreground">
                Full API reference is coming soon. In the meantime, explore our SDK snippets.
              </p>
            </div>
            <Button variant="outline" size="sm" className="gap-1.5" asChild>
              <a href="https://docs.xpay.expert" target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-3.5 w-3.5" /> docs.xpay.expert
              </a>
            </Button>
          </div>

          <EmptyState
            icon={BookOpen}
            title="Full API documentation coming soon"
            description="We are building comprehensive docs with guides, API reference and examples."
          />
        </Card>
      </motion.div>

      {/* SDK code snippet preview */}
      <motion.div {...fadeUp}>
        <Card className="border-border/60 bg-card/60 backdrop-blur-xl p-5">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="flex items-center gap-2 text-sm font-semibold">
                <Terminal className="h-4 w-4 text-primary" />
                SDK Quick Start
              </h3>
              <p className="text-xs text-muted-foreground">
                Create a payment in your preferred language.
              </p>
            </div>
          </div>

          {/* Language tabs */}
          <div className="mb-3 flex items-center gap-1 rounded-lg border border-border/60 bg-muted/30 p-1">
            {LANGUAGES.map((lang) => (
              <button
                key={lang}
                onClick={() => setActiveLang(lang)}
                className={
                  "rounded-md px-3 py-1.5 text-xs font-medium capitalize transition " +
                  (activeLang === lang
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground")
                }
              >
                {lang}
              </button>
            ))}
          </div>

          <pre className="max-h-80 overflow-y-auto rounded-lg bg-black/60 p-4 text-xs leading-relaxed text-zinc-300 scrollbar-thin">
            <code>{sdkSnippets[activeLang]}</code>
          </pre>
        </Card>
      </motion.div>
    </div>
  );
}