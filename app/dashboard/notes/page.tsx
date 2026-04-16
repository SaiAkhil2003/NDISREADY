import { FilePenLine, MessageSquareQuote, NotebookTabs, Search } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const noteTypes = [
  { title: "Case notes", total: "42", icon: NotebookTabs },
  { title: "Follow-ups", total: "9", icon: FilePenLine },
  { title: "Escalations", total: "2", icon: MessageSquareQuote },
];

const notes = [
  {
    title: "Transport support updated",
    body: "Participant requested earlier pickup window for weekday appointments.",
  },
  {
    title: "Medication reminder request",
    body: "Worker raised a recurring reminder need for evening support blocks.",
  },
  {
    title: "Plan review upcoming",
    body: "Coordinator preparing summary before next Tuesday review meeting.",
  },
];

export default function NotesPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-2">
          <Badge className="w-fit">Notes</Badge>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-950">
            Notes and activity
          </h1>
          <p className="max-w-2xl text-sm leading-6 text-slate-600">
            Base shell for case note capture, recent activity, and search-driven review.
          </p>
        </div>

        <div className="flex items-center gap-3 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-500 shadow-sm">
          <Search className="size-4" />
          Search UI placeholder
        </div>
      </div>

      <section className="grid gap-4 md:grid-cols-3">
        {noteTypes.map(({ title, total, icon: Icon }) => (
          <Card key={title} className="border-white/70 bg-white/80">
            <CardHeader className="space-y-4">
              <div className="inline-flex size-11 items-center justify-center rounded-2xl bg-amber-50 text-amber-700">
                <Icon className="size-5" />
              </div>
              <div>
                <CardDescription>{title}</CardDescription>
                <CardTitle className="pt-1 text-3xl">{total}</CardTitle>
              </div>
            </CardHeader>
          </Card>
        ))}
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <Card className="border-white/70 bg-white/80">
          <CardHeader>
            <CardTitle>Recent notes</CardTitle>
            <CardDescription>Static feed placeholder for the future notes stream.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {notes.map((note) => (
              <div key={note.title} className="rounded-3xl border border-slate-200 p-4">
                <h2 className="font-semibold text-slate-900">{note.title}</h2>
                <p className="pt-2 text-sm leading-6 text-slate-600">{note.body}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-slate-200 bg-slate-950 text-white">
          <CardHeader>
            <CardTitle>Composer shell</CardTitle>
            <CardDescription className="text-slate-300">
              Editor and tagging controls will be added in later phases.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-3xl border border-white/10 bg-white/5 px-4 py-10 text-sm text-slate-400">
              Rich text entry placeholder
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-300">
                Tags / participant selector
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-300">
                Save draft / submit controls
              </div>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
