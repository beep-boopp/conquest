"use client";

import { PrivyProvider } from "@privy-io/react-auth";
import { createSolanaRpc, createSolanaRpcSubscriptions } from "@solana/kit";

import { DEVNET_RPC_URL } from "@/lib/constants";

const DEVNET_WS_URL = DEVNET_RPC_URL.replace(/^http/, "ws");

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
        // Without this, Privy's Solana wallet defaults any unspecified
        // `chain` to 'solana:mainnet' and throws "No RPC configuration
        // found" since we never configure a mainnet RPC (see
        // lib/use-conquest-actions.ts, which now also passes
        // chain: "solana:devnet" explicitly on every sign call — belt and
        // suspenders, since either alone fixes the symptom but not the
        // other's failure mode).
        solana: {
          rpcs: {
            "solana:devnet": {
              rpc: createSolanaRpc(DEVNET_RPC_URL),
              rpcSubscriptions: createSolanaRpcSubscriptions(DEVNET_WS_URL),
            },
          },
        },
      }}
    >
      {children}
    </PrivyProvider>
  );
}
