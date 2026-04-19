import type { Metadata } from "next";
import Link from "next/link";
import { Activity, CalendarDays, CircleAlert, CircleCheckBig, ListTodo, Users } from "lucide-react";

import { OverviewAnalyticsGrid } from "@/components/dashboard/overview-analytics-grid";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { claimsUrl, notesUrl, participantsUrl, workersUrl } from "@/lib/routes";
import { loadDashboardSnapshot } from "@/lib/workspace-data";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Dashboard",
  description: "Overview of workers, participants, notes, compliance, and claim activity in NDISReady.ai.",
};

const routeCards = [
  {
    title: "Workers",
    description: "Open the live worker roster, review active staffing, and add new team members.",
    href: workersUrl,
  },
  {
    title: "Participants",
    description: "Review participant records, goal coverage, and profile detail pages.",
    href: participantsUrl,
  },
  {
    title: "Notes",
    description: "Move into the saved notes feed, filters, and note composer.",
    href: notesUrl,
  },
  {
    title: "Claims",
    description: "Review claims and address any issues before submission.",
    href: claimsUrl,
  },
];

export default async function DashboardPage() {
  const snapshot = await loadDashboardSnapshot();
  const workers = snapshot.data.workers;
  const participants = snapshot.data.participants;
  const notes = snapshot.data.noteSummaries;
  const claims = snapshot.data.claims;

  const activeWorkers = workers.filter((worker) => worker.status === "active").length;
  const participantsWithGoals = participants.filter((participant) => participant.goals.length > 0).length;
  const participantsWithNotes = new Set(
    notes.filter((note) => Boolean(note.approvedAt)).map((note) => note.participantId),
  ).size;
  const complianceScore = getComplianceScore({
    totalWorkers: workers.length,
    activeWorkers,
    totalParticipants: participants.length,
    participantsWithGoals,
    participantsWithNotes,
  });
  const workerCoverage = workers.length > 0 ? Math.round((activeWorkers / workers.length) * 100) : 0;
  const goalCoverage =
    participants.length > 0 ? Math.round((participantsWithGoals / participants.length) * 100) : 0;
  const noteCoverage =
    participants.length > 0 ? Math.round((participantsWithNotes / participants.length) * 100) : 0;

  const stats = [
    {
      title: "Workers",
      value: String(workers.length),
      detail:
        workers.length === 0
          ? "No workers saved yet"
          : `${activeWorkers} active in the current roster`,
      icon: Activity,
    },
    {
      title: "Participants",
      value: String(participants.length),
      detail:
        participants.length === 0
          ? "No participants saved yet"
          : `${participantsWithGoals} with recorded goals`,
      icon: Users,
    },
    {
      title: "Saved notes",
      value: String(notes.length),
      detail:
        notes.length === 0
          ? "No approved notes saved yet"
          : `${participantsWithNotes} participant${participantsWithNotes === 1 ? "" : "s"} covered`,
      icon: ListTodo,
    },
    {
      title: "Compliance score",
      value: `${complianceScore}%`,
      detail: getComplianceDetail({
        totalWorkers: workers.length,
        activeWorkers,
        totalParticipants: participants.length,
        participantsWithGoals,
        participantsWithNotes,
      }),
      icon: CircleCheckBig,
    },
  ];
  const coverageCards = [
    {
      label: "Worker coverage",
      value: `${workerCoverage}%`,
      detail: `${activeWorkers} active workers from ${workers.length || 0} total`,
    },
    {
      label: "Goal coverage",
      value: `${goalCoverage}%`,
      detail: `${participantsWithGoals} participants with goals recorded`,
    },
    {
      label: "Note coverage",
      value: `${noteCoverage}%`,
      detail: `${participantsWithNotes} participants covered by approved notes`,
    },
  ];
  const activeParticipants = participants.filter((participant) => participant.status === "active").length;
  const workerDistribution = [
    { label: "Active", value: activeWorkers, color: "#0f766e" },
    { label: "Inactive", value: Math.max(workers.length - activeWorkers, 0), color: "#94a3b8" },
  ];
  const participantDistribution = [
    { label: "Active", value: activeParticipants, color: "#0f766e" },
    { label: "Inactive", value: Math.max(participants.length - activeParticipants, 0), color: "#cbd5e1" },
  ];
  const notesActivity = buildRecentDailySeries(notes.map((note) => note.createdAt), 7);
  const notesTrend = buildTrendSummary(notes.map((note) => note.createdAt), 7, "notes created in the last 7 days");
  const claimsDistribution = buildClaimsStatusDistribution(claims.map((claim) => claim.status));
  const activityTimeline = buildRecentDailySeries(
    [
      ...workers.map((worker) => worker.createdAt),
      ...participants.map((participant) => participant.createdAt),
      ...notes.map((note) => note.createdAt),
      ...claims.map((claim) => claim.createdAt),
    ],
    7,
  );

  return (
    <div className="dashboard-page">
      <div className="dashboard-page-header">
        <div className="dashboard-page-heading">
          <Badge
            variant="secondary"
            className="w-fit border border-primary/15 bg-primary/10 px-3 py-1 text-primary shadow-sm"
          >
            Overview
          </Badge>
          <h1 className="dashboard-page-title">Operations overview</h1>
          <p className="dashboard-page-copy">
            Review worker, participant, note, and claim activity from one dashboard
            with totals that reflect the current saved workspace data.
          </p>
        </div>
      </div>

      {snapshot.notice ? (
        <div className="dashboard-notice border-amber-200 bg-amber-50 text-amber-950">
          <CircleAlert className="mt-0.5 size-4 shrink-0" />
          <div className="space-y-1">
            <p className="font-semibold">{snapshot.notice.title}</p>
            <p>{snapshot.notice.message}</p>
          </div>
        </div>
      ) : null}

      <section className="dashboard-overview-grid">
        {stats.map(({ title, value, detail, icon: Icon }) => (
          <Card key={title} className="dashboard-stat-surface relative">
            <CardHeader className="space-y-2 p-3.5 pb-2.5 md:p-3.5 md:pb-2.5">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-0.5">
                  <CardDescription className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                    {title}
                  </CardDescription>
                  <CardTitle className="text-[1.45rem] leading-none sm:text-[1.65rem]">{value}</CardTitle>
                </div>
                <div className="inline-flex size-9 items-center justify-center rounded-[10px] bg-slate-100 text-slate-700">
                  <Icon className="size-4.5" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-3.5 pt-0 text-[13px] leading-5 text-slate-600 md:p-3.5 md:pt-0">
              {detail}
            </CardContent>
          </Card>
        ))}
      </section>

      <div className="grid min-w-0 gap-4 md:gap-6 lg:grid-cols-12 lg:items-start">
        <div className="min-w-0 space-y-4 md:space-y-6 lg:col-span-8">
          <Card className="dashboard-surface overflow-hidden">
            <CardHeader className="border-b border-slate-200 bg-slate-50/80 p-3.5 sm:p-4 md:p-4">
              <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                <div className="space-y-1.5">
                  <CardTitle className="text-[1.35rem] font-semibold">Service compliance overview</CardTitle>
                  <CardDescription className="max-w-3xl text-sm leading-5 text-slate-600">
                    Track operational coverage across workers, participant planning, and approved notes
                    from one desktop workspace.
                  </CardDescription>
                </div>

                <div className="w-full rounded-[12px] border border-emerald-200 bg-emerald-50 px-4 py-3 xl:min-w-[188px] xl:w-auto">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-800/80">
                    Compliance score
                  </p>
                  <p className="pt-1.5 text-[2rem] font-semibold leading-none tracking-tight text-emerald-950">
                    {complianceScore}%
                  </p>
                  <p className="pt-1.5 text-xs leading-5 text-emerald-900/80">
                    Coverage across active workers, participant goals, and approved notes.
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="grid gap-3 p-3.5 sm:p-4 md:p-4 lg:grid-cols-[minmax(0,1.18fr)_240px] xl:grid-cols-[minmax(0,1.18fr)_248px]">
              <div className="space-y-3">
                <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                  {coverageCards.map((item) => (
                    <div
                      key={item.label}
                      className="rounded-[12px] border border-slate-200 bg-white p-3.5"
                    >
                      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                        {item.label}
                      </p>
                      <p className="pt-2 text-[1.65rem] font-semibold leading-none tracking-tight text-slate-950">
                        {item.value}
                      </p>
                      <p className="pt-1.5 text-[13px] leading-5 text-slate-600">{item.detail}</p>
                    </div>
                  ))}
                </div>

                <div className="grid gap-2.5 md:grid-cols-2">
                  {routeCards.map((route) => (
                    <div
                      key={route.href}
                      className="flex flex-col items-start gap-3 rounded-[12px] border border-slate-200 bg-slate-50 px-3.5 py-3 min-[430px]:flex-row min-[430px]:items-center min-[430px]:justify-between"
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-900">{route.title}</p>
                        <p className="pt-1 text-[12px] leading-5 text-slate-600">{route.description}</p>
                      </div>
                      <Button asChild variant="outline" size="sm" className="w-full shrink-0 min-[430px]:w-auto">
                        <Link href={route.href}>Open</Link>
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-[12px] border border-slate-200 bg-slate-50 p-3.5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Current workspace
                </p>
                <div className="pt-3 space-y-2.5 text-[13px] leading-5 text-slate-600">
                  <p>
                    {workers.length} worker{workers.length === 1 ? "" : "s"} and {participants.length} participant
                    record{participants.length === 1 ? "" : "s"} are active across the workspace.
                  </p>
                  <p>
                    {notes.length} saved note{notes.length === 1 ? "" : "s"} and {claims.length} claim
                    {claims.length === 1 ? "" : "s"} are currently available for review.
                  </p>
                  <p>
                    The compliance score combines staffing coverage, participant goals, and approved note coverage.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <OverviewAnalyticsGrid
            workerDistribution={workerDistribution}
            participantDistribution={participantDistribution}
            notesActivity={notesActivity}
            notesTrend={notesTrend}
            claimsDistribution={claimsDistribution}
            activityTimeline={activityTimeline}
          />
        </div>

        <div className="min-w-0 space-y-4 md:space-y-6 lg:col-span-4">
          <Card className="dashboard-surface">
            <CardHeader className="space-y-1.5 p-3.5 pb-3 sm:p-4 sm:pb-3">
              <CardTitle className="text-[1.15rem] font-semibold">Workspace health</CardTitle>
              <CardDescription className="text-[13px] leading-5 text-slate-600">
                Compliance and coverage signals for the current workspace.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 p-3.5 pt-0 sm:p-4 sm:pt-0">
              <div className="rounded-[12px] border border-emerald-200 bg-emerald-50 px-3.5 py-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-800/80">
                  Ready score
                </p>
                <p className="pt-1.5 text-[1.9rem] font-semibold leading-none tracking-tight text-emerald-950">
                  {complianceScore}%
                </p>
                <p className="pt-1.5 text-[12px] leading-5 text-emerald-900/80">
                  Updated from worker activity, participant goals, and approved notes.
                </p>
              </div>

              {coverageCards.map((item) => (
                <div
                  key={`signal-${item.label}`}
                  className="flex flex-col items-start gap-2.5 rounded-[12px] border border-slate-200 bg-slate-50 px-3.5 py-3 min-[390px]:flex-row min-[390px]:items-center min-[390px]:justify-between"
                >
                  <div className="min-w-0">
                    <p className="text-[13px] font-semibold leading-5 text-slate-900">{item.label}</p>
                    <p className="text-[11px] leading-4 text-slate-500">{item.detail}</p>
                  </div>
                  <p className="shrink-0 text-lg font-semibold text-slate-950">{item.value}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="dashboard-surface">
            <CardHeader className="space-y-1.5 p-3.5 pb-3 sm:p-4 sm:pb-3">
              <CardTitle className="text-[1.15rem] font-semibold">Operational rhythm</CardTitle>
              <CardDescription className="text-[13px] leading-5 text-slate-600">
                Weekly review cadence and current workspace summary.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 p-3.5 pt-0 sm:p-4 sm:pt-0">
              <div className="flex items-start gap-3 rounded-[12px] border border-slate-200 bg-slate-50 px-3.5 py-3">
                <div className="rounded-[10px] bg-primary/10 p-2 text-primary">
                  <CalendarDays className="size-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-[13px] font-semibold text-slate-900">Roster review every Monday</p>
                  <p className="pt-1 text-[12px] leading-5 text-slate-600">
                    Review staffing coverage and participant planning before the week starts.
                  </p>
                </div>
              </div>

              <div className="rounded-[12px] border border-slate-200 bg-slate-50 px-3.5 py-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                  Workspace snapshot
                </p>
                <div className="pt-2.5 space-y-2 text-[13px] leading-5 text-slate-600">
                  <p>
                    {workers.length === 0
                      ? "No workers are currently listed in the roster."
                      : `${workers.length} worker${workers.length === 1 ? "" : "s"} are currently listed in the roster.`}
                  </p>
                  <p>
                    {participants.length === 0
                      ? "No participant records are currently available."
                      : `${participants.length} participant record${participants.length === 1 ? "" : "s"} are currently available.`}
                  </p>
                  <p>
                    {claims.length > 0
                      ? `${claims.length} claim${claims.length === 1 ? "" : "s"} are available in the current workspace.`
                      : "Claim review is ready for the next review cycle."}
                  </p>
                </div>
              </div>

              <div className="rounded-[12px] border border-slate-200 bg-slate-50 px-3.5 py-3">
                <p className="text-[13px] font-semibold text-slate-900">Case sync every Thursday</p>
                <p className="pt-1 text-[12px] leading-5 text-slate-600">
                  Use notes and claim activity to confirm readiness before the next review cycle.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function getComplianceScore(input: {
  totalWorkers: number;
  activeWorkers: number;
  totalParticipants: number;
  participantsWithGoals: number;
  participantsWithNotes: number;
}) {
  const workerCoverage =
    input.totalWorkers > 0 ? input.activeWorkers / input.totalWorkers : 0;
  const goalCoverage =
    input.totalParticipants > 0 ? input.participantsWithGoals / input.totalParticipants : 0;
  const noteCoverage =
    input.totalParticipants > 0 ? input.participantsWithNotes / input.totalParticipants : 0;

  return Math.round(((workerCoverage + goalCoverage + noteCoverage) / 3) * 100);
}

function getComplianceDetail(input: {
  totalWorkers: number;
  activeWorkers: number;
  totalParticipants: number;
  participantsWithGoals: number;
  participantsWithNotes: number;
}) {
  if (input.totalWorkers === 0 && input.totalParticipants === 0) {
    return "Awaiting worker, participant, and note data";
  }

  return (
    `${input.activeWorkers}/${input.totalWorkers || 0} active workers • ` +
    `${input.participantsWithGoals}/${input.totalParticipants || 0} participants with goals • ` +
    `${input.participantsWithNotes}/${input.totalParticipants || 0} participants with notes`
  );
}

function buildRecentDailySeries(values: string[], days: number) {
  const today = new Date();
  const end = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));
  const formatter = new Intl.DateTimeFormat("en-AU", { weekday: "short" });
  const buckets: Array<{ key: string; label: string; value: number }> = [];

  for (let index = days - 1; index >= 0; index -= 1) {
    const date = new Date(end);
    date.setUTCDate(end.getUTCDate() - index);
    buckets.push({
      key: formatDayKey(date),
      label: formatter.format(date),
      value: 0,
    });
  }

  const lookup = new Map(buckets.map((bucket) => [bucket.key, bucket]));

  for (const value of values) {
    const key = toDayKey(value);

    if (key && lookup.has(key)) {
      const bucket = lookup.get(key);

      if (bucket) {
        bucket.value += 1;
      }
    }
  }

  return buckets.map(({ label, value }) => ({ label, value }));
}

function buildTrendSummary(values: string[], days: number, detailSuffix: string) {
  const current = countValuesWithinDays(values, 0, days);
  const previous = countValuesWithinDays(values, days, days);

  if (current === 0 && previous === 0) {
    return {
      label: "Stable",
      detail: `No ${detailSuffix}.`,
      tone: "flat" as const,
    };
  }

  if (previous === 0) {
    return {
      label: "Up",
      detail: `${current} ${detailSuffix}.`,
      tone: "up" as const,
    };
  }

  const delta = Math.round(((current - previous) / previous) * 100);

  if (delta > 0) {
    return {
      label: `Up ${delta}%`,
      detail: `${current} ${detailSuffix}.`,
      tone: "up" as const,
    };
  }

  if (delta < 0) {
    return {
      label: `Down ${Math.abs(delta)}%`,
      detail: `${current} ${detailSuffix}.`,
      tone: "down" as const,
    };
  }

  return {
    label: "Stable",
    detail: `${current} ${detailSuffix}.`,
    tone: "flat" as const,
  };
}

function countValuesWithinDays(values: string[], daysAgoStart: number, windowLength: number) {
  const today = new Date();
  const windowEnd = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate() + 1));
  windowEnd.setUTCDate(windowEnd.getUTCDate() - daysAgoStart);
  const windowStart = new Date(windowEnd);
  windowStart.setUTCDate(windowStart.getUTCDate() - windowLength);

  return values.reduce((count, value) => {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return count;
    }

    return date >= windowStart && date < windowEnd ? count + 1 : count;
  }, 0);
}

function buildClaimsStatusDistribution(values: string[]) {
  let approved = 0;
  let pending = 0;
  let rejected = 0;

  for (const value of values) {
    const normalised = value.trim().toLowerCase();

    if (normalised === "approved") {
      approved += 1;
      continue;
    }

    if (normalised === "rejected") {
      rejected += 1;
      continue;
    }

    pending += 1;
  }

  return [
    { label: "Approved", value: approved, color: "#0f766e" },
    { label: "Pending", value: pending, color: "#f59e0b" },
    { label: "Rejected", value: rejected, color: "#dc2626" },
  ];
}

function toDayKey(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return formatDayKey(date);
}

function formatDayKey(date: Date) {
  return `${date.getUTCFullYear()}-${date.getUTCMonth()}-${date.getUTCDate()}`;
}
