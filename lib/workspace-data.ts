import {
  demoClaims,
  demoParticipants,
  demoProgressNotes,
  demoWorkers,
  getDemoParticipantById,
  getDemoWorkerById,
} from "@/lib/demo-data";
import { ensureDemoWorkspaceSeeded } from "@/lib/demo-seed";
import { formatClaimStatus, listClaims, type ClaimListItem } from "@/lib/claims";
import { isNoteType, noteTypeOptions, getNoteTypeLabel } from "@/lib/notes";
import {
  type ParticipantDetail,
  type ParticipantListItem,
  formatParticipantStatus,
  getParticipantById,
  listParticipants,
} from "@/lib/participants";
import {
  listProgressNotes,
  listProgressNoteSummaries,
  type ListProgressNotesFilters,
  type ProgressNoteListItem,
  type ProgressNoteSummary,
} from "@/lib/progress-notes";
import {
  formatDisplayName,
  formatDisplayParticipantName,
  resolveDisplayName,
} from "@/lib/display-names";
import { getSupabaseAdminEnvStatus } from "@/lib/supabase/env";
import {
  type WorkerDetail,
  type WorkerListItem,
  formatWorkerRole,
  listWorkers,
} from "@/lib/workers";

export type WorkspaceLoadNotice = {
  title: string;
  message: string;
};

export type WorkspaceLoadMode = "live" | "demo";

export type WorkspaceLoadResult<T> = {
  data: T;
  mode: WorkspaceLoadMode;
  notice: WorkspaceLoadNotice | null;
  canPersist: boolean;
};

export type NoteSelectOption = {
  value: string;
  label: string;
  detail?: string;
  goals?: string[];
};

export type ClaimSelectOption = {
  value: string;
  label: string;
  detail?: string;
};

export async function loadWorkersDirectory() {
  return await withWorkspaceData("workers", () => listWorkers(), getDemoWorkers);
}

export async function loadParticipantsDirectory() {
  return await withWorkspaceData("participants", () => listParticipants(), getDemoParticipants);
}

export async function loadDashboardSnapshot() {
  return await withWorkspaceData(
    "dashboard",
    async () => {
      const [workers, participants, noteSummaries, claims] = await Promise.all([
        listWorkers(),
        listParticipants(),
        listProgressNoteSummaries(),
        listClaims(),
      ]);

      return {
        workers,
        participants,
        noteSummaries,
        claims,
      };
    },
    () => ({
      workers: getDemoWorkers(),
      participants: getDemoParticipants(),
      noteSummaries: getDemoProgressNoteSummaries(),
      claims: getDemoClaims(),
    }),
  );
}

export async function loadNotesFeed(filters: ListProgressNotesFilters) {
  return await withWorkspaceData(
    "notes",
    async () => {
      const [notes, participants, workers] = await Promise.all([
        listProgressNotes(filters),
        listParticipants(),
        listWorkers(),
      ]);

      return {
        notes,
        participantOptions: mapNoteParticipantOptions(participants),
        workerOptions: mapNoteWorkerOptions(workers),
      };
    },
    () => {
      const participants = getDemoParticipants();
      const workers = getDemoWorkers();

      return {
        notes: filterDemoProgressNotes(filters),
        participantOptions: mapNoteParticipantOptions(participants),
        workerOptions: mapNoteWorkerOptions(workers),
      };
    },
  );
}

export async function loadNoteComposerContext() {
  return await withWorkspaceData(
    "note-composer",
    async () => {
      const [participants, workers] = await Promise.all([listParticipants(), listWorkers()]);

      return {
        participantOptions: mapNoteParticipantOptions(participants),
        workerOptions: mapNoteWorkerOptions(workers),
      };
    },
    () => ({
      participantOptions: mapNoteParticipantOptions(getDemoParticipants()),
      workerOptions: mapNoteWorkerOptions(getDemoWorkers()),
    }),
  );
}

export async function loadClaimsWorkspace() {
  return await withWorkspaceData(
    "claims",
    async () => {
      const [participants, workers, claims] = await Promise.all([
        listParticipants(),
        listWorkers(),
        listClaims(),
      ]);

      return {
        participantOptions: mapClaimParticipantOptions(participants),
        workerOptions: mapClaimWorkerOptions(workers),
        claims,
      };
    },
    () => ({
      participantOptions: mapClaimParticipantOptions(getDemoParticipants()),
      workerOptions: mapClaimWorkerOptions(getDemoWorkers()),
      claims: getDemoClaims(),
    }),
  );
}

export async function resolveParticipantDetail(participantId: string) {
  const envStatus = getSupabaseAdminEnvStatus();

  if (!envStatus.ready) {
    return mapDemoParticipantDetail(participantId);
  }

  try {
    await ensureDemoWorkspaceSeeded();
    return (await getParticipantById(participantId)) ?? mapDemoParticipantDetail(participantId);
  } catch (error) {
    logWorkspaceFallback("participant-detail", error);
    return mapDemoParticipantDetail(participantId);
  }
}

