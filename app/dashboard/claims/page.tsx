import type { Metadata } from "next";
import { CircleAlert, DatabaseZap, ShieldAlert } from "lucide-react";

import {
  ClaimChecker,
  type ClaimSelectOption,
} from "@/components/dashboard/claim-checker";
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
  description: "Review recent claims and run the claim checker with participant and worker context in NDISReady.ai.",
};

export default async function ClaimsPage() {
  const claimsData = await loadClaimsWorkspace();
  const claims = claimsData.data.claims;

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-2">
          <Badge className="w-fit">Claims</Badge>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-950">
            Claim checker
          </h1>
          <p className="max-w-2xl text-base leading-7 text-slate-600">
            Review draft claims with participant and worker context, run Claude
            validation, and surface warnings before the claim moves any further.
          </p>
        </div>

        <div className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
          <ShieldAlert className="size-4" />
          Claim review
        </div>
      </div>

      <div className="space-y-3">
        <div
          className={`flex items-start gap-3 rounded-3xl border px-4 py-4 text-base shadow-sm ${
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
              ? "The claim workspace is using realistic sample records so the checker and claims list remain usable."
              : "The claim workspace is using live participant, worker, and claims data from Supabase."}
          </p>
        </div>
      </div>

      <Card className="border-white/70 bg-white/80">
        <CardHeader>
          <CardTitle>Validation sources</CardTitle>
          <CardDescription>
            The checker builds on the same saved participant and worker data as the rest of the workspace.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          <div className="rounded-3xl border border-slate-200 bg-slate-50 px-4 py-4">
            <p className="font-semibold text-slate-900">Participant context</p>
            <p className="pt-2 text-base leading-7 text-slate-600">
              {claimsData.mode === "demo"
                ? "Demo participant records are available for the checker."
                : `Loaded ${claimsData.data.participantOptions.length} participant option${claimsData.data.participantOptions.length === 1 ? "" : "s"} from Supabase.`}
            </p>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-slate-50 px-4 py-4">
            <p className="font-semibold text-slate-900">Worker context</p>
            <p className="pt-2 text-base leading-7 text-slate-600">
              {claimsData.mode === "demo"
                ? "Demo worker records are available for the checker."
                : `Loaded ${claimsData.data.workerOptions.length} worker option${claimsData.data.workerOptions.length === 1 ? "" : "s"} from Supabase.`}
            </p>
          </div>

          <div className="rounded-3xl border border-primary/10 bg-primary/5 px-4 py-4 text-base leading-7 text-slate-700">
            The checker calls `/api/check-claim`, sends the draft to Claude for validation,
            and shows returned issues as warnings or errors.
          </div>
        </CardContent>
      </Card>

      <ClaimChecker
        participantOptions={claimsData.data.participantOptions}
        workerOptions={claimsData.data.workerOptions}
      />

      <Card className="border-white/70 bg-white/80">
        <CardHeader>
          <CardTitle>Recent claims</CardTitle>
          <CardDescription>
            Recent claim context helps the demo feel complete even before a new review is run.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {claims.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 px-6 py-12 text-center text-base text-slate-500">
              No claims are available yet.
            </div>
          ) : (
            claims.map((claim) => (
              <div
                key={claim.id}
                className="rounded-3xl border border-slate-200 bg-slate-50 px-4 py-4"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="space-y-2">
                    <p className="text-lg font-semibold text-slate-950">{claim.participantName}</p>
                    <p className="text-base text-slate-600">
                      {claim.workerName
                        ? `${claim.workerName}${claim.workerRole ? ` · ${claim.workerRole}` : ""}`
                        : "No worker assigned"}
                    </p>
                    <p className="text-base text-slate-600">
                      Service date {claim.claimDate} • ${claim.amount.toFixed(2)}
                    </p>
                    {claim.notes ? (
                      <p className="text-base leading-7 text-slate-700">{claim.notes}</p>
                    ) : null}
                  </div>

                  <div className="flex flex-wrap gap-2 lg:max-w-xs lg:justify-end">
                    <span className="inline-flex rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600">
                      {formatClaimStatus(claim.status)}
                    </span>
                    {claim.reference ? (
                      <span className="inline-flex rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600">
                        {claim.reference}
                      </span>
                    ) : null}
                    {claim.supportHours ? (
                      <span className="inline-flex rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600">
                        {claim.supportHours} hrs
                      </span>
                    ) : null}
                  </div>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
