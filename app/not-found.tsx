import Link from "next/link";
import { ArrowLeft, Home } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { dashboardUrl } from "@/lib/routes";
import { siteName } from "@/lib/site";

export default function NotFound() {
  return (
    <main className="px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <section className="page-shell px-5 py-10 sm:px-8 sm:py-12">
          <Card className="border-white/70 bg-white/85">
            <CardHeader className="space-y-3">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
                {siteName}
              </p>
              <CardTitle className="text-4xl tracking-tight text-slate-950">
                This page is not in the current demo.
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="max-w-2xl text-base leading-7 text-slate-600">
                The route you opened does not exist or is not part of the active NDISReady.ai demo flow.
              </p>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Button asChild size="lg">
                  <Link href={dashboardUrl}>
                    <Home className="size-4" />
                    Back to dashboard
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link href="/">
                    <ArrowLeft className="size-4" />
                    Back to home
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </main>
  );
}
