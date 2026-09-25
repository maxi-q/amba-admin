import { useQueries } from "@tanstack/react-query";
import { creativeTasksControllerGetSubmissions } from "@/api/generated/creative-tasks/creative-tasks";
import { QueryKeys } from "@/config/tanstack/queryKeys";
import { collectPages } from "../collectPages";

export function useParticipantActivity(taskIds: string[], ambassadorId: string) {
  // ponytail: one cached query per task until the API provides a participant activity endpoint.
  const queries = useQueries({ queries: taskIds.map((taskId) => ({
    queryKey: [QueryKeys.SUBMISSIONS, taskId, "all", 100, undefined],
    queryFn: ({ signal }: { signal: AbortSignal }) => collectPages((page) =>
      creativeTasksControllerGetSubmissions(taskId, { page, size: 100 }, undefined, signal)),
    enabled: !!ambassadorId,
    retry: 2,
    staleTime: 0,
  })) });
  return {
    submissions: queries.flatMap((query) => query.data?.items ?? []).filter((item) => item.ambassadorId === ambassadorId),
    isLoading: queries.some((query) => query.isLoading),
    isError: queries.some((query) => query.isError),
    refetch: () => Promise.all(queries.map((query) => query.refetch())),
  };
}
