import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { getLikeStatus, type LikeStatus } from "@/actions/likes";

export const getLikeStatusQueryKey = (
  videoId: number,
  walletAddress?: string
) => ["likeStatus", videoId, walletAddress];

export type UseLikeStatusParams = {
  videoId: number;
  walletAddress?: string;
};

export type UseLikeStatusOptions = Omit<
  UseQueryOptions<LikeStatus, Error>,
  "queryKey" | "queryFn"
>;

export default function useLikeStatus(
  { videoId, walletAddress }: UseLikeStatusParams,
  options?: UseLikeStatusOptions
) {
  return useQuery({
    queryKey: getLikeStatusQueryKey(videoId, walletAddress),
    queryFn: () => getLikeStatus({ videoId, walletAddress }),
    ...options,
  });
}
