import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ClipboardCheck, Mic, ShieldCheck, UsersRound } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { dashboardUrl } from "@/lib/routes";
import { siteDescription, siteName, siteTagline } from "@/lib/site";

export const metadata: Metadata = {
  title: siteName,
  description:
    "NDISReady.ai for voice notes, participant tracking, worker management, and claim review.",
};

export default function HomePage() {
  return (
    <main className="overflow-x-hidden px-3 py-4 sm:px-6 sm:py-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl min-w-0 flex-col gap-4 sm:gap-6">
        <section className="page-shell bg-hero-grid px-4 py-6 sm:px-8 sm:py-10 lg:px-10 lg:py-12">
          <div className="grid min-w-0 gap-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-8">
            <div className="min-w-0 space-y-5 sm:space-y-6">
              <Badge className="w-fit">{siteName}</Badge>
              <div className="space-y-3 sm:space-y-4">
                <h1 className="max-w-3xl text-3xl font-semibold tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
                  Capture support notes, track participants, and review claims in one workspace.
                </h1>
                <p className="max-w-2xl text-base leading-7 text-slate-600 sm:text-lg sm:leading-8">
                  {siteDescription} {siteTagline}
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <Button asChild size="lg" className="w-full justify-between px-5 sm:w-auto sm:justify-center">
                  <Link href={dashboardUrl}>
                    Open Workspace
                    <ArrowRight className="size-4" />
                  </Link>
                </Button>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <div className="soft-panel w-full px-4 py-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                    Notes
                  </p>
                  <p className="pt-2 text-base font-semibold text-slate-900">Voice capture with text fallback</p>
                </div>
                <div className="soft-panel w-full px-4 py-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                    Participants
                  </p>
                  <p className="pt-2 text-base font-semibold text-slate-900">Goals, NDIS numbers, and profile detail</p>
                </div>
                <div className="soft-panel w-full px-4 py-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                    Claims
                  </p>
                  <p className="pt-2 text-base font-semibold text-slate-900">Claim review with participant and worker context</p>
                </div>
              </div>
            </div>

            <div className="grid min-w-0 gap-4">
              <Card className="border-white/70 bg-white/85">
                <CardHeader className="space-y-2 px-4 py-5 sm:px-6">
                  <CardTitle>What the platform covers</CardTitle>
                  <CardDescription>Designed to keep day-to-day support work clear, fast, and organised.</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-3 px-4 pb-5 pt-0 sm:px-6">
                  <FeatureRow
                    icon={Mic}
                    title="Voice-to-note drafting"
                    description="Record support updates, generate a structured draft, edit it, and save it to the notes history."
                  />
                  <FeatureRow
                    icon={UsersRound}
                    title="Participant and worker records"
                    description="Review realistic NDIS participants, goals, and staffing context from the same dashboard."
                  />
                  <FeatureRow
                    icon={ClipboardCheck}
                    title="Claim review flow"
                    description="Check claim quality with participant and worker context before anything moves forward."
                  />
                  <FeatureRow
                    icon={ShieldCheck}
                    title="Mobile-ready navigation"
                    description="Sticky navigation stays visible while scrolling, with quick access to the full workspace."
                  />
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

type FeatureRowProps = {
  icon: typeof Mic;
  title: string;
  description: string;
};

function FeatureRow({ icon: Icon, title, description }: FeatureRowProps) {
  return (
    <div className="flex min-w-0 items-start gap-3 rounded-3xl border border-slate-200 bg-slate-50 px-4 py-4">
      <div className="rounded-2xl bg-white p-2 text-primary shadow-sm">
        <Icon className="size-4" />
      </div>
      <div className="min-w-0 space-y-1">
        <p className="text-base font-semibold text-slate-900">{title}</p>
        <p className="text-sm leading-6 text-slate-600 sm:text-base sm:leading-7">{description}</p>
      </div>
    </div>
  );
}
