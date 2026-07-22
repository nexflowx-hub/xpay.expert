"use client";

import { PageHeader, EmptyState } from "@/components/shared";
import { Server } from "lucide-react";

export default function AdminGatewaysPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Gateways"
        description="Payment gateway management"
        breadcrumbs={[
          { label: "Admin" },
          { label: "Operations" },
          { label: "Gateways" },
        ]}
      />
      <EmptyState
        icon={Server}
        title="Gateway management coming soon"
        description="Payment gateway configuration and monitoring will be available in a future release."
      />
    </div>
  );
}