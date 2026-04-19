import { createAdminClient } from "@/lib/supabase/admin";
import { formatParticipantName } from "@/lib/notes";
import { listParticipants } from "@/lib/participants";
import { getWorkspaceOrganisationId } from "@/lib/workspace";
import { formatWorkerRole, listWorkers } from "@/lib/workers";

export type ClaimCheckIssueSeverity = "warning" | "error";

export type ClaimCheckIssue = {
  severity: ClaimCheckIssueSeverity;
  title: string;
  detail: string;
  field?: string;
};

export type ClaimCheckResult = {
  summary: string;
  issues: ClaimCheckIssue[];
};

export type ClaimListItem = {
  id: string;
  participantId: string;
  participantName: string;
  workerId: string | null;
  workerName: string | null;
  workerRole: string | null;
  reference: string | null;
  claimDate: string;
  amount: number;
  status: string;
  supportHours: number | null;
  serviceCode: string | null;
  notes: string | null;
  createdAt: string;
};

type ClaimsTableRow = {
  id: string;
  participant_id: string;
  worker_id: string | null;
  reference: string | null;
  claim_date: string;
  amount: number | string;
  status: string;
  support_hours: number | null;
  service_code: string | null;
  notes: string | null;
  created_at: string;
};

type LegacyClaimsTableRow = {
  id: string;
  participant_id: string;
  worker_id: string | null;
  reference: string | null;
  claim_date: string;
  amount: number | string;
  status: string;
  created_at: string;
};

type BuildClaimCheckPromptInput = {
  participantName: string;
  participantStatus?: string | null;
  participantGoals: string[];
  workerName: string;
  workerRole?: string | null;
  workerStatus?: string | null;
  claimDate: string;
  amount: number;
  supportHours?: number | null;
  serviceCode?: string;
  reference?: string;
  claimNotes: string;
};

type LocalClaimIssueInput = {
  participantStatus?: string | null;
  workerStatus?: string | null;
  claimDate: string;
  amount: number;
  supportHours?: number | null;
  serviceCode?: string;
  reference?: string;
  claimNotes: string;
};

export function buildClaimCheckPrompt(input: BuildClaimCheckPromptInput) {
  const goalsSection =
    input.participantGoals.length > 0
      ? input.participantGoals.map((goal) => `- ${goal}`).join("\n")
      : "- No participant goals were provided";

  return [
    "You are validating a draft NDIS support claim for likely internal issues.",
    "Review the supplied claim for missing information, internal inconsistencies, future-dated service delivery, weak support evidence, unlikely amount-to-hours combinations, and participant or worker status risks.",
    "Do not claim that a rule definitely exists unless it is obvious from the provided data. Focus on practical warnings and errors a claims reviewer should inspect.",
    'Return valid JSON only in this exact shape: {"summary":"...","issues":[{"severity":"warning"|"error","title":"...","detail":"...","field":"participant|worker|claimDate|amount|supportHours|serviceCode|reference|claimNotes"}]}.',
    "If there are no meaningful problems, return an empty issues array and a short positive summary.",
    "",
    "Claim context:",
    `Participant: ${input.participantName}`,
    `Participant status: ${input.participantStatus?.trim() || "Unknown"}`,
    `Participant goals:\n${goalsSection}`,
    `Worker: ${input.workerName}`,
    `Worker role: ${input.workerRole?.trim() || "Unknown"}`,
    `Worker status: ${input.workerStatus?.trim() || "Unknown"}`,
    `Claim date: ${input.claimDate}`,
    `Amount: ${input.amount.toFixed(2)}`,
    `Support hours: ${input.supportHours ?? "Not provided"}`,
    `Service code: ${input.serviceCode?.trim() || "Not provided"}`,
    `Reference: ${input.reference?.trim() || "Not provided"}`,
    `Claim notes: ${input.claimNotes.trim()}`,
  ].join("\n");
}

export function buildClaimSystemPrompt() {
  return [
    "You are a strict claim-quality checker.",
    "Return JSON only.",
    "Keep issues concrete, concise, and tied to the supplied fields.",
  ].join(" ");
}

export function formatClaimStatus(value: string) {
  return value
    .split(/[_-]/)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(" ");
}

