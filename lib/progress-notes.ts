import { createAdminClient } from "@/lib/supabase/admin";
import {
  formatParticipantName,
  getNoteTypeLabel,
  getNoteTypeValueFromLabel,
  type NoteType,
} from "@/lib/notes";
import { listParticipants } from "@/lib/participants";
import { getWorkspaceOrganisationId } from "@/lib/workspace";
import { formatWorkerRole, listWorkers } from "@/lib/workers";

type CreateProgressNoteInput = {
  participantId: string;
  workerId?: string | null;
  noteType?: NoteType;
  rawInput: string;
  aiDraft: string;
  finalNote: string;
  participantGoals: string[];
  goalsAddressed?: string[];
  approvedAt: string;
  noteDate?: string;
};

type ProgressNotesInsertRow = {
  id: string;
};

type ProgressNotesTableRow = {
  id: string;
  participant_id: string;
  worker_id: string | null;
  title: string | null;
  body: string;
  raw_input: string | null;
  ai_draft: string | null;
  final_note: string | null;
  goals_addressed: unknown;
  approved_at: string | null;
  created_at: string;
  note_date: string;
};

type LegacyProgressNotesTableRow = {
  id: string;
  participant_id: string;
  worker_id: string | null;
  title: string | null;
  body: string;
  created_at: string;
  note_date: string;
};

type ProgressNotesSummaryRow = {
  id: string;
  participant_id: string;
  approved_at: string | null;
  created_at: string;
};

type LegacyProgressNotesSummaryRow = {
  id: string;
  participant_id: string;
  created_at: string;
};

export type ProgressNoteListItem = {
  id: string;
  participantId: string;
  participantName: string;
  workerId: string | null;
  workerName: string | null;
  workerRole: string | null;
  title: string;
  noteType: NoteType | null;
  body: string;
  rawInput: string;
  aiDraft: string;
  finalNote: string;
  goalsAddressed: string[];
  approvedAt: string | null;
  createdAt: string;
  noteDate: string;
};

export type ListProgressNotesFilters = {
  participantId?: string;
  workerId?: string;
  noteType?: NoteType;
  query?: string;
};

export type ProgressNoteSummary = {
  id: string;
  participantId: string;
  approvedAt: string | null;
  createdAt: string;
};

type ProgressNotesQueryMode = "phase9" | "legacy";

type ProgressNotesLikeError = {
  code?: unknown;
  message?: unknown;
  details?: unknown;
  hint?: unknown;
};

export function formatProgressNotesError(error: unknown) {
  if (typeof error === "string") {
    return error;
  }

  if (error instanceof Error) {
    const details = formatProgressNotesErrorDetails(error, { includeMessage: false });
    return details ? `${error.message} (${details})` : error.message;
  }

  if (typeof error === "object" && error !== null) {
    const details = formatProgressNotesErrorDetails(error as ProgressNotesLikeError);

    if (details) {
      return details;
    }

    try {
      return JSON.stringify(error);
    } catch {
      return "Unknown progress notes error object";
    }
  }

  return String(error);
}

