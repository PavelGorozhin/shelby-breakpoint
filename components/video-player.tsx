"use client";

import { useRef, useEffect, useState } from "react";
import {
  MediaController,
  MediaControlBar,
  MediaTimeRange,
  MediaMuteButton,
} from "media-chrome/react";
import { Video } from "@/db/schema";
import { VideoActions } from "@/components/video-actions";

// Default sample videos - always included
export const defaultVideos: Video[] = [
  {
    id: -1,
    fileId: "sample-1",
    account: "",
    description: "Big Buck Bunny",
    email: "bigbuckbunny@example.com",
    url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    createdAt: new Date(),
  },
  {
    id: -2,
    fileId: "sample-2",
    account: "",
    description: "Elephants Dream",
    email: "elephantsdream@example.com",
    url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
    createdAt: new Date(),
  },
  {
    id: -3,
    fileId: "sample-3",
    account: "",
    description: "For Bigger Blazes",
    email: "forbiggerblazes@example.com",
    url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    createdAt: new Date(),
  },
];

interface VideoPlayerProps {
  video: Video;
  isActive?: boolean;
  authToken?: string;
}

export function VideoPlayer({
  video,
  isActive = true,
  authToken,
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const isActiveRef = useRef(isActive);
  const [isPlaying, setIsPlaying] = useState(isActive);
  const mediaSourceUrlRef = useRef<string | null>(null);

  useEffect(() => {
    isActiveRef.current = isActive;
  }, [isActive]);

  // Setup video source
  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement || !video) return;

    // Cleanup previous MediaSource URL
    if (mediaSourceUrlRef.current) {
      URL.revokeObjectURL(mediaSourceUrlRef.current);
      mediaSourceUrlRef.current = null;
    }

    // If auth token is provided, use MediaSource to stream with authorization header
    if (authToken) {
      const controller = new AbortController();
      const mediaSource = new MediaSource();
      const mediaSourceUrl = URL.createObjectURL(mediaSource);
      mediaSourceUrlRef.current = mediaSourceUrl;
      videoElement.src = mediaSourceUrl;

      mediaSource.addEventListener("sourceopen", async () => {
        // Determine MIME type from URL extension
        const extension = video.url.split(".").pop()?.toLowerCase();
        const mimeType =
          extension === "webm"
            ? 'video/webm; codecs="vp8, vorbis"'
            : 'video/mp4; codecs="avc1.42E01E, mp4a.40.2"';

        if (!MediaSource.isTypeSupported(mimeType)) {
          console.error("MIME type not supported:", mimeType);
          return;
        }

        const sourceBuffer = mediaSource.addSourceBuffer(mimeType);

        try {
          const response = await fetch(video.url, {
            headers: {
              Authorization: `Bearer ${authToken}`,
            },
            signal: controller.signal,
          });

          if (!response.ok) throw new Error("Failed to fetch video");
          if (!response.body) throw new Error("No response body");

          const reader = response.body.getReader();

          const processStream = async () => {
            while (true) {
              const { done, value } = await reader.read();

              if (done) {
                // Wait for any pending updates before ending the stream
                if (sourceBuffer.updating) {
                  await new Promise((resolve) =>
                    sourceBuffer.addEventListener("updateend", resolve, {
                      once: true,
                    })
                  );
                }
                if (mediaSource.readyState === "open") {
                  mediaSource.endOfStream();
                }
                break;
              }

              // Wait if sourceBuffer is still updating
              if (sourceBuffer.updating) {
                await new Promise((resolve) =>
                  sourceBuffer.addEventListener("updateend", resolve, {
                    once: true,
                  })
                );
              }

              sourceBuffer.appendBuffer(value);
            }
          };

          processStream();

          // Start playback once we have some data
          sourceBuffer.addEventListener(
            "updateend",
            () => {
              if (isActiveRef.current && videoElement.paused) {
                videoElement.play().catch((error) => {
                  console.log("Autoplay prevented:", error);
                });
              }
            },
            { once: true }
          );
        } catch (error) {
          if (error instanceof Error && error.name !== "AbortError") {
            console.error("Error loading video:", error);
          }
        }
      });

      return () => {
        controller.abort();
      };
    }

    // No auth token - use direct URL
    videoElement.src = video.url;
    videoElement.load();
    if (isActiveRef.current) {
      videoElement.play().catch((error) => {
        console.log("Autoplay prevented:", error);
      });
    }
  }, [video, authToken]);

  // Cleanup MediaSource URL on unmount
  useEffect(() => {
    return () => {
      if (mediaSourceUrlRef.current) {
        URL.revokeObjectURL(mediaSourceUrlRef.current);
      }
    };
  }, []);

  // Handle play/pause based on isActive prop
  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    if (isActive) {
      videoElement.play().catch((error) => {
        console.log("Autoplay prevented:", error);
      });
    } else {
      videoElement.pause();
    }
  }, [isActive]);

  const togglePlay = () => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    if (!isPlaying) {
      videoElement.play().catch((error) => {
        console.log("Play prevented:", error);
      });
    } else {
      videoElement.pause();
    }
  };

  return (
    <div className="relative h-full w-full overflow-hidden">
      <MediaController
        className="relative w-full h-full md:rounded overflow-hidden"
        suppressHydrationWarning
        autohide="-1"
      >
        <video
          ref={videoRef}
          key={video.id}
          slot="media"
          preload="auto"
          muted
          loop
          playsInline
          webkit-playsinline="true"
          x-webkit-airplay="allow"
          crossOrigin=""
          className="w-full h-full object-cover"
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onClick={togglePlay}
        />

        <MediaControlBar className="px-4 pb-8 gap-4">
          <MediaTimeRange className="bg-transparent" />
          <MediaMuteButton className="bg-transparent px-2" />
        </MediaControlBar>
      </MediaController>

      {/* Video actions - description, like, share, creator */}
      <VideoActions video={video} isPlaying={isPlaying} />
    </div>
  );
}
