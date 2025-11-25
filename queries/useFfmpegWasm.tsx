import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { toBlobURL } from "@ffmpeg/util";

export type UseFfmpegWasmOptions = Omit<
  UseQueryOptions<FFmpeg, Error>,
  "queryKey" | "queryFn" | "staleTime" | "gcTime"
>;

export default function useFfmpegWasm({
  ...options
}: UseFfmpegWasmOptions = {}) {
  return useQuery({
    queryKey: ["ffmpeg-wasm"],
    queryFn: async () => {
      const baseURL =
        "https://cdn.jsdelivr.net/npm/@ffmpeg/core-mt@0.12.10/dist/umd";

      const ffmpeg = new FFmpeg();
      await ffmpeg.load({
        coreURL: await toBlobURL(
          `${baseURL}/ffmpeg-core.js`,
          "text/javascript"
        ),
        wasmURL: await toBlobURL(
          `${baseURL}/ffmpeg-core.wasm`,
          "application/wasm"
        ),
        workerURL: await toBlobURL(
          `${baseURL}/ffmpeg-core.worker.js`,
          "text/javascript"
        ),
      });

      return ffmpeg;
    },
    retry: 2,
    staleTime: Infinity,
    gcTime: Infinity,
    ...options,
  });
}
