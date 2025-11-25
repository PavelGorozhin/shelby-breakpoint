import { hlsCmaf } from "@shelby-protocol/media-prepare/core";
import { execFfmpegWasm } from "@shelby-protocol/media-prepare/browser";
import { useMutation, UseMutationOptions } from "@tanstack/react-query";
import { FFmpeg } from "@ffmpeg/ffmpeg";

export type TranscodeOutput = {
  blobs: { blobName: string; blobData: Uint8Array }[];
};

export type UseTranscodeVariables = {
  video: File;
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
      video,
    }: UseTranscodeVariables): Promise<TranscodeOutput> => {
      if (!ffmpeg) {
        throw new Error("FFmpeg WASM is required to transcode a video");
      }

      const ff = ffmpeg; // Capture for closure

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
        await ffmpeg.deleteFile("/input.mp4");
      } catch {
        // File doesn't exist, ignore
      }
      await deleteDirRecursive("/out");

      // Write input file to FFmpeg virtual filesystem
      const inputBlob = await video.arrayBuffer();
      const inputBuffer = new Uint8Array(inputBlob);
      const inputFilePath = `/input.mp4`;
      await ffmpeg.writeFile(inputFilePath, inputBuffer);

      // Precreate the output directory
      await ffmpeg.createDir("/out");

      const plan = hlsCmaf
        .planHlsCmaf()
        .input(inputFilePath)
        .outputDir("/out")
        .withLadder([
          { width: 1080, height: 1920, bitrateBps: 1_000_000, name: "1080p" },
        ])
        .withVideoEncoder({ kind: "copy" }) // Copy mode recommended for WASM
        .withSegments({ mode: "fixed", segmentSeconds: 4 })
        .hlsCmaf()
        .render.ffmpegArgs();

      await execFfmpegWasm(ffmpeg, plan.args, {
        precreate: plan.variantNames.map((name: string) => `/out/${name}`),
      });

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
