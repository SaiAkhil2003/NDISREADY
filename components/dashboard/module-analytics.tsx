import type { ReactNode } from "react";
import { Activity, BriefcaseBusiness, ClipboardCheck, FileBarChart2, Goal, TrendingUp, UsersRound, Wallet } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatClaimStatus, type ClaimListItem } from "@/lib/claims";
import { noteTypeOptions } from "@/lib/notes";
import { formatParticipantStatus, participantStatusOptions, type ParticipantListItem } from "@/lib/participants";
import { type ProgressNoteListItem } from "@/lib/progress-notes";
import { cn } from "@/lib/utils";
import { formatWorkerRole, formatWorkerStatus, workerRoleOptions, workerStatusOptions, type WorkerListItem } from "@/lib/workers";

type SeriesDatum = {
  label: string;
  value: number;
  color?: string;
  detail?: string;
};

type AnalyticsPanelProps = {
  className?: string;
};

const palette = ["#2563eb", "#0ea5e9", "#0f172a", "#16a34a", "#f59e0b", "#475569"];

const workerStatusColorMap: Record<string, string> = {
  active: "#2563eb",
  onboarding: "#f59e0b",
  inactive: "#64748b",
};

const participantStatusColorMap: Record<string, string> = {
  active: "#2563eb",
  intake: "#0284c7",
  inactive: "#64748b",
  "on-hold": "#f59e0b",
};

const claimStatusColorMap: Record<string, string> = {
  approved: "#2563eb",
  draft: "#0284c7",
  rejected: "#dc2626",
  flagged: "#f59e0b",
  pending: "#64748b",
};

export function WorkerAnalyticsPanel({
  workers,
  className,
}: AnalyticsPanelProps & { workers: WorkerListItem[] }) {
  const roleSeries = workerRoleOptions
    .map((option, index) => ({
      label: formatWorkerRole(option.value),
      value: workers.filter((worker) => worker.role === option.value).length,
      color: palette[index % palette.length],
    }))
    .filter((item) => item.value > 0);

  const statusSeries = workerStatusOptions.map((option) => ({
    label: formatWorkerStatus(option.value),
    value: workers.filter((worker) => worker.status === option.value).length,
    color: workerStatusColorMap[option.value] ?? "#64748b",
  }));

  const recentAdditions = buildRecentCountSeries(workers.map((worker) => worker.createdAt));
  const leadershipCount = workers.filter((worker) => ["team_lead", "admin"].includes(worker.role)).length;
  const phoneCoverage = workers.filter((worker) => Boolean(worker.phone?.trim())).length;
  const onboardingCount = workers.filter((worker) => worker.status === "onboarding").length;

  return (
    <div className={cn("dashboard-analytics-stack", className)}>
      <AnalyticsCard
        title="Workforce overview"
        description="Role coverage and staffing mix across the current roster."
        icon={BriefcaseBusiness}
        delay={0}
      >
        <div className="grid gap-4 md:grid-cols-[148px_minmax(0,1fr)] xl:grid-cols-1 2xl:grid-cols-[148px_minmax(0,1fr)]">
          <DonutChart
            data={roleSeries}
            totalLabel="Workers"
            centerValue={String(workers.length)}
          />
          <LegendList
            data={roleSeries}
            emptyLabel="No worker roles yet"
          />
        </div>

        <div className="mt-4 grid grid-cols-1 gap-2 md:grid-cols-3">
          <MetricTile label="Active" value={String(statusSeries[0]?.value ?? 0)} accent="text-emerald-700" />
          <MetricTile label="Leads" value={String(leadershipCount)} accent="text-slate-900" />
          <MetricTile
            label="Phones"
            value={`${workers.length > 0 ? Math.round((phoneCoverage / workers.length) * 100) : 0}%`}
            accent="text-cyan-700"
            className="md:col-span-1"
          />
        </div>
      </AnalyticsCard>

      <AnalyticsCard
        title="Roster activity"
        description="Recent additions and current worker status distribution."
        icon={Activity}
        delay={90}
      >
        <div className="space-y-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
              Recent additions
            </p>
            <BarTrend data={recentAdditions} tone="teal" />
          </div>

          <div className="grid gap-3">
            <ProgressRows
              data={statusSeries}
              formatValue={(value) => `${value} worker${value === 1 ? "" : "s"}`}
            />
          </div>

          <div className="rounded-[12px] border border-slate-200 bg-slate-50 px-3.5 py-3">
            <p className="text-sm font-semibold text-slate-900">Current staffing mix</p>
            <p className="pt-1 text-[13px] leading-5 text-slate-600">
              {onboardingCount} worker{onboardingCount === 1 ? "" : "s"} are still onboarding, with {leadershipCount} leadership profile{leadershipCount === 1 ? "" : "s"} available for oversight.
            </p>
          </div>
        </div>
      </AnalyticsCard>
    </div>
  );
}

