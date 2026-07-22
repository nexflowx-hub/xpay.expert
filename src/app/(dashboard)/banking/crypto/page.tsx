"use client";

import { Bitcoin } from "lucide-react";
import { EmptyState } from "@/components/shared";
import { PageHeader } from "@/components/shared";

export default function BankingCryptoPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Crypto"
        description="Buy, sell and hold cryptocurrency"
        breadcrumbs={[
          { label: "Banking" },
          { label: "Crypto" },
        ]}
      />
      <EmptyState
        icon={Bitcoin}
        title="Crypto coming soon"
        description="Manage crypto assets directly from your business account with seamless fiat on/off ramps."
      />
    </div>
  );
}