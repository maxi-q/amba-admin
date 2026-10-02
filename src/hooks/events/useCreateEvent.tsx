import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { QueryKeys } from '@/config/tanstack/queryKeys';
import { MutationKeys } from '@/config/tanstack/mutationKeys';
import { eventsControllerCreate } from '@/api/generated/events/events';
import type { CreateEventRequestDto } from '@/api/generated/model';
import { ApiError } from '@/types';

export function useCreateEvent({ navigateOnSuccess = true }: { navigateOnSuccess?: boolean } = {}) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { mutate, mutateAsync, isPending, error, isSuccess, isError } = useMutation<
    Awaited<ReturnType<typeof eventsControllerCreate>>,
    ApiError,
    CreateEventRequestDto
  >({
    mutationKey: [MutationKeys.CREATE_EVENT],
    mutationFn: (data: CreateEventRequestDto) => eventsControllerCreate(data),
    onSuccess: async (createdEvent) => {
      if (createdEvent) {
        await queryClient.invalidateQueries({
          queryKey: [QueryKeys.EVENTS, createdEvent.roomId]
        });

        if (navigateOnSuccess) navigate(`/rooms/${createdEvent.roomId}/events/${createdEvent.id}`);
      }
    },
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
    mutate,
    mutateAsync,
    isPending,
    error,
    isSuccess,
    isError,
    isValidationError,
    validationErrors,
    generalError
  };
}
