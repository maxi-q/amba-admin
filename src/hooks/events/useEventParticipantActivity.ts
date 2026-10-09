import { useQueries } from "@tanstack/react-query";
import { eventTaskSubmissionsControllerList } from "@/api/generated/event-task-submissions/event-task-submissions";
import { eventTaskSubmissionsQueryKey } from "./useEventTaskSubmissions";

export function useEventParticipantActivity(
  eventId: string,
  taskIds: string[],
  ambassadorId: string,
) {
  const queries = useQueries({
    queries: taskIds.map((taskId) => ({
      queryKey: eventTaskSubmissionsQueryKey(eventId, taskId),
      queryFn: ({ signal }: { signal: AbortSignal }) =>
        eventTaskSubmissionsControllerList(
          eventId,
          taskId,
          { page: 1, size: 100 },
          undefined,
          signal,
        ),
      enabled: Boolean(eventId && ambassadorId),
      retry: 2,
      staleTime: 0,
    })),
  });

  return {
    submissions: queries
      .flatMap((query) => query.data?.items ?? [])
      .filter((item) => item.ambassadorId === ambassadorId),
    isLoading: queries.some((query) => query.isLoading),
    isError: queries.some((query) => query.isError),
    refetch: () => Promise.all(queries.map((query) => query.refetch())),
  };
}
