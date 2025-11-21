"use client";

import dynamic from "next/dynamic";

// Disable SSR for the video player to avoid hydration issues with Media Chrome web components
export const VideoPlayer = dynamic(
  () =>
    import("./video-player-client").then((mod) => ({
      default: mod.VideoPlayerClient,
    })),
  { ssr: false }
);
