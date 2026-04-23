import type { ReactNode } from "react";

import { MobileBottomNav, Sidebar } from "@/components/dashboard/sidebar";

export default function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen md:flex">
      <Sidebar />
      <main className="dashboard-main min-w-0 flex-1 md:h-screen md:overflow-y-auto">
        <div className="w-full px-4 pt-[calc(env(safe-area-inset-top)+1rem)] pb-[calc(env(safe-area-inset-bottom)+112px)] md:px-6 md:pt-4 md:pb-8 lg:px-8">
          {children}
        </div>
      </main>
      <MobileBottomNav />
    </div>
  );
}
