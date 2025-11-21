"use client";

import { Button } from "@/components/ui/button";

export function Header() {
  const handleUploadClick = () => {
    // Placeholder - will redirect to upload page later
    console.log("Upload button clicked");
  };

  return (
    <header className="flex items-center justify-between px-6 py-4 bg-black border-b border-zinc-800 shrink-0">
      <div className="flex items-center">
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
