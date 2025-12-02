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
import { Input } from "./ui/input";
import { Label } from "@radix-ui/react-dropdown-menu";
import { useState } from "react";
import { Textarea } from "./ui/textarea";

interface VideoPreviewProps {
  mediaBlobUrl: string;
  onConfirm: (description: string, email: string) => void;
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
  const [description, setDescription] = useState("");
  const [email, setEmail] = useState("");
  return (
    <div>
      <div className="flex flex-col gap-3">
        {/* Video Preview - fills available space */}
        <div className="relative flex-1 bg-card rounded-lg overflow-hidden min-h-[300px] lg:min-h-0">
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

        {/* Metadata */}
        <div className="flex flex-col gap-3 mt-4 w-full lg:max-w-2xl lg:mx-auto">
          <Textarea
            rows={4}
            placeholder="Add description..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <Label>Email (will not be shown publicly)</Label>
          <Input
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
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
          onClick={() => onConfirm(description, email)}
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
