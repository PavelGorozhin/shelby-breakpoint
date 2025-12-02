import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { getProfile } from "@/actions/profiles";

export type Profile = Awaited<ReturnType<typeof getProfile>>;

export const getProfileQueryKey = (walletAddress?: string) => [
  "profile",
  walletAddress,
];

export type UseProfileParams = {
  walletAddress?: string;
};

export type UseProfileOptions = Omit<
  UseQueryOptions<Profile, Error>,
  "queryKey" | "queryFn"
>;

export default function useProfile(
  { walletAddress }: UseProfileParams,
  options?: UseProfileOptions
) {
  return useQuery({
    queryKey: getProfileQueryKey(walletAddress),
    queryFn: () => getProfile({ walletAddress: walletAddress! }),
    enabled: !!walletAddress,
    ...options,
  });
}
