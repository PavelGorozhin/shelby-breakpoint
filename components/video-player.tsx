"use client";

import { useRef, useEffect, useState } from "react";
import {
  MediaController,
  MediaControlBar,
  MediaTimeRange,
  MediaMuteButton,
} from "media-chrome/react";
import HLS from "hls.js";
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
}

export function VideoPlayer({ video, isActive = true }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<HLS | null>(null);
  const isActiveRef = useRef(isActive);
  const [isPlaying, setIsPlaying] = useState(isActive);

  useEffect(() => {
    isActiveRef.current = isActive;
  }, [isActive]);

  // Setup HLS.js for .m3u8 streams or regular video (TODO: Replace with Shaka)
  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement || !video) return;

    const url = video.url;
    const isHLS = url.endsWith(".m3u8");

    // Cleanup previous HLS instance
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    if (isHLS && HLS.isSupported()) {
      const hls = new HLS();
      hlsRef.current = hls;
      hls.loadSource(url);
      hls.attachMedia(videoElement);
      hls.on(HLS.Events.MANIFEST_PARSED, () => {
        if (isActiveRef.current) {
          videoElement.play().catch((error) => {
            console.log("Autoplay prevented:", error);
          });
        }
      });
    } else if (
      isHLS &&
      videoElement.canPlayType("application/vnd.apple.mpegurl")
    ) {
      // Native HLS support (Safari)
      videoElement.src = url;
      videoElement.addEventListener("loadedmetadata", () => {
        if (isActiveRef.current) {
          videoElement.play().catch((error) => {
            console.log("Autoplay prevented:", error);
          });
        }
      });
    } else {
      // Regular video file
      videoElement.src = url;
      videoElement.load();
      if (isActiveRef.current) {
        videoElement.play().catch((error) => {
          console.log("Autoplay prevented:", error);
        });
      }
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [video]);

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
