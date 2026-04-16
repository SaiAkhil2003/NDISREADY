import Link from "next/link";
import { Activity, CalendarDays, CircleCheckBig, ListTodo } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { notesUrl, participantsUrl, workersUrl } from "@/lib/routes";

const stats = [
  {
    title: "Active workers",
    value: "24",
    detail: "4 requiring follow-up",
    icon: Activity,
  },
  {
    title: "Participants onboarded",
    value: "118",
    detail: "12 added this month",
    icon: CircleCheckBig,
  },
  {
    title: "Pending notes",
    value: "16",
    detail: "6 due today",
    icon: ListTodo,
  },
];

const routeCards = [
  {
    title: "Workers",
    description: "Open the worker roster shell and staffing preview table.",
    href: workersUrl,
  },
  {
    title: "Participants",
    description: "Review the participant intake board and coordinator queue.",
    href: participantsUrl,
  },
  {
    title: "Notes",
    description: "Move into the note feed and composer layout shell.",
    href: notesUrl,
  },
];

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-2">
          <Badge variant="secondary" className="w-fit">
            Dashboard
          </Badge>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-950">
            Operations overview
          </h1>
          <p className="max-w-2xl text-sm leading-6 text-slate-600">
            Phase 4 focuses on the dashboard shell itself: navigation, overview UI,
            and route entry points for workers, participants, and notes.
          </p>
        </div>

        <Card className="w-full max-w-sm border-primary/15 bg-primary/5">
          <CardContent className="flex items-center gap-4 p-5">
            <div className="rounded-2xl bg-white p-3 text-primary shadow-sm">
              <CalendarDays className="size-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Weekly rhythm</p>
              <p className="text-lg font-semibold text-slate-900">
                Roster review every Monday, case sync every Thursday
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <section className="grid gap-4 xl:grid-cols-3">
        {stats.map(({ title, value, detail, icon: Icon }) => (
          <Card key={title} className="border-white/70 bg-white/80">
            <CardHeader className="space-y-4">
              <div className="inline-flex size-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
                <Icon className="size-5" />
              </div>
              <div>
                <CardDescription>{title}</CardDescription>
                <CardTitle className="pt-1 text-3xl">{value}</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-0 text-sm text-slate-500">{detail}</CardContent>
          </Card>
        ))}
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.3fr_0.9fr]">
        <Card className="border-white/70 bg-white/80">
          <CardHeader>
            <CardTitle>Route entry points</CardTitle>
            <CardDescription>Use the dashboard shell to move between the Phase 4 sections.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            {routeCards.map((route) => (
              <div
                key={route.href}
                className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-semibold text-slate-900">{route.title}</p>
                  <p className="pt-1 text-sm leading-6 text-slate-600">{route.description}</p>
                </div>
                <Button asChild variant="outline" className="shrink-0">
                  <Link href={route.href}>Open page</Link>
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-amber-200 bg-amber-50/80">
          <CardHeader>
            <CardTitle>Layout status</CardTitle>
            <CardDescription>Phase 4 stops after the dashboard shell, navigation, and routing.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-amber-900">
            <p>Sidebar navigation is shared across all dashboard pages.</p>
            <p>Workers, participants, and notes remain UI-only route shells.</p>
            <p>Authentication and Supabase setup from earlier phases remain intact.</p>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
