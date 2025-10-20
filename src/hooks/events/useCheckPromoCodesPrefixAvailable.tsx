import { useMutation } from '@tanstack/react-query';
import eventsService from '@/services/events/events.service';

export function useCheckPromoCodesPrefixAvailable() {
  return useMutation({
    mutationFn: (prefix: string) => eventsService.checkPromoCodesPrefixAvailable(prefix),
  });
}
