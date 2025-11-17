import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';
import { QueryKeys } from '@/config/tanstack/queryKeys';
import { MutationKeys } from '@/config/tanstack/mutationKeys';
import eventsService from '@/services/events/events.service';
import type { IPatchEventsRequest } from '@/services/events/events.types';
import { ApiError } from '@/types';

export function usePatchEvent() {
  const queryClient = useQueryClient();

  const { mutate, isPending, error, isSuccess, isError } = useMutation<
    Awaited<ReturnType<typeof eventsService.patchEvents>>,
    ApiError,
    { data: IPatchEventsRequest; eventId: string }
  >({
    mutationKey: [MutationKeys.PATCH_EVENT],
    mutationFn: ({ data, eventId }: { data: IPatchEventsRequest; eventId: string }) =>
      eventsService.patchEvents(data, eventId),
    onSuccess: (updatedEvent, { eventId }) => {
      if (updatedEvent) {
        queryClient.invalidateQueries({
          queryKey: [QueryKeys.EVENTS, updatedEvent.roomId],
          exact: false
        });
        queryClient.setQueryData([QueryKeys.EVENTS, updatedEvent.roomId, eventId], updatedEvent);
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
