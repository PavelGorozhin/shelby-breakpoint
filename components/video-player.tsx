"use client";

import { useSwipeable } from "react-swipeable";
import { useState, useRef, useEffect, useMemo } from "react";
import {
  MediaController,
  MediaControlBar,
  MediaTimeRange,
  MediaVolumeRange,
  MediaMuteButton,
} from "media-chrome/react";
import HLS from "hls.js";
import { Video } from "@/db/schema";
import { VideoActions } from "@/components/video-actions";

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

interface VideoPlayerProps {
  videos: Video[];
  initialVideoId?: string;
}

export function VideoPlayer({
  videos: videosFromDb,
  initialVideoId,
}: VideoPlayerProps) {
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
    <div {...handlers} className="relative h-full w-full overflow-hidden">
      <MediaController
        className="w-full h-full md:rounded overflow-hidden"
        suppressHydrationWarning
      >
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

        <MediaControlBar className="px-4">
          <div className="group w-full flex">
            <MediaMuteButton className="bg-transparent" />
            <MediaVolumeRange className="bg-transparent group-hover:opacity-100 opacity-0 transition-all duration-300 group-hover:w-[100px] w-0" />
          </div>
        </MediaControlBar>
        <MediaControlBar className="px-2">
          <MediaTimeRange className="bg-transparent" />
        </MediaControlBar>
      </MediaController>

      {/* Video actions - description, like, share, creator */}
      <VideoActions video={currentVideo} />
    </div>
  );
}
