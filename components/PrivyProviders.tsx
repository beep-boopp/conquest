"use client";

import { PrivyProvider } from "@privy-io/react-auth";

// NEXT_PUBLIC_PRIVY_APP_ID is a placeholder until the real Privy app is
// created — see CLAUDE.md. PrivyProvider validates the App ID synchronously
// during server render (not just on use), so an empty/invalid value crashes
// every page with a 500 rather than failing gracefully at the login button.
// Skip rendering the real provider until a real ID is set, so the rest of
// the app (fixtures, layout, etc.) stays testable in the meantime.
export function PrivyProviders({ children }: { children: React.ReactNode }) {
  const appId = process.env.NEXT_PUBLIC_PRIVY_APP_ID;

  if (!appId) {
    return (
      <div className="mx-auto max-w-lg p-8 text-center">
        <p className="text-sm text-red-600">
          NEXT_PUBLIC_PRIVY_APP_ID is not set — add it to .env.local to enable login. See CLAUDE.md.
        </p>
      </div>
    );
  }

  return (
    <PrivyProvider
      appId={appId}
      config={{
        loginMethods: ["google"],
        embeddedWallets: {
          solana: {
            createOnLogin: "users-without-wallets",
          },
        },
      }}
    >
      {children}
    </PrivyProvider>
  );
}
