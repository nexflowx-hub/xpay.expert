"use client";

import { ArrowLeftRight } from "lucide-react";
import { EmptyState } from "@/components/shared";
import { PageHeader } from "@/components/shared";

export default function BankingTransfersPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Transfers"
        description="Send SEPA, SWIFT and instant payments"
        breadcrumbs={[
          { label: "Banking" },
          { label: "Transfers" },
        ]}
      />
      <EmptyState
        icon={ArrowLeftRight}
        title="Transfers coming soon"
        description="Send domestic and international bank transfers directly from your business accounts."
      />
    </div>
  );
}