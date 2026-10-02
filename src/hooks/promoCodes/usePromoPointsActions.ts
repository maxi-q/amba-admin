import { useMutation, useQueryClient } from '@tanstack/react-query';
import { roomPromoPointsControllerCreateRule } from '@/api/generated/room-promo-points/room-promo-points';
import { promoPointsRulesControllerUpdateRule, promoPointsRulesControllerDeleteRule } from '@/api/generated/promo-points-rules/promo-points-rules';
import { scopeParams, type CompetitionScope } from '../competitions/types';

export function usePromoPointsActions(scope: CompetitionScope) {
  const client = useQueryClient();
  return useMutation({ mutationFn: (action: { id?: string; usagesPerAward: number; pointsPerAward: string } | { id: string; remove: true }) => {
    if ('remove' in action) return promoPointsRulesControllerDeleteRule(action.id);
    const data = { usagesPerAward: action.usagesPerAward, pointsPerAward: action.pointsPerAward, isActive: true };
    return action.id ? promoPointsRulesControllerUpdateRule(action.id, data)
      : roomPromoPointsControllerCreateRule(scope.roomId, { ...scopeParams(scope), ...data });
  }, onSuccess: () => Promise.all([
    client.invalidateQueries({ queryKey: ['promoPointsRules', scope.roomId] }),
    client.invalidateQueries({ queryKey: ['promoPoints', scope.roomId] }),
  ]) });
}
