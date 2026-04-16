const requiredPublicEnv = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
] as const;

type PublicEnvKey = (typeof requiredPublicEnv)[number];

function requireEnv(
  key: PublicEnvKey | "SUPABASE_SECRET_KEY" | "SUPABASE_SERVICE_ROLE_KEY",
) {
  const value = process.env[key];

  if (!value) {
    throw new Error(`Missing required Supabase environment variable: ${key}`);
  }

  return value;
}

export function getSupabasePublicEnv() {
  return {
    url: requireEnv("NEXT_PUBLIC_SUPABASE_URL"),
    publishableKey: requireEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"),
  };
}

export function getSupabaseServiceRoleKey() {
  return process.env.SUPABASE_SECRET_KEY ?? requireEnv("SUPABASE_SERVICE_ROLE_KEY");
}
