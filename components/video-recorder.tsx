import dynamic from "next/dynamic";

export const VideoRecorder = dynamic(
  () =>
    import("@/components/video-recorder-client").then(
      (mod) => mod.VideoRecorderClient
    ),
  {
    ssr: false,
    loading: () => <div className="flex-1 bg-card rounded-lg animate-pulse" />,
  }
);
