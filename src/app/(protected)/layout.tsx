import { DashboardGuard } from "@/components/dashboard/dashboard-guard";

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  return <DashboardGuard>{children}</DashboardGuard>;
}