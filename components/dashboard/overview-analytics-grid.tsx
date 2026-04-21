"use client";

import type { ReactNode } from "react";
import {
  Activity,
  CircleCheckBig,
  ListTodo,
  Users,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

type DistributionDatum = {
  label: string;
  value: number;
  color: string;
};

type TimelineDatum = {
  label: string;
  value: number;
};

type TrendSummary = {
  label: string;
  detail: string;
  tone: "up" | "down" | "flat";
};

type OverviewAnalyticsGridProps = {
  workerDistribution: DistributionDatum[];
  participantDistribution: DistributionDatum[];
  notesActivity: TimelineDatum[];
  notesTrend: TrendSummary;
  claimsDistribution: DistributionDatum[];
};

const chartMargin = { top: 4, right: 4, left: -18, bottom: 0 };

export function OverviewAnalyticsGrid({
  workerDistribution,
  participantDistribution,
  notesActivity,
  notesTrend,
  claimsDistribution,
}: OverviewAnalyticsGridProps) {
  return (
    <section className="space-y-4 md:space-y-6">
      <div className="dashboard-page-header">
        <div className="dashboard-page-heading">
          <h2 className="text-[1.15rem] font-semibold tracking-tight text-slate-950 md:text-[1.25rem]">
            Operational analytics
          </h2>
          <p className="text-sm leading-5 text-slate-600">
            Live distribution and activity signals across staffing, participants, notes, and claims.
          </p>
        </div>

        <div className="dashboard-chip">Live workspace analytics</div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 xl:grid-cols-2">
        <AnalyticsChartCard
          title="Worker distribution"
          description="Active versus inactive roster coverage."
          icon={Activity}
          delay={0}
        >
          <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_172px]">
            <ChartWrap>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={getSafeDistribution(workerDistribution)}
                    dataKey="value"
                    nameKey="label"
                    innerRadius={58}
                    outerRadius={84}
                    paddingAngle={3}
                    stroke="rgba(255,255,255,0.92)"
                    strokeWidth={3}
                    isAnimationActive
                    animationDuration={850}
                  >
                    {getSafeDistribution(workerDistribution).map((item) => (
                      <Cell key={item.label} fill={item.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<ChartTooltip suffix="workers" />} />
                </PieChart>
              </ResponsiveContainer>
            </ChartWrap>
            <LegendPanel data={workerDistribution} totalLabel="Workers" />
          </div>
        </AnalyticsChartCard>

        <AnalyticsChartCard
          title="Participant status"
          description="Current participant activity mix."
          icon={Users}
          delay={80}
        >
          <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_172px]">
            <ChartWrap>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={getSafeDistribution(participantDistribution)}
                    dataKey="value"
                    nameKey="label"
                    innerRadius={58}
                    outerRadius={84}
                    paddingAngle={3}
                    stroke="rgba(255,255,255,0.92)"
                    strokeWidth={3}
                    isAnimationActive
                    animationDuration={850}
                  >
                    {getSafeDistribution(participantDistribution).map((item) => (
                      <Cell key={item.label} fill={item.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<ChartTooltip suffix="participants" />} />
                </PieChart>
              </ResponsiveContainer>
            </ChartWrap>
            <LegendPanel data={participantDistribution} totalLabel="Participants" />
          </div>
        </AnalyticsChartCard>

        <AnalyticsChartCard
          title="Notes activity"
          description="Approved note volume across the last seven days."
          icon={ListTodo}
          delay={160}
          badge={notesTrend.label}
          badgeTone={notesTrend.tone}
          footer={notesTrend.detail}
        >
          <ChartWrap heightClassName="h-[196px] min-[390px]:h-[212px] sm:h-[248px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={notesActivity} margin={chartMargin}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis
                  dataKey="label"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#64748b", fontSize: 12 }}
                />
                <YAxis
                  allowDecimals={false}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#64748b", fontSize: 12 }}
                  width={30}
                />
                <Tooltip content={<ChartTooltip suffix="notes" />} />
                <Bar
                  dataKey="value"
                  radius={[10, 10, 4, 4]}
                  fill="#0f766e"
                  isAnimationActive
                  animationDuration={900}
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartWrap>
        </AnalyticsChartCard>

        <AnalyticsChartCard
          title="Claims status"
          description="Approved, pending, and rejected claim mix."
          icon={CircleCheckBig}
          delay={240}
        >
          <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_172px]">
            <ChartWrap>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={getSafeDistribution(claimsDistribution)}
                    dataKey="value"
                    nameKey="label"
                    innerRadius={56}
                    outerRadius={84}
                    paddingAngle={3}
                    stroke="rgba(255,255,255,0.92)"
                    strokeWidth={3}
                    isAnimationActive
                    animationDuration={850}
                  >
                    {getSafeDistribution(claimsDistribution).map((item) => (
                      <Cell key={item.label} fill={item.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<ChartTooltip suffix="claims" />} />
                </PieChart>
              </ResponsiveContainer>
            </ChartWrap>
            <LegendPanel data={claimsDistribution} totalLabel="Claims" />
          </div>
        </AnalyticsChartCard>
      </div>
    </section>
  );
}

function AnalyticsChartCard({
  title,
  description,
  icon: Icon,
  children,
  delay,
  className,
  badge,
  badgeTone = "flat",
  footer,
}: {
  title: string;
  description: string;
  icon: typeof Activity;
  children: ReactNode;
  delay: number;
  className?: string;
  badge?: string;
  badgeTone?: "up" | "down" | "flat";
  footer?: string;
}) {
  return (
    <Card
      className={cn("dashboard-analytics-card", className)}
      style={{ animationDelay: `${delay}ms` }}
    >
      <CardHeader className="space-y-2 p-3.5 pb-3 sm:p-4 sm:pb-3">
        <div className="flex flex-col gap-3 min-[390px]:flex-row min-[390px]:items-start min-[390px]:justify-between">
          <div className="space-y-1">
            <CardTitle className="text-[1.05rem] font-semibold">{title}</CardTitle>
            <CardDescription className="text-[13px] leading-5 text-slate-600">
              {description}
            </CardDescription>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {badge ? (
              <span
                className={cn(
                  "inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.16em]",
                  badgeTone === "up"
                    ? "bg-emerald-50 text-emerald-800"
                    : badgeTone === "down"
                      ? "bg-rose-50 text-rose-800"
                      : "bg-slate-100 text-slate-600",
                )}
              >
                {badge}
              </span>
            ) : null}

            <div className="rounded-[12px] bg-slate-100 p-2.5 text-slate-700">
              <Icon className="size-4.5" />
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 p-3.5 pt-0 sm:p-4 sm:pt-0">
        {children}
        {footer ? <p className="text-[12px] leading-5 text-slate-500">{footer}</p> : null}
      </CardContent>
    </Card>
  );
}

function ChartWrap({
  children,
  heightClassName = "h-[184px] min-[390px]:h-[202px] sm:h-[232px]",
}: {
  children: ReactNode;
  heightClassName?: string;
}) {
  return (
    <div className={cn("rounded-[12px] border border-slate-200 bg-slate-50 p-2.5 min-[390px]:p-3", heightClassName)}>
      {children}
    </div>
  );
}

function LegendPanel({
  data,
  totalLabel,
}: {
  data: DistributionDatum[];
  totalLabel: string;
}) {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  const displayData = total > 0 ? data : [{ label: "Awaiting data", value: 0, color: "#cbd5e1" }];

  return (
    <div className="space-y-2">
      <div className="rounded-[12px] border border-slate-200 bg-slate-50 px-3.5 py-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">{totalLabel}</p>
        <p className="pt-1.5 text-[1.45rem] font-semibold leading-none tracking-tight text-slate-950">
          {total}
        </p>
      </div>

      {displayData.map((item) => {
        const percentage = total > 0 ? Math.round((item.value / total) * 100) : 0;

        return (
          <div
            key={item.label}
            className="flex items-center justify-between gap-3 rounded-[12px] border border-slate-200 bg-slate-50 px-3.5 py-3"
          >
            <div className="flex min-w-0 items-center gap-2.5">
              <span
                className="size-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <p className="truncate text-sm font-medium text-slate-700">{item.label}</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold text-slate-950">{item.value}</p>
              <p className="text-[11px] text-slate-500">{percentage}%</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ChartTooltip({
  active,
  payload,
  label,
  suffix,
}: {
  active?: boolean;
  payload?: Array<{ value?: number; name?: string; payload?: { label?: string } }>;
  label?: string;
  suffix: string;
}) {
  if (!active || !payload || payload.length === 0) {
    return null;
  }

  const item = payload[0];
  const name = item.name ?? item.payload?.label ?? label ?? "Value";
  const value = typeof item.value === "number" ? item.value : 0;

  return (
    <div className="rounded-[12px] border border-slate-200 bg-white px-3 py-2.5 shadow-lg shadow-slate-900/5">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">{name}</p>
      <p className="pt-1 text-sm font-semibold text-slate-950">
        {value} {suffix}
      </p>
    </div>
  );
}

function getSafeDistribution(data: DistributionDatum[]) {
  const total = data.reduce((sum, item) => sum + item.value, 0);

  if (total > 0) {
    return data;
  }

  return [{ label: "Awaiting data", value: 1, color: "#cbd5e1" }];
}
