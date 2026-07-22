"use client";

import { PageHeader, EmptyState } from "@/components/shared";
import { ShieldCheck } from "lucide-react";

export default function AdminRiskPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Risk Management"
        description="Platform risk monitoring and controls"
        breadcrumbs={[
          { label: "Admin" },
          { label: "Operations" },
          { label: "Risk" },
        ]}
      />
      <EmptyState
        icon={ShieldCheck}
        title="Risk management coming soon"
        description="Platform-level risk monitoring, alerts, and controls will be available in a future release."
      />
    </div>
  );
}