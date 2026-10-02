import { useMutation, useQueryClient } from '@tanstack/react-query';
import { sprintsControllerFinishReview, sprintsControllerUpdate } from '@/api/generated/sprints/sprints';
import { eventsControllerUpdate } from '@/api/generated/events/events';
import { eventCompetitionsControllerFinishReview, eventCompetitionsControllerSetParticipants, eventCompetitionsControllerCreateRule, eventCompetitionsControllerUpdateRule, eventCompetitionsControllerDeleteRule, eventCompetitionsControllerUpdateVersions } from '@/api/generated/project/project';
import { competitionRewardsControllerPutSprintManual, competitionRewardsControllerPutEventManual, competitionRewardsControllerDeleteSprintManual, competitionRewardsControllerDeleteEventManual, competitionRewardsControllerSetDelivery } from '@/api/generated/competition-rewards/competition-rewards';
import type { SprintRewardRuleConfigDto } from '@/api/generated/model';
import { QueryKeys } from '@/config/tanstack/queryKeys';
import type { CompetitionScope } from './types';

type Action = { type: 'status'; status: 'reviewing' | 'completed' } | { type: 'finish-review' }
  | { type: 'manual'; ruleRewardId: string; ambassadorId: string; amount: string }
  | { type: 'remove-manual'; ruleRewardId: string; ambassadorId: string }
  | { type: 'delivery'; grantId: string; delivered: boolean };

export function useCompetitionActions(scope: CompetitionScope) {
  const client = useQueryClient();
  return useMutation({ mutationFn: async (action: Action) => {
    if (action.type === 'status') {
      if (scope.kind === 'sprint') await sprintsControllerUpdate(scope.id, { status: action.status });
      else await eventsControllerUpdate(scope.id, { status: action.status });
    } else if (action.type === 'finish-review') {
      if (scope.kind === 'sprint') await sprintsControllerFinishReview(scope.id);
      else await eventCompetitionsControllerFinishReview(scope.id);
    } else if (action.type === 'delivery') await competitionRewardsControllerSetDelivery(action.grantId, { delivered: action.delivered });
    else if (action.type === 'manual') {
      if (scope.kind === 'sprint') await competitionRewardsControllerPutSprintManual(scope.id, action.ruleRewardId, action.ambassadorId, { amount: action.amount });
      else await competitionRewardsControllerPutEventManual(scope.id, action.ruleRewardId, action.ambassadorId, { amount: action.amount });
    } else {
      if (scope.kind === 'sprint') await competitionRewardsControllerDeleteSprintManual(scope.id, action.ruleRewardId, action.ambassadorId);
      else await competitionRewardsControllerDeleteEventManual(scope.id, action.ruleRewardId, action.ambassadorId);
    }
  }, onSuccess: () => Promise.all([
    client.invalidateQueries({ queryKey: ['competition', scope.kind, scope.id] }),
    client.invalidateQueries({ queryKey: [QueryKeys.SPRINTS, scope.roomId] }),
    client.invalidateQueries({ queryKey: [QueryKeys.EVENTS, scope.roomId] }),
    client.invalidateQueries({ queryKey: [QueryKeys.SPRINT_LEADERBOARD, scope.roomId] }),
    client.invalidateQueries({ queryKey: [QueryKeys.CREATIVE_TASKS] }),
    client.invalidateQueries({ queryKey: [QueryKeys.SUBMISSIONS] }),
  ]) });
}

type EventAction = { type: 'participants'; ambassadorIds: string[] }
  | { type: 'rule'; id?: string; data: SprintRewardRuleConfigDto }
  | { type: 'delete-rule'; id: string } | { type: 'versions'; rewardIds: string[] };

export function useEventCompetitionActions(scope: CompetitionScope) {
  const client = useQueryClient();
  return useMutation({ mutationFn: async (action: EventAction) => {
    if (action.type === 'participants') await eventCompetitionsControllerSetParticipants(scope.id, { ambassadorIds: action.ambassadorIds });
    else if (action.type === 'rule') {
      if (action.id) await eventCompetitionsControllerUpdateRule(scope.id, action.id, action.data);
      else await eventCompetitionsControllerCreateRule(scope.id, action.data);
    } else if (action.type === 'delete-rule') await eventCompetitionsControllerDeleteRule(scope.id, action.id);
    else await eventCompetitionsControllerUpdateVersions(scope.id, { rewardIds: action.rewardIds });
  }, onSuccess: () => client.invalidateQueries({ queryKey: ['competition', 'event', scope.id] }) });
}
