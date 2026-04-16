import type { ReactNode } from "react";
import { auth } from "@clerk/nextjs/server";

import { Sidebar } from "@/components/dashboard/sidebar";

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  await auth.protect();

  return (
    <div className="min-h-screen px-4 py-4 sm:px-6 lg:px-8">
      <div className="container">
        <div className="page-shell overflow-hidden">
          <div className="flex min-h-[calc(100vh-2rem)] flex-col md:flex-row">
            <Sidebar />
            <main className="flex-1 bg-white/55 p-5 sm:p-8">{children}</main>
          </div>
        </div>
      </div>
    </div>
  );
}