export async function createProgressNote(input: CreateProgressNoteInput) {
  const organisationId = await getWorkspaceOrganisationId({ createIfMissing: true });

  if (!organisationId) {
    throw new Error("Workspace organisation could not be resolved.");
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("progress_notes")
    .insert({
      organisation_id: organisationId,
      participant_id: input.participantId,
      worker_id: input.workerId?.trim() || null,
      title: input.noteType ? getNoteTypeLabel(input.noteType) : "Support Note",
      body: input.finalNote,
      raw_input: input.rawInput,
      ai_draft: input.aiDraft,
      final_note: input.finalNote,
      goals_addressed:
        input.goalsAddressed && input.goalsAddressed.length > 0
          ? input.goalsAddressed
          : deriveGoalsAddressed(input.participantGoals, [
              input.rawInput,
              input.aiDraft,
              input.finalNote,
            ]),
      approved_at: input.approvedAt,
      note_date: input.noteDate?.trim() || undefined,
    })
    .select("id")
    .single();

  if (error) {
    throw error;
  }

  return (data as ProgressNotesInsertRow).id;
}

export async function listProgressNotes(filters: ListProgressNotesFilters = {}) {
  const organisationId = await getWorkspaceOrganisationId();

  if (!organisationId) {
    return [];
  }

  let queryMode: ProgressNotesQueryMode = "phase9";
  let rows:
    | ProgressNotesTableRow[]
    | LegacyProgressNotesTableRow[] = [];

  const phase9Result = await queryProgressNotesRows({
    organisationId,
    filters,
    mode: "phase9",
  });

  if (phase9Result.error) {
    logProgressNotesWarning(
      "Primary progress notes query failed.",
      phase9Result.error,
    );

    if (!isMissingProgressNotesPhaseColumnsError(phase9Result.error)) {
      return [];
    }

    const legacyResult = await queryProgressNotesRows({
      organisationId,
      filters,
      mode: "legacy",
    });

    if (legacyResult.error) {
      logProgressNotesWarning(
        "Legacy progress notes fallback query failed.",
        legacyResult.error,
      );
      return [];
    }

    queryMode = "legacy";
    rows = (legacyResult.data ?? []) as unknown as LegacyProgressNotesTableRow[];
  } else {
    rows = (phase9Result.data ?? []) as unknown as ProgressNotesTableRow[];
  }

  if (rows.length === 0) {
    return [];
  }

  const [participantsResult, workersResult] = await Promise.allSettled([
    listParticipants(),
    listWorkers(),
  ]);
  const participants =
    participantsResult.status === "fulfilled" ? participantsResult.value : [];
  const workers = workersResult.status === "fulfilled" ? workersResult.value : [];

  if (participantsResult.status === "rejected") {
    logProgressNotesWarning(
      "Participant lookup for progress notes failed. Notes will still render with fallback participant names.",
      participantsResult.reason,
    );
  }

  if (workersResult.status === "rejected") {
    logProgressNotesWarning(
      "Worker lookup for progress notes failed. Notes will still render with fallback worker values.",
      workersResult.reason,
    );
  }

  const participantById = new Map(participants.map((participant) => [participant.id, participant]));
  const workerById = new Map(workers.map((worker) => [worker.id, worker]));

  return rows.map((row) => {
    const participant = participantById.get(row.participant_id);
    const worker = row.worker_id ? workerById.get(row.worker_id) : null;
    const phase9Row = queryMode === "phase9" ? (row as ProgressNotesTableRow) : null;
    const rawInput = phase9Row?.raw_input?.trim() || row.body;
    const aiDraft = phase9Row?.ai_draft?.trim() || row.body;
    const finalNote = phase9Row?.final_note?.trim() || row.body;
    const goalsAddressed = phase9Row
      ? normaliseGoalsAddressed(phase9Row.goals_addressed)
      : [];
    const approvedAt = phase9Row?.approved_at ?? null;

    return {
      id: row.id,
      participantId: row.participant_id,
      participantName: participant
        ? formatParticipantName(participant)
        : "Unknown participant",
      workerId: row.worker_id,
      workerName: worker ? `${worker.firstName} ${worker.lastName}` : null,
      workerRole: worker ? formatWorkerRole(worker.role) : null,
      title: row.title?.trim() || "Support Note",
      noteType: getNoteTypeValueFromLabel(row.title),
      body: row.body,
      rawInput,
      aiDraft,
      finalNote,
      goalsAddressed,
      approvedAt,
      createdAt: row.created_at,
      noteDate: row.note_date,
    } satisfies ProgressNoteListItem;
  });
}

export async function listProgressNoteSummaries() {
  const organisationId = await getWorkspaceOrganisationId();

  if (!organisationId) {
    return [];
  }

  const phase9Result = await queryProgressNoteSummaryRows({
    organisationId,
    mode: "phase9",
  });

  if (!phase9Result.error) {
    return ((phase9Result.data ?? []) as unknown as ProgressNotesSummaryRow[]).map((row) => ({
      id: row.id,
      participantId: row.participant_id,
      approvedAt: row.approved_at,
      createdAt: row.created_at,
    })) satisfies ProgressNoteSummary[];
  }

  logProgressNotesWarning(
    "Primary progress note summary query failed.",
    phase9Result.error,
  );

  if (!isMissingProgressNotesPhaseColumnsError(phase9Result.error)) {
    return [];
  }

  const legacyResult = await queryProgressNoteSummaryRows({
    organisationId,
    mode: "legacy",
  });

  if (legacyResult.error) {
    logProgressNotesWarning(
      "Legacy progress note summary fallback query failed.",
      legacyResult.error,
    );
    return [];
  }

  return ((legacyResult.data ?? []) as unknown as LegacyProgressNotesSummaryRow[]).map((row) => ({
    id: row.id,
    participantId: row.participant_id,
    approvedAt: null,
    createdAt: row.created_at,
  })) satisfies ProgressNoteSummary[];
}

function deriveGoalsAddressed(goals: string[], texts: string[]) {
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

function normaliseGoalsAddressed(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .flatMap((goal) => (typeof goal === "string" ? [goal.trim()] : []))
    .filter(Boolean);
}

function normaliseSearchQuery(value: string | undefined) {
  return value?.trim().replaceAll(",", " ") || "";
}

async function queryProgressNotesRows(input: {
  organisationId: string;
  filters: ListProgressNotesFilters;
  mode: ProgressNotesQueryMode;
}) {
  const supabase = createAdminClient();
  const select =
    input.mode === "phase9"
      ? "id, participant_id, worker_id, title, body, raw_input, ai_draft, final_note, goals_addressed, approved_at, created_at, note_date"
      : "id, participant_id, worker_id, title, body, created_at, note_date";
  const searchColumns =
    input.mode === "phase9"
      ? ["title", "final_note", "raw_input", "body"]
      : ["title", "body"];

  let query = supabase
    .from("progress_notes")
    .select(select)
    .eq("organisation_id", input.organisationId);

  if (input.mode === "phase9") {
    query = query
      .order("approved_at", { ascending: false, nullsFirst: false })
      .order("created_at", { ascending: false });
  } else {
    query = query.order("created_at", { ascending: false });
  }

  if (input.filters.participantId?.trim()) {
    query = query.eq("participant_id", input.filters.participantId.trim());
  }

  if (input.filters.workerId?.trim()) {
    query = query.eq("worker_id", input.filters.workerId.trim());
  }

  if (input.filters.noteType) {
    query = query.eq("title", getNoteTypeLabel(input.filters.noteType));
  }

  const searchQuery = normaliseSearchQuery(input.filters.query);

  if (searchQuery) {
    query = query.or(
      searchColumns
        .map((column) => `${column}.ilike.%${searchQuery}%`)
        .join(","),
    );
  }

  return await query;
}

async function queryProgressNoteSummaryRows(input: {
  organisationId: string;
  mode: ProgressNotesQueryMode;
}) {
  const supabase = createAdminClient();
  let query = supabase
    .from("progress_notes")
    .select(
      input.mode === "phase9"
        ? "id, participant_id, approved_at, created_at"
        : "id, participant_id, created_at",
    )
    .eq("organisation_id", input.organisationId);

  if (input.mode === "phase9") {
    query = query
      .order("approved_at", { ascending: false, nullsFirst: false })
      .order("created_at", { ascending: false });
  } else {
    query = query.order("created_at", { ascending: false });
  }

  return await query;
}

function isMissingProgressNotesPhaseColumnsError(error: unknown) {
  const errorText = formatProgressNotesError(error).toLowerCase();

  return [
    "approved_at",
    "raw_input",
    "ai_draft",
    "final_note",
    "goals_addressed",
  ].some((column) => errorText.includes(column));
}

function logProgressNotesWarning(context: string, error: unknown) {
  void context;
  void error;
}

function formatProgressNotesErrorDetails(
  error: ProgressNotesLikeError | Error,
  options?: { includeMessage?: boolean },
) {
  const message = getErrorFieldValue(error, "message");
  const code = getErrorFieldValue(error, "code");
  const details = getErrorFieldValue(error, "details");
  const hint = getErrorFieldValue(error, "hint");
  const values = [
    code ? `code=${code}` : "",
    options?.includeMessage === false ? "" : message ? `message=${message}` : "",
    details ? `details=${details}` : "",
    hint ? `hint=${hint}` : "",
  ].filter(Boolean);

  return values.join(" | ");
}

function getErrorFieldValue(
  error: ProgressNotesLikeError | Error,
  field: "code" | "message" | "details" | "hint",
) {
  const objectValue = error as ProgressNotesLikeError;
  const value = field in objectValue ? objectValue[field] : undefined;
  return typeof value === "string" && value.trim() ? value.trim() : "";
}
