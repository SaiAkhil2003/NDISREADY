import { createClient } from "@supabase/supabase-js";

import { getSupabaseAdminEnv } from "@/lib/supabase/env";

export function createAdminClient() {
  const { url, secretKey } = getSupabaseAdminEnv();

  return createClient(url, secretKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
