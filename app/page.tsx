import { getRandomVideos } from "@/actions/videos";
import ClientOnly from "@/components/client-only";
import CommunicationMethodsDialog from "@/components/communication-methods-dialog";
import VideoCarousel from "@/components/video-carousel";
import { VIDEO_PAGE_SIZE } from "@/lib/constants";
import { generateSeed } from "@/lib/random";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const { id: initialFileId } = await searchParams;

  // Generate a random seed for this session's video order
  const seed = generateSeed();

  // Fetch initial videos, prioritizing the requested video if provided
  const { videos } = await getRandomVideos({
    seed,
    limit: VIDEO_PAGE_SIZE,
    prioritizeFileId: initialFileId,
  });

  return (
    <div className="overflow-hidden pb-16 md:pb-0 flex md:items-center justify-center">
      <ClientOnly>
        <VideoCarousel
          initialData={videos}
          seed={seed}
          onLoadMore={async (params) => {
            "use server";
            const { videos } = await getRandomVideos({
              ...params,
              prioritizeFileId: initialFileId,
            });
            return videos;
          }}
        />
        <CommunicationMethodsDialog />
      </ClientOnly>
    </div>
  );
}
