import type { Metadata } from "next";
import Link from "next/link";
import { CircleAlert, FilePenLine, Filter, NotebookTabs, Search, UsersRound } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { NoteAnalyticsPanel } from "@/components/dashboard/module-analytics";
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
  const notePreviewLength = 180;

  return (
    <div className="dashboard-page">
      <div className="dashboard-page-header">
        <div className="dashboard-page-heading">
          <Badge className="w-fit">Notes</Badge>
          <h1 className="dashboard-page-title">Notes and activity</h1>
          <p className="dashboard-page-copy">
            Review saved notes, filter the list, and jump back into the composer when
            new notes need approval.
          </p>
        </div>

        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <div className="dashboard-chip">
            <Filter className="size-4" />
            Saved note history
          </div>
          <Button asChild size="lg" className="w-full md:w-auto">
            <Link href="/dashboard/notes/new">
              <FilePenLine className="size-4" />
              New note
            </Link>
          </Button>
        </div>
      </div>

      <div className="space-y-3">
        {notesResult.notice ? (
          <div className="dashboard-notice border-amber-200 bg-amber-50 text-amber-950">
            <CircleAlert className="mt-0.5 size-4 shrink-0" />
            <div className="space-y-1">
              <p className="font-semibold">{notesResult.notice.title}</p>
              <p>{notesResult.notice.message}</p>
            </div>
          </div>
        ) : null}
      </div>

      <section className="dashboard-summary-grid">
        {summaryCards.map(({ title, value, icon: Icon }) => (
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
        <NoteAnalyticsPanel
          notes={notes}
          participantCount={participantOptions.length}
          className="order-2 self-start xl:order-1 xl:sticky xl:top-3"
        />

        <div className="order-1 min-w-0 space-y-3 xl:order-2">
          <Card className="dashboard-surface">
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

          <Card className="dashboard-surface">
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
                <div className="dashboard-empty-state">
                  {hasActiveFilters
                    ? "No saved notes matched the current filters."
                    : "No notes saved yet. Open the composer and approve a note to create the first entry."}
                </div>
              ) : (
                notes.map((note) => (
                  <div
                    key={note.id}
                    className="rounded-3xl border border-slate-200 bg-slate-50 px-4 py-4 md:rounded-[18px]"
                  >
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div className="space-y-3">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="text-lg font-semibold text-slate-950">{note.participantName}</p>
                            <Badge variant="secondary">{note.title}</Badge>
                          </div>
                          <p className="pt-1 text-sm text-slate-500 sm:text-base">
                            Approved {formatDateTime(note.approvedAt || note.createdAt)} •{" "}
                            {note.workerName
                              ? `${note.workerName}${note.workerRole ? ` · ${note.workerRole}` : ""}`
                              : "No worker assigned"}
                          </p>
                        </div>

                        {hasLongText(note.finalNote, notePreviewLength) ? (
                          <details className="group">
                            <p className="text-sm leading-6 text-slate-700 group-open:hidden sm:text-base sm:leading-7">
                              {getExcerpt(note.finalNote, notePreviewLength)}
                            </p>
                            <p className="hidden text-sm leading-6 text-slate-700 group-open:block sm:text-base sm:leading-7">
                              {normaliseCopy(note.finalNote)}
                            </p>
                            <summary className="mt-2 inline-flex cursor-pointer list-none text-sm font-medium text-primary transition hover:text-primary/80">
                              <span className="group-open:hidden">Read more</span>
                              <span className="hidden group-open:inline">Show less</span>
                            </summary>
                          </details>
                        ) : (
                          <p className="text-sm leading-6 text-slate-700 sm:text-base sm:leading-7">
                            {normaliseCopy(note.finalNote)}
                          </p>
                        )}

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

                      <div className="min-w-0 space-y-3 rounded-3xl border border-white/70 bg-white px-4 py-4 text-sm text-slate-600 sm:text-base lg:w-full lg:max-w-[18rem] md:rounded-[18px]">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                            Worker's original words
                          </p>
                          <p className="pt-2 leading-6 text-slate-700">{normaliseCopy(note.rawInput)}</p>
                        </div>
                      </div>
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
  const normalisedValue = normaliseCopy(value);

  if (normalisedValue.length <= maxLength) {
    return normalisedValue;
  }

  return `${normalisedValue.slice(0, maxLength - 1).trimEnd()}…`;
}

function hasLongText(value: string, maxLength: number) {
  return normaliseCopy(value).length > maxLength;
}

function normaliseCopy(value: string) {
  return value.replace(/\s+/g, " ").trim();
}
