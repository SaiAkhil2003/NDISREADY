import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, CircleAlert, DatabaseZap } from "lucide-react";

import {
  NoteComposer,
  type NoteSelectOption,
} from "@/components/dashboard/note-composer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { loadNoteComposerContext } from "@/lib/workspace-data";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "New Note",
  description: "Capture a voice or typed support update, generate a structured draft, and approve it into NDISReady.ai.",
};

export default async function NewNotePage() {
  const composerData = await loadSafeNoteComposerContext();
  const participantOptions = normaliseNoteOptions(composerData.data.participantOptions);
  const workerOptions = normaliseNoteOptions(composerData.data.workerOptions);
  const participantCount = participantOptions.length;
  const workerCount = workerOptions.length;

  return (
    <div className="dashboard-page">
      <div className="dashboard-page-header">
        <div className="dashboard-page-heading">
          <Badge className="w-fit">Notes</Badge>
          <h1 className="dashboard-page-title">New note</h1>
          <p className="dashboard-page-copy">
            Capture support details, assign them to a participant and worker, generate
            a structured draft, and approve the completed note.
          </p>
        </div>

        <Button asChild variant="outline" size="lg" className="w-full sm:w-auto">
          <Link href="/dashboard/notes">
            <ArrowLeft className="size-4" />
            Back to notes
          </Link>
        </Button>
      </div>

      <div className="space-y-3">
        <div
          className={`dashboard-notice ${
            composerData.mode === "demo"
              ? "border-amber-200 bg-amber-50 text-amber-950"
              : "border-emerald-200 bg-emerald-50 text-emerald-950"
          }`}
        >
          {composerData.mode === "demo" ? (
            <CircleAlert className="mt-0.5 size-4 shrink-0" />
          ) : (
            <DatabaseZap className="mt-0.5 size-4 shrink-0" />
          )}
          <p>
            {composerData.mode === "demo"
              ? "Workspace records are temporarily limited while the connection is restored."
              : "Current participant and worker records are available for note drafting."}
          </p>
        </div>
      </div>

      <Card className="dashboard-surface">
        <CardHeader>
          <CardTitle>Workspace context</CardTitle>
          <CardDescription>
            The note composer uses the same participant and worker records as the rest of the workspace.
          </CardDescription>
        </CardHeader>
        <CardContent className="dashboard-context-grid">
          <div className="dashboard-subpanel border-slate-200 bg-slate-50 text-slate-600">
            <p className="font-semibold text-slate-900">Participant dropdown</p>
            <p className="pt-2">
              {participantCount} participant record{participantCount === 1 ? "" : "s"} available for note drafting.
            </p>
          </div>

          <div className="dashboard-subpanel border-slate-200 bg-slate-50 text-slate-600">
            <p className="font-semibold text-slate-900">Worker dropdown</p>
            <p className="pt-2">
              {workerCount} worker record{workerCount === 1 ? "" : "s"} available for note drafting.
            </p>
          </div>

          <div className="dashboard-subpanel border-primary/10 bg-primary/5 text-slate-700">
            Each draft uses the selected participant, worker, note type, and support details.
          </div>
        </CardContent>
      </Card>

      <NoteComposer
        participantOptions={participantOptions}
        workerOptions={workerOptions}
        canSaveToSupabase={composerData.canPersist}
        saveUnavailableMessage={
          composerData.canPersist
            ? undefined
            : "Approve and save will be available again once the workspace connection is restored."
        }
      />
    </div>
  );
}

async function loadSafeNoteComposerContext() {
  try {
    const composerData = await loadNoteComposerContext();

    return {
      ...composerData,
      data: {
        participantOptions: normaliseNoteOptions(composerData.data?.participantOptions),
        workerOptions: normaliseNoteOptions(composerData.data?.workerOptions),
      },
    };
  } catch (error) {
    console.error("[notes/new] Failed to load note composer context:", error);

    return {
      data: {
        participantOptions: [],
        workerOptions: [],
      },
      mode: "demo" as const,
      notice: {
        title: "Connection issue",
        message:
          "Workspace records are temporarily limited while the connection is restored.",
      },
      canPersist: false,
    };
  }
}

function normaliseNoteOptions(value: unknown): NoteSelectOption[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.flatMap((option) => {
    if (!isRecord(option)) {
      return [];
    }

    const optionValue = readString(option.value);

    if (!optionValue) {
      return [];
    }

    const detail = readString(option.detail);
    const goals = Array.isArray(option.goals)
      ? option.goals.flatMap((goal) => {
          const title = readString(goal);
          return title ? [title] : [];
        })
      : [];

    return [
      {
        value: optionValue,
        label: readString(option.label) || "Unnamed record",
        ...(detail ? { detail } : {}),
        ...(goals.length > 0 ? { goals } : {}),
      },
    ];
  });
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function readString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}
