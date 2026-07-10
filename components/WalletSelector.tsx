"use client";

import { useEffect, useState } from "react";

import { getTestWalletAddresses } from "@/app/actions";
import { useActiveWallet } from "@/lib/use-active-wallet";
import { truncateAddress } from "@/lib/utils";
import { TEST_WALLET_NAMES, TestWalletName } from "@/types";

// TODO: replace entirely once Privy's embedded wallet (Google login) is wired up.
export function WalletSelector() {
  const [active, setActive] = useActiveWallet();
  const [addresses, setAddresses] = useState<Record<TestWalletName, string> | null>(null);

  useEffect(() => {
    getTestWalletAddresses().then(setAddresses);
  }, []);

  return (
    <div className="flex items-center gap-2 rounded-md border p-2 text-sm">
      <span className="text-gray-500">Acting as:</span>
      <select
        value={active}
        onChange={(e) => setActive(e.target.value as TestWalletName)}
        className="rounded border px-2 py-1"
      >
        {TEST_WALLET_NAMES.map((name) => (
          <option key={name} value={name}>
            {name}
          </option>
        ))}
      </select>
      {addresses && <span className="text-gray-500">{truncateAddress(addresses[active])}</span>}
    </div>
  );
}
