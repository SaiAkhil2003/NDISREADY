import { createAdminClient } from "@/lib/supabase/admin";
import { getWorkspaceOrganisationId } from "@/lib/workspace";
import { resolveDisplayName } from "@/lib/display-names";

export const participantStatusOptions = [
  { value: "active", label: "Active" },
  { value: "intake", label: "Intake" },
  { value: "inactive", label: "Inactive" },
  { value: "on-hold", label: "On Hold" },
] as const;

export type ParticipantStatus = (typeof participantStatusOptions)[number]["value"];

export type ParticipantGoal = {
  title: string;
};

export type ParticipantListItem = {
  id: string;
  firstName: string;
  lastName: string;
  preferredName: string | null;
  dateOfBirth: string | null;
  ndisNumber: string | null;
  status: string;
  goals: ParticipantGoal[];
  createdAt: string;
};

export type ParticipantDetail = ParticipantListItem;

type CreateParticipantInput = {
  firstName: string;
  lastName: string;
  preferredName?: string;
  dateOfBirth?: string;
  ndisNumber?: string;
  status: ParticipantStatus;
  goals: ParticipantGoal[];
};

type ParticipantsTableRow = {
  id: string;
  first_name: string;
  last_name: string;
  preferred_name: string | null;
  date_of_birth: string | null;
  ndis_number: string | null;
  status: string;
  goals: unknown;
  created_at: string;
};

export function isParticipantStatus(value: string): value is ParticipantStatus {
  return participantStatusOptions.some((option) => option.value === value);
}

export function formatParticipantStatus(value: string) {
  return participantStatusOptions.find((option) => option.value === value)?.label ?? formatLabel(value);
}

export function parseParticipantGoals(value: string) {
  return value
    .split("\n")
    .map((goal) => goal.trim())
    .filter(Boolean)
    .map((goal) => ({ title: goal }));
}

export async function listParticipants() {
  const organisationId = await getWorkspaceOrganisationId();

  if (!organisationId) {
    return [];
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("participants")
    .select(
      "id, first_name, last_name, preferred_name, date_of_birth, ndis_number, status, goals, created_at",
    )
    .eq("organisation_id", organisationId)
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return ((data ?? []) as ParticipantsTableRow[]).map(mapParticipantRow);
}

export async function getParticipantById(participantId: string) {
  const organisationId = await getWorkspaceOrganisationId();

  if (!organisationId) {
    return null;
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("participants")
    .select(
      "id, first_name, last_name, preferred_name, date_of_birth, ndis_number, status, goals, created_at",
    )
    .eq("organisation_id", organisationId)
    .eq("id", participantId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data ? mapParticipantRow(data as ParticipantsTableRow) : null;
}

export async function createParticipant(input: CreateParticipantInput) {
  const organisationId = await getWorkspaceOrganisationId({ createIfMissing: true });

  if (!organisationId) {
    throw new Error("Workspace organisation could not be resolved.");
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("participants")
    .insert({
      organisation_id: organisationId,
      first_name: input.firstName,
      last_name: input.lastName,
      preferred_name: input.preferredName?.trim() || null,
      date_of_birth: input.dateOfBirth?.trim() || null,
      ndis_number: input.ndisNumber?.trim() || null,
      status: input.status,
      goals: input.goals,
    })
    .select(
      "id, first_name, last_name, preferred_name, date_of_birth, ndis_number, status, goals, created_at",
    )
    .single();

  if (error) {
    throw error;
  }

  return mapParticipantRow(data as ParticipantsTableRow);
}

function mapParticipantRow(participant: ParticipantsTableRow) {
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
    goals: normaliseGoals(participant.goals),
    createdAt: participant.created_at,
  } satisfies ParticipantListItem;
}

function normaliseGoals(value: unknown): ParticipantGoal[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.flatMap((goal) => {
    if (typeof goal === "string") {
      const title = goal.trim();
      return title ? [{ title }] : [];
    }

    if (typeof goal === "object" && goal !== null && "title" in goal) {
      const title = typeof goal.title === "string" ? goal.title.trim() : "";
      return title ? [{ title }] : [];
    }

    return [];
  });
}

function formatLabel(value: string) {
  return value
    .split(/[_-]/)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(" ");
}
