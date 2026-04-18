"use client";

import { CheckCircle2, CircleAlert, ShieldAlert, Sparkles, UserRound, Users } from "lucide-react";
import { useState } from "react";

import type { ClaimCheckIssue } from "@/lib/claims";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export type ClaimSelectOption = {
  value: string;
  label: string;
  detail?: string;
};

type ClaimCheckerProps = {
  participantOptions: ClaimSelectOption[];
  workerOptions: ClaimSelectOption[];
};

const initialClaimNotes =
  "Worker completed community access support and recorded a brief travel check-in.";

export function ClaimChecker({
  participantOptions,
  workerOptions,
}: ClaimCheckerProps) {
  const [participantId, setParticipantId] = useState("");
  const [workerId, setWorkerId] = useState("");
  const [claimDate, setClaimDate] = useState(getTodayDateValue());
  const [amount, setAmount] = useState("185.00");
  const [supportHours, setSupportHours] = useState("3");
  const [serviceCode, setServiceCode] = useState("");
  const [reference, setReference] = useState("");
  const [claimNotes, setClaimNotes] = useState(initialClaimNotes);
  const [isChecking, setIsChecking] = useState(false);
  const [hasChecked, setHasChecked] = useState(false);
  const [apiError, setApiError] = useState("");
  const [resultSummary, setResultSummary] = useState(
    "Enter claim details and review them before submission.",
  );
  const [issues, setIssues] = useState<ClaimCheckIssue[]>([]);
  const canCheck = Boolean(
    participantId && workerId && claimDate && amount.trim() && claimNotes.trim(),
  );
  const selectedParticipantLabel = findOptionLabel(participantOptions, participantId);
  const selectedWorkerLabel = findOptionLabel(workerOptions, workerId);

  function handleDraftChange(update: () => void) {
    update();

    if (!hasChecked && issues.length === 0 && !apiError) {
      return;
    }

    setHasChecked(false);
    setIssues([]);
    setApiError("");
    setResultSummary("Claim details changed. Review them again to refresh the result.");
  }

  async function handleCheckClaim() {
    setIsChecking(true);
    setApiError("");
    setResultSummary("Checking claim...");

    try {
      const response = await fetch("/api/check-claim", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          participantId,
          participantName: findOptionLabel(participantOptions, participantId),
          workerId,
          workerName: findOptionLabel(workerOptions, workerId),
          claimDate,
          amount,
          supportHours,
          serviceCode,
          reference,
          claimNotes,
        }),
      });
      const payload = (await response.json().catch(() => null)) as
        | { summary?: string; issues?: ClaimCheckIssue[]; error?: string }
        | null;

      if (!response.ok || !payload) {
        throw new Error(payload?.error || "Claim review failed.");
      }

      setIssues(Array.isArray(payload.issues) ? payload.issues : []);
      setResultSummary(
        typeof payload.summary === "string" && payload.summary.trim()
          ? payload.summary.trim()
          : "Claim review completed.",
      );
      setHasChecked(true);
    } catch (error) {
      setIssues([]);
      setApiError(getErrorMessage(error));
      setResultSummary("Claim review failed. Resolve the issue and try again.");
    } finally {
      setIsChecking(false);
    }
  }

  const totalErrors = issues.filter((issue) => issue.severity === "error").length;
  const totalWarnings = issues.filter((issue) => issue.severity === "warning").length;

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <Card className="border-white/70 bg-white/80">
          <CardHeader className="flex flex-col gap-4 space-y-0 md:flex-row md:items-start md:justify-between">
            <div>
              <CardDescription>Participants</CardDescription>
              <CardTitle className="pt-2 text-3xl">{participantOptions.length}</CardTitle>
            </div>
            <div className="rounded-2xl bg-slate-100 p-3 text-slate-700">
              <UserRound className="size-5" />
            </div>
          </CardHeader>
        </Card>

        <Card className="border-white/70 bg-white/80">
          <CardHeader className="flex flex-col gap-4 space-y-0 md:flex-row md:items-start md:justify-between">
            <div>
              <CardDescription>Workers</CardDescription>
              <CardTitle className="pt-2 text-3xl">{workerOptions.length}</CardTitle>
            </div>
            <div className="rounded-2xl bg-slate-100 p-3 text-slate-700">
              <Users className="size-5" />
            </div>
          </CardHeader>
        </Card>

        <Card className="border-white/70 bg-white/80">
          <CardHeader className="flex flex-col gap-4 space-y-0 md:flex-row md:items-start md:justify-between">
            <div>
              <CardDescription>Issues found</CardDescription>
              <CardTitle className="pt-2 text-3xl">{issues.length}</CardTitle>
            </div>
            <div className="rounded-2xl bg-slate-100 p-3 text-slate-700">
              <ShieldAlert className="size-5" />
            </div>
          </CardHeader>
        </Card>
      </section>

      <section className="grid items-start gap-4 xl:grid-cols-[minmax(0,0.95fr)_minmax(20rem,1.05fr)]">
        <Card className="border-white/70 bg-white/80">
          <CardHeader>
            <CardTitle>Claim details</CardTitle>
            <CardDescription>
              Choose the participant and worker, add the claim details, and review them
              before the claim is submitted.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-5">
            <div className="grid gap-3 md:grid-cols-3">
              <div className="soft-panel px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Participant
                </p>
                <p className="pt-2 text-base font-semibold text-slate-900">
                  {selectedParticipantLabel || "Select participant"}
                </p>
              </div>
              <div className="soft-panel px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Worker
                </p>
                <p className="pt-2 text-base font-semibold text-slate-900">
                  {selectedWorkerLabel || "Select worker"}
                </p>
              </div>
              <div className="soft-panel px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Review state
                </p>
                <p className="pt-2 text-base font-semibold text-slate-900">
                  {hasChecked ? "Results ready" : "Awaiting review"}
                </p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="space-y-2 text-sm">
                <span className="font-medium text-slate-700">Participant</span>
                <select
                  value={participantId}
                  onChange={(event) =>
                    handleDraftChange(() => setParticipantId(event.target.value))
                  }
                  className="field-control"
                >
                  <option value="">Select participant</option>
                  {participantOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                {findOptionDetail(participantOptions, participantId) ? (
                  <p className="text-base text-slate-500">
                    {findOptionDetail(participantOptions, participantId)}
                  </p>
                ) : null}
              </label>

              <label className="space-y-2 text-sm">
                <span className="font-medium text-slate-700">Worker</span>
                <select
                  value={workerId}
                  onChange={(event) =>
                    handleDraftChange(() => setWorkerId(event.target.value))
                  }
                  className="field-control"
                >
                  <option value="">Select worker</option>
                  {workerOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                {findOptionDetail(workerOptions, workerId) ? (
                  <p className="text-base text-slate-500">{findOptionDetail(workerOptions, workerId)}</p>
                ) : null}
              </label>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="space-y-2 text-sm">
                <span className="font-medium text-slate-700">Claim date</span>
                <input
                  type="date"
                  value={claimDate}
                  onChange={(event) =>
                    handleDraftChange(() => setClaimDate(event.target.value))
                  }
                  className="field-control"
                />
              </label>

              <label className="space-y-2 text-sm">
                <span className="font-medium text-slate-700">Amount</span>
                <input
                  value={amount}
                  onChange={(event) => handleDraftChange(() => setAmount(event.target.value))}
                  className="field-control"
                  placeholder="185.00"
                />
              </label>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="space-y-2 text-sm">
                <span className="font-medium text-slate-700">Support hours</span>
                <input
                  value={supportHours}
                  onChange={(event) =>
                    handleDraftChange(() => setSupportHours(event.target.value))
                  }
                  className="field-control"
                  placeholder="3"
                />
              </label>

              <label className="space-y-2 text-sm">
                <span className="font-medium text-slate-700">Service code</span>
                <input
                  value={serviceCode}
                  onChange={(event) =>
                    handleDraftChange(() => setServiceCode(event.target.value))
                  }
                  className="field-control"
                  placeholder="04_104_0125_6_1"
                />
              </label>
            </div>

            <label className="space-y-2 text-sm">
              <span className="font-medium text-slate-700">Reference</span>
              <input
                value={reference}
                onChange={(event) => handleDraftChange(() => setReference(event.target.value))}
                className="field-control"
                placeholder="CLM-APR-2026-001"
              />
            </label>

            <label className="space-y-2 text-sm">
              <span className="font-medium text-slate-700">Claim notes</span>
              <textarea
                rows={8}
                value={claimNotes}
                onChange={(event) =>
                  handleDraftChange(() => setClaimNotes(event.target.value))
                }
                className="field-textarea"
                placeholder="Describe the support that was delivered and why the claim should be valid."
              />
            </label>

            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <Button
                type="button"
                size="lg"
                onClick={handleCheckClaim}
                disabled={isChecking || !canCheck}
                className="w-full md:w-auto"
              >
                <Sparkles className="size-4" />
                {isChecking ? "Checking details..." : "Check details"}
              </Button>
              <p className="text-base text-slate-500">
                The claim is reviewed against the selected participant, worker, and claim details.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="w-full self-start border-slate-200 bg-slate-950 text-white xl:sticky xl:top-6">
          <CardHeader>
            <div className="flex flex-wrap items-center gap-3">
              <CardTitle className="text-white">Claim review</CardTitle>
              <Badge
                variant={hasChecked && issues.length === 0 ? "default" : "secondary"}
                className={
                  !hasChecked
                    ? "border-white/10 bg-white/10 text-slate-200"
                    : issues.length === 0
                      ? "border-emerald-500/25 bg-emerald-500/15 text-emerald-200"
                      : "border-amber-500/25 bg-amber-500/15 text-amber-200"
                }
              >
                {!hasChecked
                  ? "Awaiting review"
                  : issues.length === 0
                    ? "No issues found"
                    : `${totalErrors} errors • ${totalWarnings} warnings`}
              </Badge>
            </div>
            <CardDescription className="text-slate-300">
              Review results appear here so issues can be addressed before claim submission.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-3xl border border-white/10 bg-white/5 px-4 py-4 text-base text-slate-300">
              {resultSummary}
            </div>

            {apiError ? (
              <div className="flex items-start gap-3 rounded-3xl border border-rose-500/30 bg-rose-500/10 px-4 py-4 text-base text-rose-100">
                <CircleAlert className="mt-0.5 size-4 shrink-0" />
                <p>{apiError}</p>
              </div>
            ) : null}

            {!hasChecked && !apiError ? (
              <div className="rounded-3xl border border-white/10 bg-white/5 px-4 py-4 text-base text-slate-300">
                Check the details to surface issues before the claim moves any further.
              </div>
            ) : null}

            {hasChecked && issues.length === 0 && !apiError ? (
              <div className="flex items-start gap-3 rounded-3xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-4 text-base text-emerald-100">
                <CheckCircle2 className="mt-0.5 size-4 shrink-0" />
                <p>No claim issues are currently shown. Check the details again after editing the claim to refresh the result.</p>
              </div>
            ) : null}

            {issues.length > 0 ? (
              <div className="space-y-3">
                {issues.map((issue, index) => (
                  <div
                    key={`${issue.field ?? "general"}-${issue.title}-${index}`}
                    className={`rounded-3xl border px-4 py-4 text-base ${
                      issue.severity === "error"
                        ? "border-rose-500/30 bg-rose-500/10 text-rose-100"
                        : "border-amber-500/30 bg-amber-500/10 text-amber-100"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <CircleAlert className="mt-0.5 size-4 shrink-0" />
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-semibold">{issue.title}</p>
                          <Badge
                            variant="secondary"
                            className={
                              issue.severity === "error"
                                ? "border-rose-500/30 bg-rose-500/10 text-rose-100"
                                : "border-amber-500/30 bg-amber-500/10 text-amber-100"
                            }
                          >
                            {issue.severity}
                          </Badge>
                          {issue.field ? (
                            <span className="text-xs uppercase tracking-[0.18em] text-current/70">
                              {issue.field}
                            </span>
                          ) : null}
                        </div>
                        <p className="pt-2 leading-6">{issue.detail}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : null}

            <div className="rounded-3xl border border-white/10 bg-white/5 px-4 py-4 text-base text-slate-300">
              Any issues found during review will appear here before the claim is submitted.
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

function findOptionDetail(options: readonly ClaimSelectOption[], value: string) {
  return options.find((option) => option.value === value)?.detail;
}

function findOptionLabel(options: readonly ClaimSelectOption[], value: string) {
  return options.find((option) => option.value === value)?.label;
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Claim review failed.";
}

function getTodayDateValue() {
  return new Date().toISOString().slice(0, 10);
}
