import {
  useMutation,
  UseMutationOptions,
  useQueryClient,
} from "@tanstack/react-query";
import { saveProfile, SaveProfileParams } from "@/actions/profiles";
import { getProfileQueryKey } from "@/queries/useProfile";
import { useWallet } from "@aptos-labs/wallet-adapter-react";

export type UseSaveProfileOptions = Omit<
  UseMutationOptions<void, Error, SaveProfileParams>,
  "mutationFn"
>;

export default function useSaveProfile({
  onSuccess,
  onError,
  ...options
}: UseSaveProfileOptions = {}) {
  const queryClient = useQueryClient();
  const { account } = useWallet();

  return useMutation({
    mutationFn: async (params: SaveProfileParams) => {
      await saveProfile(params);
    },
    onSuccess: (_data, variables, context, mutation) => {
      queryClient.invalidateQueries({
        queryKey: getProfileQueryKey(account?.address?.toString()),
      });
      onSuccess?.(void 0, variables, context, mutation);
    },
    onError: (error, variables, context, mutation) => {
      onError?.(error, variables, context, mutation);
    },
    ...options,
  });
}
