import { NextResponse } from "next/server";

import {
  buildRuleBasedNoteDraft,
  formatParticipantName,
  isNoteType,
} from "@/lib/notes";
import { resolveParticipantForNotes } from "@/lib/workspace-data";

type GenerateNoteRequestBody = {
  raw_input?: unknown;
  participant_id?: unknown;
  shift_date?: unknown;
  sourceText?: unknown;
  participantId?: unknown;
  workerId?: unknown;
  noteType?: unknown;
};

export async function POST(request: Request) {
  let body: GenerateNoteRequestBody;

  try {
    body = (await request.json()) as GenerateNoteRequestBody;
  } catch {
    return NextResponse.json({ error: "The note request could not be processed." }, { status: 400 });
  }

  const sourceText =
    typeof body.sourceText === "string"
      ? body.sourceText.trim()
      : typeof body.raw_input === "string"
        ? body.raw_input.trim()
        : "";
  const participantId =
    typeof body.participantId === "string"
      ? body.participantId.trim()
      : typeof body.participant_id === "string"
        ? body.participant_id.trim()
        : "";
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

  if (!sourceText) {
    return NextResponse.json({ error: "Source notes are required." }, { status: 400 });
  }

  if (!participantId) {
    return NextResponse.json({ error: "Participant selection is required." }, { status: 400 });
  }

  if (workerId === null || noteType === null) {
    return NextResponse.json(
      { error: "Some note details were not in the expected format." },
      { status: 400 },
    );
  }

  if (noteType && !isNoteType(noteType)) {
    return NextResponse.json({ error: "A valid note type is required." }, { status: 400 });
  }

  try {
    const participant = await resolveParticipantForNotes(participantId);

    if (!participant) {
      return NextResponse.json(
        {
          error: "The selected participant could not be found.",
        },
        { status: 404 },
      );
    }

    const participantName = formatParticipantName(participant);
    const result = buildRuleBasedNoteDraft({
      sourceText,
      participantName,
      participantGoals: getParticipantGoalTitles(participant.goals),
      noteType: noteType && isNoteType(noteType) ? noteType : undefined,
      shiftDate: typeof body.shift_date === "string" ? body.shift_date.trim() : undefined,
    });

    return NextResponse.json({
      ai_draft: result.aiDraft,
      goals_addressed: result.goalsAddressed,
    });
  } catch {
    return NextResponse.json(
      { error: "A draft note could not be created. Please try again." },
      { status: 500 },
    );
  }
}

function getParticipantGoalTitles(goals: unknown) {
  if (!Array.isArray(goals)) {
    return [];
  }

  return goals.flatMap((goal) => {
    if (typeof goal === "string") {
      const title = goal.trim();
      return title ? [title] : [];
    }

    if (typeof goal === "object" && goal !== null && "title" in goal) {
      const title = typeof goal.title === "string" ? goal.title.trim() : "";
      return title ? [title] : [];
    }

    return [];
  });
}
