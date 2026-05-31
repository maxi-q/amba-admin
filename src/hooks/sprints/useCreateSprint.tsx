import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";
import { useNavigate } from "react-router-dom";

import { QueryKeys } from '@/config/tanstack/queryKeys';
import { MutationKeys } from '@/config/tanstack/mutationKeys';

import { sprintsControllerCreate } from "@/api/generated/sprints/sprints";
import type { CreateSprintRequestDto } from "@/api/generated/model";
import { ApiError } from "@/types";

export function useCreateSprint() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { mutate: createSprint, isPending, error, isSuccess } = useMutation({
    mutationKey: [MutationKeys.CREATE_SPRINT],
    mutationFn: (data: CreateSprintRequestDto) => sprintsControllerCreate(data),
    onSuccess: (createdSprint) => {
      if (createdSprint) {
        queryClient.invalidateQueries({
          queryKey: [QueryKeys.SPRINTS, createdSprint.roomId]
        });
        // Навигация к созданному спринту
        navigate(`/rooms/${createdSprint.roomId}/sprints/${createdSprint.id}`);
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
    isPending,
    error,
    isSuccess,
    isValidationError,
    validationErrors,
    generalError
  };
}
