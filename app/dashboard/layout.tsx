import type { ReactNode } from "react";

import { MobileBottomNav, Sidebar } from "@/components/dashboard/sidebar";

export default function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden bg-[#f5f7fb]">
      <Sidebar />
      <main className="dashboard-main min-w-0 max-w-full md:ml-72 md:h-screen md:w-[calc(100%_-_18rem)] md:overflow-y-auto">
        <div className="dashboard-main-frame px-4 pt-[calc(env(safe-area-inset-top)+1rem)] pb-[calc(env(safe-area-inset-bottom)+var(--dashboard-mobile-nav-height)+2.5rem)] md:px-6 md:pt-6 md:pb-8 lg:px-8 lg:pt-8">
          {children}
        </div>
      </main>
      <MobileBottomNav />
    </div>
  );
}
