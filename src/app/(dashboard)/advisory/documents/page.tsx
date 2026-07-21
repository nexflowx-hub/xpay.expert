"use client";

import { FileText } from "lucide-react";
import { EmptyState } from "@/components/shared";
import { PageHeader } from "@/components/shared";

export default function AdvisoryDocumentsPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Documents"
        description="Manage your business documents"
        breadcrumbs={[
          { label: "Advisory" },
          { label: "Documents" },
        ]}
      />
      <EmptyState
        icon={FileText}
        title="Document management coming soon"
        description="Upload, manage, and track your business documents."
      />
    </div>
  );
}