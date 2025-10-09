import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { QueryKeys } from '@/config/tanstack/queryKeys';
import { MutationKeys } from '@/config/tanstack/mutationKeys';
import eventsService from '@/services/events/events.service';
import type { ICreateEventRequest } from '@/services/events/events.types';

export function useCreateEvent() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationKey: [MutationKeys.CREATE_EVENT],
    mutationFn: (data: ICreateEventRequest) => eventsService.createEvent(data),
    onSuccess: (createdEvent) => {
      if (createdEvent) {
        // Инвалидируем список событий для комнаты
        queryClient.invalidateQueries({
          queryKey: [QueryKeys.EVENTS, createdEvent.roomId]
        });
        // Переходим на страницу созданного события
        navigate(`/rooms/${createdEvent.roomId}/events/${createdEvent.id}`);
      }
    },
  });
}
