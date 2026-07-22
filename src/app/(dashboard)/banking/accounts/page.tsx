"use client";

import { Landmark } from "lucide-react";
import { EmptyState } from "@/components/shared";
import { PageHeader } from "@/components/shared";

export default function BankingAccountsPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Accounts"
        description="Multi-currency business accounts"
        breadcrumbs={[
          { label: "Banking" },
          { label: "Accounts" },
        ]}
      />
      <EmptyState
        icon={Landmark}
        title="Banking Accounts coming soon"
        description="Multi-currency business accounts with dedicated IBANs will be available in the private beta."
      />
    </div>
  );
}