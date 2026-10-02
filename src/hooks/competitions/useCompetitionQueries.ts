import { useQuery } from '@tanstack/react-query';
import { sprintsControllerGetReview, sprintsControllerGetRewardRules } from '@/api/generated/sprints/sprints';
import { eventCompetitionsControllerReview, eventCompetitionsControllerGetResults, eventCompetitionsControllerGetRules, eventCompetitionsControllerGetParticipants } from '@/api/generated/project/project';
import { competitionRewardsControllerGetSprintGrants, competitionRewardsControllerGetEventGrants } from '@/api/generated/competition-rewards/competition-rewards';
import { ambassadorControllerGetRoomApplications } from '@/api/generated/ambassador/ambassador';
import type { CompetitionRewardsControllerGetSprintGrantsParams } from '@/api/generated/model';
import { collectPages } from '../collectPages';
import { QueryKeys } from '@/config/tanstack/queryKeys';
import type { CompetitionScope } from './types';

export function useCompetitionReview(scope: CompetitionScope) {
  return useQuery({ queryKey: ['competition', scope.kind, scope.id, 'review'], enabled: !!scope.id && scope.id !== 'new',
    queryFn: () => scope.kind === 'sprint' ? sprintsControllerGetReview(scope.id) : eventCompetitionsControllerReview(scope.id) });
}

export function useCompetitionGrants(scope: CompetitionScope, params: CompetitionRewardsControllerGetSprintGrantsParams = {}) {
  return useQuery({ queryKey: ['competition', scope.kind, scope.id, 'grants', params], enabled: !!scope.id && scope.id !== 'new',
    queryFn: ({ signal }) => collectPages((page) => scope.kind === 'sprint'
      ? competitionRewardsControllerGetSprintGrants(scope.id, { ...params, page, size: 100 }, undefined, signal)
      : competitionRewardsControllerGetEventGrants(scope.id, { ...params, page, size: 100 }, undefined, signal)) });
}

export function useCompetitionRules(scope: CompetitionScope) {
  return useQuery({ queryKey: scope.kind === 'sprint' ? [QueryKeys.SPRINT_REWARD_RULES, scope.id] : ['competition', scope.kind, scope.id, 'rules'], enabled: !!scope.id && scope.id !== 'new',
    queryFn: async () => scope.kind === 'sprint' ? sprintsControllerGetRewardRules(scope.id) : eventCompetitionsControllerGetRules(scope.id),
    select: (data) => Array.isArray(data) ? data : data.items });
}

export function useEventResults(eventId: string, page = 1, search = '') {
  return useQuery({ queryKey: ['competition', 'event', eventId, 'results', page, search], enabled: !!eventId && eventId !== 'new',
    queryFn: ({ signal }) => eventCompetitionsControllerGetResults(eventId, { page, size: 50, search: search || undefined }, undefined, signal) });
}

export function useEventParticipants(eventId: string) {
  return useQuery({ queryKey: ['competition', 'event', eventId, 'participants'], enabled: !!eventId && eventId !== 'new',
    queryFn: () => eventCompetitionsControllerGetParticipants(eventId) });
}

export function useApprovedParticipants(roomId: string) {
  return useQuery({ queryKey: ['roomApplications', 'approved', roomId, 'all'], enabled: !!roomId,
    queryFn: ({ signal }) => collectPages((page) => ambassadorControllerGetRoomApplications({ roomIds: [roomId], status: 'approved', page, size: 100 }, undefined, signal)) });
}
