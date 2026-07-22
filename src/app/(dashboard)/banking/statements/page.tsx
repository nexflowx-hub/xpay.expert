"use client";

import { FileText } from "lucide-react";
import { EmptyState } from "@/components/shared";
import { PageHeader } from "@/components/shared";

export default function BankingStatementsPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Statements"
        description="Account statements and transaction history"
        breadcrumbs={[
          { label: "Banking" },
          { label: "Statements" },
        ]}
      />
      <EmptyState
        icon={FileText}
        title="Statements coming soon"
        description="Download and view your account statements and detailed transaction history."
      />
    </div>
  );
}