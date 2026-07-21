"use client";

import { motion } from "framer-motion";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader, StatusBadge, EmptyState, ErrorState } from "@/components/shared";
import { useAdminKyc } from "@/hooks/use-queries";
import { formatDate } from "@/lib/utils";
import type { KycReview, KycDocument } from "@/types";
import { ScrollText } from "lucide-react";

function DocBadge({ doc }: { doc: KycDocument }) {
  return (
    <Badge variant="outline" className="text-[10px] gap-1">
      {doc.name}
      <span className="text-muted-foreground">({doc.pages}p)</span>
    </Badge>
  );
}

export default function AdminKycPage() {
  const { data, isLoading, isError, refetch } = useAdminKyc();
  const reviews: KycReview[] = Array.isArray(data) ? data : [];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="KYC Queue"
          description="Merchant verification requests"
          breadcrumbs={[{ label: "Admin" }, { label: "KYC Queue" }]}
        />
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-14 rounded-lg" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="space-y-6">
        <PageHeader title="KYC Queue" breadcrumbs={[{ label: "Admin" }, { label: "KYC Queue" }]} />
        <ErrorState message="Failed to load KYC queue" onRetry={() => refetch()} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="KYC Queue"
        description={`${reviews.length} verification requests`}
        breadcrumbs={[{ label: "Admin" }, { label: "KYC Queue" }]}
      />

      {reviews.length === 0 && (
        <EmptyState
          icon={ScrollText}
          title="No KYC requests"
          description="No pending or reviewed KYC submissions"
        />
      )}

      {reviews.length > 0 && (
        <>
          {/* Desktop Table */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="hidden md:block overflow-x-auto rounded-xl border border-border/60 bg-card/60 backdrop-blur-xl"
          >
            <Table>
              <TableHeader>
                <TableRow className="border-border/60 hover:bg-transparent">
                  <TableHead>Merchant</TableHead>
                  <TableHead>Country</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead>Documents</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Risk Flags</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reviews.map((r) => (
                  <TableRow key={r.id} className="border-border/40">
                    <TableCell>
                      <div>
                        <p className="text-sm font-medium">{r.merchantName}</p>
                        <p className="text-xs text-muted-foreground font-mono">{r.merchantId}</p>
                      </div>
                    </TableCell>
                    <TableCell>{r.country}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{formatDate(r.submittedAt)}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {r.documents.map((d) => (
                          <DocBadge key={d.id} doc={d} />
                        ))}
                      </div>
                    </TableCell>
                    <TableCell><StatusBadge status={r.status} /></TableCell>
                    <TableCell>
                      {r.riskFlags.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {r.riskFlags.map((f, i) => (
                            <Badge key={i} variant="outline" className="text-[10px] bg-rose-500/10 text-rose-400 border-rose-500/25">
                              {f}
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">None</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </motion.div>

          {/* Mobile Cards */}
          <div className="space-y-3 md:hidden">
            {reviews.map((r) => (
              <motion.div
                key={r.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="rounded-xl border border-border/60 bg-card/60 p-4 backdrop-blur-xl space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-semibold">{r.merchantName}</p>
                      <p className="text-xs text-muted-foreground font-mono">{r.merchantId}</p>
                    </div>
                    <StatusBadge status={r.status} />
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-muted-foreground">Country</span>
                      <p className="font-medium">{r.country}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Submitted</span>
                      <p className="font-medium">{formatDate(r.submittedAt)}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {r.documents.map((d) => (
                      <DocBadge key={d.id} doc={d} />
                    ))}
                  </div>
                  {r.riskFlags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {r.riskFlags.map((f, i) => (
                        <Badge key={i} variant="outline" className="text-[10px] bg-rose-500/10 text-rose-400 border-rose-500/25">
                          {f}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}