export function ParticipantAnalyticsPanel({
  participants,
  className,
}: AnalyticsPanelProps & { participants: ParticipantListItem[] }) {
  const statusSeries = participantStatusOptions.map((option) => ({
    label: formatParticipantStatus(option.value),
    value: participants.filter((participant) => participant.status === option.value).length,
    color: participantStatusColorMap[option.value] ?? "#64748b",
  }));

  const goalCoverage = participants.filter((participant) => participant.goals.length > 0).length;
  const averageGoals =
    participants.length > 0
      ? (participants.reduce((sum, participant) => sum + participant.goals.length, 0) / participants.length).toFixed(1)
      : "0.0";
  const goalDistribution = [
    {
      label: "No goals",
      value: participants.filter((participant) => participant.goals.length === 0).length,
      color: "#64748b",
    },
    {
      label: "1 goal",
      value: participants.filter((participant) => participant.goals.length === 1).length,
      color: "#0284c7",
    },
    {
      label: "2-3 goals",
      value: participants.filter((participant) => participant.goals.length >= 2 && participant.goals.length <= 3).length,
      color: "#0ea5e9",
    },
    {
      label: "4+ goals",
      value: participants.filter((participant) => participant.goals.length >= 4).length,
      color: "#2563eb",
    },
  ];
  const recentAdditions = buildRecentCountSeries(participants.map((participant) => participant.createdAt));

  return (
    <div className={cn("dashboard-analytics-stack", className)}>
      <AnalyticsCard
        title="Participant insights"
        description="Status mix and support-planning coverage across the current participant list."
        icon={UsersRound}
        delay={0}
      >
        <div className="grid gap-4 md:grid-cols-[148px_minmax(0,1fr)] xl:grid-cols-1 2xl:grid-cols-[148px_minmax(0,1fr)]">
          <DonutChart
            data={statusSeries}
            totalLabel="Participants"
            centerValue={String(participants.length)}
          />
          <LegendList data={statusSeries} />
        </div>

        <div className="mt-4 grid grid-cols-1 gap-2 md:grid-cols-3">
          <MetricTile
            label="Goal coverage"
            value={`${participants.length > 0 ? Math.round((goalCoverage / participants.length) * 100) : 0}%`}
            accent="text-emerald-700"
          />
          <MetricTile label="Avg goals" value={averageGoals} accent="text-slate-900" />
          <MetricTile
            label="On hold"
            value={String(statusSeries.find((item) => item.label === "On Hold")?.value ?? 0)}
            accent="text-amber-700"
            className="md:col-span-1"
          />
        </div>
      </AnalyticsCard>

      <AnalyticsCard
        title="Planning depth"
        description="Goals-per-participant distribution and recent intake flow."
        icon={Goal}
        delay={90}
      >
        <div className="space-y-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
              Goals per participant
            </p>
            <ProgressRows data={goalDistribution} formatValue={(value) => `${value}`} />
          </div>

          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
              Recent additions
            </p>
            <BarTrend data={recentAdditions} tone="blue" />
          </div>
        </div>
      </AnalyticsCard>
    </div>
  );
}

