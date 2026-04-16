import { createAdminClient } from "@/lib/supabase/admin";

const DEFAULT_ORGANISATION_SLUG = "ndis-ready-workspace";
const DEFAULT_ORGANISATION_NAME = "NDIS Ready Workspace";

export const workerRoleOptions = [
  { value: "support_worker", label: "Support Worker" },
  { value: "team_lead", label: "Team Lead" },
  { value: "coordinator", label: "Coordinator" },
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

  return workers.map((worker) => ({
    id: worker.id,
    firstName: worker.first_name,
    lastName: worker.last_name,
    email: worker.email,
    phone: worker.phone,
    role: worker.role,
    status: worker.status,
    createdAt: worker.created_at,
  })) satisfies WorkerListItem[];
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

async function getWorkspaceOrganisationId(options?: { createIfMissing?: boolean }) {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("organisations")
    .select("id")
    .eq("slug", DEFAULT_ORGANISATION_SLUG)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (data?.id) {
    return data.id;
  }

  if (!options?.createIfMissing) {
    return null;
  }

  const { data: inserted, error: insertError } = await supabase
    .from("organisations")
    .insert({
      name: DEFAULT_ORGANISATION_NAME,
      slug: DEFAULT_ORGANISATION_SLUG,
    })
    .select("id")
    .single();

  if (!insertError) {
    return inserted.id;
  }

  if (insertError.code !== "23505") {
    throw insertError;
  }

  const { data: existing, error: existingError } = await supabase
    .from("organisations")
    .select("id")
    .eq("slug", DEFAULT_ORGANISATION_SLUG)
    .single();

  if (existingError) {
    throw existingError;
  }

  return existing.id;
}

function formatLabel(value: string) {
  return value
    .split("_")
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(" ");
}
