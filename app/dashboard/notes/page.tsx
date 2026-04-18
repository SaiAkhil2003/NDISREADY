import type { Metadata } from "next";
import Link from "next/link";
import { CircleAlert, FilePenLine, Filter, NotebookTabs, Search, UsersRound } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { isNoteType, noteTypeOptions } from "@/lib/notes";
import { type ProgressNoteListItem } from "@/lib/progress-notes";
import { loadNotesFeed } from "@/lib/workspace-data";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Notes",
  description: "Browse, filter, and review support notes in the NDISReady.ai workspace.",
};

type NotesPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function NotesPage({ searchParams }: NotesPageProps) {
  const params = searchParams ? await searchParams : {};
  const filters = {
    query: readSearchParam(params.query),
    participantId: readSearchParam(params.participantId),
    workerId: readSearchParam(params.workerId),
    noteType: readSearchParam(params.noteType),
  };

  const notesResult = await loadNotesFeed({
    participantId: filters.participantId || undefined,
    workerId: filters.workerId || undefined,
    noteType: filters.noteType && isNoteType(filters.noteType) ? filters.noteType : undefined,
    query: filters.query || undefined,
  });
  const notes = notesResult.data.notes as ProgressNoteListItem[];
  const participantOptions = notesResult.data.participantOptions;
  const workerOptions = notesResult.data.workerOptions;

  const totalNotes = notes.length;
  const approvedNotes = notes.filter((note) => Boolean(note.approvedAt)).length;
  const participantsInView = new Set(notes.map((note) => note.participantId)).size;
  const hasActiveFilters = Object.values(filters).some(Boolean);

  const summaryCards = [
    { title: "Notes in view", value: String(totalNotes), icon: NotebookTabs },
    { title: "Approved notes", value: String(approvedNotes), icon: FilePenLine },
    { title: "Participants covered", value: String(participantsInView), icon: UsersRound },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-2">
          <Badge className="w-fit">Notes</Badge>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-950">
            Notes and activity
          </h1>
          <p className="max-w-2xl text-base leading-7 text-slate-600">
            Review saved notes, filter the list, and jump back into the composer when
            new notes need approval.
          </p>
        </div>

        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
            <Filter className="size-4" />
            Saved note history
          </div>
          <Button asChild size="lg">
            <Link href="/dashboard/notes/new">
              <FilePenLine className="size-4" />
              New note
            </Link>
          </Button>
        </div>
      </div>

      <div className="space-y-3">
        {notesResult.notice ? (
          <div className="flex items-start gap-3 rounded-3xl border border-amber-200 bg-amber-50 px-4 py-4 text-base text-amber-950 shadow-sm">
            <CircleAlert className="mt-0.5 size-4 shrink-0" />
            <div className="space-y-1">
              <p className="font-semibold">{notesResult.notice.title}</p>
              <p>{notesResult.notice.message}</p>
            </div>
          </div>
        ) : null}
      </div>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {summaryCards.map(({ title, value, icon: Icon }) => (
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

      <Card className="border-white/70 bg-white/80">
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>
            Narrow the saved notes list by participant, worker, note type, or matching text.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4 lg:grid-cols-[1.2fr_0.9fr_0.9fr_0.8fr_auto_auto]">
            <label className="space-y-2 text-sm">
              <span className="font-medium text-slate-700">Search</span>
              <div className="flex h-11 items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 transition focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/15">
                <Search className="size-4 text-slate-400" />
                <input
                  name="query"
                  defaultValue={filters.query}
                  className="w-full border-0 bg-transparent p-0 outline-none placeholder:text-slate-400"
                  placeholder="Search title or note text"
                />
              </div>
            </label>

            <label className="space-y-2 text-sm">
              <span className="font-medium text-slate-700">Participant</span>
              <select
                name="participantId"
                defaultValue={filters.participantId}
                className="field-control"
              >
                <option value="">All participants</option>
                {participantOptions.map((participant) => (
                  <option key={participant.value} value={participant.value}>
                    {participant.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-2 text-sm">
              <span className="font-medium text-slate-700">Worker</span>
              <select
                name="workerId"
                defaultValue={filters.workerId}
                className="field-control"
              >
                <option value="">All workers</option>
                {workerOptions.map((worker) => (
                  <option key={worker.value} value={worker.value}>
                    {worker.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-2 text-sm">
              <span className="font-medium text-slate-700">Type</span>
              <select
                name="noteType"
                defaultValue={filters.noteType}
                className="field-control"
              >
                <option value="">All note types</option>
                {noteTypeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <div className="flex items-end">
              <button
                type="submit"
                className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-2xl bg-primary px-5 text-base font-medium text-primary-foreground transition hover:bg-primary/90"
              >
                <Filter className="size-4" />
                Apply
              </button>
            </div>

            <div className="flex items-end">
              {hasActiveFilters ? (
                <Button asChild variant="outline" className="h-11 w-full">
                  <Link href="/dashboard/notes">Reset</Link>
                </Button>
              ) : (
                <div className="flex h-11 w-full items-center justify-center rounded-2xl border border-dashed border-slate-200 px-4 text-base text-slate-400">
                  No filters
                </div>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="border-white/70 bg-white/80">
        <CardHeader>
          <CardTitle>Saved notes</CardTitle>
          <CardDescription>
            {hasActiveFilters
              ? `Showing ${totalNotes} saved note${totalNotes === 1 ? "" : "s"} for the current filters.`
              : "Saved notes are listed with the newest approvals first."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {notes.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 px-6 py-12 text-center text-base text-slate-500">
              {hasActiveFilters
                ? "No saved notes matched the current filters."
                : "No notes saved yet. Open the composer and approve a note to create the first entry."}
            </div>
          ) : (
            notes.map((note) => (
              <div
                key={note.id}
                className="rounded-3xl border border-slate-200 bg-slate-50 px-4 py-4"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="space-y-3">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-lg font-semibold text-slate-950">{note.participantName}</p>
                        <Badge variant="secondary">{note.title}</Badge>
                      </div>
                      <p className="pt-1 text-base text-slate-500">
                        Approved {formatDateTime(note.approvedAt || note.createdAt)} •{" "}
                        {note.workerName
                          ? `${note.workerName}${note.workerRole ? ` · ${note.workerRole}` : ""}`
                          : "No worker assigned"}
                      </p>
                    </div>

                    <p className="text-base leading-7 text-slate-700">
                      {getExcerpt(note.finalNote, 320)}
                    </p>

                    {note.goalsAddressed.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {note.goalsAddressed.map((goal) => (
                          <span
                            key={`${note.id}-${goal}`}
                            className="inline-flex rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600"
                          >
                            {goal}
                          </span>
                        ))}
                      </div>
                    ) : null}
                  </div>

                  <div className="min-w-0 space-y-3 rounded-3xl border border-white/70 bg-white px-4 py-4 text-base text-slate-600 lg:w-full lg:max-w-[18rem]">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                        Support summary
                      </p>
                      <p className="pt-2 leading-6 text-slate-700">{getExcerpt(note.rawInput, 160)}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                        Record status
                      </p>
                      <p className="pt-2 leading-6 text-slate-700">
                        {note.approvedAt
                          ? "This note has been approved and added to the participant record."
                          : "This note is saved and awaiting approval."}
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
  );
}

function readSearchParam(value: string | string[] | undefined) {
  return typeof value === "string" ? value.trim() : "";
}

function formatDateTime(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-AU", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function getExcerpt(value: string, maxLength: number) {
  const normalisedValue = value.replace(/\s+/g, " ").trim();

  if (normalisedValue.length <= maxLength) {
    return normalisedValue;
  }

  return `${normalisedValue.slice(0, maxLength - 1).trimEnd()}…`;
}
