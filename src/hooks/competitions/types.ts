export type CompetitionScope = { kind: 'sprint' | 'event'; id: string; roomId: string };
export type CompetitionStatus = 'active' | 'reviewing' | 'awarding' | 'completed';

export const competitionStatusLabels: Record<CompetitionStatus, string> = {
  active: 'Активный', reviewing: 'Проверка ответов', awarding: 'Выдача наград', completed: 'Завершён',
};

export const scopeParams = (scope: CompetitionScope) =>
  scope.kind === 'sprint' ? { sprintId: scope.id } : { eventId: scope.id };
