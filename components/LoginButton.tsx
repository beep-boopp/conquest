"use client";

import { usePrivy } from "@privy-io/react-auth";

export function LoginButton() {
  const { ready, login } = usePrivy();

  function handleClick() {
    login({ loginMethods: ["google"] });
  }

  return (
    <button
      onClick={handleClick}
      disabled={!ready}
      className="rounded-md bg-black px-4 py-2 text-white disabled:opacity-50"
    >
      Sign in with Google
    </button>
  );
}
