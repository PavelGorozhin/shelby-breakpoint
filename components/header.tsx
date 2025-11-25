"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export function Header() {
  const router = useRouter();

  const handleUploadClick = () => {
    // Use window.location to force full page reload for COOP/COEP headers
    window.location.href = "/upload";
  };

  return (
    <header className="flex items-center justify-between px-6 py-4 bg-black border-b border-zinc-800 shrink-0">
      <div
        className="flex items-center cursor-pointer"
        onClick={() => router.push("/")}
      >
        <h1 className="text-white text-xl font-semibold">Shelby Breakpoint</h1>
      </div>
      <Button
        onClick={handleUploadClick}
        variant="secondary"
        className="bg-white hover:bg-zinc-200 text-black"
      >
        Upload Video
      </Button>
    </header>
  );
}
