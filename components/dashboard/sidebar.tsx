"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ClipboardCheck, Home, LayoutDashboard, Menu, StickyNote, Users, UsersRound, X } from "lucide-react";
import { useState } from "react";

import { claimsUrl, dashboardUrl, notesUrl, participantsUrl, workersUrl } from "@/lib/routes";
import { siteName } from "@/lib/site";
import { cn } from "@/lib/utils";

const navigation = [
  { href: dashboardUrl, label: "Overview", icon: LayoutDashboard },
  { href: workersUrl, label: "Workers", icon: Users },
  { href: participantsUrl, label: "Participants", icon: UsersRound },
  { href: notesUrl, label: "Notes", icon: StickyNote },
  { href: claimsUrl, label: "Claims", icon: ClipboardCheck },
];

export function Sidebar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      <div className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/95 backdrop-blur md:hidden">
        <div className="flex min-h-16 items-center justify-between px-4">
          <Link href="/" className="inline-flex min-h-11 items-center gap-3 text-base font-semibold text-slate-900">
            <span className="inline-flex size-11 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm">
              <Home className="size-5" />
            </span>
            <span>
              <span className="block leading-5">{siteName}</span>
              <span className="block text-sm font-medium text-slate-500">Public demo workspace</span>
            </span>
          </Link>

          <button
            type="button"
            aria-expanded={mobileMenuOpen}
            aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
            onClick={() => setMobileMenuOpen((value) => !value)}
            className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:border-slate-300 hover:text-slate-950"
          >
            {mobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      <div className="sticky top-16 z-30 border-b border-slate-200/70 bg-white/95 px-2 py-2 backdrop-blur md:hidden">
        <div className="scrollbar-none flex gap-2 overflow-x-auto px-2">
          {navigation.map(({ href, label, icon: Icon }) => {
            const isActive = href === dashboardUrl ? pathname === href : pathname.startsWith(href);

            return (
              <Link
                key={href}
                href={href}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "inline-flex min-h-11 shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-950",
                )}
              >
                <Icon className="size-4" />
                {label}
              </Link>
            );
          })}
        </div>
      </div>

      {mobileMenuOpen ? (
        <div className="fixed inset-0 z-50 bg-slate-950/45 md:hidden" onClick={() => setMobileMenuOpen(false)}>
          <aside
            className="ml-auto flex h-full w-[min(88vw,22rem)] flex-col border-l border-slate-200 bg-white p-4 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <div>
                <p className="text-base font-semibold text-slate-950">{siteName}</p>
                <p className="text-sm text-slate-500">Dashboard navigation</p>
              </div>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-2xl border border-slate-200 text-slate-700"
              >
                <X className="size-5" />
              </button>
            </div>

            <nav className="mt-4 space-y-2">
              {navigation.map(({ href, label, icon: Icon }) => {
                const isActive = href === dashboardUrl ? pathname === href : pathname.startsWith(href);

                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setMobileMenuOpen(false)}
                    aria-current={isActive ? "page" : undefined}
                    className={cn(
                      "flex min-h-11 items-center gap-3 rounded-2xl px-4 py-3 text-base font-medium transition-colors",
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-slate-700 hover:bg-slate-100 hover:text-slate-950",
                    )}
                  >
                    <Icon className="size-5 shrink-0" />
                    {label}
                  </Link>
                );
              })}
            </nav>

            <div className="mt-auto rounded-3xl border border-slate-200 bg-slate-50 px-4 py-4 text-base text-slate-600">
              Browse the demo without signing in, add sample records, and move between modules from the same sticky navigation.
            </div>
          </aside>
        </div>
      ) : null}

      <aside className="hidden w-full max-w-72 shrink-0 border-r border-slate-200/80 bg-slate-950 text-white md:flex md:min-h-[calc(100vh-3rem)] md:flex-col">
        <div className="border-b border-white/10 px-6 py-6">
          <Link href="/" className="inline-flex items-center gap-3">
            <span className="inline-flex size-11 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm">
              <Home className="size-5" />
            </span>
            <span>
              <span className="block text-base font-semibold">{siteName}</span>
              <span className="block text-sm text-slate-400">Public demo workspace</span>
            </span>
          </Link>
        </div>

        <nav className="flex-1 space-y-2 px-4 py-6">
          {navigation.map(({ href, label, icon: Icon }) => {
            const isActive = href === dashboardUrl ? pathname === href : pathname.startsWith(href);

            return (
              <Link
                key={href}
                href={href}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "flex min-h-11 items-center gap-3 rounded-2xl px-4 py-3 text-base font-medium transition-colors",
                  isActive
                    ? "bg-white text-slate-950 shadow-sm"
                    : "text-slate-300 hover:bg-white/10 hover:text-white",
                )}
              >
                <Icon className="size-5 shrink-0" />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-white/10 px-4 py-5">
          <div className="space-y-4 rounded-3xl bg-white/5 px-4 py-4">
            <div>
              <p className="text-base font-semibold">Demo-ready workspace</p>
              <p className="pt-2 text-base leading-7 text-slate-400">
                Voice notes, participant tracking, workers, and claims all stay accessible without an auth wall.
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
