"use client";

import { PageHeader, EmptyState } from "@/components/shared";
import { FileText } from "lucide-react";

export default function AdminLogsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Logs"
        description="System and audit logs"
        breadcrumbs={[{ label: "Admin" }, { label: "Infrastructure" }, { label: "Logs" }]}
      />
      <EmptyState
        icon={FileText}
        title="Logs coming soon"
        description="System and audit log viewer will be available in a future release."
      />
    </div>
  );
}