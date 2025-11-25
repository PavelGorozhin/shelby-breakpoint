"use client";

import { useRef, useEffect, useState } from "react";
import { ReactMediaRecorder } from "react-media-recorder";
import { Button } from "@/components/ui/button";
import { VideoIcon, UpdateIcon, CrossCircledIcon } from "@radix-ui/react-icons";
import useIsClient from "@/queries/useIsClient";
import { formatTime } from "@/lib/time";
import { checkMediaSupported, getMediaMimeType } from "@/lib/media";
import { cn } from "@/lib/utils";

const MAX_RECORDING_TIME_SECONDS = 10;

type FacingMode = "user" | "environment";

interface VideoRecorderClientProps {
  onRecordingComplete: (mediaBlobUrl: string, fileId: string) => void;
}

export function VideoRecorderClient({
  onRecordingComplete,
}: VideoRecorderClientProps) {
  const isClient = useIsClient();
  const [facingMode, setFacingMode] = useState<FacingMode>("environment");

  const handleSwitchCamera = () => {
    setFacingMode((prev) => (prev === "user" ? "environment" : "user"));
  };

  const isFrontCamera = facingMode === "user";

  // Show loading while on server
  if (!isClient) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex-1 bg-card rounded-lg animate-pulse" />
      </div>
    );
  }

  const { supported, error: supportError } = checkMediaSupported();

  // Show error if not supported
  if (!supported) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex-1 bg-card rounded-lg flex items-center justify-center">
          <div className="text-center p-6">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
              <CrossCircledIcon className="w-10 h-10 text-destructive" />
            </div>
            <p className="text-foreground font-medium mb-2">
              Camera Not Available
            </p>
            {supportError && (
              <p className="text-muted-foreground text-sm max-w-xs">
                {supportError}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  const mimeType = getMediaMimeType();

  return (
    <ReactMediaRecorder
      key={facingMode}
      video={{
        width: { ideal: 1080 },
        height: { ideal: 1920 },
        facingMode,
      }}
      audio
      mediaRecorderOptions={{ mimeType }}
      askPermissionOnMount
      onStop={(blobUrl) => {
        const id = crypto.randomUUID();
        onRecordingComplete(blobUrl, id);
      }}
      render={({
        status,
        startRecording,
        stopRecording,
        mediaBlobUrl,
        previewStream,
        clearBlobUrl,
        error,
      }) => (
        <RecorderOverlay
          status={status}
          startRecording={startRecording}
          stopRecording={stopRecording}
          mediaBlobUrl={mediaBlobUrl}
          previewStream={previewStream}
          clearBlobUrl={clearBlobUrl}
          error={error}
          facingMode={facingMode}
          isFrontCamera={isFrontCamera}
          onSwitchCamera={handleSwitchCamera}
        />
      )}
    />
  );
}

export interface RecorderOverlayProps {
  status: string;
  startRecording: () => void;
  stopRecording: () => void;
  mediaBlobUrl: string | undefined;
  previewStream: MediaStream | null;
  clearBlobUrl: () => void;
  error: string;
  facingMode: FacingMode;
  isFrontCamera: boolean;
  onSwitchCamera: () => void;
}

function RecorderOverlay({
  status,
  startRecording,
  stopRecording,
  mediaBlobUrl,
  previewStream,
  clearBlobUrl,
  error,
  facingMode,
  isFrontCamera,
  onSwitchCamera,
}: RecorderOverlayProps) {
  const videoPreviewRef = useRef<HTMLVideoElement>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const stopRecordingRef = useRef(stopRecording);

  const isRecording = status === "recording";
  const isStopped = status === "stopped";
  const hasError = !!error;

  // Keep ref updated
  useEffect(() => {
    stopRecordingRef.current = stopRecording;
  }, [stopRecording]);

  // Attach preview stream to video element
  useEffect(() => {
    if (videoPreviewRef.current && previewStream) {
      videoPreviewRef.current.srcObject = previewStream;
    }
  }, [previewStream]);

  // Recording timer
  useEffect(() => {
    if (isRecording) {
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => {
          const newTime = prev + 1;
          if (newTime >= MAX_RECORDING_TIME_SECONDS) {
            stopRecordingRef.current();
          }
          return newTime;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isRecording]);

  const handleStartRecording = () => {
    clearBlobUrl();
    setRecordingTime(0);
    startRecording();
  };

  const getStatusMessage = () => {
    if (hasError) return `Error: ${error}`;
    switch (status) {
      case "idle":
        return "Ready to record";
      case "acquiring_media":
        return "Accessing camera...";
      case "recording":
        return "Recording";
      case "stopping":
        return "Stopping...";
      case "stopped":
        return "Recording complete";
      default:
        return status;
    }
  };

  const getErrorMessage = (errorCode: string) => {
    switch (errorCode) {
      case "permission_denied":
        return "Camera permission was denied. Please allow camera access and try again.";
      case "no_specified_media_found":
        return "No camera found. Please connect a camera and try again.";
      case "media_in_use":
        return "Camera is being used by another application.";
      case "invalid_media_constraints":
        return "Camera settings are not supported by your device.";
      default:
        return `An error occurred: ${errorCode}`;
    }
  };

  return (
    <div className="flex flex-1 flex-col h-full">
      {/* Video Preview - fills available space */}
      <div className="relative flex-1 bg-card rounded-lg overflow-hidden">
        {/* Live preview - always rendered to prevent flickering */}
        <video
          ref={videoPreviewRef}
          className={cn(
            "absolute inset-0 w-full h-full object-cover",
            isFrontCamera && "scale-x-[-1]",
            previewStream && !isStopped ? "opacity-100" : "opacity-0"
          )}
          autoPlay
          muted
          playsInline
        />

        {/* Top overlay - Status & Camera switch */}
        <div className="absolute top-0 left-0 right-0 p-4 flex items-start justify-between z-10">
          {/* Recording indicator or Status */}
          {isRecording ? (
            <div className="flex items-center gap-2 bg-background/60 backdrop-blur-sm px-3 py-1.5 rounded-full">
              <div className="w-3 h-3 bg-destructive rounded-full animate-pulse" />
              <span className="text-foreground text-sm font-mono">
                {formatTime(recordingTime)} /{" "}
                {formatTime(MAX_RECORDING_TIME_SECONDS)}
              </span>
            </div>
          ) : (
            <div className="bg-background/60 backdrop-blur-sm px-3 py-1.5 rounded-full">
              <span className="text-foreground text-sm">
                {getStatusMessage()}
              </span>
            </div>
          )}

          {/* Camera switch button */}
          {!isStopped && !isRecording && (
            <button
              onClick={onSwitchCamera}
              className="w-10 h-10 bg-background/60 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-background/80 transition-colors"
              title={`Switch to ${
                facingMode === "user" ? "back" : "front"
              } camera`}
            >
              <UpdateIcon className="w-5 h-5 text-foreground" />
            </button>
          )}
        </div>

        {/* Recorded video playback */}
        {isStopped && mediaBlobUrl && (
          <video
            src={mediaBlobUrl}
            className="absolute inset-0 w-full h-full object-cover z-10"
            controls
            autoPlay
            loop
            playsInline
          />
        )}

        {/* Placeholder when no preview */}
        {!previewStream && !mediaBlobUrl && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                <VideoIcon className="w-10 h-10 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground">Camera preview</p>
            </div>
          </div>
        )}

        {/* Error message overlay */}
        {hasError && (
          <div className="absolute bottom-20 left-4 right-4 bg-destructive/90 backdrop-blur-sm rounded-lg p-3 z-20">
            <p className="text-destructive-foreground text-sm">
              {getErrorMessage(error)}
            </p>
          </div>
        )}

        {/* Bottom overlay - Progress bar when recording */}
        {isRecording && (
          <div className="absolute bottom-20 left-4 right-4 z-10">
            <div className="w-full bg-background/40 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-destructive h-full transition-all duration-1000"
                style={{
                  width: `${
                    (recordingTime / MAX_RECORDING_TIME_SECONDS) * 100
                  }%`,
                }}
              />
            </div>
          </div>
        )}

        {/* Bottom controls overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-4 z-10">
          <div className="flex gap-3">
            {!isRecording && !isStopped && (
              <Button
                onClick={handleStartRecording}
                variant="destructive"
                size="lg"
                className="flex-1 h-14 text-base"
              >
                {hasError ? "Try Again" : "Start Recording"}
              </Button>
            )}

            {isRecording && (
              <Button
                onClick={stopRecording}
                variant="destructive"
                size="lg"
                className="flex-1 h-14 text-base"
              >
                Stop ({formatTime(MAX_RECORDING_TIME_SECONDS - recordingTime)})
              </Button>
            )}

            {isStopped && !hasError && (
              <Button
                onClick={() => {
                  clearBlobUrl();
                }}
                variant="outline"
                size="lg"
                className="flex-1 h-14 text-base bg-background/60 backdrop-blur-sm"
              >
                Record Again
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
