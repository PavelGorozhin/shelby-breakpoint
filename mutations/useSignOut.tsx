import {
  useMutation,
  UseMutationOptions,
  useQueryClient,
} from "@tanstack/react-query";
import { signOut } from "@/actions/auth";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { getBaseUserQueryKey } from "@/queries/useUser";

export type UseSignOutOptions = Omit<
  UseMutationOptions<void, Error>,
  "mutationFn" | "mutationKey"
>;

export default function useSignOut({
  onSuccess,
  ...options
}: UseSignOutOptions = {}) {
  const queryClient = useQueryClient();
  const { disconnect } = useWallet();

  return useMutation({
    mutationFn: async () => {
      disconnect();
      await signOut();
    },
    onSuccess: async (data, variables, context, mutation) => {
      await queryClient.invalidateQueries({ queryKey: getBaseUserQueryKey() });
      onSuccess?.(data, variables, context, mutation);
    },
    ...options,
  });
}
