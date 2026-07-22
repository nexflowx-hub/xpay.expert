"use client";

import { MessageSquare } from "lucide-react";
import { EmptyState } from "@/components/shared";
import { PageHeader } from "@/components/shared";

export default function AdvisoryMessagesPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Messages"
        description="Communicate with your advisor"
        breadcrumbs={[
          { label: "Advisory" },
          { label: "Messages" },
        ]}
      />
      <EmptyState
        icon={MessageSquare}
        title="Messages coming soon"
        description="Communicate directly with your advisor."
      />
    </div>
  );
}