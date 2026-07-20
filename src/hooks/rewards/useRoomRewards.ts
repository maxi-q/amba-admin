import { useQuery } from "@tanstack/react-query";
import { QueryKeys } from "@/config/tanstack/queryKeys";
import { rewardsControllerGetRewards } from "@/api/generated/rewards/rewards";
import type { RewardsControllerGetRewardsParams } from "@/api/generated/model";

export function useRoomRewards(
  roomId: string,
  params: RewardsControllerGetRewardsParams = { page: 1, size: 100 }
) {
  const query = useQuery({
    queryKey: [QueryKeys.REWARDS, roomId, params.page, params.size, params.includeDeleted],
    queryFn: () => rewardsControllerGetRewards(roomId, params),
    enabled: !!roomId,
    staleTime: 30_000,
  });

  return {
    rewards: query.data?.items ?? [],
    pagination: query.data
      ? {
          page: query.data.page,
          size: query.data.size,
          total: query.data.total,
          totalPages: query.data.totalPages,
        }
      : null,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}