export function NoteAnalyticsPanel({
  notes,
  participantCount,
  className,
}: AnalyticsPanelProps & {
  notes: ProgressNoteListItem[];
  participantCount: number;
}) {
  const noteTypeSeries = noteTypeOptions.map((option, index) => ({
    label: option.label,
    value: notes.filter((note) => note.noteType === option.value).length,
    color: palette[index % palette.length],
  }));

  const approvedCount = notes.filter((note) => Boolean(note.approvedAt)).length;
  const awaitingCount = notes.length - approvedCount;
  const approvalSeries = [
    { label: "Approved", value: approvedCount, color: "#2563eb" },
    { label: "Awaiting", value: awaitingCount, color: "#64748b" },
  ];
  const recentTrend = buildRecentCountSeries(notes.map((note) => note.createdAt));
  const participantCoverage = new Set(notes.map((note) => note.participantId)).size;
  const topParticipants = buildTopSeries(
    notes,
    (note) => note.participantName,
    () => 1,
    4,
  );
  const topNoteType =
    [...noteTypeSeries].sort((left, right) => right.value - left.value)[0]?.label ?? "No notes yet";

  return (
    <div className={cn("dashboard-analytics-stack", className)}>
      <AnalyticsCard
        title="Documentation insights"
        description="Note type mix and approval flow for the current notes feed."
        icon={FileBarChart2}
        delay={0}
      >
        <div className="grid gap-4 md:grid-cols-[148px_minmax(0,1fr)] xl:grid-cols-1 2xl:grid-cols-[148px_minmax(0,1fr)]">
          <DonutChart
            data={noteTypeSeries}
            totalLabel="Notes"
            centerValue={String(notes.length)}
          />
          <LegendList data={noteTypeSeries} emptyLabel="No saved note types yet" />
        </div>

        <div className="mt-4 grid grid-cols-1 gap-2 md:grid-cols-3">
          <MetricTile
            label="Approved"
            value={`${notes.length > 0 ? Math.round((approvedCount / notes.length) * 100) : 0}%`}
            accent="text-emerald-700"
          />
          <MetricTile
            label="Coverage"
            value={`${participantCount > 0 ? Math.round((participantCoverage / participantCount) * 100) : 0}%`}
            accent="text-cyan-700"
          />
          <MetricTile
            label="Top type"
            value={topNoteType}
            accent="text-slate-900"
            compact
            className="md:col-span-1"
          />
        </div>
      </AnalyticsCard>

      <AnalyticsCard
        title="Support documentation flow"
        description="Recent note volume and the participants with the most documentation coverage."
        icon={TrendingUp}
        delay={90}
      >
        <div className="space-y-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
              Recent note volume
            </p>
            <BarTrend data={recentTrend} tone="teal" />
          </div>

          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
              Approval status
            </p>
            <ProgressRows data={approvalSeries} formatValue={(value) => `${value} note${value === 1 ? "" : "s"}`} />
          </div>

          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
              Top participant coverage
            </p>
            <ProgressRows
              data={topParticipants}
              formatValue={(value) => `${value} note${value === 1 ? "" : "s"}`}
            />
          </div>
        </div>
      </AnalyticsCard>
    </div>
  );
}

export function ClaimAnalyticsPanel({
  claims,
  className,
}: AnalyticsPanelProps & { claims: ClaimListItem[] }) {
  const statusSeries = buildGroupedStatusSeries(claims.map((claim) => claim.status), claimStatusColorMap, formatClaimStatus);
  const amountTrend = buildRecentAmountSeries(claims.map((claim) => ({
    date: claim.claimDate || claim.createdAt,
    amount: claim.amount,
  })));
  const claimsByWorker = buildTopSeries(
    claims,
    (claim) => claim.workerName ?? "Unassigned",
    (claim) => claim.amount,
    4,
  );
  const totalAmount = claims.reduce((sum, claim) => sum + claim.amount, 0);
  const averageAmount = claims.length > 0 ? totalAmount / claims.length : 0;
  const totalHours = claims.reduce((sum, claim) => sum + (claim.supportHours ?? 0), 0);

  return (
    <div className={cn("dashboard-analytics-stack", className)}>
      <AnalyticsCard
        title="Claims insights"
        description="Review status mix and value coverage across current claims."
        icon={ClipboardCheck}
        delay={0}
      >
        <div className="grid gap-4 md:grid-cols-[148px_minmax(0,1fr)] xl:grid-cols-1 2xl:grid-cols-[148px_minmax(0,1fr)]">
          <DonutChart
            data={statusSeries}
            totalLabel="Claims"
            centerValue={String(claims.length)}
          />
          <LegendList data={statusSeries} emptyLabel="No claims to review yet" />
        </div>

        <div className="mt-4 grid grid-cols-1 gap-2 md:grid-cols-3">
          <MetricTile label="Average" value={formatCompactCurrency(averageAmount)} accent="text-slate-900" compact />
          <MetricTile label="Hours" value={formatCompactNumber(totalHours)} accent="text-cyan-700" />
          <MetricTile
            label="Value"
            value={formatCompactCurrency(totalAmount)}
            accent="text-emerald-700"
            compact
            className="md:col-span-1"
          />
        </div>
      </AnalyticsCard>

      <AnalyticsCard
        title="Claim value trend"
        description="Recent claim volume by month and the workers carrying the highest claim value."
        icon={Wallet}
        delay={90}
      >
        <div className="space-y-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
              Recent claim amounts
            </p>
            <BarTrend data={amountTrend} tone="emerald" formatValue={formatCompactCurrency} />
          </div>

          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
              Claim value by worker
            </p>
            <ProgressRows
              data={claimsByWorker}
              formatValue={formatCompactCurrency}
            />
          </div>
        </div>
      </AnalyticsCard>
    </div>
  );
}

