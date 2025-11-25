import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { useMutation, UseMutationOptions } from "@tanstack/react-query";
import { useUploadBlobs, UseUploadBlobsOptions } from "@shelby-protocol/react";
import { createShelbyClient } from "@/lib/shelby";
import { createAptosClient } from "@/lib/aptos";

export type UseWalletUploadBlobsVariables = {
  blobs: { blobName: string; blobData: Uint8Array }[];
  expirationMicros: number;
};

export type UseWalletUploadBlobsOptions = Omit<
  UseMutationOptions<void, Error, UseWalletUploadBlobsVariables>,
  "mutationFn"
> & {
  uploadOptions: Omit<UseUploadBlobsOptions, "client">;
};

export default function useWalletUploadBlobs({
  uploadOptions,
  ...options
}: UseWalletUploadBlobsOptions) {
  const {
    account,
    signAndSubmitTransaction,
    signTransaction,
    wallet,
    network,
  } = useWallet();

  const { mutateAsync: uploadBlobs } = useUploadBlobs({
    client: createShelbyClient(),
    ...uploadOptions,
  });

  return useMutation({
    mutationFn: async ({
      blobs,
      expirationMicros,
    }: UseWalletUploadBlobsVariables) => {
      if (!account?.address) {
        throw new Error("Wallet must be connected to upload blobs");
      }

      await uploadBlobs({
        expirationMicros,
        signer: {
          account: account?.address,
          signAndSubmitTransaction: async (payload) => {
            if (!wallet || !account || !network) {
              throw new Error(
                "'wallet', 'account' and 'network' must be defined to sign and submit a transaction"
              );
            }

            // If the wallet is an Aptos native wallet, use the Aptos client to sign and submit the transaction
            if (wallet?.isAptosNativeWallet) {
              return signAndSubmitTransaction(payload);
            }

            // If the wallet is not an Aptos native wallet, use the Aptos with gas station to pay for the transaction fees
            const aptosWithGasStation = createAptosClient(network.name, {
              withGasStation: true,
            });

            const transaction =
              await aptosWithGasStation.transaction.build.simple({
                data: payload.data,
                sender: account.address,
                withFeePayer: true,
              });

            const signedTransaction = await signTransaction({
              transactionOrPayload: transaction,
            });

            return aptosWithGasStation.transaction.submit.simple({
              transaction,
              senderAuthenticator: signedTransaction.authenticator,
            });
          },
        },
        blobs,
      });
    },
    ...options,
  });
}
