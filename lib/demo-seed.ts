import { createAdminClient } from "@/lib/supabase/admin";
import { demoClaims, demoParticipants, demoProgressNotes, demoWorkers } from "@/lib/demo-data";
import { getWorkspaceOrganisationId } from "@/lib/workspace";

export async function ensureDemoWorkspaceSeeded() {
  const organisationId = await getWorkspaceOrganisationId({ createIfMissing: true });

  if (!organisationId) {
    throw new Error("Workspace organisation could not be resolved for demo seed.");
  }

  const supabase = createAdminClient();
  const [workerCount, participantCount, noteCount, claimCount] = await Promise.all([
    countRows(supabase, "workers", organisationId),
    countRows(supabase, "participants", organisationId),
    countRows(supabase, "progress_notes", organisationId),
    countRows(supabase, "claims", organisationId),
  ]);

  if (workerCount > 0 || participantCount > 0 || noteCount > 0 || claimCount > 0) {
    const shouldSeedWorkers = workerCount === 0 || noteCount === 0 || claimCount === 0;
    const shouldSeedParticipants = participantCount === 0 || noteCount === 0 || claimCount === 0;
    const shouldSeedNotes = noteCount === 0;
    const shouldSeedClaims = claimCount === 0;

    if (
      !shouldSeedWorkers &&
      !shouldSeedParticipants &&
      !shouldSeedNotes &&
      !shouldSeedClaims
    ) {
      return {
        organisationId,
        seeded: false,
      };
    }

    if (shouldSeedWorkers) {
      const workersToInsert = demoWorkers.map((worker) => ({
        ...worker,
        organisation_id: organisationId,
      }));
      const { error: workersError } = await supabase
        .from("workers")
        .upsert(workersToInsert, { onConflict: "id" });

      if (workersError) {
        throw workersError;
      }
    }

    if (shouldSeedParticipants) {
      const participantsToInsert = demoParticipants.map((participant) => ({
        ...participant,
        organisation_id: organisationId,
      }));
      const { error: participantsError } = await supabase
        .from("participants")
        .upsert(participantsToInsert, { onConflict: "id" });

      if (participantsError) {
        throw participantsError;
      }
    }

    if (shouldSeedNotes) {
      const notesToInsert = demoProgressNotes.map((note) => ({
        ...note,
        organisation_id: organisationId,
      }));
      const { error: notesError } = await supabase
        .from("progress_notes")
        .upsert(notesToInsert, { onConflict: "id" });

      if (notesError) {
        throw notesError;
      }
    }

    if (shouldSeedClaims) {
      await upsertDemoClaims(supabase, organisationId);
    }

    return {
      organisationId,
      seeded: true,
    };
  }

  const workersToInsert = demoWorkers.map((worker) => ({
    ...worker,
    organisation_id: organisationId,
  }));
  const participantsToInsert = demoParticipants.map((participant) => ({
    ...participant,
    organisation_id: organisationId,
  }));
  const notesToInsert = demoProgressNotes.map((note) => ({
    ...note,
    organisation_id: organisationId,
  }));
  const { error: workersError } = await supabase
    .from("workers")
    .upsert(workersToInsert, { onConflict: "id" });

  if (workersError) {
    throw workersError;
  }

  const { error: participantsError } = await supabase
    .from("participants")
    .upsert(participantsToInsert, { onConflict: "id" });

  if (participantsError) {
    throw participantsError;
  }

  const { error: notesError } = await supabase
    .from("progress_notes")
    .upsert(notesToInsert, { onConflict: "id" });

  if (notesError) {
    throw notesError;
  }

  await upsertDemoClaims(supabase, organisationId);

  return {
    organisationId,
    seeded: true,
  };
}

async function countRows(
  supabase: ReturnType<typeof createAdminClient>,
  table: "workers" | "participants" | "progress_notes" | "claims",
  organisationId: string,
) {
  const { count, error } = await supabase
    .from(table)
    .select("id", {
      count: "exact",
      head: true,
    })
    .eq("organisation_id", organisationId);

  if (error) {
    throw error;
  }

  return count ?? 0;
}

async function upsertDemoClaims(
  supabase: ReturnType<typeof createAdminClient>,
  organisationId: string,
) {
  const claimsToInsert = demoClaims.map((claim) => ({
    ...claim,
    organisation_id: organisationId,
  }));
  const { error: claimsError } = await supabase
    .from("claims")
    .upsert(claimsToInsert, { onConflict: "id" });

  if (!claimsError) {
    return;
  }

  if (!isLegacyClaimsSchemaError(claimsError)) {
    throw claimsError;
  }

  const legacyClaimsToInsert = demoClaims.map((claim) => ({
    id: claim.id,
    organisation_id: organisationId,
    participant_id: claim.participant_id,
    worker_id: claim.worker_id,
    reference: claim.reference,
    claim_date: claim.claim_date,
    amount: claim.amount,
    status: claim.status,
    created_at: claim.created_at,
  }));
  const { error: legacyClaimsError } = await supabase
    .from("claims")
    .upsert(legacyClaimsToInsert, { onConflict: "id" });

  if (legacyClaimsError) {
    throw legacyClaimsError;
  }
}

function isLegacyClaimsSchemaError(error: unknown) {
  const text =
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof error.message === "string"
      ? error.message.toLowerCase()
      : String(error).toLowerCase();

  return ["support_hours", "service_code", "notes"].some((column) => text.includes(column));
}