export function OverviewActivityPanel({
  workers,
  participants,
  notes,
  claims,
  className,
}: AnalyticsPanelProps & {
  workers: WorkerListItem[];
  participants: ParticipantListItem[];
  notes: ProgressNoteListItem[];
  claims: ClaimListItem[];
}) {
  const series = [
    { label: "Workers", value: workers.length, color: "#2563eb" },
    { label: "Participants", value: participants.length, color: "#0284c7" },
    { label: "Notes", value: notes.length, color: "#0ea5e9" },
    { label: "Claims", value: claims.length, color: "#f59e0b" },
  ];

  return (
    <AnalyticsCard
      title="Module health"
      description="High-level record volume across the workspace modules."
      icon={TrendingUp}
      delay={140}
      className={className}
    >
      <ProgressRows data={series} formatValue={(value) => `${value} record${value === 1 ? "" : "s"}`} />
    </AnalyticsCard>
  );
}

function AnalyticsCard({
  title,
  description,
  icon: Icon,
  children,
  delay,
  className,
}: {
  title: string;
  description: string;
  icon: typeof Activity;
  children: ReactNode;
  delay: number;
  className?: string;
}) {
  return (
    <Card
      className={cn("dashboard-analytics-card", className)}
      style={{ animationDelay: `${delay}ms` }}
    >
      <CardHeader className="space-y-2 p-3.5 pb-3 sm:p-4 sm:pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <CardTitle className="text-[1.05rem] font-semibold">{title}</CardTitle>
            <CardDescription className="text-[13px] leading-5 text-slate-600">
              {description}
            </CardDescription>
          </div>
          <div className="rounded-[12px] bg-slate-100 p-2.5 text-slate-700">
            <Icon className="size-4.5" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-3.5 pt-0 sm:p-4 sm:pt-0">{children}</CardContent>
    </Card>
  );
}

function DonutChart({
  data,
  centerValue,
  totalLabel,
}: {
  data: SeriesDatum[];
  centerValue: string;
  totalLabel: string;
}) {
  const filteredData = data.filter((item) => item.value > 0);
  const chartData =
    filteredData.length > 0
      ? filteredData
      : [{ label: "No records", value: 1, color: "#e2e8f0" }];
  const total = filteredData.reduce((sum, item) => sum + item.value, 0);
  const circumference = 2 * Math.PI * 54;
  let offset = 0;

  return (
    <div className="relative mx-auto flex h-[136px] w-[136px] items-center justify-center min-[390px]:h-[148px] min-[390px]:w-[148px]">
      <svg
        viewBox="0 0 140 140"
        className="h-full w-full"
        aria-label={`${totalLabel} distribution`}
      >
        <circle
          cx="70"
          cy="70"
          r="54"
          fill="none"
          stroke="#e2e8f0"
          strokeWidth="16"
        />
        <g transform="rotate(-90 70 70)">
          {chartData.map((item, index) => {
            const segmentLength = (item.value / chartData.reduce((sum, datum) => sum + datum.value, 0)) * circumference;
            const node = (
              <circle
                key={`${item.label}-${index}`}
                cx="70"
                cy="70"
                r="54"
                fill="none"
                stroke={item.color ?? palette[index % palette.length]}
                strokeWidth="16"
                strokeDasharray={`${segmentLength} ${circumference - segmentLength}`}
                strokeDashoffset={-offset}
                strokeLinecap="round"
                className="dashboard-chart-segment"
                style={{ animationDelay: `${index * 90}ms` }}
              />
            );

            offset += segmentLength;
            return node;
          })}
        </g>
      </svg>

      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        <p className="text-[1.4rem] font-semibold leading-none text-slate-950">
          {centerValue}
        </p>
        <p className="pt-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
          {total > 0 ? totalLabel : "Awaiting data"}
        </p>
      </div>
    </div>
  );
}

