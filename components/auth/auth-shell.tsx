import type { ReactNode } from "react";
import Link from "next/link";
import { Home } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

type AuthShellProps = {
  eyebrow: string;
  title: string;
  description: string;
  secondaryCtaLabel: string;
  secondaryCtaHref: string;
  children: ReactNode;
};

export function AuthShell({
  eyebrow,
  title,
  description,
  secondaryCtaLabel,
  secondaryCtaHref,
  children,
}: AuthShellProps) {
  return (
    <main className="relative overflow-hidden px-4 py-8 sm:px-6 lg:px-8">
      <div className="container">
        <section className="page-shell bg-hero-grid grid gap-8 px-6 py-10 sm:px-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
          <div className="space-y-6">
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/75 px-4 py-2 text-sm font-medium text-slate-700 shadow-sm backdrop-blur"
            >
              <Home className="size-4" />
              Back to home
            </Link>
            <div className="inline-flex items-center rounded-full border border-primary/15 bg-primary/10 px-4 py-1 text-sm font-medium text-primary">
              {eyebrow}
            </div>
            <div className="space-y-4">
              <h1 className="max-w-xl text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
                {title}
              </h1>
              <p className="max-w-xl text-base leading-7 text-slate-600 sm:text-lg">
                {description}
              </p>
            </div>
            <Card className="border-white/70 bg-white/80">
              <CardContent className="space-y-2 py-6">
                <p className="text-sm font-semibold text-slate-900">Next destination</p>
                <p className="text-sm leading-6 text-slate-600">
                  Successful authentication redirects straight to <code>/dashboard</code>.
                </p>
                <Link
                  href={secondaryCtaHref}
                  className="inline-flex pt-2 text-sm font-semibold text-primary"
                >
                  {secondaryCtaLabel}
                </Link>
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-center lg:justify-end">{children}</div>
        </section>
      </div>
    </main>
  );
}
