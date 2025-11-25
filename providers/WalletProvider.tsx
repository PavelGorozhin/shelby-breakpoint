"use client";

import { AptosWalletAdapterProvider } from "@aptos-labs/wallet-adapter-react";
import { setupAutomaticSolanaWalletDerivation } from "@aptos-labs/derived-wallet-solana";
import { Network } from "@aptos-labs/ts-sdk";
import { toast } from "sonner";

setupAutomaticSolanaWalletDerivation({ defaultNetwork: Network.SHELBYNET });

export const WalletProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <AptosWalletAdapterProvider
      autoConnect={true}
      dappConfig={{
        network: Network.SHELBYNET,
        aptosApiKeys: {
          shelbynet: process.env.NEXT_PUBLIC_APTOS_SHELBYNET_API_KEY,
        },
        crossChainWallets: true,
      }}
      onError={(error) => {
        toast.error(error.message || "Error connecting wallet");
      }}
    >
      {children}
    </AptosWalletAdapterProvider>
  );
};
