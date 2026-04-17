import { lookup } from "node:dns/promises";
import { createClient } from "@supabase/supabase-js";

const url = getSupabaseUrl();
const publishableKey = requireEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY");
const secretKey = requireEnv("SUPABASE_SECRET_KEY");

await verifyHostLookup(url);

if (!publishableKey.startsWith("sb_publishable_")) {
  console.error(
    "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY must be a Supabase publishable key that starts with sb_publishable_.",
  );
  process.exit(1);
}

if (!secretKey.startsWith("sb_secret_")) {
  console.error(
    "SUPABASE_SECRET_KEY must be a Supabase secret key that starts with sb_secret_.",
  );
  process.exit(1);
}

const supabase = createClient(url, secretKey, {
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
  console.error(`Supabase verification failed for ${url}:`, error.message);
  process.exit(1);
}

console.log(`Supabase connection verified for ${url}.`);
console.log(JSON.stringify(data, null, 2));

function requireEnv(key) {
  const value = process.env[key]?.trim();

  if (!value) {
    console.error(`Missing Supabase connection env var: ${key}`);
    process.exit(1);
  }

  return value;
}

function getSupabaseUrl() {
  const value = requireEnv("NEXT_PUBLIC_SUPABASE_URL");
  let url;

  try {
    url = new URL(value);
  } catch {
    console.error(
      "NEXT_PUBLIC_SUPABASE_URL must be a valid URL such as https://<project_ref>.supabase.co.",
    );
    process.exit(1);
  }

  if (isHostedSupabaseUrl(url)) {
    return `${url.protocol}//${url.host}`;
  }

  console.error(
    "NEXT_PUBLIC_SUPABASE_URL must use the cloud Supabase format https://<project_ref>.supabase.co.",
  );
  process.exit(1);
}

function isHostedSupabaseUrl(url) {
  return url.protocol === "https:" && url.hostname.endsWith(".supabase.co") && url.pathname === "/";
}

async function verifyHostLookup(url) {
  const hostname = new URL(url).hostname;

  try {
    await lookup(hostname);
  } catch (error) {
    console.error(`Supabase host lookup failed for ${hostname}:`, error.code ?? error.message);
    process.exit(1);
  }
}
