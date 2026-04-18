import { createAdminClient } from "@/lib/supabase/admin";
import { getWorkspaceOrganisationId } from "@/lib/workspace";
import { resolveDisplayName } from "@/lib/display-names";

export const workerRoleOptions = [
  { value: "support_worker", label: "Support Worker" },
  { value: "nurse", label: "Nurse" },
  { value: "coordinator", label: "Coordinator" },
  { value: "team_lead", label: "Team Lead" },
  { value: "admin", label: "Admin" },
] as const;

export const workerStatusOptions = [
  { value: "active", label: "Active" },
  { value: "onboarding", label: "Onboarding" },
  { value: "inactive", label: "Inactive" },
] as const;

export type WorkerRole = (typeof workerRoleOptions)[number]["value"];
export type WorkerStatus = (typeof workerStatusOptions)[number]["value"];

export type WorkerListItem = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  role: string;
  status: string;
  createdAt: string;
};

export type WorkerDetail = WorkerListItem;

type CreateWorkerInput = {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role: WorkerRole;
  status: WorkerStatus;
};

type WorkersTableRow = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  role: string;
  status: string;
  created_at: string;
};

export function isWorkerRole(value: string): value is WorkerRole {
  return workerRoleOptions.some((option) => option.value === value);
}

export function isWorkerStatus(value: string): value is WorkerStatus {
  return workerStatusOptions.some((option) => option.value === value);
}

export function formatWorkerRole(value: string) {
  return workerRoleOptions.find((option) => option.value === value)?.label ?? formatLabel(value);
}

export function formatWorkerStatus(value: string) {
  return (
    workerStatusOptions.find((option) => option.value === value)?.label ?? formatLabel(value)
  );
}

export async function listWorkers() {
  const organisationId = await getWorkspaceOrganisationId();

  if (!organisationId) {
    return [];
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("workers")
    .select("id, first_name, last_name, email, phone, role, status, created_at")
    .eq("organisation_id", organisationId)
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  const workers = (data ?? []) as WorkersTableRow[];

  return workers.map(mapWorkerRow) satisfies WorkerListItem[];
}

export async function getWorkerById(workerId: string) {
  const organisationId = await getWorkspaceOrganisationId();

  if (!organisationId) {
    return null;
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("workers")
    .select("id, first_name, last_name, email, phone, role, status, created_at")
    .eq("organisation_id", organisationId)
    .eq("id", workerId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data ? mapWorkerRow(data as WorkersTableRow) : null;
}

export async function createWorker(input: CreateWorkerInput) {
  const organisationId = await getWorkspaceOrganisationId({ createIfMissing: true });

  if (!organisationId) {
    throw new Error("Workspace organisation could not be resolved.");
  }

  const supabase = createAdminClient();
  const { error } = await supabase.from("workers").insert({
    organisation_id: organisationId,
    first_name: input.firstName,
    last_name: input.lastName,
    email: input.email,
    phone: input.phone?.trim() || null,
    role: input.role,
    status: input.status,
  });

  if (error) {
    throw error;
  }
}

function mapWorkerRow(worker: WorkersTableRow) {
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
}

function formatLabel(value: string) {
  return value
    .split("_")
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(" ");
}
