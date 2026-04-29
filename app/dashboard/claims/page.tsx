import type { Metadata } from "next";
import { CircleAlert, DatabaseZap, ShieldAlert } from "lucide-react";

import {
  ClaimChecker,
} from "@/components/dashboard/claim-checker";
import { ClaimAnalyticsPanel } from "@/components/dashboard/module-analytics";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatClaimStatus } from "@/lib/claims";
import { loadClaimsWorkspace } from "@/lib/workspace-data";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Claims",
  description: "Review recent claims and check details with participant and worker context in NDISReady.ai.",
};

export default async function ClaimsPage() {
  const claimsData = await loadClaimsWorkspace();
  const claims = claimsData.data.claims;
  const participantCount = claimsData.data.participantOptions.length;
  const workerCount = claimsData.data.workerOptions.length;

  return (
    <div className="dashboard-page">
      <div className="dashboard-page-header">
        <div className="dashboard-page-heading">
          <Badge className="w-fit">Claims</Badge>
          <h1 className="dashboard-page-title">Claim review</h1>
          <p className="dashboard-page-copy">
            Review claims with participant and worker context and surface issues before submission.
          </p>
        </div>

        <div className="dashboard-chip">
          <ShieldAlert className="size-4" />
          Claim review
        </div>
      </div>

      <div className="space-y-3">
        <div
          className={`dashboard-notice ${
            claimsData.mode === "demo"
              ? "border-amber-200 bg-amber-50 text-amber-950"
              : "border-emerald-200 bg-emerald-50 text-emerald-950"
          }`}
        >
          {claimsData.mode === "demo" ? (
            <CircleAlert className="mt-0.5 size-4 shrink-0" />
          ) : (
            <DatabaseZap className="mt-0.5 size-4 shrink-0" />
          )}
          <p>
            {claimsData.mode === "demo"
              ? "Workspace records are temporarily limited while the connection is restored."
              : "Current participant, worker, and claim records are available for review."}
          </p>
        </div>
      </div>

      <Card className="dashboard-surface min-w-0">
        <CardHeader>
          <CardTitle>Review context</CardTitle>
          <CardDescription>
            Claim review uses the same participant and worker records available across the workspace.
          </CardDescription>
        </CardHeader>
        <CardContent className="dashboard-context-grid">
          <div className="dashboard-subpanel border-slate-200 bg-slate-50 text-slate-600">
            <p className="font-semibold text-slate-900">Participant context</p>
            <p className="pt-2">
              {participantCount} participant record{participantCount === 1 ? "" : "s"} available for claim review.
            </p>
          </div>

          <div className="dashboard-subpanel border-slate-200 bg-slate-50 text-slate-600">
            <p className="font-semibold text-slate-900">Worker context</p>
            <p className="pt-2">
              {workerCount} worker record{workerCount === 1 ? "" : "s"} available for claim review.
            </p>
          </div>

          <div className="dashboard-subpanel border-blue-100 bg-blue-50 text-slate-700">
            Each review checks the claim details against the selected participant and worker information and highlights issues that need attention.
          </div>
        </CardContent>
      </Card>

      <section className="grid min-w-0 items-start gap-4 xl:grid-cols-[minmax(280px,320px)_minmax(0,1fr)] xl:gap-5 2xl:grid-cols-[minmax(300px,340px)_minmax(0,1fr)]">
        <ClaimAnalyticsPanel
          claims={claims}
          className="order-2 min-w-0 self-start xl:order-1 xl:sticky xl:top-4"
        />

        <div className="order-1 min-w-0 space-y-4 xl:order-2">
          <ClaimChecker
            participantOptions={claimsData.data.participantOptions}
            workerOptions={claimsData.data.workerOptions}
          />

          <Card className="dashboard-surface min-w-0">
            <CardHeader>
              <CardTitle>Recent claims</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {claims.length === 0 ? (
                <div className="dashboard-empty-state">
                  No claims are available yet.
                </div>
              ) : (
                claims.map((claim) => (
                  <div
                    key={claim.id}
                    className="min-w-0 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4"
                  >
                    <div className="flex min-w-0 flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                      <div className="min-w-0 space-y-2">
                        <p className="break-words text-lg font-semibold text-slate-950">{claim.participantName}</p>
                        <p className="text-base text-slate-600">
                          {claim.workerName
                            ? `${claim.workerName}${claim.workerRole ? ` · ${claim.workerRole}` : ""}`
                            : "No worker assigned"}
                        </p>
                        {claim.notes ? (
                          <p className="break-words text-base leading-7 text-slate-700">{claim.notes}</p>
                        ) : null}
                      </div>

                      <div className="grid min-w-0 gap-2 sm:grid-cols-2 xl:w-full xl:max-w-[28rem]">
                        <div className="rounded-xl border border-white/80 bg-white px-3.5 py-3">
                          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                            Status
                          </p>
                          <p className="pt-1.5 text-sm font-medium text-slate-700">
                            {formatClaimStatus(claim.status)}
                          </p>
                        </div>

                        <div className="rounded-xl border border-white/80 bg-white px-3.5 py-3">
                          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                            Service date
                          </p>
                          <p className="pt-1.5 text-sm font-medium text-slate-700">
                            {claim.claimDate}
                          </p>
                        </div>

                        <div className="rounded-xl border border-white/80 bg-white px-3.5 py-3">
                          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                            Amount
                          </p>
                          <p className="pt-1.5 text-sm font-medium text-slate-700">
                            ${claim.amount.toFixed(2)}
                          </p>
                        </div>

                        <div className="rounded-xl border border-white/80 bg-white px-3.5 py-3">
                          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                            Support hours
                          </p>
                          <p className="pt-1.5 text-sm font-medium text-slate-700">
                            {claim.supportHours ? `${claim.supportHours} hrs` : "Not provided"}
                          </p>
                        </div>

                        <div className="rounded-xl border border-white/80 bg-white px-3.5 py-3">
                          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                            Service code
                          </p>
                          <p className="break-words pt-1.5 text-sm font-medium text-slate-700">
                            {claim.serviceCode || "Not provided"}
                          </p>
                        </div>

                        <div className="rounded-xl border border-white/80 bg-white px-3.5 py-3">
                          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                            Reference
                          </p>
                          <p className="break-words pt-1.5 text-sm font-medium text-slate-700">
                            {claim.reference || "Not provided"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
