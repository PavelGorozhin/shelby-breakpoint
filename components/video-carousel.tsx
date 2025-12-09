"use client";

import { Video } from "@/db/schema";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Carousel, CarouselItem, CarouselContent } from "./ui/carousel";
import { EmblaCarouselType, EngineType } from "embla-carousel";
import { VideoPlayer, defaultVideos } from "./video-player";
import { WheelGesturesPlugin } from "embla-carousel-wheel-gestures";
import Loader from "./ui/loader";

export interface VideoCarouselProps {
  initialData?: Video[];
  initialVideoId?: string;
  onLoadMore?: () => void;
}

const mockApiCall = (
  minWait: number,
  maxWait: number,
  callback: () => void
): void => {
  const min = Math.ceil(minWait);
  const max = Math.floor(maxWait);
  const wait = Math.floor(Math.random() * (max - min + 1)) + min;
  setTimeout(callback, wait);
};

export default function VideoCarousel({
  initialData,
  initialVideoId,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onLoadMore,
}: VideoCarouselProps) {
  const [videos, setVideos] = useState<Video[]>(initialData ?? defaultVideos);
  const scrollListenerRef = useRef<() => void>(() => undefined);
  const listenForScrollRef = useRef(true);
  const hasMoreToLoadRef = useRef(true);
  const [hasMoreToLoad, setHasMoreToLoad] = useState(true);
  const [, setLoadingMore] = useState(false);
  const [emblaApi, setEmblaApi] = useState<EmblaCarouselType>();

  // Find initial index based on fileId or id from query param
  const initialIndex = useMemo(() => {
    if (!initialVideoId || videos.length === 0) return 0;
    const index = videos.findIndex(
      (v) => v.fileId === initialVideoId || v.id.toString() === initialVideoId
    );
    return index >= 0 ? index : 0;
  }, [initialVideoId, videos]);

  const [activeIndex, setActiveIndex] = useState(initialIndex);

  // Track active slide for play/pause
  useEffect(() => {
    if (!emblaApi) return;

    const onSelect = () => {
      setActiveIndex(emblaApi.selectedScrollSnap());
    };

    emblaApi.on("select", onSelect);
    // Scroll to initial index if not 0
    if (initialIndex > 0) {
      emblaApi.scrollTo(initialIndex, true);
    }

    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi, initialIndex]);

  const onScroll = useCallback((emblaApi: EmblaCarouselType) => {
    if (!listenForScrollRef.current) return;

    setLoadingMore((loadingMore) => {
      const lastSlide = emblaApi.slideNodes().length - 1;
      const lastSlideInView = emblaApi.slidesInView().includes(lastSlide);
      const loadMore =
        !loadingMore && lastSlideInView && listenForScrollRef.current;

      if (loadMore) {
        listenForScrollRef.current = false;

        // TODO: Replace with real API call
        mockApiCall(1000, 2000, () => {
          setVideos((currentVideos) => {
            if (currentVideos.length >= 20) {
              setHasMoreToLoad(false);
              emblaApi.off("scroll", scrollListenerRef.current);
              return currentVideos;
            }

            // For now, duplicate default videos with unique IDs for infinite scroll demo
            const newVideos = defaultVideos.map((video, i) => ({
              ...video,
              id: currentVideos.length + i,
              fileId: `${video.fileId}-${currentVideos.length + i}`,
            }));

            return [...currentVideos, ...newVideos];
          });
        });
      }

      return loadingMore || lastSlideInView;
    });
  }, []);

  const addScrollListener = useCallback(
    (emblaApi: EmblaCarouselType) => {
      scrollListenerRef.current = () => onScroll(emblaApi);
      emblaApi.on("scroll", scrollListenerRef.current);
    },
    [onScroll]
  );

  useEffect(() => {
    if (!emblaApi) return;
    addScrollListener(emblaApi);

    const onResize = () => emblaApi.reInit();
    window.addEventListener("resize", onResize);
    emblaApi.on("destroy", () =>
      window.removeEventListener("resize", onResize)
    );
  }, [emblaApi, addScrollListener]);

  useEffect(() => {
    hasMoreToLoadRef.current = hasMoreToLoad;
  }, [hasMoreToLoad]);

  return (
    <Carousel
      setApi={setEmblaApi}
      opts={{
        containScroll: "keepSnaps",
        watchResize: false,
        align: "start",
        watchSlides: (emblaApi) => {
          const reloadEmbla = (): void => {
            const oldEngine = emblaApi.internalEngine();

            emblaApi.reInit();
            const newEngine = emblaApi.internalEngine();
            const copyEngineModules: (keyof EngineType)[] = [
              "scrollBody",
              "location",
              "offsetLocation",
              "previousLocation",
              "target",
            ];
            copyEngineModules.forEach((engineModule) => {
              Object.assign(newEngine[engineModule], oldEngine[engineModule]);
            });

            newEngine.translate.to(oldEngine.location.get());
            const { index } = newEngine.scrollTarget.byDistance(0, false);
            newEngine.index.set(index);
            newEngine.animation.start();

            setLoadingMore(false);
            listenForScrollRef.current = true;
          };

          const reloadAfterPointerUp = (): void => {
            emblaApi.off("pointerUp", reloadAfterPointerUp);
            reloadEmbla();
          };

          const engine = emblaApi.internalEngine();

          if (hasMoreToLoadRef.current && engine.dragHandler.pointerDown()) {
            const boundsActive = engine.limit.reachedMax(engine.target.get());
            engine.scrollBounds.toggleActive(boundsActive);
            emblaApi.on("pointerUp", reloadAfterPointerUp);
          } else {
            reloadEmbla();
          }
        },
      }}
      plugins={[WheelGesturesPlugin()]}
      orientation="vertical"
      className="w-full md:max-w-md lg:max-w-lg"
    >
      <CarouselContent className="pb-12 md:pb-0 h-svh">
        {videos.map((video, index) => (
          <CarouselItem
            key={`${video.fileId}-${index}`}
            className="md:basis-full md:py-12 h-full"
          >
            <VideoPlayer video={video} isActive={index === activeIndex} />
          </CarouselItem>
        ))}
        {hasMoreToLoad && (
          <CarouselItem className="md:py-12 md:basis-full">
            <div className="flex items-center justify-center h-full bg-card">
              <Loader />
            </div>
          </CarouselItem>
        )}
      </CarouselContent>
    </Carousel>
  );
}