export async function resolveParticipantForNotes(participantId: string) {
  const envStatus = getSupabaseAdminEnvStatus();

  if (!envStatus.ready) {
    return mapDemoParticipantDetail(participantId);
  }

  try {
    await ensureDemoWorkspaceSeeded();
    return (await getParticipantById(participantId)) ?? mapDemoParticipantDetail(participantId);
  } catch (error) {
    logWorkspaceFallback("notes-participant", error);
    return mapDemoParticipantDetail(participantId);
  }
}

export async function resolveWorkerForNotes(workerId: string | null | undefined) {
  if (!workerId?.trim()) {
    return null;
  }

  const envStatus = getSupabaseAdminEnvStatus();

  if (!envStatus.ready) {
    return mapDemoWorkerDetail(workerId);
  }

  try {
    await ensureDemoWorkspaceSeeded();
    const { getWorkerById } = await import("@/lib/workers");
    return (await getWorkerById(workerId)) ?? mapDemoWorkerDetail(workerId);
  } catch (error) {
    logWorkspaceFallback("notes-worker", error);
    return mapDemoWorkerDetail(workerId);
  }
}

function getDemoWorkers() {
  return demoWorkers.map((worker) => {
    const displayName = resolveDisplayName({
      firstName: worker.first_name,
      lastName: worker.last_name,
    });

    return {
      id: worker.id,
      firstName: displayName.firstName,
      lastName: displayName.lastName,
      email: worker.email,
      phone: worker.phone,
      role: worker.role,
      status: worker.status,
      createdAt: worker.created_at,
    } satisfies WorkerListItem;
  });
}

function getDemoParticipants() {
  return demoParticipants.map((participant) => {
    const displayName = resolveDisplayName({
      firstName: participant.first_name,
      lastName: participant.last_name,
      preferredName: participant.preferred_name,
    });

    return {
      id: participant.id,
      firstName: displayName.firstName,
      lastName: displayName.lastName,
      preferredName: displayName.preferredName,
      dateOfBirth: participant.date_of_birth,
      ndisNumber: participant.ndis_number,
      status: participant.status,
      goals: participant.goals,
      createdAt: participant.created_at,
    } satisfies ParticipantListItem;
  });
}

function getDemoProgressNotes() {
  const participants = new Map(getDemoParticipants().map((participant) => [participant.id, participant]));
  const workers = new Map(getDemoWorkers().map((worker) => [worker.id, worker]));

  return demoProgressNotes.map((note) => {
    const participant = participants.get(note.participant_id);
    const worker = note.worker_id ? workers.get(note.worker_id) : null;

    return {
      id: note.id,
      participantId: note.participant_id,
      participantName: participant
        ? formatParticipantDisplayName(participant)
        : "Unknown participant",
      workerId: note.worker_id,
      workerName: worker ? formatDisplayName(worker) : null,
      workerRole: worker ? formatWorkerRole(worker.role) : null,
      title: note.title,
      noteType: getDemoNoteType(note.title),
      body: note.body,
      rawInput: note.raw_input,
      aiDraft: note.ai_draft,
      finalNote: note.final_note,
      goalsAddressed: note.goals_addressed,
      approvedAt: note.approved_at,
      createdAt: note.created_at,
      noteDate: note.note_date,
    } satisfies ProgressNoteListItem;
  });
}

function getDemoProgressNoteSummaries() {
  return demoProgressNotes.map((note) => ({
    id: note.id,
    participantId: note.participant_id,
    approvedAt: note.approved_at,
    createdAt: note.created_at,
  })) satisfies ProgressNoteSummary[];
}

function getDemoClaims() {
  const participants = new Map(getDemoParticipants().map((participant) => [participant.id, participant]));
  const workers = new Map(getDemoWorkers().map((worker) => [worker.id, worker]));

  return demoClaims.map((claim) => {
    const participant = participants.get(claim.participant_id);
    const worker = claim.worker_id ? workers.get(claim.worker_id) : null;

    return {
      id: claim.id,
      participantId: claim.participant_id,
      participantName: participant
        ? formatParticipantDisplayName(participant)
        : "Unknown participant",
      workerId: claim.worker_id,
      workerName: worker ? formatDisplayName(worker) : null,
      workerRole: worker ? formatWorkerRole(worker.role) : null,
      reference: claim.reference,
      claimDate: claim.claim_date,
      amount: claim.amount,
      status: claim.status,
      supportHours: claim.support_hours,
      serviceCode: claim.service_code,
      notes: claim.notes,
      createdAt: claim.created_at,
    } satisfies ClaimListItem;
  });
}

