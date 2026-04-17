import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, BadgeCheck, CalendarDays, Goal, Hash } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  formatParticipantStatus,
} from "@/lib/participants";
import { participantsUrl } from "@/lib/routes";
import { resolveParticipantDetail } from "@/lib/workspace-data";

type ParticipantDetailPageProps = {
  params: Promise<{
    participantId: string;
  }>;
};

export default async function ParticipantDetailPage({ params }: ParticipantDetailPageProps) {
  const { participantId } = await params;
  const participant = await resolveParticipantDetail(participantId);

  if (!participant) {
    notFound();
  }

  const displayName = participant.preferredName?.trim()
    ? `${participant.preferredName} (${participant.firstName} ${participant.lastName})`
    : `${participant.firstName} ${participant.lastName}`;

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-3">
          <Link
            href={participantsUrl}
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-slate-950"
          >
            <ArrowLeft className="size-4" />
            Back to participants
          </Link>
          <Badge className="w-fit">Participant detail</Badge>
          <div className="space-y-2">
            <h1 className="text-3xl font-semibold tracking-tight text-slate-950">
              {displayName}
            </h1>
            <p className="max-w-2xl text-base leading-7 text-slate-600">
              Review participant profile details and the saved support goals.
            </p>
          </div>
        </div>

        <Badge variant="secondary" className="w-fit text-sm">
          {formatParticipantStatus(participant.status)}
        </Badge>
      </div>

      <section className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
        <Card className="border-white/70 bg-white/80">
          <CardHeader>
            <CardTitle>Profile</CardTitle>
            <CardDescription>Saved participant information from Supabase.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <InfoRow
              icon={BadgeCheck}
              label="Status"
              value={formatParticipantStatus(participant.status)}
            />
            <InfoRow
              icon={Hash}
              label="NDIS number"
              value={participant.ndisNumber ?? "Not provided"}
            />
            <InfoRow
              icon={CalendarDays}
              label="Date of birth"
              value={participant.dateOfBirth ?? "Not provided"}
            />
          </CardContent>
        </Card>

        <Card className="border-white/70 bg-white/80">
          <CardHeader>
            <CardTitle>Goals</CardTitle>
            <CardDescription>Goals are stored as structured data and rendered here.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {participant.goals.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center text-base text-slate-500">
                No goals saved for this participant yet.
              </div>
            ) : (
              participant.goals.map((goal, index) => (
                <div
                  key={`${goal.title}-${index}`}
                  className="rounded-3xl border border-slate-200 bg-slate-50 px-4 py-4"
                >
                  <div className="flex items-start gap-3">
                    <div className="rounded-2xl bg-white p-2 text-primary shadow-sm">
                      <Goal className="size-4" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-base font-semibold text-slate-900">Goal {index + 1}</p>
                      <p className="text-base leading-7 text-slate-600">{goal.title}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

type InfoRowProps = {
  icon: typeof BadgeCheck;
  label: string;
  value: string;
};

function InfoRow({ icon: Icon, label, value }: InfoRowProps) {
  return (
    <div className="flex flex-col gap-3 rounded-3xl border border-slate-200 bg-slate-50 px-4 py-4 md:flex-row md:items-start">
      <div className="rounded-2xl bg-white p-2 text-slate-700 shadow-sm">
        <Icon className="size-4" />
      </div>
      <div className="space-y-1">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
          {label}
        </p>
        <p className="text-base text-slate-700">{value}</p>
      </div>
    </div>
  );
}