export async function listClaims() {
  const organisationId = await getWorkspaceOrganisationId();

  if (!organisationId) {
    return [];
  }

  const phase14Result = await queryClaimsRows({
    organisationId,
    mode: "phase14",
  });

  let rows: ClaimsTableRow[] | LegacyClaimsTableRow[];
  let mode: "phase14" | "legacy" = "phase14";

  if (phase14Result.error) {
    if (!isMissingClaimColumnsError(phase14Result.error)) {
      throw phase14Result.error;
    }

    const legacyResult = await queryClaimsRows({
      organisationId,
      mode: "legacy",
    });

    if (legacyResult.error) {
      throw legacyResult.error;
    }

    rows = ((legacyResult.data ?? []) as unknown) as LegacyClaimsTableRow[];
    mode = "legacy";
  } else {
    rows = ((phase14Result.data ?? []) as unknown) as ClaimsTableRow[];
  }

  if (rows.length === 0) {
    return [];
  }

  const [participantsResult, workersResult] = await Promise.allSettled([
    listParticipants(),
    listWorkers(),
  ]);
  const participants =
    participantsResult.status === "fulfilled" ? participantsResult.value : [];
  const workers = workersResult.status === "fulfilled" ? workersResult.value : [];

  const participantById = new Map(participants.map((participant) => [participant.id, participant]));
  const workerById = new Map(workers.map((worker) => [worker.id, worker]));

  return rows.map((row) => {
    const participant = participantById.get(row.participant_id);
    const worker = row.worker_id ? workerById.get(row.worker_id) : null;
    const enrichedRow = mode === "phase14" ? (row as ClaimsTableRow) : null;

    return {
      id: row.id,
      participantId: row.participant_id,
      participantName: participant ? formatParticipantName(participant) : "Unknown participant",
      workerId: row.worker_id,
      workerName: worker ? `${worker.firstName} ${worker.lastName}` : null,
      workerRole: worker ? formatWorkerRole(worker.role) : null,
      reference: row.reference ?? null,
      claimDate: row.claim_date,
      amount: normaliseAmount(row.amount),
      status: row.status,
      supportHours: enrichedRow?.support_hours ?? null,
      serviceCode: enrichedRow?.service_code ?? null,
      notes: enrichedRow?.notes ?? null,
      createdAt: row.created_at,
    } satisfies ClaimListItem;
  });
}

export function createLocalClaimIssues(input: LocalClaimIssueInput) {
  const issues: ClaimCheckIssue[] = [];
  const claimDate = new Date(input.claimDate);
  const today = new Date();

  if (!Number.isNaN(claimDate.getTime())) {
    const claimDateOnly = new Date(
      Date.UTC(claimDate.getUTCFullYear(), claimDate.getUTCMonth(), claimDate.getUTCDate()),
    );
    const todayOnly = new Date(
      Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()),
    );

    if (claimDateOnly.getTime() > todayOnly.getTime()) {
      issues.push({
        severity: "error",
        title: "Future claim date",
        detail: "The claim date is in the future, so the service may not have been delivered yet.",
        field: "claimDate",
      });
    }
  }

  if (input.amount <= 0) {
    issues.push({
      severity: "error",
      title: "Non-positive amount",
      detail: "The claim amount must be greater than zero before the claim can be reviewed.",
      field: "amount",
    });
  }

  if (typeof input.supportHours === "number") {
    if (input.supportHours <= 0) {
      issues.push({
        severity: "error",
        title: "Invalid support hours",
        detail: "Support hours must be greater than zero when they are included on a claim.",
        field: "supportHours",
      });
    } else {
      const hourlyRate = input.amount / input.supportHours;

      if (hourlyRate > 500) {
        issues.push({
          severity: "warning",
          title: "High implied hourly rate",
          detail: `The amount implies about ${hourlyRate.toFixed(2)} per hour, which is unusually high and should be checked.`,
          field: "amount",
        });
      }
    }
  }

  if (!input.serviceCode?.trim()) {
    issues.push({
      severity: "warning",
      title: "Missing service code",
      detail: "No service code was provided, so the claim may be hard to review or match.",
      field: "serviceCode",
    });
  }

  if (!input.reference?.trim()) {
    issues.push({
      severity: "warning",
      title: "Missing reference",
      detail: "Add a reference number so the claim can be traced later.",
      field: "reference",
    });
  }

  if (input.claimNotes.trim().length < 24) {
    issues.push({
      severity: "warning",
      title: "Thin claim notes",
      detail: "The claim notes are brief and may not clearly justify the support that was delivered.",
      field: "claimNotes",
    });
  }

  if (input.participantStatus && input.participantStatus !== "active") {
    issues.push({
      severity: "warning",
      title: "Participant status needs review",
      detail: `The participant is marked as ${input.participantStatus}, so eligibility or timing should be confirmed.`,
      field: "participant",
    });
  }

  if (input.workerStatus && input.workerStatus !== "active") {
    issues.push({
      severity: "warning",
      title: "Worker status needs review",
      detail: `The worker is marked as ${input.workerStatus}, so the claim should be checked before submission.`,
      field: "worker",
    });
  }

  return issues;
}

