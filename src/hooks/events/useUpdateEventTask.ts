import { useQueryClient } from "@tanstack/react-query";
import { useEventTasksControllerUpdate } from "@/api/generated/event-tasks/event-tasks";
import { eventTasksQueryKey } from "./useEventTasks";

export function useUpdateEventTask(eventId: string) {
  const queryClient = useQueryClient();
  const mutation = useEventTasksControllerUpdate({
    mutation: {
      onSuccess: async () => {
        await queryClient.invalidateQueries({
          queryKey: eventTasksQueryKey(eventId),
        });
      },
    },
  });

  return {
    updateEventTask: mutation.mutate,
    isPending: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error,
    reset: mutation.reset,
  };
}
