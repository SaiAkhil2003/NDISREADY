"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ClipboardCheck, Home, LayoutDashboard, StickyNote, Users, UsersRound } from "lucide-react";

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

  return (
    <>
      <div className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl md:hidden">
        <div className="flex min-h-[72px] items-center px-4">
          <Link
            href="/"
            className="inline-flex min-h-11 min-w-0 items-center gap-3 text-base font-semibold text-slate-900"
          >
            <span className="inline-flex size-11 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">
              <Home className="size-5" />
            </span>
            <span className="min-w-0">
              <span className="block truncate leading-5">{siteName}</span>
              <span className="block text-xs font-medium uppercase tracking-[0.18em] text-slate-500">
                Workspace navigation
              </span>
            </span>
          </Link>
        </div>
      </div>

      <aside className="hidden border-r border-slate-800 bg-slate-950 text-white md:fixed md:inset-y-0 md:left-0 md:z-40 md:flex md:w-72 md:flex-col md:overflow-y-auto">
        <div className="border-b border-slate-800 px-6 py-5">
          <Link href="/" className="inline-flex min-w-0 items-center gap-3">
            <span className="inline-flex size-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">
              <Home className="size-4" />
            </span>
            <span className="min-w-0">
              <span className="block text-sm font-semibold leading-5">{siteName}</span>
              <span className="block pt-0.5 text-[10px] uppercase tracking-[0.18em] text-slate-400">Operations</span>
            </span>
          </Link>
        </div>

        <div className="flex flex-1 flex-col px-4 py-5">
          <div className="px-2 pb-3">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
              Dashboard
            </p>
          </div>

          <nav className="flex-1 space-y-1.5">
            {navigation.map(({ href, label, icon: Icon }) => {
              const isActive = isActivePath(pathname, href);

              return (
                <Link
                  key={href}
                  href={href}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "flex min-h-11 items-center gap-3 rounded-lg px-3.5 py-2.5 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-blue-600 text-white shadow-sm"
                      : "text-slate-300 hover:bg-white/10 hover:text-white",
                  )}
                >
                  <Icon className="size-4 shrink-0" />
                  {label}
                </Link>
              );
            })}
          </nav>

          <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.04] p-4 shadow-sm">
            <div className="space-y-2.5">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Manager
                </p>
                <p className="pt-1.5 text-sm font-semibold text-white">Operations Workspace</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-black/10 px-3 py-2.5">
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Status
                </p>
                <p className="pt-1.5 text-sm text-slate-200">Workspace active</p>
              </div>
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
      className="fixed inset-x-0 bottom-0 z-[9999] w-full max-w-full overflow-hidden border-t border-slate-200/90 bg-white/95 backdrop-blur-xl supports-[backdrop-filter]:bg-white/80 md:hidden"
    >
      <div
        className="flex h-[var(--dashboard-mobile-nav-height)] w-full max-w-full items-stretch justify-around gap-0 px-1"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        {navigation.map(({ href, label, icon: Icon }) => {
          const isActive = isActivePath(pathname, href);

          return (
            <Link
              key={href}
              href={href}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "flex min-w-0 flex-1 basis-0 flex-col items-center justify-center gap-1 rounded-xl px-0.5 text-center transition-colors",
                isActive
                  ? "bg-blue-600 text-white shadow-sm"
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
