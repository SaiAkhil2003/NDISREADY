import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey =
  process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceRoleKey) {
  console.error(
    "Missing Supabase connection env vars. Expected NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SECRET_KEY.",
  );
  process.exit(1);
}

const supabase = createClient(url, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

const expectedTables = [
  "organisations",
  "workers",
  "participants",
  "progress_notes",
  "claims",
  "participant_reports",
];

const { data, error } = await supabase.rpc("phase3_table_check", {
  expected_tables: expectedTables,
});

if (error) {
  console.error("Supabase verification failed:", error.message);
  process.exit(1);
}

console.log("Supabase connection verified.");
console.log(JSON.stringify(data, null, 2));
