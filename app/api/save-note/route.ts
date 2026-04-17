import { NextResponse } from "next/server";

import { isNoteType } from "@/lib/notes";
import { createProgressNote } from "@/lib/progress-notes";
import { getSupabaseAdminEnvStatus } from "@/lib/supabase/env";
import { resolveParticipantForNotes, resolveWorkerForNotes } from "@/lib/workspace-data";

type SaveNoteRequestBody = {
  sourceText?: unknown;
  participantId?: unknown;
  workerId?: unknown;
  noteType?: unknown;
  aiDraft?: unknown;
  finalNote?: unknown;
  shiftDate?: unknown;
  goalsAddressed?: unknown;
};

export async function POST(request: Request) {
  let body: SaveNoteRequestBody;

  try {
    body = (await request.json()) as SaveNoteRequestBody;
  } catch {
    return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 });
  }

  const sourceText = typeof body.sourceText === "string" ? body.sourceText.trim() : "";
  const participantId = typeof body.participantId === "string" ? body.participantId.trim() : "";
  const aiDraft = typeof body.aiDraft === "string" ? body.aiDraft.trim() : "";
  const finalNote = typeof body.finalNote === "string" ? body.finalNote.trim() : "";
  const shiftDate = typeof body.shiftDate === "string" ? body.shiftDate.trim() : "";
  const workerId =
    typeof body.workerId === "undefined"
      ? undefined
      : typeof body.workerId === "string"
        ? body.workerId.trim()
        : null;
  const noteType =
    typeof body.noteType === "undefined"
      ? undefined
      : typeof body.noteType === "string"
        ? body.noteType.trim()
        : null;

  if (!sourceText || !participantId || !aiDraft || !finalNote) {
    return NextResponse.json(
      { error: "Source text, participant, AI draft, and final note are required." },
      { status: 400 },
    );
  }

  if (workerId === null || noteType === null) {
    return NextResponse.json(
      { error: "Invalid request body. Optional fields must be strings when provided." },
      { status: 400 },
    );
  }

  if (noteType && !isNoteType(noteType)) {
    return NextResponse.json({ error: "A valid note type is required." }, { status: 400 });
  }

  const envStatus = getSupabaseAdminEnvStatus();

  if (!envStatus.ready) {
    return NextResponse.json(
      {
        error:
          "Live note saving is unavailable because the Supabase cloud environment variables are not configured for this deployment.",
      },
      { status: 503 },
    );
  }

  try {
    const participant = await resolveParticipantForNotes(participantId);

    if (!participant) {
      return NextResponse.json(
        {
          error:
            "The selected participant could not be found in the live workspace.",
        },
        { status: 404 },
      );
    }

    const worker = workerId ? await resolveWorkerForNotes(workerId) : null;
    const goalsAddressed = Array.isArray(body.goalsAddressed)
      ? body.goalsAddressed
          .flatMap((goal) => (typeof goal === "string" ? [goal.trim()] : []))
          .filter(Boolean)
      : [];

    const savedNoteId = await createProgressNote({
      participantId: participant.id,
      workerId: worker?.id ?? null,
      noteType: noteType && isNoteType(noteType) ? noteType : undefined,
      rawInput: sourceText,
      aiDraft,
      finalNote,
      participantGoals: participant.goals.map((goal) => goal.title),
      goalsAddressed,
      approvedAt: new Date().toISOString(),
      noteDate: shiftDate || undefined,
    });

    return NextResponse.json({ saved_note_id: savedNoteId });
  } catch (error) {
    console.error("Failed to save note:", error);

    return NextResponse.json(
      { error: "Note could not be saved. Check the Supabase configuration and try again." },
      { status: 500 },
    );
  }
}
