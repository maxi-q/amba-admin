import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { QueryKeys } from "@/config/tanstack/queryKeys";
import { MutationKeys } from "@/config/tanstack/mutationKeys";
import {
  sprintsControllerCreateRewardRule,
  sprintsControllerDeleteRewardRule,
  sprintsControllerGetRewardRules,
  sprintsControllerUpdateRewardRule,
} from "@/api/generated/sprints/sprints";
import type {
  CreateRewardRuleRequestDto,
  UpdateRewardRuleRequestDto,
} from "@/api/generated/model";
import { ApiError } from "@/types";

const getErrorState = (error: unknown) => ({
  isValidationError: error instanceof ApiError && error.statusCode === 422,
  validationErrors: error instanceof ApiError && error.fieldErrors ? error.fieldErrors : {},
  generalError: error instanceof ApiError && error.statusCode !== 422 ? error.message : "",
});

export function useSprintRewardRules(sprintId: string) {
  const query = useQuery({
    queryKey: [QueryKeys.SPRINT_REWARD_RULES, sprintId],
    queryFn: () => sprintsControllerGetRewardRules(sprintId),
    enabled: !!sprintId && sprintId !== "new",
    staleTime: 15_000,
  });

  return {
    rules: query.data?.items ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}

export function useCreateSprintRewardRule(sprintId: string) {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationKey: [MutationKeys.CREATE_SPRINT_REWARD_RULE],
    mutationFn: (data: CreateRewardRuleRequestDto) =>
      sprintsControllerCreateRewardRule(sprintId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QueryKeys.SPRINT_REWARD_RULES, sprintId] });
      queryClient.invalidateQueries({ queryKey: [QueryKeys.SPRINT_LEADERBOARD], exact: false });
    },
  });

  return {
    createRule: mutation.mutate,
    isPending: mutation.isPending,
    ...getErrorState(mutation.error),
  };
}

export function useUpdateSprintRewardRule(sprintId: string) {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationKey: [MutationKeys.UPDATE_SPRINT_REWARD_RULE],
    mutationFn: ({ id, data }: { id: string; data: UpdateRewardRuleRequestDto }) =>
      sprintsControllerUpdateRewardRule(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QueryKeys.SPRINT_REWARD_RULES, sprintId] });
      queryClient.invalidateQueries({ queryKey: [QueryKeys.SPRINT_LEADERBOARD], exact: false });
    },
  });

  return {
    updateRule: mutation.mutate,
    isPending: mutation.isPending,
    ...getErrorState(mutation.error),
  };
}

export function useDeleteSprintRewardRule(sprintId: string) {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationKey: [MutationKeys.DELETE_SPRINT_REWARD_RULE],
    mutationFn: (id: string) => sprintsControllerDeleteRewardRule(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QueryKeys.SPRINT_REWARD_RULES, sprintId] });
      queryClient.invalidateQueries({ queryKey: [QueryKeys.SPRINT_LEADERBOARD], exact: false });
    },
  });

  return {
    deleteRule: mutation.mutate,
    isPending: mutation.isPending,
    generalError:
      mutation.error instanceof ApiError && mutation.error.statusCode !== 422
        ? mutation.error.message
        : "",
  };
}
