import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  creativeTasksControllerCreateCreativeTask,
  creativeTasksControllerUpdateCreativeTask,
} from "@/api/generated/creative-tasks/creative-tasks";
import type {
  CreateCreativeTaskRequestDto,
  UpdateCreativeTaskRequestDto,
} from "@/api/generated/model";
import { MutationKeys } from "@/config/tanstack/mutationKeys";
import { QueryKeys } from "@/config/tanstack/queryKeys";

export function useSprintTaskActions() {
  const queryClient = useQueryClient();
  const create = useMutation({
    mutationKey: [MutationKeys.CREATE_CREATIVE_TASK],
    mutationFn: (data: CreateCreativeTaskRequestDto) =>
      creativeTasksControllerCreateCreativeTask(data),
    onSuccess: (task) => queryClient.invalidateQueries({
      queryKey: [QueryKeys.CREATIVE_TASKS, task.roomId],
    }),
  });
  const update = useMutation({
    mutationKey: [MutationKeys.UPDATE_CREATIVE_TASK],
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: UpdateCreativeTaskRequestDto;
    }) => creativeTasksControllerUpdateCreativeTask(id, data),
    onSuccess: (task, { id }) => Promise.all([
      queryClient.invalidateQueries({ queryKey: [QueryKeys.CREATIVE_TASK, id] }),
      queryClient.invalidateQueries({ queryKey: [QueryKeys.CREATIVE_TASKS, task.roomId] }),
    ]).then(() => undefined),
  });

  return {
    createTaskAsync: create.mutateAsync,
    updateTaskAsync: update.mutateAsync,
  };
}
