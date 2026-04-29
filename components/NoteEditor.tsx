"use client";

import { CheckCircle2, CircleAlert } from "lucide-react";
import { useEffect, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

type NoteEditorProps = {
  aiDraft: string;
  goalsAddressed: string[];
  rawInput: string;
  participantId: string;
  shiftDate: string;
  workerId?: string;
  noteType?: string;
  statusMessage: string;
  generationError?: string;
  isGenerating?: boolean;
  canSave?: boolean;
  saveUnavailableMessage?: string;
  onApproved?: (savedNoteId: string, finalNote: string) => void;
};

type SaveNoteResponse = {
  error?: string;
  saved_note_id?: string;
};

export function NoteEditor({
  aiDraft,
  goalsAddressed,
  rawInput,
  participantId,
  shiftDate,
  workerId,
  noteType,
  statusMessage,
  generationError,
  isGenerating = false,
  canSave = true,
  saveUnavailableMessage,
  onApproved,
}: NoteEditorProps) {
  const [draft, setDraft] = useState(aiDraft);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [saveSuccess, setSaveSuccess] = useState("");

  useEffect(() => {
    setDraft(aiDraft);
    setIsSaving(false);
    setSaveError("");
    setSaveSuccess("");
  }, [aiDraft, participantId, rawInput, shiftDate, workerId, noteType]);

  async function handleApproveAndSave() {
    const finalNote = draft.trim();
    const originalDraft = aiDraft.trim();
    const sourceText = rawInput.trim();

    if (!finalNote || !originalDraft || !sourceText || !participantId.trim() || !shiftDate.trim()) {
      return;
    }

    setIsSaving(true);
    setSaveError("");
    setSaveSuccess("");

    try {
      const response = await fetch("/api/save-note", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          sourceText,
          raw_input: sourceText,
          participantId,
          participant_id: participantId,
          workerId,
          noteType,
          shiftDate,
          shift_date: shiftDate,
          aiDraft: originalDraft,
          finalNote,
          final_note: finalNote,
          goalsAddressed,
        }),
      });
      const payload = (await response.json().catch(() => null)) as SaveNoteResponse | null;

      if (!response.ok || !payload?.saved_note_id?.trim()) {
        throw new Error(payload?.error || "Note could not be saved.");
      }

      setSaveSuccess("Note approved and saved.");
      onApproved?.(payload.saved_note_id, finalNote);
    } catch (error) {
      setSaveError(getErrorMessage(error));
    } finally {
      setIsSaving(false);
    }
  }

  function handleDraftChange(value: string) {
    setDraft(value);

    if (saveError) {
      setSaveError("");
    }

    if (saveSuccess) {
      setSaveSuccess("");
    }
  }

  const canApproveAndSave = Boolean(
    aiDraft.trim() &&
      draft.trim() &&
      rawInput.trim() &&
      participantId.trim() &&
      shiftDate.trim() &&
      !isGenerating &&
      !isSaving &&
      canSave,
  );

  return (
    <Card className="w-full self-start border-slate-800 bg-slate-950 text-white xl:sticky xl:top-6">
      <CardHeader>
        <div className="flex flex-wrap items-center gap-3">
          <CardTitle className="text-white">Draft</CardTitle>
          <Badge
            variant={saveSuccess ? "default" : "secondary"}
            className={
              saveSuccess
                ? "border-emerald-500/25 bg-emerald-500/15 text-emerald-200"
                : "border-white/10 bg-white/10 text-slate-200"
            }
          >
            {saveSuccess
              ? "Approved"
              : aiDraft.trim()
                ? "Ready for approval"
                : isGenerating
                  ? "Generating"
                  : "Awaiting transcript"}
          </Badge>
        </div>
        <CardDescription className="text-slate-300">
          Review the draft, make any final edits, and save the final note.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-slate-200">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
            Worker's original words
          </p>
          <p className="mt-2 break-words whitespace-pre-wrap text-sm leading-6 sm:text-base sm:leading-7">
            {rawInput.trim() || "The original worker input will appear here for comparison."}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {goalsAddressed.length > 0 ? (
            goalsAddressed.map((goal) => (
              <Badge
                key={goal}
                variant="secondary"
                className="border-white/10 bg-white/10 text-slate-100"
              >
                {goal}
              </Badge>
            ))
          ) : (
            <Badge variant="secondary" className="border-white/10 bg-white/10 text-slate-300">
              Goals will appear here once the draft is generated
            </Badge>
          )}
        </div>

        <Textarea
          rows={14}
          value={draft}
          onChange={(event) => handleDraftChange(event.target.value)}
          disabled={!aiDraft.trim() || isGenerating || isSaving}
          className="min-h-[160px] border-white/10 bg-white/5 text-white placeholder:text-slate-500"
          placeholder="The drafted progress note will appear here."
        />

        <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-base text-slate-300">
          {statusMessage}
        </div>

        {generationError ? (
          <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-4 text-base text-rose-100">
            <div className="flex flex-col gap-3 md:flex-row md:items-start">
              <CircleAlert className="mt-0.5 size-5 shrink-0" />
              <p>{generationError}</p>
            </div>
          </div>
        ) : null}

        {saveError ? (
          <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-4 text-base text-rose-100">
            <div className="flex flex-col gap-3 md:flex-row md:items-start">
              <CircleAlert className="mt-0.5 size-5 shrink-0" />
              <p>{saveError}</p>
            </div>
          </div>
        ) : null}

        {!canSave && saveUnavailableMessage ? (
          <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 px-4 py-4 text-base text-amber-100">
            <div className="flex flex-col gap-3 md:flex-row md:items-start">
              <CircleAlert className="mt-0.5 size-5 shrink-0" />
              <p>{saveUnavailableMessage}</p>
            </div>
          </div>
        ) : null}

        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <Button
            type="button"
            size="lg"
            variant="default"
            onClick={handleApproveAndSave}
            disabled={!canApproveAndSave}
            className="w-full md:w-auto"
          >
            <CheckCircle2 className="size-5" />
            {isSaving ? "Saving..." : "Approve & Save"}
          </Button>
          <p className="text-base text-slate-400">
            {canSave
              ? "Save happens from the approval action once the draft is ready."
              : "Draft editing is available, but saving is temporarily unavailable."}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Note could not be saved.";
}
