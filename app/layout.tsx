import type { Metadata } from "next";
import "./globals.css";

// TODO: wrap children in a PrivyProvider once @privy-io/react-auth is
// installed (Google login -> embedded Solana wallet).

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
      <body className="antialiased">{children}</body>
    </html>
  );
}
