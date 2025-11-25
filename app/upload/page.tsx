"use client";

import { useState } from "react";
import { UploadHeader } from "@/components/upload-header";
import useFfmpegWasm from "@/queries/useFfmpegWasm";
import useTranscode, { TranscodeOutput } from "@/mutations/useTranscode";
import useWalletUploadBlobs from "@/mutations/useWalletUploadBlobs";
import { Button } from "@/components/ui/button";

// Sample video for testing - replace with your own
const SAMPLE_VIDEO_URL = "/globe.mp4";

type Step = "record" | "transcode" | "confirm" | "complete";

export default function Upload() {
  const [step, setStep] = useState<Step>("record");
  const [fileId, setFileId] = useState<string | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [transcodeOutput, setTranscodeOutput] =
    useState<TranscodeOutput | null>(null);

  // Load FFmpeg WASM
  const {
    data: ffmpeg,
    isLoading: isLoadingFfmpeg,
    error: ffmpegError,
    refetch: refetchFfmpeg,
  } = useFfmpegWasm();

  // Transcode mutation
  const { mutateAsync: transcode, isPending: isTranscoding } = useTranscode({
    ffmpeg,
    onSuccess: (output) => {
      setTranscodeOutput(output);
      setStep("confirm");
    },
  });

  // Upload mutation
  const { mutateAsync: uploadBlobs, isPending: isUploading } =
    useWalletUploadBlobs({
      uploadOptions: {},
      onSuccess: () => {
        setStep("complete");
      },
    });

  // Simulate "recording" by fetching a sample video
  const handleRecord = async () => {
    const response = await fetch(SAMPLE_VIDEO_URL);
    const blob = await response.blob();
    const id = crypto.randomUUID();
    const file = new File([blob], `${id}.mp4`, {
      type: "video/mp4",
    });
    setFileId(id);
    setVideoFile(file);
    setStep("transcode");
  };

  // Start transcoding
  const handleTranscode = async () => {
    if (!videoFile) return;
    await transcode({ video: videoFile });
  };

  // Upload to Shelby
  const handleUpload = async () => {
    if (!transcodeOutput || !fileId) return;

    // Set expiration to 1 hour from now in microseconds
    const expirationMicros = (Date.now() + 60 * 60 * 1000) * 1000;

    // Prepend fileId to all blob names
    const blobsWithPrefix = transcodeOutput.blobs.map((blob) => ({
      ...blob,
      blobName: `${fileId}/${blob.blobName}`,
    }));

    await uploadBlobs({
      blobs: blobsWithPrefix,
      expirationMicros,
    });
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden">
      <UploadHeader />
      <div className="flex-1 overflow-auto bg-black p-8">
        <div className="max-w-md mx-auto space-y-6">
          {/* Step indicator */}
          <div className="text-white text-sm">
            Step: {step} | FFmpeg:{" "}
            {isLoadingFfmpeg
              ? "Loading..."
              : ffmpegError
              ? "Error"
              : ffmpeg
              ? "Ready"
              : "Not loaded"}
          </div>

          {/* FFmpeg Error */}
          {ffmpegError && (
            <div className="bg-red-900/50 border border-red-500 rounded p-4 space-y-2">
              <p className="text-red-300 text-sm font-medium">
                Failed to load FFmpeg
              </p>
              <p className="text-red-400 text-xs">{ffmpegError.message}</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetchFfmpeg()}
              >
                Retry
              </Button>
            </div>
          )}

          {/* Step 1: Record */}
          {step === "record" && (
            <div className="space-y-4">
              <h2 className="text-white text-xl">1. Record Video</h2>
              <p className="text-gray-400 text-sm">
                Click to simulate recording (loads sample video)
              </p>
              <Button onClick={handleRecord}>Simulate Record</Button>
            </div>
          )}

          {/* Step 2: Transcode */}
          {step === "transcode" && (
            <div className="space-y-4">
              <h2 className="text-white text-xl">2. Transcode Video</h2>
              <p className="text-gray-400 text-sm">
                Video loaded: {videoFile?.name} (
                {((videoFile?.size ?? 0) / 1024 / 1024).toFixed(2)} MB)
              </p>
              <Button
                onClick={handleTranscode}
                disabled={isTranscoding || !ffmpeg}
              >
                {isTranscoding ? "Transcoding..." : "Start Transcode"}
              </Button>
            </div>
          )}

          {/* Step 3: Confirm & Upload */}
          {step === "confirm" && (
            <div className="space-y-4">
              <h2 className="text-white text-xl">3. Confirm & Upload</h2>
              <p className="text-gray-400 text-sm">
                Transcoded {transcodeOutput?.blobs.length ?? 0} files
              </p>
              <p className="text-gray-500 text-xs">File ID: {fileId}</p>
              <ul className="text-gray-500 text-xs max-h-40 overflow-auto">
                {transcodeOutput?.blobs.map((blob) => (
                  <li key={blob.blobName}>
                    {fileId}/{blob.blobName} (
                    {(blob.blobData.length / 1024).toFixed(2)} KB)
                  </li>
                ))}
              </ul>
              <Button onClick={handleUpload} disabled={isUploading}>
                {isUploading ? "Uploading..." : "Upload to Shelby"}
              </Button>
            </div>
          )}

          {/* Step 4: Complete */}
          {step === "complete" && (
            <div className="space-y-4">
              <h2 className="text-white text-xl">✓ Upload Complete!</h2>
              <p className="text-gray-400 text-sm">
                Your video has been uploaded to Shelby.
              </p>
              <Button
                onClick={() => {
                  setStep("record");
                  setFileId(null);
                  setVideoFile(null);
                  setTranscodeOutput(null);
                }}
              >
                Upload Another
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
