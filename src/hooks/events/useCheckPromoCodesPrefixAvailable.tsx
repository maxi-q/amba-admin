import { useMutation } from '@tanstack/react-query';
import eventsService from '@/services/events/events.service';
import type { ApiError } from '@/types';

export function useCheckPromoCodesPrefixAvailable() {
  return useMutation<
    Awaited<ReturnType<typeof eventsService.checkPromoCodesPrefixAvailable>>,
    ApiError,
    string
  >({
    mutationFn: (prefix: string) => eventsService.checkPromoCodesPrefixAvailable(prefix),
  });
}
