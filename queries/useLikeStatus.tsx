import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { getLikeStatus, type LikeStatus } from "@/actions/likes";

export const getLikeStatusQueryKey = (videoId: number) => [
  "likeStatus",
  videoId,
];

export type UseLikeStatusParams = {
  videoId: number;
  walletAddress?: string;
};

export type UseLikeStatusOptions = Omit<
  UseQueryOptions<LikeStatus, Error>,
  "queryKey" | "queryFn"
>;

export default function useLikeStatus(
  { videoId }: UseLikeStatusParams,
  options?: UseLikeStatusOptions
) {
  return useQuery({
    queryKey: getLikeStatusQueryKey(videoId),
    queryFn: () => getLikeStatus({ videoId }),
    ...options,
  });
}
