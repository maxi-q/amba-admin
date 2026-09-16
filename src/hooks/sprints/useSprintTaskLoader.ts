import { useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { creativeTasksControllerGetCreativeTaskById } from "@/api/generated/creative-tasks/creative-tasks";
import { QueryKeys } from "@/config/tanstack/queryKeys";

export function useSprintTaskLoader() {
  const queryClient = useQueryClient();

  return useCallback(
    (id: string) =>
      queryClient.fetchQuery({
        queryKey: [QueryKeys.CREATIVE_TASK, id],
        queryFn: () => creativeTasksControllerGetCreativeTaskById(id),
        staleTime: 30 * 60 * 1000,
      }),
    [queryClient]
  );
}
