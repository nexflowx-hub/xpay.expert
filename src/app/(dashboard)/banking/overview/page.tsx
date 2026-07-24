"use client";

import { CapabilityPlaceholderPage } from "@/components/shared/capability-placeholder-page";

export default function BankingOverviewPage() {
  return (
    <CapabilityPlaceholderPage
      title="Banking"
      description="Business accounts, transfers, cards and FX."
      capabilityKey="banking"
      reason="Banking sera ativado para a sua conta apos a verificacao KYC e aprovacao do compliance."
      plannedModules={["Accounts", "Transfers", "FX", "Cards", "Crypto", "Statements"]}
    />
  );
}
