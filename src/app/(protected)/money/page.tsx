"use client";

import dynamic from "next/dynamic";

const WalletsPage = dynamic(
  () => import("@/components/merchant/wallets"),
  { loading: () => <PageSkeleton /> }
);

function PageSkeleton() {
  return (
    <div className="space-y-6 p-6">
      <div className="h-8 w-48 animate-pulse rounded bg-muted" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-32 animate-pulse rounded-lg bg-muted" />
        ))}
      </div>
    </div>
  );
}

export default function MoneyPageRoute() {
  return <WalletsPageRoute />;
}