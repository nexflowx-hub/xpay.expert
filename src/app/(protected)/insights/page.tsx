"use client";

import dynamic from "next/dynamic";

const AnalyticsPage = dynamic(
  () => import("@/components/merchant/analytics"),
  { loading: () => <PageSkeleton /> }
);

function PageSkeleton() {
  return (
    <div className="space-y-6 p-6">
      <div className="h-8 w-48 animate-pulse rounded bg-muted" />
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-24 animate-pulse rounded-lg bg-muted" />
        ))}
      </div>
    </div>
  );
}

export default function InsightsPageRoute() {
  return <AnalyticsPageRoute />;
}