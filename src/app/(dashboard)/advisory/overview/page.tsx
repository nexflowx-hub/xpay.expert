"use client";

import { CapabilityPlaceholderPage } from "@/components/shared/capability-placeholder-page";

export default function AdvisoryOverviewPage() {
  return (
    <CapabilityPlaceholderPage
      title="Advisory"
      description="Business formation, payments setup and international operations."
      capabilityKey="advisory"
      reason="Advisory sera ativado para a sua conta conforme as capacidades forem liberadas."
      plannedModules={["Services", "Cases", "Documents", "Messages"]}
    />
  );
}