function LegendList({
  data,
  emptyLabel,
}: {
  data: SeriesDatum[];
  emptyLabel?: string;
}) {
  const displayData = data.filter((item) => item.value > 0);

  if (displayData.length === 0) {
    return (
      <div className="rounded-[12px] border border-dashed border-slate-200 bg-slate-50 px-3.5 py-4 text-sm text-slate-500">
        {emptyLabel ?? "No analytics available yet"}
      </div>
    );
  }

  return (
    <div className="space-y-2.5">
      {displayData.map((item) => (
        <div
          key={item.label}
          className="flex items-center justify-between gap-3 rounded-[12px] border border-slate-200 bg-slate-50 px-3.5 py-3"
        >
          <div className="flex min-w-0 items-center gap-2.5">
            <span
              className="size-2.5 shrink-0 rounded-full"
              style={{ backgroundColor: item.color ?? "#2563eb" }}
            />
            <p className="break-words text-sm font-medium leading-5 text-slate-700">{item.label}</p>
          </div>
          <p className="shrink-0 text-sm font-semibold text-slate-950">
            {formatCompactNumber(item.value)}
          </p>
        </div>
      ))}
    </div>
  );
}

function MetricTile({
  label,
  value,
  accent,
  compact,
  className,
}: {
  label: string;
  value: string;
  accent?: string;
  compact?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("rounded-[12px] border border-slate-200 bg-slate-50 px-3 py-2.5", className)}>
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
        {label}
      </p>
      <p
        className={cn(
          "break-words pt-1.5 font-semibold leading-tight text-slate-950",
          compact ? "text-[0.95rem]" : "text-[1.08rem] min-[390px]:text-[1.15rem]",
          accent,
        )}
      >
        {value}
      </p>
    </div>
  );
}

