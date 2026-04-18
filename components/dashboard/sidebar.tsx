"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ClipboardCheck, Home, LayoutDashboard, Menu, StickyNote, Users, UsersRound, X } from "lucide-react";
import { useEffect, useState } from "react";

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

function isActivePath(pathname: string, href: string) {
  return href === dashboardUrl ? pathname === href : pathname.startsWith(href);
}

export function Sidebar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  return (
    <>
      <div className="sticky top-0 z-40 border-b border-slate-200 bg-white shadow-[0_10px_30px_-24px_rgba(15,23,42,0.45)] md:hidden">
        <div className="flex min-h-16 items-center justify-between gap-3 px-3">
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
                const isActive = isActivePath(pathname, href);

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
            const isActive = isActivePath(pathname, href);

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

export function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Mobile dashboard navigation"
      className="fixed inset-x-0 bottom-0 z-[9999] border-t border-slate-200 bg-white md:hidden"
    >
      <div className="grid h-[70px] grid-cols-5 gap-1 px-2" style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
        {navigation.map(({ href, label, icon: Icon }) => {
          const isActive = isActivePath(pathname, href);

          return (
            <Link
              key={href}
              href={href}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "flex min-w-0 flex-col items-center justify-center gap-1 rounded-2xl px-1 text-center transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-slate-500 hover:bg-slate-100 hover:text-slate-900",
              )}
            >
              <Icon className="size-[1.1rem] shrink-0" />
              <span className="w-full truncate px-0.5 text-[10px] font-medium leading-none tracking-tight">
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
