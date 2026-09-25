import { useQueries, useQuery } from "@tanstack/react-query";
import { QueryKeys } from "@/config/tanstack/queryKeys";
import {
  rewardsControllerGetRewardById,
  rewardsControllerGetRewards,
} from "@/api/generated/rewards/rewards";
import type { RewardsControllerGetRewardsParams } from "@/api/generated/model";
import { collectPages, type AllPagesOptions } from "../collectPages";

export function useRoomRewards(
  roomId: string,
  params: RewardsControllerGetRewardsParams = { page: 1, size: 100 },
  { allPages = false }: AllPagesOptions = {}
) {
  const query = useQuery({
    queryKey: [QueryKeys.REWARDS, roomId, allPages ? "all" : params.page, params.size, params.includeDeleted],
    queryFn: ({ signal }) => allPages
      ? collectPages((page) => rewardsControllerGetRewards(roomId, { ...params, page }, undefined, signal))
      : rewardsControllerGetRewards(roomId, params, undefined, signal),
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

export function useRewardsByIds(roomId: string, ids: string[]) {
  const queries = useQueries({
    queries: [...new Set(ids)].map((id) => ({
      queryKey: [QueryKeys.REWARDS, roomId, "detail", id],
      queryFn: () => rewardsControllerGetRewardById(id),
      enabled: !!roomId,
      staleTime: 30_000,
    })),
  });

  return {
    rewards: queries.flatMap((query) => (query.data ? [query.data] : [])),
  };
}
