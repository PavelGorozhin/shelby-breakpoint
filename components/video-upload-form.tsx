"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ReloadIcon, CheckIcon } from "@radix-ui/react-icons";
import { Textarea } from "@/components/ui/textarea";
import Loader from "@/components/ui/loader";

interface VideoUploadFormProps {
  onConfirm: (description: string) => void;
  onRetake: () => void;
  isProcessing?: boolean;
  processingLabel?: string;
  onDescriptionChange: (description: string) => void;
  children?: React.ReactNode;
}

export function VideoUploadForm({
  onConfirm,
  onRetake,
  isProcessing = false,
  processingLabel = "Processing...",
  onDescriptionChange,
  children,
}: VideoUploadFormProps) {
  const [description, setDescription] = useState("");

  const handleDescriptionChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    const value = e.target.value;
    setDescription(value);
    onDescriptionChange(value);
  };

  return (
    <div className="flex flex-col gap-4 h-full w-full bg-card rounded-lg p-6 border">
      <div className="flex justify-start items-start w-full">{children}</div>

      <div>
        <h2 className="text-xl font-gt-planar font-bold mb-1 mt-4">
          Share some details
        </h2>
        <p className="text-sm text-muted-foreground">
          Provide some details about your video.
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-3">
          <label className=" font-gt-planar font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            Description
          </label>
          <Textarea
            rows={3}
            placeholder="What's happening in this video?"
            value={description}
            onChange={handleDescriptionChange}
            className="resize-none mt-1 text-sm"
          />
          <p className="text-xs text-muted-foreground">
            This will be displayed to viewers.
          </p>
        </div>
      </div>

      <div className="flex-1" />

      <div className="flex gap-3 pt-2">
        <Button
          onClick={onRetake}
          variant="outline"
          size="lg"
          className="flex-1"
          disabled={isProcessing}
        >
          <ReloadIcon className="w-4 h-4 mr-2" />
          Retake
        </Button>
        <Button
          onClick={() => onConfirm(description)}
          size="lg"
          className="flex-1"
          disabled={isProcessing}
        >
          {isProcessing ? (
            <>
              <Loader size="md" className="mr-2" />
              {processingLabel}
            </>
          ) : (
            <>
              <CheckIcon className="w-4 h-4 mr-2" />
              Upload
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
