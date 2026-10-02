import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';
import { QueryKeys } from '@/config/tanstack/queryKeys';
import { MutationKeys } from '@/config/tanstack/mutationKeys';
import { eventsControllerUpdate } from '@/api/generated/events/events';
import type { UpdateEventRequestDto } from '@/api/generated/model';
import { ApiError } from '@/types';

export function usePatchEvent() {
  const queryClient = useQueryClient();

  const { mutate, mutateAsync, isPending, error, isSuccess, isError } = useMutation<
    Awaited<ReturnType<typeof eventsControllerUpdate>>,
    ApiError,
    { data: UpdateEventRequestDto; eventId: string }
  >({
    mutationKey: [MutationKeys.PATCH_EVENT],
    mutationFn: ({ data, eventId }: { data: UpdateEventRequestDto; eventId: string }) =>
      eventsControllerUpdate(eventId, data),
    onSuccess: async (updatedEvent, { eventId }) => {
      await queryClient.invalidateQueries({ queryKey: ['competition', 'event', eventId] });
      if (updatedEvent) {
        await queryClient.invalidateQueries({
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
