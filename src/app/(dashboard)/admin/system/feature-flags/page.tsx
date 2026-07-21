"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/shared";
import { features, type FeatureKey } from "@/config/feature-flags";
import { Flag } from "lucide-react";

const FEATURE_LABELS: Record<FeatureKey, string> = {
  commerce: "Commerce Module",
  merchantPayouts: "Merchant Payouts",
  settlements: "Settlements",
  adminConsole: "Admin Console",
  banking: "Banking Module",
  advisory: "Advisory Module",
  advisoryCases: "Advisory Cases",
  advisoryDocuments: "Advisory Documents",
  advisoryMessages: "Advisory Messages",
  discordNotifications: "Discord Notifications",
  emailNotifications: "Email Notifications",
  whatsappNotifications: "WhatsApp Notifications",
};

export default function AdminFeatureFlagsPage() {
  const entries = Object.entries(features) as [FeatureKey, boolean][];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Feature Flags"
        description="Platform feature toggle configuration"
        breadcrumbs={[{ label: "Admin" }, { label: "Infrastructure" }, { label: "Feature Flags" }]}
      />

      <div className="hidden md:block overflow-x-auto rounded-xl border border-border/60 bg-card/60 backdrop-blur-xl">
        <Table>
          <TableHeader>
            <TableRow className="border-border/60 hover:bg-transparent">
              <TableHead>Flag Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="text-center">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {entries.map(([key, enabled]) => (
              <TableRow key={key} className="border-border/40">
                <TableCell className="font-mono text-sm">{key}</TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {FEATURE_LABELS[key] ?? key}
                </TableCell>
                <TableCell className="text-center">
                  {enabled ? (
                    <Badge className="bg-emerald-500/12 text-emerald-400 border-emerald-500/25">
                      Enabled
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-muted-foreground">
                      Disabled
                    </Badge>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Mobile Cards */}
      <div className="space-y-3 md:hidden">
        {entries.map(([key, enabled]) => (
          <div
            key={key}
            className="flex items-center justify-between rounded-xl border border-border/60 bg-card/60 p-4 backdrop-blur-xl"
          >
            <div>
              <p className="font-mono text-sm font-medium">{key}</p>
              <p className="text-xs text-muted-foreground">
                {FEATURE_LABELS[key] ?? key}
              </p>
            </div>
            {enabled ? (
              <Badge className="bg-emerald-500/12 text-emerald-400 border-emerald-500/25">
                Enabled
              </Badge>
            ) : (
              <Badge variant="outline" className="text-muted-foreground">
                Disabled
              </Badge>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}