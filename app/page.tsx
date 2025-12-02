import { VideoPlayer } from "@/components/video-player";
import { getVideos } from "@/actions/videos";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const videos = await getVideos();
  const { id } = await searchParams;

  return (
    <div className="flex-1 overflow-hidden pb-16 md:pb-0 flex justify-center">
      <div className="w-full md:max-w-md lg:max-w-lg h-full md:py-8 py-0">
        <VideoPlayer videos={videos} initialVideoId={id} />
      </div>
    </div>
  );
}
