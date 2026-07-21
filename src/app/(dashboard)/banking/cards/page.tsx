"use client";

import { CreditCard } from "lucide-react";
import { EmptyState } from "@/components/shared";
import { PageHeader } from "@/components/shared";

export default function BankingCardsPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Cards"
        description="Virtual and physical business debit cards"
        breadcrumbs={[
          { label: "Banking" },
          { label: "Cards" },
        ]}
      />
      <EmptyState
        icon={CreditCard}
        title="Cards coming soon"
        description="Issue virtual and physical debit cards for your business expenses and team spending."
      />
    </div>
  );
}