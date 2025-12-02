import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { getVideos, GetVideosParams } from "@/actions/videos";

export type Videos = Awaited<ReturnType<typeof getVideos>>;

export const getVideosQueryKey = (account?: string) => ["videos", account];

export type UseVideosParams = GetVideosParams;

export type UseVideosOptions = Omit<
  UseQueryOptions<Videos, Error>,
  "queryKey" | "queryFn"
>;

export default function useVideos(
  { account }: UseVideosParams = {},
  options?: UseVideosOptions
) {
  return useQuery({
    queryKey: getVideosQueryKey(account),
    queryFn: () => getVideos({ account }),
    ...options,
  });
}
