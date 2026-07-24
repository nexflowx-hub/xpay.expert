"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Lock } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/shared";
import { fadeUp } from "@/components/shared";

interface CapabilityPlaceholderPageProps {
  title: string;
  description: string;
  capabilityKey: string;
  reason: string;
  plannedModules: string[];
}

export function CapabilityPlaceholderPage({
  title,
  description,
  reason,
  plannedModules,
}: CapabilityPlaceholderPageProps) {
  const router = useRouter();
  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={title} description={description} />
      <motion.div {...fadeUp}>
        <Card className="border-border/60 bg-card/60 p-8 backdrop-blur-xl">
          <div className="flex flex-col items-center text-center">
            <div className="grid h-16 w-16 place-items-center rounded-2xl bg-amber-500/10 text-amber-400">
              <Lock className="h-8 w-8" />
            </div>
            <h2 className="mt-6 text-lg font-semibold">Em preparacao</h2>
            <p className="mt-2 max-w-md text-sm text-muted-foreground">{reason}</p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
              {plannedModules.map((m) => (
                <Badge key={m} variant="outline" className="border-border/60 text-xs text-muted-foreground">
                  {m}
                </Badge>
              ))}
            </div>
            <Button
              variant="outline"
              size="sm"
              className="mt-8 gap-1.5"
              onClick={() => router.push("/commerce")}
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Voltar ao Commerce
            </Button>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