export function parseClaimCheckResponse(text: string) {
  const jsonText = extractJsonObject(text);

  if (!jsonText) {
    throw new Error("Claude did not return a valid JSON claim check response.");
  }

  const parsed = JSON.parse(jsonText) as {
    summary?: unknown;
    issues?: unknown;
  };

  return {
    summary:
      typeof parsed.summary === "string" && parsed.summary.trim()
        ? parsed.summary.trim()
        : "Claim review completed.",
    issues: normaliseClaimIssues(parsed.issues),
  } satisfies ClaimCheckResult;
}

export function mergeClaimIssues(...issueGroups: ClaimCheckIssue[][]) {
  const merged: ClaimCheckIssue[] = [];
  const seen = new Set<string>();

  for (const group of issueGroups) {
    for (const issue of group) {
      const title = issue.title.trim();
      const detail = issue.detail.trim();

      if (!title || !detail) {
        continue;
      }

      const key = `${issue.severity}:${issue.field ?? ""}:${title.toLowerCase()}:${detail.toLowerCase()}`;

      if (seen.has(key)) {
        continue;
      }

      seen.add(key);
      merged.push({
        severity: issue.severity,
        title,
        detail,
        field: issue.field?.trim() || undefined,
      });
    }
  }

  return merged;
}

export function getClaimCheckSummary(issues: ClaimCheckIssue[], claudeSummary?: string) {
  if (issues.length === 0) {
    return claudeSummary?.trim() || "No claim issues were detected.";
  }

  if (claudeSummary?.trim()) {
    return claudeSummary.trim();
  }

  return `${issues.length} issue${issues.length === 1 ? "" : "s"} detected in the draft claim.`;
}

export function getAnthropicClaimEnv() {
  const apiKey = process.env.ANTHROPIC_API_KEY?.trim();

  if (!apiKey) {
    throw new Error("Missing required Anthropic environment variable: ANTHROPIC_API_KEY");
  }

  return {
    apiKey,
    model: process.env.ANTHROPIC_CLAUDE_MODEL?.trim() || "claude-sonnet-4-5-20250929",
  };
}

function extractJsonObject(value: string) {
  const trimmedValue = value.trim();

  if (!trimmedValue) {
    return null;
  }

  if (trimmedValue.startsWith("{") && trimmedValue.endsWith("}")) {
    return trimmedValue;
  }

  const fencedMatch = trimmedValue.match(/```json\s*([\s\S]*?)\s*```/i);

  if (fencedMatch?.[1]) {
    return fencedMatch[1].trim();
  }

  const firstBrace = trimmedValue.indexOf("{");
  const lastBrace = trimmedValue.lastIndexOf("}");

  if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) {
    return null;
  }

  return trimmedValue.slice(firstBrace, lastBrace + 1);
}

function normaliseClaimIssues(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.flatMap((item) => {
    if (typeof item !== "object" || item === null) {
      return [];
    }

    const severity = itemSeverity(item.severity);
    const title = typeof item.title === "string" ? item.title.trim() : "";
    const detail = typeof item.detail === "string" ? item.detail.trim() : "";
    const field = typeof item.field === "string" ? item.field.trim() : "";

    if (!title || !detail) {
      return [];
    }

    return [
      {
        severity,
        title,
        detail,
        field: field || undefined,
      } satisfies ClaimCheckIssue,
    ];
  });
}

function itemSeverity(value: unknown): ClaimCheckIssueSeverity {
  return value === "error" ? "error" : "warning";
}

async function queryClaimsRows(input: {
  organisationId: string;
  mode: "phase14" | "legacy";
}) {
  const supabase = createAdminClient();

  return await supabase
    .from("claims")
    .select(
      input.mode === "phase14"
        ? "id, participant_id, worker_id, reference, claim_date, amount, status, support_hours, service_code, notes, created_at"
        : "id, participant_id, worker_id, reference, claim_date, amount, status, created_at",
    )
    .eq("organisation_id", input.organisationId)
    .order("claim_date", { ascending: false })
    .order("created_at", { ascending: false });
}

function isMissingClaimColumnsError(error: unknown) {
  const text =
    error instanceof Error
      ? error.message
      : typeof error === "object" &&
          error !== null &&
          "message" in error &&
          typeof error.message === "string"
        ? error.message
        : String(error);
  const lowerText = text.toLowerCase();

  return ["support_hours", "service_code", "notes"].some((column) =>
    lowerText.includes(column),
  );
}

function normaliseAmount(value: number | string) {
  if (typeof value === "number") {
    return value;
  }

  const parsedValue = Number(value);
  return Number.isFinite(parsedValue) ? parsedValue : 0;
}
