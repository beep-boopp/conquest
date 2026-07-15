"use client";

import { useState } from "react";

import { truncateAddress } from "@/lib/utils";

export function WalletAddressBadge({ address }: { address: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button
      onClick={handleCopy}
      title={address}
      className="rounded border border-neutral-700 px-2 py-1 text-neutral-400 hover:bg-neutral-800 hover:text-neutral-200"
    >
      {copied ? "Copied!" : truncateAddress(address)}
    </button>
  );
}
