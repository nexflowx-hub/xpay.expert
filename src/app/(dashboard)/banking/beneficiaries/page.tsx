"use client";

import { Users } from "lucide-react";
import { EmptyState } from "@/components/shared";
import { PageHeader } from "@/components/shared";

export default function BankingBeneficiariesPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Beneficiaries"
        description="Manage frequent payees for faster transfers"
        breadcrumbs={[
          { label: "Banking" },
          { label: "Beneficiaries" },
        ]}
      />
      <EmptyState
        icon={Users}
        title="Beneficiaries coming soon"
        description="Save and manage your frequent payees for domestic and cross-border transfers."
      />
    </div>
  );
}