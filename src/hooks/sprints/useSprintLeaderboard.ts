import { useQuery } from "@tanstack/react-query";
import { QueryKeys } from "@/config/tanstack/queryKeys";
import { sprintsControllerGetLeaderboard } from "@/api/generated/sprints/sprints";
import type { SprintsControllerGetLeaderboardParams } from "@/api/generated/model";
import { collectPages, type AllPagesOptions } from "../collectPages";

export function useSprintLeaderboard(
  roomId: string,
  params: SprintsControllerGetLeaderboardParams = { page: 1, size: 50 },
  { allPages = false }: AllPagesOptions = {}
) {
  const query = useQuery({
    queryKey: [QueryKeys.SPRINT_LEADERBOARD, roomId, allPages ? "all" : params.page, params.size],
    queryFn: ({ signal }) => allPages
      ? collectPages((page) => sprintsControllerGetLeaderboard(roomId, { ...params, page }, undefined, signal))
      : sprintsControllerGetLeaderboard(roomId, params, undefined, signal),
    enabled: !!roomId,
    staleTime: 15_000,
  });

  return {
    sprint: query.data?.sprint ?? null,
    entries: query.data?.items ?? [],
    manualRewards: query.data?.manualRewards ?? [],
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
