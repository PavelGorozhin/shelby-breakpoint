"use client";

import { SolanaWalletSelector } from "./solana-wallet-selector";
import { useRouter } from "next/navigation";

export function UploadHeader() {
  const router = useRouter();

  return (
    <header className="flex items-center justify-between px-6 py-4 bg-black border-b border-zinc-800 shrink-0">
      <div
        className="flex items-center cursor-pointer"
        onClick={() => router.push("/")}
      >
        <h1 className="text-white text-xl font-semibold">Shelby Breakpoint</h1>
      </div>
      <SolanaWalletSelector />
    </header>
  );
}
