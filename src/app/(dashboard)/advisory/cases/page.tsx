"use client";

import { FolderOpen } from "lucide-react";
import { EmptyState } from "@/components/shared";
import { PageHeader } from "@/components/shared";

export default function AdvisoryCasesPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Advisory Cases"
        description="Track your service requests and progress"
        breadcrumbs={[
          { label: "Advisory" },
          { label: "Cases" },
        ]}
      />
      <EmptyState
        icon={FolderOpen}
        title="Advisory Cases will be available soon"
        description="Track your service requests, proposals, and progress."
      />
    </div>
  );
}