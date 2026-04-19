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
            <span className="inline-flex size-11 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm">
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

      <aside className="hidden w-full shrink-0 border-r border-slate-900/10 bg-[linear-gradient(180deg,#0d1729_0%,#0a1220_100%)] text-white md:sticky md:top-0 md:flex md:h-screen md:w-[260px] md:max-w-[260px] md:flex-none md:flex-col md:overflow-y-auto">
        <div className="border-b border-white/10 px-5 py-4">
          <Link href="/" className="inline-flex min-w-0 items-center gap-3">
            <span className="inline-flex size-8 items-center justify-center rounded-[12px] bg-primary text-primary-foreground shadow-sm">
              <Home className="size-4" />
            </span>
            <span className="min-w-0">
              <span className="block text-[14px] font-semibold leading-4">{siteName}</span>
              <span className="block pt-1 text-[10px] uppercase tracking-[0.18em] text-slate-500">Operations</span>
            </span>
          </Link>
        </div>

        <div className="flex flex-1 flex-col px-4 py-4">
          <div className="px-1 pb-3">
            <p className="text-xs font-semibold uppercase tracking-[0.26em] text-slate-500">
              Dashboard
            </p>
            <p className="pt-1.5 text-[11px] leading-4 text-slate-400">
              Shared workspace navigation for operations teams.
            </p>
          </div>

          <nav className="flex-1 space-y-1">
            {navigation.map(({ href, label, icon: Icon }) => {
              const isActive = isActivePath(pathname, href);

              return (
                <Link
                  key={href}
                  href={href}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "flex min-h-[44px] items-center gap-3 rounded-[12px] px-3.5 py-2.5 text-[13px] font-medium transition-all",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-[0_10px_18px_-14px_rgba(13,148,136,0.95)]"
                      : "text-slate-300 hover:bg-white/5 hover:text-white",
                  )}
                >
                  <Icon className="size-4 shrink-0" />
                  {label}
                </Link>
              );
            })}
          </nav>

          <div className="mt-5 rounded-[14px] border border-white/10 bg-white/5 p-3.5 shadow-[0_16px_28px_-26px_rgba(2,6,23,0.9)]">
            <div className="space-y-2.5">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Admin
                </p>
                <p className="pt-1.5 text-sm font-semibold text-white">Operations Workspace</p>
                <p className="pt-1 text-[11px] leading-4 text-slate-400">
                  Monitor workers, participants, notes, and claims from one dashboard.
                </p>
              </div>
              <div className="rounded-[10px] border border-white/10 bg-black/10 px-3 py-2.5">
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
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
      className="fixed inset-x-0 bottom-0 z-[9999] border-t border-slate-200/90 bg-white/95 backdrop-blur-xl supports-[backdrop-filter]:bg-white/80 md:hidden"
    >
      <div
        className="mx-auto grid h-[72px] max-w-screen-sm grid-cols-5 gap-1 px-2"
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
                "flex min-w-0 flex-col items-center justify-center gap-1 rounded-[20px] px-1 text-center transition-colors",
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
