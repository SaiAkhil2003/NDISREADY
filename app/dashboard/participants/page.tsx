import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, CircleAlert, Eye, Goal, Hash, UserPlus2, UsersRound } from "lucide-react";

import { createParticipantAction } from "@/app/dashboard/participants/actions";
import { ParticipantAnalyticsPanel } from "@/components/dashboard/module-analytics";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  formatParticipantNdisNumber,
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
    <div className="dashboard-page">
      <div className="dashboard-page-header">
        <div className="dashboard-page-heading">
          <Badge className="w-fit">Participants</Badge>
          <h1 className="dashboard-page-title">Participant management</h1>
          <p className="dashboard-page-copy">
            Create participant records, capture their goals, and review each profile in one place.
          </p>
        </div>

        <div className="dashboard-chip">
          <UserPlus2 className="size-4" />
          Participant directory
        </div>
      </div>

      <div className="space-y-3">
        {statusMessage ? (
          <div
            className={`dashboard-notice ${
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
          <div className="dashboard-notice border-amber-200 bg-amber-50 text-amber-950">
            <CircleAlert className="mt-0.5 size-4 shrink-0" />
            <div className="space-y-1">
              <p className="font-semibold">{participantsResult.notice.title}</p>
              <p>{participantsResult.notice.message}</p>
            </div>
          </div>
        ) : null}
      </div>

      <section className="dashboard-summary-grid">
        {participantCards.map(({ title, value, icon: Icon }) => (
          <Card key={title} className="dashboard-stat-surface">
            <CardHeader className="flex flex-col gap-3 space-y-0 p-3.5 md:flex-row md:items-start md:justify-between md:p-4">
              <div>
                <CardDescription className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">{title}</CardDescription>
                <CardTitle className="pt-1.5 text-[1.6rem] leading-none">{value}</CardTitle>
              </div>
              <div className="rounded-[10px] bg-slate-100 p-2.5 text-slate-700">
                <Icon className="size-4.5" />
              </div>
            </CardHeader>
          </Card>
        ))}
      </section>

      <section className="grid items-start gap-3 xl:grid-cols-[minmax(0,320px)_minmax(0,1fr)] 2xl:grid-cols-[minmax(0,340px)_minmax(0,1fr)]">
        <ParticipantAnalyticsPanel
          participants={participants}
          className="order-2 self-start xl:order-1 xl:sticky xl:top-3"
        />

        <div className="order-1 min-w-0 space-y-3 xl:order-2 2xl:grid 2xl:grid-cols-[minmax(0,0.86fr)_minmax(0,1.14fr)] 2xl:items-start 2xl:gap-3 2xl:space-y-0">
          <Card className="dashboard-surface">
            <CardHeader>
              <CardTitle>Add participant</CardTitle>
              <CardDescription>
                Add a participant record and capture the goals that guide support.
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
                    Enter one goal per line.
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

          <Card className="dashboard-surface min-w-0">
            <CardHeader>
              <CardTitle>Saved participants</CardTitle>
              <CardDescription>
                Participants are listed with the most recently added records first.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {participants.length === 0 ? (
                <div className="dashboard-empty-state">
                  No participants saved yet. Submit the form to create the first participant.
                </div>
              ) : (
                participants.map((participant) => (
                  <div
                    key={participant.id}
                    className="rounded-3xl border border-slate-200 bg-slate-50 px-4 py-4 md:rounded-[18px]"
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
                        </div>

                        <div className="grid gap-2 text-sm text-slate-600 sm:text-base">
                          <div className="flex items-center gap-2">
                            <Hash className="size-4 shrink-0 text-slate-400" />
                            <p>
                              <span className="font-medium text-slate-700">NDIS:</span>{" "}
                              {formatParticipantNdisNumber(participant.ndisNumber) ?? "Not provided"}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Goal className="size-4 shrink-0 text-slate-400" />
                            <p>
                              {participant.goals.length} goal{participant.goals.length === 1 ? "" : "s"} recorded
                            </p>
                          </div>
                        </div>

                        {participant.goals.length > 0 ? (
                          <div className="rounded-[14px] border border-white/80 bg-white px-4 py-3 text-base text-slate-600">
                            <p className="font-medium text-slate-700">Goals</p>
                            <div className="mt-2 space-y-2">
                              {participant.goals.slice(0, 3).map((goal, index) => (
                                <p
                                  key={`${participant.id}-${goal.title}-${index}`}
                                  className="leading-6 text-slate-600"
                                >
                                  <span className="font-medium text-slate-700">Goal {index + 1}:</span>{" "}
                                  {goal.title}
                                </p>
                              ))}
                            </div>
                            {participant.goals.length > 3 ? (
                              <p className="mt-3 text-sm text-slate-500">
                                +{participant.goals.length - 3} more goal{participant.goals.length - 3 === 1 ? "" : "s"}
                              </p>
                            ) : null}
                          </div>
                        ) : null}
                      </div>

                      <Link
                        href={getParticipantDetailUrl(participant.id)}
                        className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-base font-medium text-slate-700 transition hover:border-slate-300 hover:text-slate-950 lg:w-auto"
                      >
                        <Eye className="size-4" />
                        View profile
                      </Link>
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
      message: "The participant could not be saved right now. Please try again.",
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
