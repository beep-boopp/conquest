import type { Metadata } from "next";
import "./globals.css";

import { PrivyProviders } from "@/components/PrivyProviders";

// Every route is wrapped in PrivyProvider (below), which initializes with a
// real Privy App ID at runtime. Forcing dynamic rendering means that
// initialization happens per-request instead of at build time — build
// doesn't need a valid App ID, and there's no upside to statically
// prerendering pages that immediately branch on client-side auth state.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "ConquestBet",
  description: "Wager land on World Cup matches with your friends.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <PrivyProviders>{children}</PrivyProviders>
      </body>
    </html>
  );
}
