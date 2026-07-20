import { useQuery } from "@tanstack/react-query";
import { QueryKeys } from "@/config/tanstack/queryKeys";
import { sprintsControllerGetLeaderboard } from "@/api/generated/sprints/sprints";
import type { SprintsControllerGetLeaderboardParams } from "@/api/generated/model";

export function useSprintLeaderboard(
  roomId: string,
  params: SprintsControllerGetLeaderboardParams = { page: 1, size: 50 }
) {
  const query = useQuery({
    queryKey: [QueryKeys.SPRINT_LEADERBOARD, roomId, params.page, params.size],
    queryFn: () => sprintsControllerGetLeaderboard(roomId, params),
    enabled: !!roomId,
    staleTime: 15_000,
  });

  return {
    sprint: query.data?.sprint ?? null,
    entries: query.data?.items ?? [],
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
