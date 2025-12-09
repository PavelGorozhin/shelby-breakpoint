import { AccountAddress } from "@aptos-labs/ts-sdk";
import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { getSession } from "@/actions/auth";

export const getBaseUserQueryKey = () => ["user"] as const;

export const getUserQueryKey = (address?: string, connected?: boolean) => [
  ...getBaseUserQueryKey(),
  address,
  connected,
];

export type User = {
  address: AccountAddress | null;
  isConnected: boolean;
  hasSession: boolean;
};

export type UseUserOptions = Omit<
  UseQueryOptions<User, Error>,
  "queryKey" | "queryFn"
>;

export default function useUser(options?: UseUserOptions) {
  const { account, connected } = useWallet();

  return useQuery({
    queryKey: getUserQueryKey(account?.address?.toString(), connected),
    queryFn: async () => {
      const session = await getSession();

      const isConnected = !!(connected && account?.address);
      const hasSession = !!(
        session &&
        account &&
        AccountAddress.from(session.address).equals(account.address)
      );

      return {
        address: hasSession && isConnected ? account.address : null,
        isConnected,
        hasSession,
      };
    },
    ...options,
  });
}
