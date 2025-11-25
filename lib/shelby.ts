import {
  AccountAddress,
  AccountAddressInput,
  Network,
} from "@aptos-labs/ts-sdk";
import { ShelbyClient } from "@shelby-protocol/sdk/browser";

export const createShelbyClient = () => {
  return new ShelbyClient({
    network: Network.SHELBYNET,
    apiKey: process.env.NEXT_PUBLIC_SHELBY_SHELBYNET_API_KEY,
  });
};

export const createShelbyDownloadURL = (
  account: AccountAddressInput,
  blobName: string
) => {
  return `https://api.shelbynet.shelby.xyz/shelby/v1/blobs/${AccountAddress.from(
    account
  ).toString()}/${blobName}`;
};
