import type { Metadata } from "next";
import Link from "next/link";
import { Activity, CalendarDays, CircleAlert, CircleCheckBig, ListTodo, Users } from "lucide-react";

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
    description: "Move into the saved notes feed, filters, and AI-assisted note composer.",
    href: notesUrl,
  },
  {
    title: "Claims",
    description: "Run the claim checker, send the draft to Claude, and review claim warnings.",
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

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="space-y-2">
          <Badge variant="secondary" className="w-fit">
            Overview
          </Badge>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-950">
            Operations overview
          </h1>
          <p className="max-w-2xl text-base leading-7 text-slate-600">
            Review live worker, participant, note, and claims activity from one dashboard
            with totals that reflect the current saved workspace data.
          </p>
        </div>

        <Card className="w-full max-w-xl border-primary/15 bg-primary/5">
          <CardContent className="flex flex-col items-start gap-4 p-4 md:flex-row md:items-center md:p-5">
            <div className="rounded-2xl bg-white p-3 text-primary shadow-sm">
              <CalendarDays className="size-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Operational rhythm</p>
              <p className="text-lg font-semibold text-slate-900">
                Roster review every Monday, case sync every Thursday
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {snapshot.notice ? (
        <div className="flex items-start gap-3 rounded-3xl border border-amber-200 bg-amber-50 px-4 py-4 text-base text-amber-950 shadow-sm">
          <CircleAlert className="mt-0.5 size-4 shrink-0" />
          <div className="space-y-1">
            <p className="font-semibold">{snapshot.notice.title}</p>
            <p>{snapshot.notice.message}</p>
          </div>
        </div>
      ) : null}

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.map(({ title, value, detail, icon: Icon }) => (
          <Card key={title} className="border-white/70 bg-white/80">
            <CardHeader className="space-y-4">
              <div className="inline-flex size-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
                <Icon className="size-5" />
              </div>
              <div>
                <CardDescription>{title}</CardDescription>
                <CardTitle className="pt-1 text-3xl">{value}</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-0 text-base text-slate-500">{detail}</CardContent>
          </Card>
        ))}
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.3fr_0.9fr]">
        <Card className="border-white/70 bg-white/80">
          <CardHeader>
            <CardTitle>Route entry points</CardTitle>
            <CardDescription>
              Move between the live worker, participant, notes, and claims modules from the dashboard.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            {routeCards.map((route) => (
              <div
                key={route.href}
                className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 md:flex-row md:items-center md:justify-between"
              >
                <div>
                  <p className="font-semibold text-slate-900">{route.title}</p>
                  <p className="pt-1 text-base leading-7 text-slate-600">{route.description}</p>
                </div>
                <Button asChild variant="outline" className="shrink-0">
                  <Link href={route.href}>Open page</Link>
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-emerald-200 bg-emerald-50/80">
          <CardHeader>
            <CardTitle>Live status</CardTitle>
            <CardDescription>
              Dashboard logic now reflects the current saved state of the workspace.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-base text-emerald-950">
            <p>Workers count comes from the saved Supabase roster.</p>
            <p>Participants count comes from the participant records and goal data.</p>
            <p>Notes count comes from the approved notes pipeline.</p>
            <p>
              {claims.length > 0
                ? `${claims.length} claim${claims.length === 1 ? "" : "s"} are available in the current workspace.`
                : "The claim checker and claims list are ready for the next review cycle."}
            </p>
            <p>
              Compliance score blends active worker coverage, participant goal coverage,
              and participant note coverage.
            </p>
          </CardContent>
        </Card>
      </section>
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
