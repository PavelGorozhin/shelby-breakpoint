"use client";

import { useSwipeable } from "react-swipeable";
import { useState, useRef, useEffect, useMemo } from "react";
import {
  MediaController,
  MediaControlBar,
  MediaTimeRange,
  MediaTimeDisplay,
  MediaVolumeRange,
  MediaPlayButton,
  MediaMuteButton,
  MediaFullscreenButton,
} from "media-chrome/react";
import HLS from "hls.js";
import { Video } from "@/db/schema";

// Default sample videos - always included
const defaultVideos: Video[] = [
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

interface VideoPlayerClientProps {
  videos: Video[];
  initialVideoId?: string;
}

export function VideoPlayerClient({
  videos: videosFromDb,
  initialVideoId,
}: VideoPlayerClientProps) {
  // Combine DB videos with default videos (DB videos first)
  const videos = useMemo(
    () => [...videosFromDb, ...defaultVideos],
    [videosFromDb]
  );

  // Find initial index based on fileId or id from query param
  const initialIndex = useMemo(() => {
    if (!initialVideoId || videos.length === 0) return 0;
    const index = videos.findIndex(
      (v) => v.fileId === initialVideoId || v.id.toString() === initialVideoId
    );
    return index >= 0 ? index : 0;
  }, [initialVideoId, videos]);

  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<HLS | null>(null);

  const handleSwipeUp = () => {
    if (videos.length === 0) return;
    // Swipe up = go to previous video, or wrap to last if at the beginning
    setCurrentIndex((currentIndex - 1 + videos.length) % videos.length);
  };

  const handleSwipeDown = () => {
    if (videos.length === 0) return;
    // Swipe down = go to next video, or wrap to first if at the end
    setCurrentIndex((currentIndex + 1) % videos.length);
  };

  const handlers = useSwipeable({
    onSwipedUp: handleSwipeUp,
    onSwipedDown: handleSwipeDown,
    preventScrollOnSwipe: true,
    trackMouse: true,
  });

  const currentVideo = videos[currentIndex];

  // Setup HLS.js for .m3u8 streams or regular video (TODO: Replace with Shaka)
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !currentVideo) return;

    const url = currentVideo.url;
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
      hls.attachMedia(video);
      hls.on(HLS.Events.MANIFEST_PARSED, () => {
        video.play().catch((error) => {
          console.log("Autoplay prevented:", error);
        });
      });
    } else if (isHLS && video.canPlayType("application/vnd.apple.mpegurl")) {
      // Native HLS support (Safari)
      video.src = url;
      video.addEventListener("loadedmetadata", () => {
        video.play().catch((error) => {
          console.log("Autoplay prevented:", error);
        });
      });
    } else {
      // Regular video file
      video.src = url;
      video.load();
      video.play().catch((error) => {
        console.log("Autoplay prevented:", error);
      });
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [currentIndex, currentVideo]);

  return (
    <div
      {...handlers}
      className="relative h-full w-full bg-black overflow-hidden"
    >
      <MediaController className="w-full h-full" suppressHydrationWarning>
        <video
          ref={videoRef}
          key={currentVideo.id}
          slot="media"
          preload="auto"
          autoPlay
          muted
          loop
          playsInline
          webkit-playsinline="true"
          x-webkit-airplay="allow"
          crossOrigin=""
          className="w-full h-full object-cover"
        />
        <MediaControlBar>
          <MediaPlayButton />
          <MediaTimeRange />
          <MediaTimeDisplay showDuration />
          <MediaMuteButton />
          <MediaVolumeRange />
          <MediaFullscreenButton />
        </MediaControlBar>
      </MediaController>

      {/* Navigation hints - always show since it's infinite scroll */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 text-white/50 text-sm z-10 pointer-events-none">
        ↑ Swipe up for previous
      </div>
      <div className="absolute bottom-28 left-1/2 -translate-x-1/2 text-white/50 text-sm z-10 pointer-events-none">
        ↓ Swipe down for next
      </div>
    </div>
  );
}
