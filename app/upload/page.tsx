"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { VideoPreview } from "@/components/video-preview";
import useFfmpegWasm from "@/queries/useFfmpegWasm";
import useTranscode from "@/mutations/useTranscode";
import useWalletUploadBlobs from "@/mutations/useWalletUploadBlobs";
import { createShelbyDownloadURL } from "@/lib/shelby";
import { saveVideo } from "@/actions/videos";
import { Button } from "@/components/ui/button";
import { CheckIcon, PlayIcon } from "@radix-ui/react-icons";
import { VideoRecorder } from "@/components/video-recorder";
import { toast } from "sonner";
import { UPLOAD_ALLOWLIST_ADDRESSES } from "@/lib/constants";

type Step = "record" | "preview" | "uploading" | "complete";
type UploadProgress = "processing" | "transcoding" | "uploading" | "saving";

export default function Upload() {
  const [step, setStep] = useState<Step>("record");
  const [fileId, setFileId] = useState<string | null>(null);
  const [mediaBlobUrl, setMediaBlobUrl] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] =
    useState<UploadProgress>("processing");

  const router = useRouter();
  const { account } = useWallet();

  // Load FFmpeg WASM
  const {
    data: ffmpeg,
    error: ffmpegError,
    refetch: refetchFfmpeg,
  } = useFfmpegWasm();

  const { mutateAsync: transcode } = useTranscode({ ffmpeg });
  const { mutateAsync: uploadBlobs } = useWalletUploadBlobs();

  // Process and upload mutation
  const { mutate: processAndUpload, isPending: isProcessing } = useMutation({
    mutationFn: async ({
      mediaBlobUrl,
      fileId,
      accountAddress,
      description,
      email,
    }: {
      mediaBlobUrl: string;
      fileId: string;
      accountAddress: string;
      description: string;
      email: string;
    }) => {
      // Step 1: Transcode
      setUploadProgress("transcoding");
      const transcodeOutput = await transcode({ mediaBlobUrl });

      // Step 2: Upload to Shelby
      setUploadProgress("uploading");
      const expirationMicros = (Date.now() + 60 * 60 * 1000) * 1000;
      const blobsWithPrefix = transcodeOutput.blobs.map((blob) => ({
        ...blob,
        blobName: `${fileId}/${blob.blobName}`,
      }));
      await uploadBlobs({ blobs: blobsWithPrefix, expirationMicros });

      // Step 3: Save to database (TODO: this is unsafe, validate later)
      setUploadProgress("saving");
      const url = createShelbyDownloadURL(
        accountAddress,
        `${fileId}/master.m3u8`
      );
      await saveVideo({
        fileId,
        account: accountAddress,
        url,
        description,
        email,
      });

      return { fileId, url };
    },
    onSuccess: () => setStep("complete"),
    onError: (error) => {
      console.error("Upload failed:", error);
      setStep("preview");
    },
  });

  // Handle recording complete
  const handleRecordingComplete = (blobUrl: string, id: string) => {
    setMediaBlobUrl(blobUrl);
    setFileId(id);
    setStep("preview");
  };

  // Handle retake
  const handleRetake = () => {
    if (mediaBlobUrl) {
      URL.revokeObjectURL(mediaBlobUrl);
    }
    setMediaBlobUrl(null);
    setFileId(null);
    setStep("record");
  };

  // Handle process and upload
  const handleProcessAndUpload = (description: string, email: string) => {
    if (!mediaBlobUrl || !fileId || !account?.address) return;

    // Check if the account address is in the upload allowlist
    const accountAddress = account.address.toString();
    if (!UPLOAD_ALLOWLIST_ADDRESSES.includes(accountAddress)) {
      toast.error(
        `Account address ${accountAddress} is not in the upload allowlist`
      );
      return;
    }

    setStep("uploading");
    processAndUpload({
      mediaBlobUrl,
      fileId,
      accountAddress: account.address.toString(),
      description,
      email,
    });
  };

  function getUploadProgressMessage(progress: UploadProgress): string {
    switch (progress) {
      case "processing":
        return "Processing...";
      case "transcoding":
        return "Transcoding video...";
      case "uploading":
        return "Uploading to Shelby...";
      case "saving":
        return "Saving to database...";
    }
  }

  // Full-screen layout for record and preview steps
  const isFullScreenStep = step === "record" || step === "preview";

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background">
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* FFmpeg Error - shown as overlay for full-screen steps */}
        {ffmpegError && isFullScreenStep && (
          <div className="absolute top-4 left-4 right-4 z-50 bg-destructive/90 backdrop-blur-sm border border-destructive rounded-lg p-4 space-y-2 max-w-md mx-auto md:left-[88px]">
            <p className="text-destructive-foreground text-sm font-medium">
              Failed to load FFmpeg
            </p>
            <p className="text-destructive-foreground/80 text-xs">
              {ffmpegError.message}
            </p>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => refetchFfmpeg()}
            >
              Retry
            </Button>
          </div>
        )}

        {/* Full-screen content for record/preview */}
        {isFullScreenStep && (
          <div className="md:flex-1 md:flex md:justify-center h-full ">
            <div className="w-full md:max-w-md lg:max-w-lg flex flex-col p-4 pb-24 h-full overflow-scroll">
              {step === "record" && (
                <VideoRecorder onRecordingComplete={handleRecordingComplete} />
              )}

              {step === "preview" && mediaBlobUrl && (
                <VideoPreview
                  mediaBlobUrl={mediaBlobUrl}
                  onConfirm={(description: string, email: string) =>
                    handleProcessAndUpload(description, email)
                  }
                  onRetake={handleRetake}
                  isProcessing={isProcessing}
                  processingLabel="Processing..."
                />
              )}
            </div>
          </div>
        )}

        {/* Regular layout for other steps */}
        {!isFullScreenStep && (
          <div className="flex-1 overflow-auto bg-background p-8 pb-20 md:pb-8 flex justify-center">
            <div className="w-full md:max-w-md lg:max-w-lg space-y-6">
              {/* FFmpeg Error */}
              {ffmpegError && (
                <div className="bg-destructive/20 border border-destructive rounded p-4 space-y-2">
                  <p className="text-destructive text-sm font-medium">
                    Failed to load FFmpeg
                  </p>
                  <p className="text-destructive/80 text-xs">
                    {ffmpegError.message}
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => refetchFfmpeg()}
                  >
                    Retry
                  </Button>
                </div>
              )}

              {/* Uploading Step */}
              {step === "uploading" && (
                <div className="space-y-4">
                  <h2 className="text-foreground text-xl">Uploading Video</h2>
                  <p className="text-muted-foreground text-sm">
                    {getUploadProgressMessage(uploadProgress)}
                  </p>
                  <div className="aspect-9/16 max-h-[60vh] bg-card rounded-lg flex items-center justify-center mx-auto">
                    <div className="text-center">
                      <div className="w-12 h-12 mx-auto mb-3 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                      <p className="text-muted-foreground text-sm">
                        {getUploadProgressMessage(uploadProgress)}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Complete Step */}
              {step === "complete" && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                      <CheckIcon className="w-5 h-5 text-primary-foreground" />
                    </div>
                    <h2 className="text-foreground text-xl">
                      Upload Complete!
                    </h2>
                  </div>
                  <p className="text-muted-foreground text-sm">
                    Your video has been uploaded to Shelby.
                  </p>

                  {/* Video Preview */}
                  {mediaBlobUrl && (
                    <div className="relative aspect-9/16 max-h-[50vh] bg-card rounded-lg overflow-hidden mx-auto">
                      <video
                        src={mediaBlobUrl}
                        className="w-full h-full object-cover"
                        autoPlay
                        muted
                        loop
                        playsInline
                      />
                    </div>
                  )}

                  <div className="flex gap-3">
                    <Button
                      onClick={() => {
                        if (mediaBlobUrl) {
                          URL.revokeObjectURL(mediaBlobUrl);
                        }
                        router.push(`/?id=${fileId}`);
                      }}
                      className="flex-1"
                    >
                      <PlayIcon className="w-4 h-4 mr-2" />
                      Watch Video
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        if (mediaBlobUrl) {
                          URL.revokeObjectURL(mediaBlobUrl);
                        }
                        setStep("record");
                        setFileId(null);
                        setMediaBlobUrl(null);
                        setUploadProgress("processing");
                      }}
                      className="flex-1"
                    >
                      Upload Another
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
