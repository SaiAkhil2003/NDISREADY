import { Clock3, ShieldCheck, UserPlus, Users } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const workerCards = [
  { title: "Available today", value: "12", icon: Users },
  { title: "Compliance due", value: "3", icon: ShieldCheck },
  { title: "Open shifts", value: "7", icon: Clock3 },
];

const sampleWorkers = [
  { name: "Olivia Martin", role: "Support Worker", status: "Ready", suburb: "Brisbane" },
  { name: "Ethan Brooks", role: "Team Lead", status: "Review", suburb: "Ipswich" },
  { name: "Mia Chen", role: "Support Worker", status: "Training", suburb: "Logan" },
];

export default function WorkersPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-2">
          <Badge className="w-fit">Workers</Badge>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-950">
            Worker management
          </h1>
          <p className="max-w-2xl text-sm leading-6 text-slate-600">
            UI-only roster workspace for headcount, compliance tracking, and staffing
            actions.
          </p>
        </div>

        <div className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
          <UserPlus className="size-4" />
          Add worker action placeholder
        </div>
      </div>

      <section className="grid gap-4 md:grid-cols-3">
        {workerCards.map(({ title, value, icon: Icon }) => (
          <Card key={title} className="border-white/70 bg-white/80">
            <CardHeader className="flex flex-row items-start justify-between space-y-0">
              <div>
                <CardDescription>{title}</CardDescription>
                <CardTitle className="pt-2 text-3xl">{value}</CardTitle>
              </div>
              <div className="rounded-2xl bg-slate-100 p-3 text-slate-700">
                <Icon className="size-5" />
              </div>
            </CardHeader>
          </Card>
        ))}
      </section>

      <Card className="border-white/70 bg-white/80">
        <CardHeader>
          <CardTitle>Roster preview</CardTitle>
          <CardDescription>Table shell for future filtering and assignment workflows.</CardDescription>
        </CardHeader>
        <CardContent className="overflow-hidden rounded-2xl border border-slate-200">
          <div className="grid grid-cols-[1.2fr_1fr_0.8fr_0.8fr] bg-slate-50 px-4 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            <span>Name</span>
            <span>Role</span>
            <span>Status</span>
            <span>Suburb</span>
          </div>
          {sampleWorkers.map((worker) => (
            <div
              key={worker.name}
              className="grid grid-cols-[1.2fr_1fr_0.8fr_0.8fr] items-center border-t border-slate-200 px-4 py-4 text-sm text-slate-700"
            >
              <span className="font-medium text-slate-950">{worker.name}</span>
              <span>{worker.role}</span>
              <span>{worker.status}</span>
              <span>{worker.suburb}</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
