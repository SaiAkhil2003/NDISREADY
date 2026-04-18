import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, CircleAlert, DatabaseZap } from "lucide-react";

import {
  NoteComposer,
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
  const composerData = await loadNoteComposerContext();
  const participantCount = composerData.data.participantOptions.length;
  const workerCount = composerData.data.workerOptions.length;

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-2">
          <Badge className="w-fit">Notes</Badge>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-950">
            New note
          </h1>
          <p className="max-w-2xl text-base leading-7 text-slate-600">
            Capture support details, assign them to a participant and worker, generate
            a structured draft, and approve the completed note.
          </p>
        </div>

        <Button asChild variant="outline" size="lg">
          <Link href="/dashboard/notes">
            <ArrowLeft className="size-4" />
            Back to notes
          </Link>
        </Button>
      </div>

      <div className="space-y-3">
        <div
          className={`flex items-start gap-3 rounded-3xl border px-4 py-4 text-base shadow-sm ${
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

      <Card className="border-white/70 bg-white/80">
        <CardHeader>
          <CardTitle>Workspace context</CardTitle>
          <CardDescription>
            The note composer uses the same participant and worker records as the rest of the workspace.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          <div className="rounded-3xl border border-slate-200 bg-slate-50 px-4 py-4">
            <p className="font-semibold text-slate-900">Participant dropdown</p>
            <p className="pt-2 text-base leading-7 text-slate-600">
              {participantCount} participant record{participantCount === 1 ? "" : "s"} available for note drafting.
            </p>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-slate-50 px-4 py-4">
            <p className="font-semibold text-slate-900">Worker dropdown</p>
            <p className="pt-2 text-base leading-7 text-slate-600">
              {workerCount} worker record{workerCount === 1 ? "" : "s"} available for note drafting.
            </p>
          </div>

          <div className="rounded-3xl border border-primary/10 bg-primary/5 px-4 py-4 text-base leading-7 text-slate-700">
            Each draft uses the selected participant, worker, note type, and support details.
          </div>
        </CardContent>
      </Card>

      <NoteComposer
        participantOptions={composerData.data.participantOptions}
        workerOptions={composerData.data.workerOptions}
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
