import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, ClipboardList, FileText, LogIn, ShieldCheck, UserPlus, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { dashboardUrl, signInUrl, signUpUrl } from "@/lib/routes";

const previewCards = [
  {
    title: "Workers",
    description: "Roster snapshots, status tags, and operational filters.",
    icon: Users,
  },
  {
    title: "Participants",
    description: "Participant summaries and intake checkpoints.",
    icon: ClipboardList,
  },
  {
    title: "Notes",
    description: "Quick view of logs, actions, and follow-ups.",
    icon: FileText,
  },
];

export default async function HomePage() {
  const { userId } = await auth();

  if (userId) {
    redirect(dashboardUrl);
  }

  return (
    <main className="relative overflow-hidden px-4 py-8 sm:px-6 lg:px-8">
      <div className="container">
        <section className="page-shell bg-hero-grid px-6 py-10 sm:px-10 sm:py-14">
          <div className="grid gap-10 lg:grid-cols-[1.25fr_0.9fr] lg:items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center rounded-full border border-primary/15 bg-primary/10 px-4 py-1 text-sm font-medium text-primary">
                Phase 2 authentication
              </div>
              <div className="space-y-4">
                <h1 className="max-w-2xl text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
                  Secure NDIS workspace with a protected dashboard and Clerk-based access flow.
                </h1>
                <p className="max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
                  Phase 1 remains intact, and Phase 2 adds dedicated sign-in and sign-up
                  pages plus dashboard protection for the operations workspace.
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Button asChild size="lg" className="rounded-full px-6">
                  <Link href={signInUrl}>
                    Sign in
                    <LogIn className="ml-2 size-4" />
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="rounded-full border-primary/20 bg-white/80 px-6"
                >
                  <Link href={signUpUrl}>
                    Create account
                    <UserPlus className="ml-2 size-4" />
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="secondary"
                  size="lg"
                  className="rounded-full px-6"
                >
                  <Link href={dashboardUrl} prefetch={false}>
                    Protected dashboard
                    <ArrowRight className="ml-2 size-4" />
                  </Link>
                </Button>
              </div>
            </div>

            <div className="grid gap-4">
              {previewCards.map(({ title, description, icon: Icon }) => (
                <Card key={title} className="border-white/70 bg-white/80 backdrop-blur">
                  <CardHeader className="pb-3">
                    <div className="mb-4 inline-flex size-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                      <Icon className="size-5" />
                    </div>
                    <CardTitle>{title}</CardTitle>
                    <CardDescription>{description}</CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="grid gap-4 pt-6 md:grid-cols-3">
          {[
            {
              title: "Phase 1 shell preserved",
              description: "Homepage, dashboard layout, sidebar, and UI routes are still present.",
              icon: ShieldCheck,
            },
            {
              title: "Clerk auth pages",
              description: "Dedicated sign-in and sign-up flows now sit on public routes.",
              icon: LogIn,
            },
            {
              title: "Protected dashboard",
              description: "Dashboard routes redirect unauthenticated users before loading.",
              icon: ArrowRight,
            },
          ].map(({ title, description, icon: Icon }) => (
            <Card key={title} className="border-white/70 bg-white/75">
              <CardContent className="flex min-h-28 gap-4 py-6">
                <div className="inline-flex size-11 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
                  <Icon className="size-5" />
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-slate-900">{title}</p>
                  <p className="text-sm leading-6 text-slate-600">{description}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </section>
      </div>
    </main>
  );
}
