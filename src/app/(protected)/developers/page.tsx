"use client";

import dynamic from "next/dynamic";

const DevelopersPage = dynamic(
  () => import("@/components/merchant/developers"),
  { loading: () => <PageSkeleton /> }
);

function PageSkeleton() {
  return (
    <div className="space-y-6 p-6">
      <div className="h-8 w-48 animate-pulse rounded bg-muted" />
      <div className="h-96 animate-pulse rounded-lg bg-muted" />
    </div>
  );
}

export default function DevelopersPageRoute() {
  return <DevelopersPageRoute />;
}