const SUPABASE_URL_KEY = "NEXT_PUBLIC_SUPABASE_URL";
const SUPABASE_PUBLISHABLE_KEY = "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY";
const SUPABASE_SECRET_KEY = "SUPABASE_SECRET_KEY";

function requireEnv(key: typeof SUPABASE_URL_KEY | typeof SUPABASE_PUBLISHABLE_KEY | typeof SUPABASE_SECRET_KEY) {
  const value = process.env[key]?.trim();

  if (!value) {
    throw new Error(`Missing required Supabase environment variable: ${key}`);
  }

  return value;
}

export function getSupabaseBrowserEnv() {
  return {
    url: getSupabaseUrl(),
    publishableKey: requireEnv(SUPABASE_PUBLISHABLE_KEY),
  };
}

export function getSupabaseAdminEnv() {
  return {
    url: getSupabaseUrl(),
    secretKey: requireEnv(SUPABASE_SECRET_KEY),
  };
}

function getSupabaseUrl() {
  const value = requireEnv(SUPABASE_URL_KEY);
  let url: URL;

  try {
    url = new URL(value);
  } catch {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL must be a valid URL such as https://<project_ref>.supabase.co.",
    );
  }

  if (isHostedSupabaseUrl(url)) {
    return `https://${url.hostname}`;
  }

  if (isLocalSupabaseUrl(url)) {
    return `${url.protocol}//${url.host}`;
  }

  throw new Error(
    "NEXT_PUBLIC_SUPABASE_URL must use either https://<project_ref>.supabase.co or a local Supabase URL like http://127.0.0.1:54321.",
  );
}

function isHostedSupabaseUrl(url: URL) {
  return url.protocol === "https:" && url.hostname.endsWith(".supabase.co") && url.pathname === "/";
}

function isLocalSupabaseUrl(url: URL) {
  return (
    (url.protocol === "http:" || url.protocol === "https:") &&
    (url.hostname === "127.0.0.1" || url.hostname === "localhost") &&
    url.pathname === "/"
  );
}
