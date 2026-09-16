import { useMutation } from "@tanstack/react-query";
import {
  creativeTasksControllerCreateCreativeTask,
  creativeTasksControllerUpdateCreativeTask,
} from "@/api/generated/creative-tasks/creative-tasks";
import type {
  CreateCreativeTaskRequestDto,
  UpdateCreativeTaskRequestDto,
} from "@/api/generated/model";
import { MutationKeys } from "@/config/tanstack/mutationKeys";

export function useSprintTaskActions() {
  const create = useMutation({
    mutationKey: [MutationKeys.CREATE_CREATIVE_TASK],
    mutationFn: (data: CreateCreativeTaskRequestDto) =>
      creativeTasksControllerCreateCreativeTask(data),
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
  });

  return {
    createTaskAsync: create.mutateAsync,
    updateTaskAsync: update.mutateAsync,
  };
}
