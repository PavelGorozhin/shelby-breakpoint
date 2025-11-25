import { Header } from "@/components/header";
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
    <div className="flex flex-col h-screen w-screen overflow-hidden">
      <Header />
      <div className="flex-1 overflow-hidden">
        <VideoPlayer videos={videos} initialVideoId={id} />
      </div>
    </div>
  );
}
