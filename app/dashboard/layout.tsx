import type { ReactNode } from "react";

import { Sidebar } from "@/components/dashboard/sidebar";

export default function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen px-4 py-4 md:px-5 md:py-5 lg:px-8 lg:py-6">
      <div className="mx-auto w-full max-w-7xl">
        <div className="page-shell">
          <div className="flex min-h-[calc(100vh-2rem)] flex-col md:min-h-[calc(100vh-3rem)] md:flex-row">
            <Sidebar />
            <main className="dashboard-main">{children}</main>
          </div>
        </div>
      </div>
    </div>
  );
}
