import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";

import { QueryKeys } from '@/config/tanstack/queryKeys';
import { MutationKeys } from '@/config/tanstack/mutationKeys';

import { sprintsControllerCreate } from "@/api/generated/sprints/sprints";
import type { CreateSprintRequestDto } from "@/api/generated/model";
import { ApiError } from "@/types";

export function useCreateSprint() {
  const queryClient = useQueryClient();

  const {
    mutate: createSprint,
    mutateAsync: createSprintAsync,
    isPending,
    error,
    isSuccess,
  } = useMutation({
    mutationKey: [MutationKeys.CREATE_SPRINT],
    mutationFn: (data: CreateSprintRequestDto) => sprintsControllerCreate(data),
    onSuccess: (createdSprint) => {
      if (createdSprint) {
        queryClient.invalidateQueries({
          queryKey: [QueryKeys.SPRINTS, createdSprint.roomId]
        });
      }
    }
  });

  const isValidationError = useMemo(() =>
    error instanceof ApiError && error.statusCode === 422,
    [error]
  );

  const validationErrors = useMemo(() =>
    error instanceof ApiError && error.fieldErrors ? error.fieldErrors : {},
    [error]
  );

  const generalError = useMemo(() =>
    error instanceof ApiError && error.statusCode !== 422 ? error.message : '',
    [error]
  );

  return {
    createSprint,
    createSprintAsync,
    isPending,
    error,
    isSuccess,
    isValidationError,
    validationErrors,
    generalError
  };
}
