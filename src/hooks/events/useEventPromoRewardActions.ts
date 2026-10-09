import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  eventPromoRewardsControllerCreate,
  eventPromoRewardsControllerRemove,
  eventPromoRewardsControllerUpdate,
} from "@/api/generated/event-promo-rewards/event-promo-rewards";

type PromoRewardAction =
  | {
      type: "save";
      ruleId?: string;
      usagesPerAward: number;
      rewardId: string;
      rewardAmount: number;
    }
  | { type: "remove"; ruleId: string };

export function useEventPromoRewardActions(eventId: string) {
  const client = useQueryClient();

  return useMutation({
    mutationFn: (action: PromoRewardAction) => {
      if (action.type === "remove") {
        return eventPromoRewardsControllerRemove(eventId, action.ruleId);
      }

      const data = {
        usagesPerAward: action.usagesPerAward,
        rewardId: action.rewardId,
        rewardAmount: action.rewardAmount,
      };
      return action.ruleId
        ? eventPromoRewardsControllerUpdate(eventId, action.ruleId, data)
        : eventPromoRewardsControllerCreate(eventId, data);
    },
    onSuccess: () =>
      client.invalidateQueries({ queryKey: ["eventPromoRewards", eventId] }),
  });
}
