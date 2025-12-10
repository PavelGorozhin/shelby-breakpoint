"use client";

import {
  MediaController,
  MediaControlBar,
  MediaTimeRange,
  MediaMuteButton,
} from "media-chrome/react";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";

interface VideoPreviewProps {
  mediaBlobUrl: string;
  description?: string;
}

export function VideoPreview({
  mediaBlobUrl,
  description = "",
}: VideoPreviewProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Thumbnail Trigger */}
      <button
        onClick={() => setIsOpen(true)}
        className="relative w-24 aspect-9/16 bg-black rounded-lg overflow-hidden border-2 border-border cursor-zoom-in hover:border-primary/90 transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 mx-auto block group"
      >
        <video
          src={mediaBlobUrl}
          className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
          muted
          playsInline
        />
        <div className="absolute inset-0 bg-black/10 hover:bg-black/0 transition-colors" />
      </button>

      {/* Full Screen Preview Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-md p-0 overflow-hidden border-none h-[80vh] w-full aspect-9/16">
          <div className="hidden">
            <DialogTitle>Video Preview</DialogTitle>
            <DialogDescription>
              Full screen preview of your recorded video with description
              overlay.
            </DialogDescription>
          </div>

          <div className="relative h-full w-full bg-black">
            <MediaController
              className="w-full h-full"
              suppressHydrationWarning
              autohide="-1"
            >
              <video
                slot="media"
                src={mediaBlobUrl}
                preload="auto"
                playsInline
                muted
                loop
                webkit-playsinline="true"
                x-webkit-airplay="allow"
                crossOrigin=""
                className="w-full h-full object-cover"
                autoPlay
              />
              <MediaControlBar className="px-4 pb-8 gap-4 bg-linear-to-t from-black/80 via-black/40 to-transparent">
                <MediaTimeRange className="bg-transparent" />
                <MediaMuteButton className="bg-transparent px-2" />
              </MediaControlBar>
            </MediaController>

            {/* Reflected Description */}
            <div className="absolute bottom-24 left-4 right-4 z-10 pointer-events-none">
              <p className="text-white text-sm drop-shadow-lg wrap-break-word line-clamp-3">
                {description}
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
