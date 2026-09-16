import { useMutation } from "@tanstack/react-query";
import {
  sprintsControllerCreateRewardRule,
  sprintsControllerDeleteRewardRule,
  sprintsControllerUpdateRewardRule,
} from "@/api/generated/sprints/sprints";
import type {
  CreateRewardRuleRequestDto,
  UpdateRewardRuleRequestDto,
} from "@/api/generated/model";
import { MutationKeys } from "@/config/tanstack/mutationKeys";

export function useSprintRewardRuleActions() {
  const create = useMutation({
    mutationKey: [MutationKeys.CREATE_SPRINT_REWARD_RULE],
    mutationFn: ({
      sprintId,
      data,
    }: {
      sprintId: string;
      data: CreateRewardRuleRequestDto;
    }) => sprintsControllerCreateRewardRule(sprintId, data),
  });
  const update = useMutation({
    mutationKey: [MutationKeys.UPDATE_SPRINT_REWARD_RULE],
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: UpdateRewardRuleRequestDto;
    }) => sprintsControllerUpdateRewardRule(id, data),
  });
  const remove = useMutation({
    mutationKey: [MutationKeys.DELETE_SPRINT_REWARD_RULE],
    mutationFn: (id: string) => sprintsControllerDeleteRewardRule(id),
  });

  return {
    createRuleAsync: create.mutateAsync,
    updateRuleAsync: update.mutateAsync,
    deleteRuleAsync: remove.mutateAsync,
  };
}
