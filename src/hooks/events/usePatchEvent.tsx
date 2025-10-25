import { useMutation, useQueryClient } from '@tanstack/react-query';
import { QueryKeys } from '@/config/tanstack/queryKeys';
import { MutationKeys } from '@/config/tanstack/mutationKeys';
import eventsService from '@/services/events/events.service';
import type { IPatchEventsRequest } from '@/services/events/events.types';
import type { ApiError } from '@/types';

export function usePatchEvent() {
  const queryClient = useQueryClient();

  return useMutation<
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
          queryKey: [QueryKeys.EVENTS, updatedEvent.roomId]
        });
        queryClient.setQueryData([QueryKeys.EVENTS, updatedEvent.roomId, eventId], updatedEvent);
      }
    },
  });
}
