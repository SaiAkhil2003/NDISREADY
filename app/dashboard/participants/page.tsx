import { BriefcaseMedical, FileCheck2, HeartHandshake, UsersRound } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const participantStats = [
  { title: "Active participants", value: "46", icon: UsersRound },
  { title: "Intake in progress", value: "8", icon: FileCheck2 },
  { title: "Care plan reviews", value: "5", icon: BriefcaseMedical },
];

const queue = [
  "Confirm support preferences for two new referrals",
  "Review transport notes for plan renewal",
  "Prepare welcome pack for Friday intake",
];

export default function ParticipantsPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Badge variant="secondary" className="w-fit">
          Participants
        </Badge>
        <h1 className="text-3xl font-semibold tracking-tight text-slate-950">
          Participant workspace
        </h1>
        <p className="max-w-2xl text-sm leading-6 text-slate-600">
          Placeholder layout for participant onboarding, support plan reviews, and
          intake tracking.
        </p>
      </div>

      <section className="grid gap-4 md:grid-cols-3">
        {participantStats.map(({ title, value, icon: Icon }) => (
          <Card key={title} className="border-white/70 bg-white/80">
            <CardHeader className="space-y-4">
              <div className="inline-flex size-11 items-center justify-center rounded-2xl bg-secondary text-slate-700">
                <Icon className="size-5" />
              </div>
              <div>
                <CardDescription>{title}</CardDescription>
                <CardTitle className="pt-1 text-3xl">{value}</CardTitle>
              </div>
            </CardHeader>
          </Card>
        ))}
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
        <Card className="border-white/70 bg-white/80">
          <CardHeader>
            <CardTitle>Intake board</CardTitle>
            <CardDescription>Cards will become live participant workflow columns later.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-3">
            {[
              { heading: "New referrals", count: "03" },
              { heading: "Assessment", count: "04" },
              { heading: "Ready to start", count: "01" },
            ].map((column) => (
              <div
                key={column.heading}
                className="rounded-3xl border border-slate-200 bg-slate-50 p-4"
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-slate-700">{column.heading}</p>
                  <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-500">
                    {column.count}
                  </span>
                </div>
                <div className="mt-4 rounded-2xl border border-dashed border-slate-300 px-3 py-8 text-center text-sm text-slate-400">
                  Card placeholders
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-emerald-100 bg-emerald-50/80">
          <CardHeader>
            <div className="inline-flex size-11 items-center justify-center rounded-2xl bg-white text-emerald-700 shadow-sm">
              <HeartHandshake className="size-5" />
            </div>
            <CardTitle className="pt-3">Priority queue</CardTitle>
            <CardDescription>High-level actions for coordinators.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-emerald-950">
            {queue.map((item) => (
              <div key={item} className="rounded-2xl border border-emerald-100 bg-white px-4 py-3">
                {item}
              </div>
            ))}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
