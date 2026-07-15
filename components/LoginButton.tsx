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
      className="rounded-md bg-yellow-500 px-6 py-3 font-medium text-black hover:bg-yellow-400 disabled:opacity-50"
    >
      Sign in with Google
    </button>
  );
}
