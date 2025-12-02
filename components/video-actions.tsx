"use client";

import { useState } from "react";
import { Heart, Share2 } from "lucide-react";
import Avatar from "boring-avatars";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Video } from "@/db/schema";
import { cn } from "@/lib/utils";

interface VideoActionsProps {
  video: Video;
}

export function VideoActions({ video }: VideoActionsProps) {
  const router = useRouter();
  const [isLiked, setIsLiked] = useState(false);

  const handleCreatorClick = () => {
    if (video.account) {
      router.push(`/profile/${video.account}`);
    }
  };

  const handleLike = () => {
    setIsLiked((prev) => !prev);
  };

  const handleShare = async () => {
    const url = `${window.location.origin}/?id=${video.fileId}`;
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Link copied to clipboard");
    } catch {
      toast.error("Failed to copy link");
    }
  };

  return (
    <>
      {/* Description overlay - above controls */}
      <div className="absolute bottom-24 left-0 right-16 px-4 z-10 pointer-events-none">
        {video.description && (
          <p className="text-white text-sm drop-shadow-lg line-clamp-3">
            {video.description}
          </p>
        )}
      </div>

      {/* Right sidebar - Like, Share, Creator */}
      <div className="absolute right-3 bottom-32 flex flex-col items-center gap-4 z-20">
        {/* Creator Avatar */}
        {video.account && (
          <Button
            size="icon"
            onClick={handleCreatorClick}
            className="w-12 h-12 rounded-full p-0 overflow-hidden transition-all hover:bg-transparent"
            asChild
          >
            <Avatar
              size={48}
              name={video.account}
              variant="beam"
              colors={["#6366f1", "#8b5cf6", "#a855f7", "#d946ef", "#ec4899"]}
            />
          </Button>
        )}

        {/* Like Button */}
        <div className="flex flex-col items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleLike}
            className={cn(
              "w-12 h-12 rounded-full backdrop-blur-sm transition-all",
              isLiked
                ? "bg-red-500 hover:bg-red-600 hover:text-white text-white"
                : "bg-black/30 hover:bg-black/50 text-white"
            )}
          >
            <Heart
              className={cn("w-6 h-6", isLiked ? "fill-current" : "")}
              strokeWidth={isLiked ? 0 : 2}
            />
          </Button>
          <span className="text-background text-xs drop-shadow-lg">300</span>
        </div>

        {/* Share Button */}
        <div className="flex flex-col items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleShare}
            className="w-12 h-12 rounded-full bg-black/30 hover:bg-black/50 backdrop-blur-sm hover:text-white text-white"
          >
            <Share2 className="w-6 h-6" />
          </Button>
          <span className="text-background text-xs drop-shadow-lg">20</span>
        </div>
      </div>
    </>
  );
}
