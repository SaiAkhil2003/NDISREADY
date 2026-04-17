export const SUPABASE_URL_KEY = "NEXT_PUBLIC_SUPABASE_URL";
export const SUPABASE_PUBLISHABLE_KEY = "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY";
export const SUPABASE_SECRET_KEY = "SUPABASE_SECRET_KEY";

type SupabaseEnvScope = "browser" | "admin";

export type SupabaseEnvStatus = {
  ready: boolean;
  issue?: {
    code:
      | "missing_url"
      | "missing_publishable_key"
      | "missing_secret_key"
      | "invalid_url"
      | "invalid_url_host"
      | "invalid_publishable_key"
      | "invalid_secret_key";
    message: string;
  };
};

export function getSupabaseBrowserEnv() {
  const status = getSupabaseBrowserEnvStatus();

  if (!status.ready) {
    throw new Error(status.issue?.message ?? "Supabase browser environment is not configured.");
  }

  return {
    url: getSupabaseUrl(),
    publishableKey: requireEnv(SUPABASE_PUBLISHABLE_KEY),
  };
}

export function getSupabaseAdminEnv() {
  const status = getSupabaseAdminEnvStatus();

  if (!status.ready) {
    throw new Error(status.issue?.message ?? "Supabase admin environment is not configured.");
  }

  return {
    url: getSupabaseUrl(),
    secretKey: requireEnv(SUPABASE_SECRET_KEY),
  };
}

export function getSupabaseBrowserEnvStatus() {
  return getSupabaseEnvStatus("browser");
}

export function getSupabaseAdminEnvStatus() {
  return getSupabaseEnvStatus("admin");
}

function getSupabaseEnvStatus(scope: SupabaseEnvScope): SupabaseEnvStatus {
  const urlValue = process.env[SUPABASE_URL_KEY]?.trim();

  if (!urlValue) {
    return {
      ready: false,
      issue: {
        code: "missing_url",
        message: `Missing required Supabase environment variable: ${SUPABASE_URL_KEY}.`,
      },
    };
  }

  const urlStatus = validateSupabaseUrl(urlValue);

  if (!urlStatus.ready) {
    return urlStatus;
  }

  const publishableKey = process.env[SUPABASE_PUBLISHABLE_KEY]?.trim();

  if (!publishableKey) {
    return {
      ready: false,
      issue: {
        code: "missing_publishable_key",
        message: `Missing required Supabase environment variable: ${SUPABASE_PUBLISHABLE_KEY}.`,
      },
    };
  }

  if (!publishableKey.startsWith("sb_publishable_")) {
    return {
      ready: false,
      issue: {
        code: "invalid_publishable_key",
        message:
          "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY must be a cloud Supabase publishable key that starts with sb_publishable_.",
      },
    };
  }

  if (scope === "browser") {
    return { ready: true };
  }

  const secretKey = process.env[SUPABASE_SECRET_KEY]?.trim();

  if (!secretKey) {
    return {
      ready: false,
      issue: {
        code: "missing_secret_key",
        message: `Missing required Supabase environment variable: ${SUPABASE_SECRET_KEY}.`,
      },
    };
  }

  if (!secretKey.startsWith("sb_secret_")) {
    return {
      ready: false,
      issue: {
        code: "invalid_secret_key",
        message:
          "SUPABASE_SECRET_KEY must be a cloud Supabase secret key that starts with sb_secret_.",
      },
    };
  }

  return { ready: true };
}

function requireEnv(
  key: typeof SUPABASE_URL_KEY | typeof SUPABASE_PUBLISHABLE_KEY | typeof SUPABASE_SECRET_KEY,
) {
  const value = process.env[key]?.trim();

  if (!value) {
    throw new Error(`Missing required Supabase environment variable: ${key}`);
  }

  return value;
}

function getSupabaseUrl() {
  const value = requireEnv(SUPABASE_URL_KEY);
  const status = validateSupabaseUrl(value);

  if (!status.ready) {
    throw new Error(
      status.issue?.message ??
        "NEXT_PUBLIC_SUPABASE_URL must be a valid cloud Supabase URL.",
    );
  }

  return `https://${new URL(value).hostname}`;
}

function validateSupabaseUrl(value: string): SupabaseEnvStatus {
  let url: URL;

  try {
    url = new URL(value);
  } catch {
    return {
      ready: false,
      issue: {
        code: "invalid_url",
        message:
          "NEXT_PUBLIC_SUPABASE_URL must be a valid URL such as https://<project_ref>.supabase.co.",
      },
    };
  }

  if (url.protocol !== "https:" || !url.hostname.endsWith(".supabase.co") || url.pathname !== "/") {
    return {
      ready: false,
      issue: {
        code: "invalid_url_host",
        message:
          "NEXT_PUBLIC_SUPABASE_URL must use the cloud Supabase format https://<project_ref>.supabase.co.",
      },
    };
  }

  return { ready: true };
}
