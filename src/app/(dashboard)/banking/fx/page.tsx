"use client";

import { RefreshCw } from "lucide-react";
import { EmptyState } from "@/components/shared";
import { PageHeader } from "@/components/shared";

export default function BankingFxPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="FX"
        description="Currency conversion at competitive rates"
        breadcrumbs={[
          { label: "Banking" },
          { label: "FX" },
        ]}
      />
      <EmptyState
        icon={RefreshCw}
        title="FX coming soon"
        description="Convert between currencies with real-time quotes and competitive exchange rates."
      />
    </div>
  );
}