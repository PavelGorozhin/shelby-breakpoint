import { startSignInLegacy, verifySignInLegacy } from "@/actions/auth";
import { getBaseUserQueryKey } from "@/queries/useUser";
import { getSignInPublicKeyScheme } from "@aptos-labs/siwa";
import {
  createLegacySignInMessage,
  serializeLegacySignInOutput,
} from "@aptos-labs/siwa/legacy";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import {
  useMutation,
  UseMutationOptions,
  useQueryClient,
} from "@tanstack/react-query";

export type SignInResult = Awaited<ReturnType<typeof verifySignInLegacy>>;

export type UseSignInOptions = Omit<
  UseMutationOptions<SignInResult, Error>,
  "mutationFn" | "mutationKey"
>;

export default function useSignIn({
  onSuccess,
  ...options
}: UseSignInOptions = {}) {
  const queryClient = useQueryClient();
  const { account, connected, signMessage } = useWallet();

  return useMutation({
    mutationFn: async () => {
      if (!connected || !account) {
        throw new Error("Wallet must be connected to sign in");
      }

      const { input } = await startSignInLegacy(account.address.toString());

      // Create the legacy sign-in message
      const message = createLegacySignInMessage(input);

      // Request signature using signMessage
      const signatureResponse = await signMessage({
        message,
        nonce: input.nonce,
      });

      // Serialize and verify on server using legacy format
      const serializedOutput = serializeLegacySignInOutput({
        account,
        message: signatureResponse.fullMessage,
        signature: signatureResponse.signature,
        type: await getSignInPublicKeyScheme(account.publicKey),
      });

      return await verifySignInLegacy(serializedOutput);
    },
    onSuccess: async (data, variables, context, mutation) => {
      await queryClient.invalidateQueries({ queryKey: getBaseUserQueryKey() });
      onSuccess?.(data, variables, context, mutation);
    },
    ...options,
  });
}
