import { getVideos } from "@/actions/videos";
import ClientOnly from "@/components/client-only";
import VideoCarousel from "@/components/video-carousel";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const videos = await getVideos();
  const { id } = await searchParams;

  return (
    <div className=" overflow-hidden pb-16 md:pb-0 flex md:items-center justify-center">
      <ClientOnly>
        <VideoCarousel initialData={videos} initialVideoId={id} />
      </ClientOnly>
    </div>
  );
}
