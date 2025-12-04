import { hlsCmaf } from "@shelby-protocol/media-prepare/core";
import { execFfmpegWasm } from "@shelby-protocol/media-prepare/browser";
import { useMutation, UseMutationOptions } from "@tanstack/react-query";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { isDevelopment } from "@/lib/environment";

export type TranscodeOutput = {
  blobs: { blobName: string; blobData: Uint8Array }[];
};

export type UseTranscodeVariables = {
  mediaBlobUrl: string;
};

export type UseTranscodeOptions = Omit<
  UseMutationOptions<TranscodeOutput, Error, UseTranscodeVariables>,
  "mutationFn"
> & { ffmpeg: FFmpeg | undefined };

export default function useTranscode({
  ffmpeg,
  ...options
}: UseTranscodeOptions) {
  return useMutation({
    mutationFn: async ({
      mediaBlobUrl,
    }: UseTranscodeVariables): Promise<TranscodeOutput> => {
      if (!ffmpeg) {
        throw new Error("FFmpeg WASM is required to transcode a video");
      }

      const ff = ffmpeg; // Capture for closure

      // Set up logging
      if (isDevelopment) {
        ffmpeg.on("log", ({ message, type }) => {
          if (type === "fferr") {
            console.error("[ffmpeg error]", message);
          } else if (process.env.NODE_ENV === "development") {
            console.log("[ffmpeg]", message);
          }
        });
      }

      // Helper to recursively delete a directory
      async function deleteDirRecursive(dirPath: string) {
        try {
          const entries = await ff.listDir(dirPath);
          for (const entry of entries) {
            if (entry.name === "." || entry.name === "..") continue;
            const fullPath = `${dirPath}/${entry.name}`;
            if (entry.isDir) {
              await deleteDirRecursive(fullPath);
            } else {
              await ff.deleteFile(fullPath);
            }
          }
          await ff.deleteDir(dirPath);
        } catch {
          // Directory doesn't exist, ignore
        }
      }

      // Clean up previous runs
      try {
        await ffmpeg.deleteFile("/input.webm");
      } catch {
        // File doesn't exist, ignore
      }
      try {
        await ffmpeg.deleteFile("/input.mp4");
      } catch {
        // File doesn't exist, ignore
      }
      await deleteDirRecursive("/out");

      // Fetch blob from URL and detect content type
      const response = await fetch(mediaBlobUrl);
      const contentType = response.headers.get("content-type") || "";
      const inputBuffer = new Uint8Array(await response.arrayBuffer());

      // Determine if we need to re-encode based on content type
      const isH264 =
        contentType.includes("h264") || contentType.includes("avc1");
      const isMp4 = contentType.includes("mp4");
      const needsReencode = !isH264 && !isMp4;

      if (needsReencode) {
        // Write as webm and re-encode to mp4
        await ffmpeg.writeFile("/input.webm", inputBuffer);
        console.log("converting webm to mp4 (re-encoding)");
        await ffmpeg.exec([
          "-i",
          "/input.webm",
          "-c:v",
          "libx264",
          "-preset",
          "ultrafast",
          "-crf",
          "28",
          "-c:a",
          "aac",
          "-b:a",
          "128k",
          "/input.mp4",
        ]);
      } else {
        // Already H.264/mp4, write directly
        console.log("Input is already H.264/mp4, skipping re-encode");
        await ffmpeg.writeFile("/input.mp4", inputBuffer);
      }

      // Step 2: Convert mp4 to HLS CMAF
      await ffmpeg.createDir("/out");

      const plan = hlsCmaf
        .planHlsCmaf()
        .input("/input.mp4")
        .outputDir("/out")
        .withLadder([
          { width: 1920, height: 1080, bitrateBps: 1_000_000, name: "1080p" },
        ])
        .withVideoEncoder({ kind: "copy" })
        .withSegments({ mode: "fixed", segmentSeconds: 2 })
        .hlsCmaf()
        .render.ffmpegArgs();

      await execFfmpegWasm(ffmpeg, plan.args, {
        precreate: plan.variantNames.map((name: string) => `/out/${name}`),
      });

      console.log("transcoding complete");

      // Recursively read all output files from FFmpeg virtual filesystem
      const blobs: { blobName: string; blobData: Uint8Array }[] = [];

      async function readDirRecursive(dirPath: string, basePath: string = "") {
        const entries = await ff.listDir(dirPath);
        for (const entry of entries) {
          // Skip . and .. entries
          if (entry.name === "." || entry.name === "..") continue;

          const fullPath = `${dirPath}/${entry.name}`;
          const blobName = basePath ? `${basePath}/${entry.name}` : entry.name;

          if (entry.isDir) {
            // Recursively read subdirectory
            await readDirRecursive(fullPath, blobName);
          } else {
            // Read file and add to blobs
            const data = await ff.readFile(fullPath);
            blobs.push({
              blobName,
              blobData:
                data instanceof Uint8Array
                  ? data
                  : new TextEncoder().encode(data),
            });
          }
        }
      }

      await readDirRecursive("/out");

      return { blobs };
    },
    ...options,
  });
}
