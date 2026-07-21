"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Building2, ShieldCheck, Mail, Hash, Crown, Save, Loader2,
} from "lucide-react";
import { useMerchantProfile, useUpdateMerchantProfile } from "@/hooks/use-queries";
import { PageHeader, ErrorState } from "@/components/shared";
import { StatusBadge } from "@/components/shared/badges";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Form, FormField, FormItem, FormLabel, FormControl, FormMessage,
} from "@/components/ui/form";
import { cn, formatDate } from "@/lib/utils";
import type { MerchantProfile } from "@/types";

const profileSchema = z.object({
  name: z.string().min(1, "Name is required").max(120),
  company: z.string().max(200).optional(),
});

type ProfileForm = z.infer<typeof profileSchema>;

export default function SettingsPage() {
  const { data: profile, isLoading, isError, refetch } = useMerchantProfile();
  const updateMutation = useUpdateMerchantProfile();

  const form = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: "", company: "" },
    values: profile ? { name: profile.name ?? "", company: profile.company ?? "" } : undefined,
  });

  if (isError) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader title="Settings" description="Account and profile settings" breadcrumbs={[{ label: "Settings" }]} />
        <ErrorState message="Failed to load profile. The backend may be unreachable." onRetry={() => refetch()} />
      </div>
    );
  }

  function onSubmit(values: ProfileForm) {
    updateMutation.mutate({
      name: values.name,
      company: values.company || undefined,
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Settings"
        description="Account and profile settings"
        breadcrumbs={[{ label: "Settings" }]}
      />

      {isLoading ? (
        <div className="flex flex-col gap-4">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      ) : !profile ? (
        <ErrorState message="No profile data available" onRetry={() => refetch()} />
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Profile form */}
          <Card className="lg:col-span-2 border-border/60 bg-card/60 p-5 backdrop-blur-xl">
            <div className="mb-5">
              <h3 className="flex items-center gap-2 text-sm font-semibold">
                <Building2 className="h-4 w-4 text-primary" />
                Profile
              </h3>
              <p className="text-xs text-muted-foreground">
                Update your name and company information.
              </p>
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Display name</FormLabel>
                      <FormControl>
                        <Input placeholder="Your name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="company"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Company</FormLabel>
                      <FormControl>
                        <Input placeholder="Company name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex items-center gap-2">
                  <Button
                    type="submit"
                    size="sm"
                    className="gap-1.5"
                    disabled={updateMutation.isPending}
                  >
                    {updateMutation.isPending ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Save className="h-3.5 w-3.5" />
                    )}
                    Save changes
                  </Button>
                </div>
              </form>
            </Form>
          </Card>

          {/* Account info (read-only) */}
          <Card className="border-border/60 bg-card/60 p-5 backdrop-blur-xl">
            <div className="mb-5">
              <h3 className="flex items-center gap-2 text-sm font-semibold">
                <ShieldCheck className="h-4 w-4 text-primary" />
                Account info
              </h3>
              <p className="text-xs text-muted-foreground">
                Read-only account details.
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <InfoRow icon={Mail} label="Email" value={profile.email} />
              <InfoRow icon={Hash} label="Merchant ID" value={profile.id} mono />
              <InfoRow
                icon={Crown}
                label="Tier"
                value={profile.tier ? (
                  <Badge variant="outline" className="border-amber-500/25 bg-amber-500/12 text-amber-400 capitalize">
                    {profile.tier}
                  </Badge>
                ) : (
                  "\u2014"
                )}
              />
              <InfoRow
                icon={ShieldCheck}
                label="KYC Status"
                value={
                  profile.kycStatus ? (
                    <StatusBadge status={profile.kycStatus as "approved" | "pending" | "rejected" | "not_submitted"} />
                  ) : (
                    "\u2014"
                  )
                }
              />
              <Separator className="my-1" />
              <p className="text-[11px] text-muted-foreground">
                Member since {formatDate(profile.createdAt)}
              </p>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

function InfoRow({
  icon: Icon,
  label,
  value,
  mono,
}: {
  icon: React.ElementType;
  label: string;
  value: React.ReactNode;
  mono?: boolean;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 rounded-md bg-muted/60 p-1.5 text-muted-foreground">
        <Icon className="h-3.5 w-3.5" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
          {label}
        </p>
        <p className={cn("mt-0.5 text-sm text-foreground", mono && "font-mono text-xs")}>
          {value}
        </p>
      </div>
    </div>
  );
}