"use client";

import { CalendarDays, ClipboardCheck, Sparkles, UserRound, Users } from "lucide-react";
import { useState } from "react";

import { NoteEditor } from "@/components/NoteEditor";
import { VoiceRecorder } from "@/components/VoiceRecorder";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { isNoteType, noteTypeOptions, type NoteType } from "@/lib/notes";

export type NoteSelectOption = {
  value: string;
  label: string;
  detail?: string;
  goals?: string[];
};

type NoteComposerProps = {
  participantOptions: NoteSelectOption[];
  workerOptions: NoteSelectOption[];
  canSaveToSupabase?: boolean;
  saveUnavailableMessage?: string;
};

type GenerateNoteResponse = {
  ai_draft?: string;
  error?: string;
  goals_addressed?: string[];
};

export function NoteComposer({
  participantOptions,
  workerOptions,
  canSaveToSupabase = true,
  saveUnavailableMessage,
}: NoteComposerProps) {
  const [participantId, setParticipantId] = useState(participantOptions[0]?.value ?? "");
  const [workerId, setWorkerId] = useState(workerOptions[0]?.value ?? "");
  const [noteType, setNoteType] = useState<NoteType>(noteTypeOptions[0].value);
  const [shiftDate, setShiftDate] = useState(getTodayDateInputValue);
  const [sourceNotes, setSourceNotes] = useState("");
  const [aiDraft, setAiDraft] = useState("");
  const [goalsAddressed, setGoalsAddressed] = useState<string[]>([]);
  const [draftState, setDraftState] = useState<"idle" | "generating" | "ready" | "approved">(
    "idle",
  );
  const [isGenerating, setIsGenerating] = useState(false);
  const [apiError, setApiError] = useState("");
  const [statusMessage, setStatusMessage] = useState(
    "Record a shift update or type it manually, then generate the AI draft for approval.",
  );

  const selectedParticipantLabel = findLabel(participantOptions, participantId);
  const selectedWorkerLabel = findLabel(workerOptions, workerId);
  const noteTypeDetail = findDetail(noteTypeOptions, noteType);
  const selectedParticipantGoals = findGoals(participantOptions, participantId);
  const canGenerate = Boolean(sourceNotes.trim() && participantId && shiftDate) && !isGenerating;

  function handleSourceChange(value: string) {
    setSourceNotes(value);
    resetDraftState(
      value.trim()
        ? "Transcript updated. Generate a fresh AI draft before approval."
        : "Record a shift update or type it manually, then generate the AI draft for approval.",
    );
  }

  function handleParticipantChange(value: string) {
    setParticipantId(value);
    resetDraftState("Participant changed. Generate a fresh AI draft before approval.");
  }

  function handleWorkerChange(value: string) {
    setWorkerId(value);
    resetDraftState("Worker changed. Generate a fresh AI draft before approval.");
  }

  function handleNoteTypeChange(value: string) {
    if (!isNoteType(value)) {
      return;
    }

    setNoteType(value);
    resetDraftState("Note type changed. Generate a fresh AI draft before approval.");
  }

  function handleShiftDateChange(value: string) {
    setShiftDate(value);
    resetDraftState("Shift date changed. Generate a fresh AI draft before approval.");
  }

  function handleTranscriptReady(text: string) {
    const trimmedTranscript = text.trim();

    if (!trimmedTranscript) {
      return;
    }

    setSourceNotes(trimmedTranscript);
    void handleGenerate(trimmedTranscript);
  }

  async function handleGenerate(nextSourceNotes?: string) {
    const trimmedSourceNotes = (nextSourceNotes ?? sourceNotes).trim();

    if (!trimmedSourceNotes) {
      setDraftState("idle");
      setAiDraft("");
      setGoalsAddressed([]);
      setApiError("");
      setStatusMessage("Add source notes before generating an AI note.");
      return;
    }

    setIsGenerating(true);
    setDraftState("generating");
    setApiError("");
    setStatusMessage("Generating AI note...");

    try {
      const response = await fetch("/api/generate-note", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          raw_input: trimmedSourceNotes,
          participant_id: participantId,
          shift_date: shiftDate,
          sourceText: trimmedSourceNotes,
          participantId,
          workerId,
          noteType,
        }),
      });
      const payload = (await response.json().catch(() => null)) as GenerateNoteResponse | null;

      if (!response.ok || !payload?.ai_draft?.trim()) {
        throw new Error(payload?.error || "AI note generation failed.");
      }

      const generatedDraft = payload.ai_draft.trim();
      setAiDraft(generatedDraft);
      setGoalsAddressed(
        resolveGoalsAddressed({
          apiGoals: payload.goals_addressed,
          participantGoals: selectedParticipantGoals,
          rawInput: trimmedSourceNotes,
          aiDraft: generatedDraft,
        }),
      );
      setDraftState("ready");
      setStatusMessage("AI draft ready. Review the text, then approve and save it.");
    } catch (error) {
      setAiDraft("");
      setGoalsAddressed([]);
      setDraftState("idle");
      setApiError(getErrorMessage(error));
      setStatusMessage("AI note generation failed. Resolve the issue and try again.");
    } finally {
      setIsGenerating(false);
    }
  }

  function handleApproved() {
    setDraftState("approved");
    setStatusMessage("Note approved and saved.");
  }

  function resetDraftState(message: string) {
    setAiDraft("");
    setGoalsAddressed([]);
    setApiError("");
    setDraftState("idle");
    setStatusMessage(message);
  }

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
              <CardDescription>Draft status</CardDescription>
              <CardTitle className="pt-2 text-3xl">{formatDraftState(draftState)}</CardTitle>
            </div>
            <div className="rounded-2xl bg-slate-100 p-3 text-slate-700">
              <ClipboardCheck className="size-5" />
            </div>
          </CardHeader>
        </Card>
      </section>

      <section className="grid items-start gap-4 xl:grid-cols-[minmax(0,0.95fr)_minmax(20rem,1.05fr)]">
        <Card className="border-white/70 bg-white/80">
          <CardHeader>
            <CardTitle>Capture and structure</CardTitle>
            <CardDescription>
              Map the note to a participant and worker, capture the transcript, and structure it
              into an AI draft.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-5">
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              <div className="soft-panel px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Participant
                </p>
                <p className="pt-2 text-base font-semibold text-slate-900">
                  {selectedParticipantLabel || "Select a participant"}
                </p>
              </div>
              <div className="soft-panel px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Worker
                </p>
                <p className="pt-2 text-base font-semibold text-slate-900">
                  {selectedWorkerLabel || "Select a worker"}
                </p>
              </div>
              <div className="soft-panel px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Note type
                </p>
                <p className="pt-2 text-base font-semibold text-slate-900">
                  {findLabel(noteTypeOptions, noteType) || "Select a note type"}
                </p>
              </div>
              <div className="soft-panel px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Shift date
                </p>
                <p className="pt-2 text-base font-semibold text-slate-900">
                  {shiftDate || "Select a shift date"}
                </p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <label className="space-y-2 text-sm">
                <span className="font-medium text-slate-700">Participant</span>
                <select
                  value={participantId}
                  onChange={(event) => handleParticipantChange(event.target.value)}
                  className="field-control"
                >
                  {participantOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                {findDetail(participantOptions, participantId) ? (
                  <p className="text-base text-slate-500">
                    {findDetail(participantOptions, participantId)}
                  </p>
                ) : null}
              </label>

              <label className="space-y-2 text-sm">
                <span className="font-medium text-slate-700">Worker</span>
                <select
                  value={workerId}
                  onChange={(event) => handleWorkerChange(event.target.value)}
                  className="field-control"
                >
                  {workerOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                {findDetail(workerOptions, workerId) ? (
                  <p className="text-base text-slate-500">{findDetail(workerOptions, workerId)}</p>
                ) : null}
              </label>

              <label className="space-y-2 text-sm">
                <span className="font-medium text-slate-700">Note type</span>
                <select
                  value={noteType}
                  onChange={(event) => handleNoteTypeChange(event.target.value)}
                  className="field-control"
                >
                  {noteTypeOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <p className="text-base text-slate-500">{noteTypeDetail}</p>
              </label>

              <label className="space-y-2 text-sm">
                <span className="font-medium text-slate-700">Shift date</span>
                <div className="relative">
                  <input
                    type="date"
                    value={shiftDate}
                    onChange={(event) => handleShiftDateChange(event.target.value)}
                    className="field-control pr-11"
                  />
                  <CalendarDays className="pointer-events-none absolute right-4 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                </div>
                <p className="text-base text-slate-500">
                  This date is sent with the transcript when the AI draft is generated.
                </p>
              </label>
            </div>

            <VoiceRecorder
              value={sourceNotes}
              onChange={handleSourceChange}
              onTranscriptReady={handleTranscriptReady}
            />

            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <Button
                type="button"
                size="lg"
                onClick={() => void handleGenerate()}
                disabled={!canGenerate}
                className="w-full md:w-auto"
              >
                <Sparkles className="size-4" />
                {isGenerating ? "Generating..." : "Generate AI Draft"}
              </Button>
              <p className="text-base text-slate-500">
                Voice recordings auto-generate on stop, and manual edits can be regenerated here.
              </p>
            </div>
          </CardContent>
        </Card>

        <NoteEditor
          aiDraft={aiDraft}
          goalsAddressed={goalsAddressed}
          rawInput={sourceNotes}
          participantId={participantId}
          shiftDate={shiftDate}
          workerId={workerId}
          noteType={noteType}
          statusMessage={statusMessage}
          generationError={apiError}
          isGenerating={isGenerating}
          canSave={canSaveToSupabase}
          saveUnavailableMessage={saveUnavailableMessage}
          onApproved={handleApproved}
        />
      </section>
    </div>
  );
}

function findDetail(options: readonly NoteSelectOption[], value: string) {
  return options.find((option) => option.value === value)?.detail;
}

function findGoals(options: readonly NoteSelectOption[], value: string) {
  return options.find((option) => option.value === value)?.goals ?? [];
}

function formatDraftState(value: "idle" | "generating" | "ready" | "approved") {
  switch (value) {
    case "generating":
      return "Generating";
    case "ready":
      return "Ready";
    case "approved":
      return "Approved";
    default:
      return "Awaiting";
  }
}

function findLabel(
  options: readonly {
    value: string;
    label: string;
  }[],
  value: string,
) {
  return options.find((option) => option.value === value)?.label;
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "AI note generation failed.";
}

function getTodayDateInputValue() {
  const now = new Date();
  const timezoneOffset = now.getTimezoneOffset() * 60_000;

  return new Date(now.getTime() - timezoneOffset).toISOString().slice(0, 10);
}

function resolveGoalsAddressed(input: {
  apiGoals?: string[];
  participantGoals: string[];
  rawInput: string;
  aiDraft: string;
}) {
  const apiGoals = input.apiGoals
    ?.flatMap((goal) => (typeof goal === "string" ? [goal.trim()] : []))
    .filter(Boolean);

  if (apiGoals && apiGoals.length > 0) {
    return apiGoals;
  }

  return deriveGoalsAddressed(input.participantGoals, [input.rawInput, input.aiDraft]);
}

function deriveGoalsAddressed(goals: string[], texts: string[]) {
  if (goals.length === 0) {
    return [];
  }

  const haystack = texts.join(" ").toLowerCase();
  const matchedGoals = goals.filter((goal) => {
    const normalisedGoal = goal.trim().toLowerCase();

    if (!normalisedGoal) {
      return false;
    }

    if (haystack.includes(normalisedGoal)) {
      return true;
    }

    const keywords = normalisedGoal
      .split(/[^a-z0-9]+/)
      .map((keyword) => keyword.trim())
      .filter((keyword) => keyword.length >= 4);

    return keywords.some((keyword) => haystack.includes(keyword));
  });

  return matchedGoals.length > 0 ? matchedGoals : goals;
}
