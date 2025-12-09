import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toggleLike, type LikeStatus } from "@/actions/likes";
import { getLikeStatusQueryKey } from "@/queries/useLikeStatus";
import { toast } from "sonner";

export type UseLikeVariables = {
  videoId: number;
};

export default function useLike() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ videoId }: UseLikeVariables) => toggleLike({ videoId }),
    onMutate: async ({ videoId }) => {
      const queryKey = getLikeStatusQueryKey(videoId);

      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey });

      // Snapshot previous value
      const previousStatus = queryClient.getQueryData<LikeStatus>(queryKey);

      // Optimistically update
      queryClient.setQueryData<LikeStatus>(queryKey, (old) => ({
        isLiked: !old?.isLiked,
        likeCount: old?.isLiked
          ? (old?.likeCount ?? 1) - 1
          : (old?.likeCount ?? 0) + 1,
      }));

      return { previousStatus, queryKey };
    },
    onError: (_err, _variables, context) => {
      // Rollback on error
      if (context?.previousStatus && context?.queryKey) {
        queryClient.setQueryData(context.queryKey, context.previousStatus);
      }
      toast.error("Failed to update like");
    },
    onSettled: (_data, _error, { videoId }) => {
      // Refetch after mutation
      queryClient.invalidateQueries({
        queryKey: getLikeStatusQueryKey(videoId),
      });
    },
  });
}
