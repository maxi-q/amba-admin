import { useQueryClient } from "@tanstack/react-query";
import { useCreativeTasksControllerFreezeCreativeTask } from "@/api/generated/creative-tasks/creative-tasks";
import type { GetCreativeTasksResponseDto } from "@/api/generated/model";
import { QueryKeys } from "@/config/tanstack/queryKeys";
import { ApiError } from "@/types";

export function useFreezeCreativeTask() {
  const queryClient = useQueryClient();
  const { mutate, isPending, error, isSuccess, isError } =
    useCreativeTasksControllerFreezeCreativeTask<ApiError>({
      mutation: {
        onSuccess: async (task, { id }) => {
          queryClient.setQueriesData<GetCreativeTasksResponseDto>(
            { queryKey: [QueryKeys.CREATIVE_TASKS], exact: false },
            (current) => current
              ? { ...current, items: current.items.map((item) => item.id === id ? { ...item, ...task } : item) }
              : current,
          );
          await Promise.all([
            queryClient.invalidateQueries({
              queryKey: [QueryKeys.CREATIVE_TASKS],
              exact: false,
            }),
            queryClient.invalidateQueries({
              queryKey: [QueryKeys.CREATIVE_TASK, id],
            }),
          ]);
        },
      },
    });

  return {
    freezeCreativeTask: mutate,
    isPending,
    error,
    isSuccess,
    isError,
    generalError: error?.message ?? "",
  };
}
