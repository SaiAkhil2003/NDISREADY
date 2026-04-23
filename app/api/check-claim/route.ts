import { NextResponse } from "next/server";

import {
  buildClaimCheckPrompt,
  buildClaimSystemPrompt,
  createLocalClaimIssues,
  getAnthropicClaimEnv,
  getClaimCheckSummary,
  mergeClaimIssues,
  parseClaimCheckResponse,
} from "@/lib/claims";
import { formatParticipantName } from "@/lib/notes";
import { formatWorkerRole } from "@/lib/workers";
import { resolveParticipantForNotes, resolveWorkerForNotes } from "@/lib/workspace-data";

type CheckClaimRequestBody = {
  participantId?: unknown;
  participantName?: unknown;
  workerId?: unknown;
  workerName?: unknown;
  claimDate?: unknown;
  amount?: unknown;
  supportHours?: unknown;
  serviceCode?: unknown;
  reference?: unknown;
  claimNotes?: unknown;
};

type AnthropicMessageResponse = {
  content?: Array<
    | { type?: "text"; text?: string }
    | { type?: string }
  >;
  error?: {
    message?: string;
  };
};

export async function POST(request: Request) {
  let body: CheckClaimRequestBody;

  try {
    body = (await request.json()) as CheckClaimRequestBody;
  } catch {
    return NextResponse.json({ error: "The claim request could not be processed." }, { status: 400 });
  }

  const participantId = readOptionalString(body.participantId);
  const participantName = readOptionalString(body.participantName);
  const workerId = readOptionalString(body.workerId);
  const workerName = readOptionalString(body.workerName);
  const claimDate = readRequiredString(body.claimDate);
  const claimNotes = readRequiredString(body.claimNotes);
  const serviceCode = readOptionalString(body.serviceCode);
  const reference = readOptionalString(body.reference);
  const amount = readOptionalNumber(body.amount);
  const supportHours = readOptionalNumber(body.supportHours);

  if (!claimDate || !claimNotes || amount === null || Number.isNaN(amount)) {
    return NextResponse.json(
      { error: "Claim date, amount, and claim notes are required." },
      { status: 400 },
    );
  }

  if (supportHours !== null && Number.isNaN(supportHours)) {
    return NextResponse.json({ error: "Support hours must be a valid number." }, { status: 400 });
  }

  try {
    const [participant, worker] = await Promise.all([
      participantId ? resolveParticipantForNotes(participantId) : Promise.resolve(null),
      workerId ? resolveWorkerForNotes(workerId) : Promise.resolve(null),
    ]);

    const resolvedParticipantName = participant
      ? formatParticipantName(participant)
      : participantName;
    const resolvedWorkerName = worker
      ? `${worker.firstName} ${worker.lastName}`
      : workerName;

    if (!resolvedParticipantName || !resolvedWorkerName) {
      return NextResponse.json(
        {
          error: "Select a participant and worker before checking the claim.",
        },
        { status: 400 },
      );
    }

    const localIssues = createLocalClaimIssues({
      participantStatus: participant?.status,
      workerStatus: worker?.status,
      claimDate,
      amount,
      supportHours,
      serviceCode,
      reference,
      claimNotes,
    });
    let claudeSummary: string | undefined;
    let claudeIssues: ReturnType<typeof mergeClaimIssues> = [];
    let summaryOverride: string | undefined;

    try {
      const { apiKey, model } = getAnthropicClaimEnv();
      const anthropicResponse = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model,
          max_tokens: 900,
          system: buildClaimSystemPrompt(),
          messages: [
            {
              role: "user",
              content: buildClaimCheckPrompt({
                participantName: resolvedParticipantName,
                participantStatus: participant?.status ?? null,
                participantGoals: participant?.goals.map((goal) => goal.title) ?? [],
                workerName: resolvedWorkerName,
                workerRole: worker ? formatWorkerRole(worker.role) : null,
                workerStatus: worker?.status ?? null,
                claimDate,
                amount,
                supportHours,
                serviceCode,
                reference,
                claimNotes,
              }),
            },
          ],
        }),
      });

      const anthropicPayload = (await anthropicResponse.json()) as AnthropicMessageResponse;

      if (!anthropicResponse.ok) {
        throw new Error(
          anthropicPayload.error?.message ||
            "Automated claim review is temporarily unavailable.",
        );
      }

      const textContent = (anthropicPayload.content ?? [])
        .flatMap((item) =>
          item.type === "text" && "text" in item && typeof item.text === "string"
            ? [item.text]
            : [],
        )
        .join("\n")
        .trim();

      const claudeResult = parseClaimCheckResponse(textContent);
      claudeSummary = claudeResult.summary;
      claudeIssues = claudeResult.issues;
    } catch {
      summaryOverride =
        localIssues.length > 0
          ? `Automated review is temporarily unavailable. ${localIssues.length} issue${localIssues.length === 1 ? "" : "s"} still need attention.`
          : "Automated review is temporarily unavailable. No issues were found by the built-in checks.";
    }

    const issues = mergeClaimIssues(localIssues, claudeIssues);

    return NextResponse.json({
      summary: summaryOverride ?? getClaimCheckSummary(issues, claudeSummary),
      issues,
    });
  } catch {
    return NextResponse.json(
      { error: "The claim review could not be completed right now. Please try again." },
      { status: 500 },
    );
  }
}

function readRequiredString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function readOptionalString(value: unknown) {
  return typeof value === "string" ? value.trim() || undefined : undefined;
}

function readOptionalNumber(value: unknown) {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }

  if (typeof value === "string" && value.trim()) {
    const parsedValue = Number(value);
    return Number.isFinite(parsedValue) ? parsedValue : Number.NaN;
  }

  return null;
}
