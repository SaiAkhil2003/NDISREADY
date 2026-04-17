import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, CircleAlert, Eye, Goal, Hash, UserPlus2, UsersRound } from "lucide-react";

import { createParticipantAction } from "@/app/dashboard/participants/actions";
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
  participantStatusOptions,
  type ParticipantListItem,
} from "@/lib/participants";
import { getParticipantDetailUrl } from "@/lib/routes";
import { loadParticipantsDirectory } from "@/lib/workspace-data";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Participants",
  description: "Review participant profiles, goals, and NDIS record details in NDISReady.ai.",
};

type ParticipantsPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function ParticipantsPage({ searchParams }: ParticipantsPageProps) {
  const params = searchParams ? await searchParams : {};
  const participantsResult = await loadParticipantsDirectory();
  const participants = participantsResult.data as ParticipantListItem[];

  const totalParticipants = participants.length;
  const activeParticipants = participants.filter((participant) => participant.status === "active").length;
  const totalGoals = participants.reduce((count, participant) => count + participant.goals.length, 0);

  const participantCards = [
    { title: "Total participants", value: String(totalParticipants), icon: UsersRound },
    { title: "Active participants", value: String(activeParticipants), icon: UserPlus2 },
    { title: "Goals captured", value: String(totalGoals), icon: Goal },
  ];

  const statusMessage = getStatusMessage(params, participants);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-2">
          <Badge className="w-fit">Participants</Badge>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-950">
            Participant management
          </h1>
          <p className="max-w-2xl text-base leading-7 text-slate-600">
            Create participants, store goals as JSON in Supabase, and review the saved list
            with direct links into each participant profile.
          </p>
        </div>

        <div className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
          <UserPlus2 className="size-4" />
          Participant directory
        </div>
      </div>

      <div className="space-y-3">
        {statusMessage ? (
          <div
            className={`flex items-start gap-3 rounded-3xl border px-4 py-4 text-base shadow-sm ${
              statusMessage.tone === "success"
                ? "border-emerald-200 bg-emerald-50 text-emerald-950"
                : "border-rose-200 bg-rose-50 text-rose-950"
            }`}
          >
            {statusMessage.tone === "success" ? (
              <CheckCircle2 className="mt-0.5 size-4 shrink-0" />
            ) : (
              <CircleAlert className="mt-0.5 size-4 shrink-0" />
            )}
            <p>{statusMessage.message}</p>
          </div>
        ) : null}

        {participantsResult.notice ? (
          <div className="flex items-start gap-3 rounded-3xl border border-amber-200 bg-amber-50 px-4 py-4 text-base text-amber-950 shadow-sm">
            <CircleAlert className="mt-0.5 size-4 shrink-0" />
            <div className="space-y-1">
              <p className="font-semibold">{participantsResult.notice.title}</p>
              <p>{participantsResult.notice.message}</p>
            </div>
          </div>
        ) : null}
      </div>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {participantCards.map(({ title, value, icon: Icon }) => (
          <Card key={title} className="border-white/70 bg-white/80">
            <CardHeader className="flex flex-col gap-4 space-y-0 md:flex-row md:items-start md:justify-between">
              <div>
                <CardDescription>{title}</CardDescription>
                <CardTitle className="pt-2 text-3xl">{value}</CardTitle>
              </div>
              <div className="rounded-2xl bg-slate-100 p-3 text-slate-700">
                <Icon className="size-5" />
              </div>
            </CardHeader>
          </Card>
        ))}
      </section>

      <section className="grid gap-4 xl:grid-cols-[0.92fr_1.08fr]">
        <Card className="border-white/70 bg-white/80">
          <CardHeader>
            <CardTitle>Add participant</CardTitle>
            <CardDescription>
              Save a participant to Supabase and capture support goals as JSON.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form action={createParticipantAction} className="grid gap-4">
              <div className="grid gap-4 md:grid-cols-2">
                <label className="space-y-2 text-sm">
                  <span className="font-medium text-slate-700">First name</span>
                  <input
                    required
                    name="firstName"
                    autoComplete="given-name"
                    className="field-control"
                    placeholder="Amelia"
                  />
                </label>

                <label className="space-y-2 text-sm">
                  <span className="font-medium text-slate-700">Last name</span>
                  <input
                    required
                    name="lastName"
                    autoComplete="family-name"
                    className="field-control"
                    placeholder="Nguyen"
                  />
                </label>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="space-y-2 text-sm">
                  <span className="font-medium text-slate-700">Preferred name</span>
                  <input
                    name="preferredName"
                    className="field-control"
                    placeholder="Millie"
                  />
                </label>

                <label className="space-y-2 text-sm">
                  <span className="font-medium text-slate-700">NDIS number</span>
                  <input
                    name="ndisNumber"
                    className="field-control"
                    placeholder="4300123456"
                  />
                </label>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="space-y-2 text-sm">
                  <span className="font-medium text-slate-700">Date of birth</span>
                  <input
                    type="date"
                    name="dateOfBirth"
                    className="field-control"
                  />
                </label>

                <label className="space-y-2 text-sm">
                  <span className="font-medium text-slate-700">Status</span>
                  <select
                    name="status"
                    defaultValue={participantStatusOptions[0].value}
                    className="field-control"
                  >
                    {participantStatusOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <label className="space-y-2 text-sm">
                <span className="font-medium text-slate-700">Goals</span>
                <textarea
                  name="goals"
                  rows={5}
                  className="field-textarea"
                  placeholder={"Enter one goal per line\nIncrease independent travel confidence\nBuild a weekly community routine"}
                />
                <p className="text-xs leading-5 text-slate-500">
                  Each non-empty line is stored as a JSON goal entry.
                </p>
              </label>

              <button
                type="submit"
                className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-2xl bg-primary px-5 py-3 text-base font-medium text-primary-foreground transition hover:bg-primary/90 md:w-auto"
              >
                <UserPlus2 className="size-4" />
                Save participant
              </button>
            </form>
          </CardContent>
        </Card>

        <Card className="border-white/70 bg-white/80">
          <CardHeader>
            <CardTitle>Saved participants</CardTitle>
            <CardDescription>
              Participants are listed from Supabase in reverse creation order.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {participants.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 px-6 py-12 text-center text-base text-slate-500">
                No participants saved yet. Submit the form to create the first participant.
              </div>
            ) : (
              participants.map((participant) => (
                <div
                  key={participant.id}
                  className="rounded-3xl border border-slate-200 bg-slate-50 px-4 py-4"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="space-y-3">
                      <div>
                        <p className="text-lg font-semibold text-slate-950">
                          {participant.preferredName?.trim()
                            ? `${participant.preferredName} (${participant.firstName} ${participant.lastName})`
                            : `${participant.firstName} ${participant.lastName}`}
                        </p>
                        <p className="pt-1 text-base text-slate-500">
                          Added {formatParticipantDate(participant.createdAt)}
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <Badge variant="secondary">{formatParticipantStatus(participant.status)}</Badge>
                        {participant.ndisNumber ? (
                          <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600">
                            <Hash className="size-3.5" />
                            {participant.ndisNumber}
                          </span>
                        ) : null}
                        <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600">
                          <Goal className="size-3.5" />
                          {participant.goals.length} goals
                        </span>
                      </div>

                      {participant.goals.length > 0 ? (
                        <div className="rounded-2xl border border-white/80 bg-white px-4 py-3 text-base text-slate-600">
                          <p className="font-medium text-slate-700">Goals JSON preview</p>
                          <pre className="mt-2 whitespace-pre-wrap break-all font-mono text-xs leading-6 text-slate-500">
                            {JSON.stringify(participant.goals, null, 2)}
                          </pre>
                        </div>
                      ) : null}
                    </div>

                    <Link
                      href={getParticipantDetailUrl(participant.id)}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-base font-medium text-slate-700 transition hover:border-slate-300 hover:text-slate-950 lg:w-auto"
                    >
                      <Eye className="size-4" />
                      View detail
                    </Link>
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

function getStatusMessage(
  params: Record<string, string | string[] | undefined>,
  participants: ParticipantListItem[],
) {
  if (typeof params.created === "string") {
    const createdParticipant = participants.find((participant) => participant.id === params.created);
    const name = createdParticipant
      ? `${createdParticipant.firstName} ${createdParticipant.lastName}`
      : "Participant";

    return {
      tone: "success" as const,
      message: `${name} was added successfully and is now visible in the participants list.`,
    };
  }

  if (params.error === "duplicate") {
    return {
      tone: "error" as const,
      message: "A participant with that NDIS number already exists in this workspace.",
    };
  }

  if (params.error === "invalid") {
    return {
      tone: "error" as const,
      message: "Enter a first name, last name, valid status, and valid date before saving.",
    };
  }

  if (params.error === "save") {
    return {
      tone: "error" as const,
      message: "The participant could not be saved to Supabase. Check the server configuration and try again.",
    };
  }

  return null;
}

function formatParticipantDate(value: string) {
  return new Intl.DateTimeFormat("en-AU", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}
