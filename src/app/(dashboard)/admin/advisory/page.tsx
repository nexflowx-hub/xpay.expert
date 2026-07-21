"use client";

import { PageHeader, EmptyState } from "@/components/shared";
import { BarChart3 } from "lucide-react";

export default function AdminAdvisoryPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Advisory"
        description="Platform advisory and insights"
        breadcrumbs={[
          { label: "Admin" },
          { label: "Advisory" },
        ]}
      />
      <EmptyState
        icon={BarChart3}
        title="Advisory coming soon"
        description="Platform advisory tools and insights will be available in a future release."
      />
    </div>
  );
}