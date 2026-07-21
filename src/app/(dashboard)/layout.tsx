import { MerchantGuard } from "@/components/dashboard/merchant-guard";
import { DashboardShell } from "@/components/dashboard/shell";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <MerchantGuard>
      <DashboardShell>{children}</DashboardShell>
    </MerchantGuard>
  );
}
