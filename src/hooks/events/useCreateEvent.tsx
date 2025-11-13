import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { QueryKeys } from '@/config/tanstack/queryKeys';
import { MutationKeys } from '@/config/tanstack/mutationKeys';
import eventsService from '@/services/events/events.service';
import type { ICreateEventRequest } from '@/services/events/events.types';
import { ApiError } from '@/types';

export function useCreateEvent() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { mutate, isPending, error, isSuccess, isError } = useMutation<
    Awaited<ReturnType<typeof eventsService.createEvent>>,
    ApiError,
    ICreateEventRequest
  >({
    mutationKey: [MutationKeys.CREATE_EVENT],
    mutationFn: (data: ICreateEventRequest) => eventsService.createEvent(data),
    onSuccess: (createdEvent) => {
      if (createdEvent) {
        queryClient.invalidateQueries({
          queryKey: [QueryKeys.EVENTS, createdEvent.roomId]
        });

        navigate(`/rooms/${createdEvent.roomId}/events/${createdEvent.id}`);
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
    isPending,
    error,
    isSuccess,
    isError,
    isValidationError,
    validationErrors,
    generalError
  };
}
