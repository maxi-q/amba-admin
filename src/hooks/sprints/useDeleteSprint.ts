import { useMutation, useQueryClient } from "@tanstack/react-query";
import { sprintsControllerDelete } from "@/api/generated/sprints/sprints";
import { MutationKeys } from "@/config/tanstack/mutationKeys";
import { QueryKeys } from "@/config/tanstack/queryKeys";

export function useDeleteSprint(roomId: string) {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationKey: [MutationKeys.SPRINTS, "delete"],
    mutationFn: (sprintId: string) => sprintsControllerDelete(sprintId),
    onSuccess: () =>
      Promise.all([
        queryClient.invalidateQueries({
          queryKey: [QueryKeys.SPRINTS, roomId],
        }),
        queryClient.invalidateQueries({
          queryKey: [QueryKeys.CREATIVE_TASKS],
          exact: false,
        }),
        queryClient.invalidateQueries({
          queryKey: [QueryKeys.CREATIVE_TASK],
          exact: false,
        }),
      ]),
  });

  return {
    deleteSprint: mutation.mutate,
    deleteSprintAsync: mutation.mutateAsync,
    isPending: mutation.isPending,
    error: mutation.error,
  };
}
