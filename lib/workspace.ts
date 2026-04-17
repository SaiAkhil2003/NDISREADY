import { createAdminClient } from "@/lib/supabase/admin";

export const DEFAULT_ORGANISATION_SLUG = "ndis-ready-workspace";
export const DEFAULT_ORGANISATION_NAME = "NDISReady.ai Demo Workspace";

export async function getWorkspaceOrganisationId(options?: {
  createIfMissing?: boolean;
}) {
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
