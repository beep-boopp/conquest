"use client";

import { useRouter } from "next/navigation";

export function LoginButton() {
  const router = useRouter();

  function handleClick() {
    // TODO: call Privy's login() once @privy-io/react-auth is installed —
    // Google login -> embedded Solana wallet. Until then, skip straight to
    // the dashboard — identity is simulated via the WalletSelector there.
    router.push("/dashboard");
  }

  return (
    <button onClick={handleClick} className="rounded-md bg-black px-4 py-2 text-white">
      Sign in with Google
    </button>
  );
}
