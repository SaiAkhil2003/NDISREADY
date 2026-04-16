"use client";

import { UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, LayoutDashboard, Menu, StickyNote, Users, UsersRound, X } from "lucide-react";
import { useState } from "react";

import { dashboardUrl, notesUrl, participantsUrl, workersUrl } from "@/lib/routes";
import { cn } from "@/lib/utils";

const navigation = [
  { href: dashboardUrl, label: "Overview", icon: LayoutDashboard },
  { href: workersUrl, label: "Workers", icon: Users },
  { href: participantsUrl, label: "Participants", icon: UsersRound },
  { href: notesUrl, label: "Notes", icon: StickyNote },
];

export function Sidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 md:hidden">
        <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-900">
          <span className="inline-flex size-9 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
            <Home className="size-4" />
          </span>
          NDIS Ready
        </Link>
        <button
          type="button"
          onClick={() => setIsOpen((current) => !current)}
          className="inline-flex size-10 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 shadow-sm"
          aria-label={isOpen ? "Close sidebar" : "Open sidebar"}
          aria-expanded={isOpen}
        >
          {isOpen ? <X className="size-4" /> : <Menu className="size-4" />}
        </button>
      </div>

      {isOpen ? (
        <button
          type="button"
          aria-label="Close sidebar overlay"
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 z-30 bg-slate-950/35 md:hidden"
        />
      ) : null}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-[18rem] shrink-0 border-r border-slate-200 bg-slate-950/95 text-white shadow-2xl transition-transform md:static md:block md:min-h-[calc(100vh-2rem)] md:w-72 md:translate-x-0 md:shadow-none",
          isOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-full flex-col">
          <div className="border-b border-white/10 px-6 py-6">
            <Link href="/" className="inline-flex items-center gap-3">
              <span className="inline-flex size-11 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm">
                <Home className="size-5" />
              </span>
              <span>
                <span className="block text-base font-semibold">NDIS Ready</span>
                <span className="block text-sm text-slate-400">Phase 4 dashboard layout</span>
              </span>
            </Link>
          </div>

          <nav className="flex-1 space-y-2 px-4 py-6">
            {navigation.map(({ href, label, icon: Icon }) => {
              const isActive =
                href === dashboardUrl ? pathname === href : pathname.startsWith(href);

              return (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-white text-slate-950"
                      : "text-slate-300 hover:bg-white/10 hover:text-white",
                  )}
                >
                  <Icon className="size-4" />
                  {label}
                </Link>
              );
            })}
          </nav>

          <div className="border-t border-white/10 px-4 py-5">
            <div className="flex items-center justify-between gap-3 rounded-3xl bg-white/5 px-4 py-4">
              <div>
                <p className="text-sm font-semibold">Workspace navigation</p>
                <p className="pt-2 text-sm leading-6 text-slate-400">
                  Overview, workers, participants, and notes route through the same dashboard shell.
                </p>
              </div>
              <UserButton
                appearance={{
                  elements: {
                    userButtonAvatarBox: "size-10",
                  },
                }}
              />
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
