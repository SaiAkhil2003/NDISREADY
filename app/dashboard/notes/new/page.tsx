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
  description: "Capture a voice or typed support update, generate an AI draft, and approve it into NDISReady.ai.",
};

export default async function NewNotePage() {
  const composerData = await loadNoteComposerContext();

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-2">
          <Badge className="w-fit">Notes</Badge>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-950">
            New note draft
          </h1>
          <p className="max-w-2xl text-base leading-7 text-slate-600">
            Capture source notes, assign them to a participant and worker, generate
            a structured note draft, and approve the final text.
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
              ? "Sample participant and worker records are active so the notes flow stays usable for demos."
              : "Live participant and worker records are being used to populate the note dropdowns."}
          </p>
        </div>
      </div>

      <Card className="border-white/70 bg-white/80">
        <CardHeader>
          <CardTitle>Data sources</CardTitle>
          <CardDescription>
            The note composer uses the same saved records and note routes as the rest of the workspace.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          <div className="rounded-3xl border border-slate-200 bg-slate-50 px-4 py-4">
            <p className="font-semibold text-slate-900">Participant dropdown</p>
            <p className="pt-2 text-base leading-7 text-slate-600">
              {composerData.mode === "demo"
                ? "Demo participant options are available for voice and typed note capture."
                : `Loaded ${composerData.data.participantOptions.length} live participant option${composerData.data.participantOptions.length === 1 ? "" : "s"} from Supabase.`}
            </p>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-slate-50 px-4 py-4">
            <p className="font-semibold text-slate-900">Worker dropdown</p>
            <p className="pt-2 text-base leading-7 text-slate-600">
              {composerData.mode === "demo"
                ? "Demo worker options are available so the note draft flow still feels complete."
                : `Loaded ${composerData.data.workerOptions.length} live worker option${composerData.data.workerOptions.length === 1 ? "" : "s"} from Supabase.`}
            </p>
          </div>

          <div className="rounded-3xl border border-primary/10 bg-primary/5 px-4 py-4 text-base leading-7 text-slate-700">
            Generate calls `/api/generate-note`, and approval saves the note through the existing persistence flow.
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
            : "Approve & Save will be enabled again once the live Supabase connection is available for this deployment."
        }
      />
    </div>
  );
}
