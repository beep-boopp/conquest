"use client";

import { useEffect, useState } from "react";

import { TestWalletName } from "@/types";

const STORAGE_KEY = "conquestbet:active-wallet";

/**
 * Client-side "who am I acting as" for pre-Privy testing — persisted to
 * localStorage so it survives navigation between dashboard/room pages.
 * Swap target once Privy lands: replace with the logged-in user's identity.
 */
export function useActiveWallet(): [TestWalletName, (name: TestWalletName) => void] {
  const [active, setActive] = useState<TestWalletName>("player-a");

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as TestWalletName | null;
    if (stored) setActive(stored);
  }, []);

  function update(name: TestWalletName) {
    setActive(name);
    localStorage.setItem(STORAGE_KEY, name);
  }

  return [active, update];
}
