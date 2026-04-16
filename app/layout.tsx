import type { ReactNode } from "react";
import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";

import "@/styles/globals.css";
import { signInUrl } from "@/lib/routes";

export const metadata: Metadata = {
  title: "NDIS Ready",
  description: "Phase 2 app shell with Clerk authentication for the NDIS operations workspace.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <ClerkProvider afterSignOutUrl={signInUrl}>
      <html lang="en">
        <body>{children}</body>
      </html>
    </ClerkProvider>
  );
}
