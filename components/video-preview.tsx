"use client";

import {
  MediaController,
  MediaControlBar,
  MediaTimeRange,
  MediaTimeDisplay,
  MediaPlayButton,
  MediaMuteButton,
} from "media-chrome/react";
import { Button } from "@/components/ui/button";
import { ReloadIcon, CheckIcon } from "@radix-ui/react-icons";

interface VideoPreviewProps {
  mediaBlobUrl: string;
  onConfirm: () => void;
  onRetake: () => void;
  isProcessing?: boolean;
  processingLabel?: string;
}

export function VideoPreview({
  mediaBlobUrl,
  onConfirm,
  onRetake,
  isProcessing = false,
  processingLabel = "Processing...",
}: VideoPreviewProps) {
  return (
    <div className="flex flex-col h-full">
      {/* Video Preview - fills available space */}
      <div className="relative flex-1 bg-card rounded-lg overflow-hidden">
        <MediaController className="w-full h-full" suppressHydrationWarning>
          <video
            slot="media"
            src={mediaBlobUrl}
            preload="auto"
            playsInline
            className="w-full h-full object-cover"
          />
          <MediaControlBar>
            <MediaPlayButton />
            <MediaTimeRange />
            <MediaTimeDisplay showDuration />
            <MediaMuteButton />
          </MediaControlBar>
        </MediaController>

        {/* Top overlay - Title */}
        <div className="absolute top-0 left-0 right-0 p-4 z-10 pointer-events-none">
          <div className="bg-background/60 backdrop-blur-sm px-3 py-1.5 rounded-full inline-block">
            <span className="text-foreground text-sm">Review Recording</span>
          </div>
        </div>
      </div>

      {/* Bottom controls */}
      <div className="flex gap-3 mt-4">
        <Button
          onClick={onRetake}
          variant="outline"
          size="lg"
          className="flex-1 h-14 text-base"
          disabled={isProcessing}
        >
          <ReloadIcon className="w-5 h-5 mr-2" />
          Retake
        </Button>
        <Button
          onClick={onConfirm}
          size="lg"
          className="flex-1 h-14 text-base"
          disabled={isProcessing}
        >
          {isProcessing ? (
            <>
              <ReloadIcon className="w-5 h-5 mr-2 animate-spin" />
              {processingLabel}
            </>
          ) : (
            <>
              <CheckIcon className="w-5 h-5 mr-2" />
              Continue
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
