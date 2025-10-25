import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";

import { QueryKeys } from '@/config/tanstack/queryKeys';
import { MutationKeys } from '@/config/tanstack/mutationKeys';

import sprintsService from "@services/sprints/sprints.service";
import type { IPatchSprintsRequest } from "@services/sprints/sprints.types";
import { ApiError } from "@/types";

export function usePatchSprint() {
  const queryClient = useQueryClient();

  const { mutate: patchSprint, isPending, error, isSuccess } = useMutation({
    mutationKey: [MutationKeys.PATCH_SPRINT],
    mutationFn: ({ data, sprintId }: { data: IPatchSprintsRequest; sprintId: string }) => 
      sprintsService.patchSprints(data, sprintId),
    onSuccess: (updatedSprint) => {
      if (updatedSprint) {
        queryClient.invalidateQueries({
          queryKey: [QueryKeys.SPRINTS, updatedSprint.roomId]
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
    patchSprint,
    isPending,
    error,
    isSuccess,
    isValidationError,
    validationErrors,
    generalError
  };
}
