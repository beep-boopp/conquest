"use client";

import { useEffect, useState } from "react";

export function InviteLink({ roomAddress }: { roomAddress: string }) {
  const [origin, setOrigin] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  if (!origin) return null;

  const link = `${origin}/join/${roomAddress}`;

  async function handleCopy() {
    await navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="flex items-center gap-2 rounded-lg border border-neutral-800 bg-neutral-900 p-2 text-sm">
      <span className="truncate text-neutral-400">{link}</span>
      <button
        onClick={handleCopy}
        className="shrink-0 rounded bg-yellow-500 px-2 py-1 text-xs font-medium text-black hover:bg-yellow-400"
      >
        {copied ? "Copied!" : "Copy invite link"}
      </button>
    </div>
  );
}