function filterDemoProgressNotes(filters: ListProgressNotesFilters) {
  const selectedTitle = filters.noteType ? getNoteTypeLabel(filters.noteType) : null;
  const searchQuery = filters.query?.trim().toLowerCase() ?? "";

  return getDemoProgressNotes().filter((note) => {
    if (filters.participantId?.trim() && note.participantId !== filters.participantId.trim()) {
      return false;
    }

    if (filters.workerId?.trim() && note.workerId !== filters.workerId.trim()) {
      return false;
    }

    if (selectedTitle && note.title !== selectedTitle) {
      return false;
    }

    if (!searchQuery) {
      return true;
    }

    return [note.title, note.rawInput, note.aiDraft, note.finalNote]
      .join(" ")
      .toLowerCase()
      .includes(searchQuery);
  });
}

function mapNoteParticipantOptions(participants: ParticipantListItem[]) {
  return participants.map((participant) => ({
    value: participant.id,
    label: formatParticipantDisplayName(participant),
    detail: formatParticipantStatus(participant.status),
    goals: participant.goals.map((goal) => goal.title),
  })) satisfies NoteSelectOption[];
}

function mapNoteWorkerOptions(workers: WorkerListItem[]) {
  return workers.map((worker) => ({
    value: worker.id,
    label: formatDisplayName(worker),
    detail: formatWorkerRole(worker.role),
  })) satisfies NoteSelectOption[];
}

function mapClaimParticipantOptions(participants: ParticipantListItem[]) {
  return participants.map((participant) => ({
    value: participant.id,
    label: formatParticipantDisplayName(participant),
    detail: formatParticipantStatus(participant.status),
  })) satisfies ClaimSelectOption[];
}

function mapClaimWorkerOptions(workers: WorkerListItem[]) {
  return workers.map((worker) => ({
    value: worker.id,
    label: formatDisplayName(worker),
    detail: formatWorkerRole(worker.role),
  })) satisfies ClaimSelectOption[];
}

function formatParticipantDisplayName(input: {
  firstName: string;
  lastName: string;
  preferredName?: string | null;
}) {
  return formatDisplayParticipantName(input);
}

function mapDemoParticipantDetail(participantId: string) {
  const participant = getDemoParticipantById(participantId);

  if (!participant) {
    return null;
  }

  const displayName = resolveDisplayName({
    firstName: participant.first_name,
    lastName: participant.last_name,
    preferredName: participant.preferred_name,
  });

  return {
    id: participant.id,
    firstName: displayName.firstName,
    lastName: displayName.lastName,
    preferredName: displayName.preferredName,
    dateOfBirth: participant.date_of_birth,
    ndisNumber: participant.ndis_number,
    status: participant.status,
    goals: participant.goals,
    createdAt: participant.created_at,
  } satisfies ParticipantDetail;
}

function mapDemoWorkerDetail(workerId: string) {
  const worker = getDemoWorkerById(workerId);

  if (!worker) {
    return null;
  }

  const displayName = resolveDisplayName({
    firstName: worker.first_name,
    lastName: worker.last_name,
  });

  return {
    id: worker.id,
    firstName: displayName.firstName,
    lastName: displayName.lastName,
    email: worker.email,
    phone: worker.phone,
    role: worker.role,
    status: worker.status,
    createdAt: worker.created_at,
  } satisfies WorkerDetail;
}

function getDemoNoteType(title: string) {
  const option = noteTypeOptions.find((item) => item.label.toLowerCase() === title.trim().toLowerCase());
  return option?.value ?? null;
}

async function withWorkspaceData<T>(
  scope: string,
  loadLive: () => Promise<T>,
  loadDemo: () => T,
): Promise<WorkspaceLoadResult<T>> {
  const envStatus = getSupabaseAdminEnvStatus();

  if (!envStatus.ready) {
    return {
      data: loadDemo(),
      mode: "demo",
      notice: {
        title: "Connection issue",
        message:
          "Workspace records are temporarily limited while the connection is restored.",
      },
      canPersist: false,
    };
  }

  try {
    await ensureDemoWorkspaceSeeded();

    return {
      data: await loadLive(),
      mode: "live",
      notice: null,
      canPersist: true,
    };
  } catch (error) {
    logWorkspaceFallback(scope, error);

    return {
      data: loadDemo(),
      mode: "demo",
      notice: {
        title: "Connection issue",
        message:
          "Workspace records are temporarily limited while the connection is restored.",
      },
      canPersist: false,
    };
  }
}

function logWorkspaceFallback(scope: string, error: unknown) {
  const message = formatWorkspaceError(error);
  console.warn(`[workspace:${scope}] ${message}`);
}

function formatWorkspaceError(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === "object" && error !== null) {
    const code = readErrorField(error, "code");
    const message = readErrorField(error, "message");
    const details = readErrorField(error, "details");
    const hint = readErrorField(error, "hint");

    return [code ? `code=${code}` : "", message, details, hint].filter(Boolean).join(" | ");
  }

  return String(error);
}

function readErrorField(error: object, key: "code" | "message" | "details" | "hint") {
  const value = key in error ? (error as Record<string, unknown>)[key] : undefined;
  return typeof value === "string" && value.trim() ? value.trim() : "";
}
