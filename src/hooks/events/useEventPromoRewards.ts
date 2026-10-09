import { useQuery } from "@tanstack/react-query";
import {
  eventPromoRewardsControllerJournal,
  eventPromoRewardsControllerRules,
} from "@/api/generated/event-promo-rewards/event-promo-rewards";

export function useEventPromoRewardRules(eventId: string, enabled = true) {
  return useQuery({
    queryKey: ["eventPromoRewards", eventId, "rules"],
    queryFn: ({ signal }) =>
      eventPromoRewardsControllerRules(eventId, undefined, signal),
    enabled: enabled && Boolean(eventId) && eventId !== "new",
  });
}

export function useEventPromoRewardJournal(
  eventId: string,
  ambassadorId?: string,
  enabled = true,
) {
  return useQuery({
    queryKey: ["eventPromoRewards", eventId, "journal", ambassadorId],
    queryFn: ({ signal }) =>
      eventPromoRewardsControllerJournal(
        eventId,
        ambassadorId ? { ambassadorId } : undefined,
        undefined,
        signal,
      ),
    enabled: enabled && Boolean(eventId) && eventId !== "new",
  });
}
