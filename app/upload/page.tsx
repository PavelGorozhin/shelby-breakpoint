"use client";

import { UploadHeader } from "@/components/upload-header";

export default function Upload() {
  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden">
      <UploadHeader />
      <div className="flex-1 overflow-auto bg-black">
        {/* TODO: Upload Video View */}
      </div>
    </div>
  );
}
