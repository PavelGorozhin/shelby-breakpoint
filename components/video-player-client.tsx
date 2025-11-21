"use client";

import { useSwipeable } from "react-swipeable";
import { useState } from "react";
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

interface Video {
  id: number;
  url: string;
  title: string;
}

// Mock video data - using sample videos
const videos: Video[] = [
  {
    id: 1,
    url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    title: "Video 1",
  },
  {
    id: 2,
    url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
    title: "Video 2",
  },
  {
    id: 3,
    url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    title: "Video 3",
  },
];

export function VideoPlayerClient() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleSwipeUp = () => {
    // Swipe up = go to previous video, or wrap to last if at the beginning
    setCurrentIndex((currentIndex - 1 + videos.length) % videos.length);
  };

  const handleSwipeDown = () => {
    // Swipe down = go to next video, or wrap to first if at the end
    setCurrentIndex((currentIndex + 1) % videos.length);
  };

  const handlers = useSwipeable({
    onSwipedUp: handleSwipeUp,
    onSwipedDown: handleSwipeDown,
    preventScrollOnSwipe: true,
    trackMouse: true,
  });

  return (
    <div
      {...handlers}
      className="relative h-full w-full bg-black overflow-hidden"
    >
      <MediaController className="w-full h-full" suppressHydrationWarning>
        <video
          key={videos[currentIndex].id}
          slot="media"
          src={videos[currentIndex].url}
          preload="auto"
          autoPlay
          muted
          loop
          playsInline
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
