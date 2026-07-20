import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";
import { QueryKeys } from "@/config/tanstack/queryKeys";
import { MutationKeys } from "@/config/tanstack/mutationKeys";
import {
  rewardsControllerCreateReward,
  rewardsControllerDeleteReward,
  rewardsControllerUpdateReward,
} from "@/api/generated/rewards/rewards";
import type { CreateRewardRequestDto, UpdateRewardRequestDto } from "@/api/generated/model";
import { ApiError } from "@/types";

const getErrorState = (error: unknown) => ({
  isValidationError: error instanceof ApiError && error.statusCode === 422,
  validationErrors: error instanceof ApiError && error.fieldErrors ? error.fieldErrors : {},
  generalError: error instanceof ApiError && error.statusCode !== 422 ? error.message : "",
});

export function useCreateReward() {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationKey: [MutationKeys.CREATE_REWARD],
    mutationFn: (data: CreateRewardRequestDto) => rewardsControllerCreateReward(data),
    onSuccess: (reward) => {
      queryClient.invalidateQueries({ queryKey: [QueryKeys.REWARDS, reward.roomId], exact: false });
    },
  });

  return {
    createReward: mutation.mutate,
    isPending: mutation.isPending,
    ...getErrorState(mutation.error),
  };
}

export function useUpdateReward() {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationKey: [MutationKeys.UPDATE_REWARD],
    mutationFn: ({ id, data }: { id: string; data: UpdateRewardRequestDto }) =>
      rewardsControllerUpdateReward(id, data),
    onSuccess: (reward) => {
      queryClient.invalidateQueries({ queryKey: [QueryKeys.REWARDS, reward.roomId], exact: false });
    },
  });

  return {
    updateReward: mutation.mutate,
    isPending: mutation.isPending,
    ...getErrorState(mutation.error),
  };
}

export function useDeleteReward(roomId: string) {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationKey: [MutationKeys.DELETE_REWARD],
    mutationFn: (id: string) => rewardsControllerDeleteReward(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QueryKeys.REWARDS, roomId], exact: false });
    },
  });

  const generalError = useMemo(
    () =>
      mutation.error instanceof ApiError && mutation.error.statusCode !== 422
        ? mutation.error.message
        : "",
    [mutation.error]
  );

  return {
    deleteReward: mutation.mutate,
    isPending: mutation.isPending,
    generalError,
  };
}
