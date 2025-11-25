import { Network } from "@aptos-labs/ts-sdk";
import { ShelbyClient } from "@shelby-protocol/sdk/browser";

export const createShelbyClient = () => {
  return new ShelbyClient({
    network: Network.SHELBYNET,
    apiKey: process.env.NEXT_PUBLIC_SHELBY_SHELBYNET_API_KEY,
  });
};
