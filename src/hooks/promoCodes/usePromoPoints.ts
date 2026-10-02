import { useQuery } from '@tanstack/react-query';
import { roomPromoPointsControllerListRules, roomPromoPointsControllerListPoints } from '@/api/generated/room-promo-points/room-promo-points';
import { scopeParams, type CompetitionScope } from '../competitions/types';

export function usePromoPointsRules(scope: CompetitionScope) {
  return useQuery({ queryKey: ['promoPointsRules', scope.roomId], enabled: !!scope.roomId,
    queryFn: () => roomPromoPointsControllerListRules(scope.roomId),
    select: (rules) => rules.filter((rule) => scope.kind === 'sprint' ? rule.sprintId === scope.id : rule.eventId === scope.id) });
}

export function usePromoPoints(scope: CompetitionScope, ambassadorId?: string, page = 1) {
  return useQuery({ queryKey: ['promoPoints', scope.roomId, scope.kind, scope.id, ambassadorId, page], enabled: !!scope.roomId && !!scope.id && scope.id !== 'new',
    queryFn: ({ signal }) => roomPromoPointsControllerListPoints(scope.roomId, { ...scopeParams(scope), ambassadorId, page, limit: 50 }, undefined, signal) });
}