function BarTrend({
  data,
  tone,
  formatValue,
}: {
  data: SeriesDatum[];
  tone: "teal" | "blue" | "emerald";
  formatValue?: (value: number) => string;
}) {
  const max = Math.max(...data.map((item) => item.value), 1);
  const toneClassName =
    tone === "blue"
      ? "from-sky-500 to-cyan-400"
      : tone === "emerald"
        ? "from-emerald-500 to-teal-400"
        : "from-blue-600 to-sky-400";

  return (
    <div className="space-y-2.5 pt-3">
      <div className="grid h-28 grid-cols-6 items-end gap-1.5 min-[390px]:h-32 min-[390px]:gap-2">
        {data.map((item, index) => {
          const height = `${Math.max((item.value / max) * 100, item.value > 0 ? 18 : 6)}%`;
          return (
            <div key={item.label} className="flex h-full flex-col justify-end">
              <div className="relative flex h-full items-end rounded-[12px] bg-slate-100 px-1.5 pb-1.5">
                <div
                  className={cn("dashboard-chart-bar w-full rounded-[8px] bg-gradient-to-t", toneClassName)}
                  style={{
                    height,
                    animationDelay: `${index * 70}ms`,
                  }}
                />
              </div>
              <div className="pt-1.5 text-center">
                <p className="text-[10px] font-medium text-slate-500 min-[390px]:text-[11px]">{item.label}</p>
                <p className="text-[10px] font-semibold text-slate-700 min-[390px]:text-[11px]">
                  {formatValue ? formatValue(item.value) : formatCompactNumber(item.value)}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ProgressRows({
  data,
  formatValue,
}: {
  data: SeriesDatum[];
  formatValue: (value: number) => string;
}) {
  const filteredData = data.filter((item) => item.value > 0);
  const displayData = filteredData.length > 0 ? filteredData : data;
  const max = Math.max(...displayData.map((item) => item.value), 1);

  return (
    <div className="space-y-3">
      {displayData.map((item, index) => {
        const width = `${Math.max((item.value / max) * 100, item.value > 0 ? 8 : 0)}%`;
        return (
          <div key={item.label} className="space-y-1.5">
            <div className="flex items-center justify-between gap-3">
              <p className="break-words pr-2 text-sm font-medium leading-5 text-slate-700">{item.label}</p>
              <p className="shrink-0 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                {formatValue(item.value)}
              </p>
            </div>
            <div className="h-2.5 rounded-full bg-slate-100">
              <div
                className="dashboard-chart-progress h-full rounded-full"
                style={{
                  width,
                  backgroundColor: item.color ?? "#2563eb",
                  animationDelay: `${index * 70}ms`,
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function buildRecentCountSeries(dates: string[], months = 6) {
  const buckets = buildMonthBuckets(months);
  const map = new Map(buckets.map((bucket) => [bucket.key, 0]));

  for (const value of dates) {
    const key = toMonthKey(value);

    if (key && map.has(key)) {
      map.set(key, (map.get(key) ?? 0) + 1);
    }
  }

  return buckets.map((bucket) => ({
    label: bucket.label,
    value: map.get(bucket.key) ?? 0,
  }));
}

function buildRecentAmountSeries(
  items: {
    date: string;
    amount: number;
  }[],
  months = 6,
) {
  const buckets = buildMonthBuckets(months);
  const map = new Map(buckets.map((bucket) => [bucket.key, 0]));

  for (const item of items) {
    const key = toMonthKey(item.date);

    if (key && map.has(key)) {
      map.set(key, (map.get(key) ?? 0) + item.amount);
    }
  }

  return buckets.map((bucket) => ({
    label: bucket.label,
    value: map.get(bucket.key) ?? 0,
  }));
}

function buildTopSeries<T>(
  items: T[],
  getLabel: (item: T) => string,
  getValue: (item: T) => number,
  limit = 4,
) {
  const totals = new Map<string, number>();

  for (const item of items) {
    const label = getLabel(item).trim() || "Unknown";
    totals.set(label, (totals.get(label) ?? 0) + getValue(item));
  }

  return [...totals.entries()]
    .sort((left, right) => right[1] - left[1])
    .slice(0, limit)
    .map(([label, value], index) => ({
      label,
      value,
      color: palette[index % palette.length],
    }));
}

function buildGroupedStatusSeries(
  values: string[],
  colorMap: Record<string, string>,
  formatter: (value: string) => string,
) {
  const counts = new Map<string, number>();

  for (const value of values) {
    counts.set(value, (counts.get(value) ?? 0) + 1);
  }

  return [...counts.entries()]
    .sort((left, right) => right[1] - left[1])
    .map(([value, count], index) => ({
      label: formatter(value),
      value: count,
      color: colorMap[value] ?? palette[index % palette.length],
    }));
}

function buildMonthBuckets(months: number) {
  const formatter = new Intl.DateTimeFormat("en-AU", { month: "short" });
  const now = new Date();
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  const buckets: { key: string; label: string }[] = [];

  for (let index = months - 1; index >= 0; index -= 1) {
    const value = new Date(start);
    value.setUTCMonth(start.getUTCMonth() - index);
    buckets.push({
      key: `${value.getUTCFullYear()}-${value.getUTCMonth()}`,
      label: formatter.format(value),
    });
  }

  return buckets;
}

function toMonthKey(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return `${date.getUTCFullYear()}-${date.getUTCMonth()}`;
}

function formatCompactNumber(value: number) {
  return new Intl.NumberFormat("en-AU", {
    notation: "compact",
    maximumFractionDigits: value >= 100 ? 0 : 1,
  }).format(value);
}

function formatCompactCurrency(value: number) {
  return new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: "AUD",
    notation: "compact",
    maximumFractionDigits: value >= 1000 ? 1 : 0,
  }).format(value);
}
