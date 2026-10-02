import type { AxiosRequestConfig } from 'axios';
import type { BaseSprintDto, BaseEventDto, RewardSummaryDto, BaseCreativeTaskSubmissionDto, CreativeTaskWithDefaultsDto, SprintRewardRuleDto, CompetitionRewardRuleDto, LeaderboardEntryDto, RewardGrantDto, PromoPointsRuleResponseDto, PromoPointsAccrualResponseDto, SprintRewardRuleConfigDto, EventParticipantDto } from '../api/generated/model';
import { distributeRewardPool, rankParticipants } from '../utils/sprintRewardPreview';

type State = { roomId: string; sprints: BaseSprintDto[]; rules: SprintRewardRuleDto[]; rewards: RewardSummaryDto[]; entries: LeaderboardEntryDto[]; tasks: CreativeTaskWithDefaultsDto[]; submissions: BaseCreativeTaskSubmissionDto[] };
const now = () => new Date().toISOString();
const body = <T,>(config: AxiosRequestConfig): T => typeof config.data === 'string' ? JSON.parse(config.data) : config.data ?? {};
const pageOf = <T,>(items: T[], params: { page?: number; size?: number } = {}) => {
  const page = Number(params.page) || 1, size = Number(params.size) || 50;
  return { items: items.slice((page - 1) * size, page * size), page, size, total: items.length, totalPages: Math.ceil(items.length / size) };
};

/** In-memory API only. Loaded exclusively by the dev preview entry. */
export function createCompetitionPreview() {
  let initialized = false;
  const events: BaseEventDto[] = [];
  const eventRules: CompetitionRewardRuleDto[] = [];
  const members = new Map<string, EventParticipantDto[]>();
  const snapshots = new Map<string, LeaderboardEntryDto[]>();
  const seedIds = new Set<string>();
  let grants: RewardGrantDto[] = [];
  let promoRules: PromoPointsRuleResponseDto[] = [];
  const accruals: PromoPointsAccrualResponseDto[] = [];

  return (config: AxiosRequestConfig, state: State): { data: unknown } | undefined => {
    const method = config.method?.toUpperCase() ?? 'GET', url = config.url ?? '';
    const response = (data: unknown) => ({ data: structuredClone(data) });
    const rulesFor = (id: string) => [...state.rules.filter((rule) => rule.sprintId === id), ...eventRules.filter((rule) => rule.eventId === id)];
    const parentFor = (id: string) => {
      const parent = [...state.sprints, ...events].find((item) => item.id === id);
      if (!parent) throw new Error('Спринт или событие не найдено');
      return parent;
    };
    const addGrant = (id: string, ruleRewardId: string, ambassadorId: string, amount: number, assignmentType: 'manual' | 'automatic') => {
      const position = rulesFor(id).flatMap((rule) => rule.rewards).find((item) => item.id === ruleRewardId)!;
      const person = state.entries.find((item) => item.ambassadorId === ambassadorId);
      const grant: RewardGrantDto = { id: crypto.randomUUID(), sprintId: events.some((item) => item.id === id) ? null : id, eventId: events.some((item) => item.id === id) ? id : null, ambassadorId, ambassador: { id: ambassadorId, username: person?.username ?? ambassadorId, subscriberId: ambassadorId, channelTypeId: 1 }, ruleRewardId, rewardId: position.rewardId, rewardVersionId: position.rewardVersionId!, reward: { id: position.rewardId, name: position.reward.name, version: position.reward.version, isDivisible: position.reward.isDivisible, divisionPrecision: position.reward.divisionPrecision, iconUrl: position.reward.iconUrl }, amount, assignmentType, deliveredAt: null, deliveredByProjectId: null, createdAt: now(), updatedAt: now(), history: [] };
      grants.push(grant); return grant;
    };
    const inScope = (grant: RewardGrantDto, id: string) => grant.sprintId === id || grant.eventId === id;
    const rowsFor = (id: string): LeaderboardEntryDto[] => {
      const parent = parentFor(id);
      if (parent.resultsFixedAt) return snapshots.get(id) ?? [];
      if (parent.status === 'completed' || parent.status === 'awarding') return [];
      const selected = members.get(id)?.filter((item) => item.status === 'approved').map((item) => item.ambassadorId);
      const entries = selected ? selected.map((ambassadorId) => {
        const person = state.entries.find((item) => item.ambassadorId === ambassadorId);
        const promoPoints = accruals.filter((item) => item.eventId === id && item.ambassadorId === ambassadorId).reduce((sum, item) => sum + Number(item.points), 0);
        return { ...person, ambassadorId, username: person?.username ?? members.get(id)?.find((item) => item.ambassadorId === ambassadorId)?.username ?? ambassadorId, avatarUrl: person?.avatarUrl ?? null, promoCode: person?.promoCode ?? '', points: promoPoints, promoPoints, taskPoints: 0, rank: null, rewards: [] };
      }) : state.entries.filter(() => seedIds.has(id));
      return rankParticipants(entries.map((entry) => ({ id: entry.ambassadorId, points: entry.points, entry }))).map(({ participant, rank }) => ({ ...participant.entry, rank, rewards: [] }));
    };
    const awardsFor = (id: string, entries: LeaderboardEntryDto[]) => {
      const automatic: { ruleRewardId: string; ambassadorId: string; amount: number }[] = [];
      for (const rule of rulesFor(id).filter((item) => item.type !== 'manual')) {
        const eligible = entries.filter((entry) => rule.type === 'each' || entry.rank != null && entry.rank >= (rule.rankFrom ?? 1) && entry.rank <= (rule.rankTo ?? Infinity) && (rule.type !== 'byPoints' || entry.points >= (rule.minPoints ?? 0)));
        for (const position of rule.rewards) {
          const distribution = rule.type === 'byPoints' ? distributeRewardPool(position.amount, position.reward.isDivisible ? position.reward.divisionPrecision : 0, eligible.map((entry) => ({ id: entry.ambassadorId, points: entry.points }))) : null;
          for (const entry of eligible) { const amount = distribution?.get(entry.ambassadorId) ?? position.amount; if (amount > 0) automatic.push({ ruleRewardId: position.id, ambassadorId: entry.ambassadorId, amount }); }
        }
      }
      return automatic;
    };
    const finish = (id: string) => {
      const parent = parentFor(id);
      if (parent.resultsFixedAt) return;
      if (parent.isDraft || parent.status !== 'reviewing') throw new Error('Сначала переведите в проверку ответов');
      const rows = rowsFor(id);
      snapshots.set(id, structuredClone(rows));
      for (const item of awardsFor(id, rows)) addGrant(id, item.ruleRewardId, item.ambassadorId, item.amount, 'automatic');
      parent.resultsFixedAt = now(); parent.status = 'awarding';
    };
    if (!initialized) {
      initialized = true;
      state.sprints.forEach((item) => seedIds.add(item.id));
      for (const sprint of state.sprints.filter((item) => item.id !== 'sprint-active')) {
        if (!state.rules.some((rule) => rule.sprintId === sprint.id)) state.rules.push(...state.rules.filter((rule) => rule.sprintId === 'sprint-active').map((rule) => ({ ...structuredClone(rule), id: `${sprint.id}-${rule.id}`, sprintId: sprint.id, rewards: rule.rewards.map((position) => ({ ...structuredClone(position), id: `${sprint.id}-${position.id}` })) })));
        if (sprint.status === 'awarding' || sprint.status === 'completed') { const completed = sprint.status === 'completed'; sprint.status = 'reviewing'; sprint.resultsFixedAt = null; finish(sprint.id); if (completed) { sprint.status = 'completed'; grants.filter((grant) => inScope(grant, sprint.id)).forEach((grant) => { grant.deliveredAt = now(); }); } }
      }
      for (const [id, type, name] of [['event-contest', 'contest', 'Конкурс промокодов'], ['event-everyone', 'everyone', 'Награды каждому участнику']] as const) {
        events.push({ id, type, status: 'active', isDraft: false, createdAt: now(), updatedAt: now(), reviewStartedAt: null, resultsFixedAt: null, completedAt: null, name, description: 'Участвуйте в событии и получайте награды', promoCodesPrefix: type === 'contest' ? 'SALE' : 'GIFT', startDate: '2026-09-01T00:00:00.000Z', endDate: '2026-12-31T00:00:00.000Z', ignoreEndDate: false, promoCodeUsagesCount: 15, promoCodeUsageLimit: 100, ignorePromoCodeUsageLimit: false, isDeleted: false, rewardType: 'fix', rewardValue: 100, rewardUnits: '₽', roomId: state.roomId });
        members.set(id, state.entries.map((entry) => ({ id: `${id}-${entry.ambassadorId}`, ambassadorId: entry.ambassadorId, username: entry.username, status: 'approved' })));
        const seed = state.rules.find((rule) => rule.type === 'byRank')!;
        eventRules.push({ ...structuredClone(seed), id: `${id}-rule`, sprintId: null, eventId: id, type: type === 'everyone' ? 'each' : 'byRank', rewards: seed.rewards.slice(0, 2).map((item) => ({ ...structuredClone(item), id: `${id}-${item.id}` })) });
      }
      promoRules = ['sprint-active', 'event-contest'].map((id) => ({ id: `promo-rule-${id}`, ...(id.startsWith('event') ? { eventId: id } : { sprintId: id }), usagesPerAward: 5, pointsPerAward: '100', isActive: true, effectiveFrom: now(), createdAt: now(), updatedAt: now() }));
      for (const rule of promoRules) accruals.push({ id: `accrual-${rule.id}`, sprintId: rule.sprintId, eventId: rule.eventId, ambassadorId: 'ambassador-1', ruleId: rule.id, systemEventId: `usage-${rule.id}`, points: '100', thresholdNumber: 1, createdAt: now() });
    }
    if (method === 'GET' && url === `/api/events/${state.roomId}`) return response(pageOf(events.filter((item) => !item.isDeleted), config.params));
    if (method === 'GET' && url.includes('/events/check-promo-codes-prefix-available/')) return response(true);
    if (method === 'POST' && url === '/api/events') {
      const data = body<BaseEventDto>(config);
      if (events.some((item) => item.promoCodesPrefix === data.promoCodesPrefix)) throw new Error('Префикс уже занят');
      const item = { ...data, id: `event-${crypto.randomUUID()}`, status: 'active' as const, createdAt: now(), updatedAt: now(), reviewStartedAt: null, resultsFixedAt: null, completedAt: null, promoCodeUsagesCount: 0 };
      events.push(item); members.set(item.id, []); return response(item);
    }
    const parentMatch = url.match(/^\/api\/(sprints|events)\/([^/]+)$/);
    if (method === 'PATCH' && parentMatch) {
      const data = body<Partial<BaseEventDto>>(config), parent = parentFor(parentMatch[2]);
      if (data.status && data.status !== parent.status) {
        if (data.status === 'reviewing' && parent.status === 'active' && !parent.isDraft) { parent.status = 'reviewing'; parent.reviewStartedAt = now(); }
        else if (data.status === 'completed' && parent.status === 'awarding' && parent.resultsFixedAt && !grants.some((grant) => inScope(grant, parent.id) && !grant.deliveredAt)) { parent.status = 'completed'; parent.completedAt = now(); }
        else throw new Error('Недопустимый переход или остались невыданные награды');
        return response(parent);
      }
      if (parentMatch[1] === 'events') {
        if (parent.status !== 'active') throw new Error('Настройки доступны только в active');
        if (data.type && data.type !== (parent as BaseEventDto).type && rulesFor(parent.id).length) throw new Error('Сначала удалите правила наград');
        Object.assign(parent, data, { updatedAt: now() }); return response(parent);
      }
    }
    const scopeMatch = url.match(/^\/api\/(sprints|events)\/([^/]+)\/(review|finish-review|reward-grants|results|participants|reward-rules|reward-versions)(?:\/([^/]+))?$/);
    if (scopeMatch) {
      const [, kind, id, operation, ruleId] = scopeMatch, parent = parentFor(id);
      if (operation === 'review') {
        const taskIds = new Set(state.tasks.filter((task) => task.sprintId === id && !task.isDeleted && !task.isFrozen).map((task) => task.id));
        const rows = kind === 'sprints' ? state.submissions.filter((item) => taskIds.has(item.taskId)) : [];
        const pending = rows.filter((item) => item.status.startsWith('waiting_for_review'));
        return response({ status: parent.status, reviewStartedAt: parent.reviewStartedAt, resultsFixedAt: parent.resultsFixedAt, tasksWithReview: new Set(pending.map((item) => item.taskId)).size, waitingMaterials: rows.filter((item) => item.status === 'waiting_for_review_materials').length, waitingPublication: rows.filter((item) => item.status === 'waiting_for_publication').length, waitingPublicationReview: rows.filter((item) => item.status === 'waiting_for_review_publication').length, waitingReviewAnswers: pending.length, unfinishedAnswers: rows.filter((item) => item.status !== 'approved').length, uniqueAmbassadors: new Set(pending.map((item) => item.ambassadorId)).size });
      }
      if (operation === 'finish-review' && method === 'POST') { finish(id); return response({ status: parent.status, isFinal: true, resultsFixedAt: parent.resultsFixedAt, participants: snapshots.get(id)?.length ?? 0 }); }
      if (operation === 'reward-grants') return response(pageOf(grants.filter((grant) => inScope(grant, id) && (!config.params?.ambassadorId || grant.ambassadorId === config.params.ambassadorId) && (config.params?.delivered == null || !!grant.deliveredAt === config.params.delivered) && (!config.params?.assignmentType || grant.assignmentType === config.params.assignmentType) && (!config.params?.search || grant.ambassador.username.toLowerCase().includes(String(config.params.search).toLowerCase()))), config.params));
      if (operation === 'participants') {
        if (method === 'PUT') {
          if (parent.status !== 'active') throw new Error('Состав участников уже зафиксирован');
          const ids = body<{ ambassadorIds: string[] }>(config).ambassadorIds;
          if (grants.some((grant) => inScope(grant, id) && !ids.includes(grant.ambassadorId))) throw new Error('Сначала снимите ручные назначения исключаемых участников');
          members.set(id, ids.map((ambassadorId) => ({ id: `${id}-${ambassadorId}`, ambassadorId, username: state.entries.find((item) => item.ambassadorId === ambassadorId)?.username ?? ambassadorId, status: 'approved' })));
        }
        return response(members.get(id) ?? []);
      }
      if (operation === 'reward-rules' && kind === 'events') {
        if (method === 'GET') return response(rulesFor(id));
        if (parent.status !== 'active') throw new Error('Правила наград зафиксированы');
        if (method === 'DELETE') { if (grants.some((grant) => rulesFor(id).find((rule) => rule.id === ruleId)?.rewards.some((position) => position.id === grant.ruleRewardId))) throw new Error('Правило уже используется'); const index = eventRules.findIndex((rule) => rule.id === ruleId); eventRules.splice(index, 1); return response(null); }
        const data = body<SprintRewardRuleConfigDto>(config), old = eventRules.find((rule) => rule.id === ruleId);
        if ((parent as BaseEventDto).type === 'everyone' ? !['each', 'manual'].includes(data.type) : data.type === 'each') throw new Error('Недопустимый тип правила');
        const rule: CompetitionRewardRuleDto = { id: old?.id ?? crypto.randomUUID(), sprintId: null, eventId: id, createdAt: old?.createdAt ?? now(), updatedAt: now(), type: data.type, rankFrom: data.rankFrom ?? null, rankTo: data.rankTo ?? null, minPoints: data.minPoints ?? null, rewards: data.rewards.map((line) => { const reward = state.rewards.find((item) => item.id === line.rewardId)!; const prev = old?.rewards.find((item) => item.rewardId === line.rewardId); return { id: prev?.id ?? crypto.randomUUID(), rewardId: reward.id, rewardVersionId: prev?.rewardVersionId ?? `${reward.id}-v${reward.version}`, amount: Number(line.amount), reward: prev?.reward ?? reward }; }) };
        if (old) eventRules.splice(eventRules.indexOf(old), 1, rule); else eventRules.push(rule); return response(rule);
      }
      if (operation === 'reward-versions' && method === 'PATCH' && kind === 'events') {
        if (parent.status !== 'active') throw new Error('Версии наград уже зафиксированы');
        const ids = body<{ rewardIds: string[] }>(config).rewardIds;
        const positions = rulesFor(id).flatMap((rule) => rule.rewards).filter((position) => ids.includes(position.rewardId));
        if (positions.some((position) => grants.some((grant) => grant.ruleRewardId === position.id))) throw new Error('Сначала снимите ручные назначения');
        positions.forEach((position) => { const latest = state.rewards.find((reward) => reward.id === position.rewardId); if (latest) { position.reward = structuredClone(latest); position.rewardVersionId = latest.versionId; } });
        return response({ updatedCount: positions.length, items: rulesFor(id) });
      }
    }
    const resultMatch = url.match(/^\/api\/sprints\/[^/]+\/leaderboard$/);
    if ((scopeMatch?.[3] === 'results' || resultMatch) && method === 'GET') {
      const id = scopeMatch?.[2] ?? config.params?.sprintId ?? 'sprint-active', parent = parentFor(id);
      const rows = structuredClone(rowsFor(id));
      const manual = grants.filter((grant) => inScope(grant, id));
      if (parent.resultsFixedAt) for (const grant of manual) if (!rows.some((row) => row.ambassadorId === grant.ambassadorId)) rows.push({ rank: null, ambassadorId: grant.ambassadorId, username: grant.ambassador.username, avatarUrl: null, promoCode: '', points: 0, taskPoints: 0, promoPoints: 0, rewards: [] });
      const amounts = parent.resultsFixedAt ? manual : [...awardsFor(id, rows), ...manual.filter((item) => item.assignmentType === 'manual')];
      for (const row of rows) for (const allocation of amounts.filter((item) => item.ambassadorId === row.ambassadorId)) {
        const position = rulesFor(id).flatMap((rule) => rule.rewards).find((item) => item.id === allocation.ruleRewardId)!;
        const existing = row.rewards.find((item) => item.rewardId === position.rewardId);
        if (existing) existing.amount += allocation.amount;
        else row.rewards.push({ rewardId: position.rewardId, name: position.reward.name, amount: allocation.amount, rewardVersionId: position.rewardVersionId, rewardVersion: position.reward.version, isDivisible: position.reward.isDivisible, divisionPrecision: position.reward.divisionPrecision });
      }
      const search = String(config.params?.search ?? '').toLocaleLowerCase('ru-RU');
      const filtered = rows.filter((row) => `${row.username} ${row.promoCode}`.toLocaleLowerCase('ru-RU').includes(search));
      const manualPositions = rulesFor(id).filter((rule) => rule.type === 'manual').flatMap((rule) => rule.rewards.map((position) => { const assignedAmount = manual.filter((item) => item.ruleRewardId === position.id).reduce((sum, item) => sum + item.amount, 0); return { ruleRewardId: position.id, rewardId: position.rewardId, rewardVersionId: position.rewardVersionId, totalAmount: position.amount, assignedAmount, remainingAmount: position.amount - assignedAmount }; }));
      return response({ ...pageOf(filtered, config.params), ...(scopeMatch ? { event: parent } : { sprint: { ...parent, isEndless: parent.ignoreEndDate } }), isFinal: !!parent.resultsFixedAt, resultsFixedAt: parent.resultsFixedAt, historyUnavailable: ['awarding', 'completed'].includes(parent.status) && !parent.resultsFixedAt, manualRewards: [], manualPositions });
    }
    const manualMatch = url.match(/^\/api\/(sprints|events)\/([^/]+)\/manual-rewards\/([^/]+)\/participants\/([^/]+)$/);
    if (manualMatch) {
      const [, , id, positionId, ambassadorId] = manualMatch, parent = parentFor(id);
      if (parent.isDraft || parent.status === 'completed') throw new Error('Ручное назначение недоступно');
      const existing = grants.find((grant) => inScope(grant, id) && grant.ruleRewardId === positionId && grant.ambassadorId === ambassadorId);
      if (existing?.deliveredAt) throw new Error('Сначала отмените выдачу');
      if (method === 'DELETE') { grants = grants.filter((grant) => grant !== existing); return response(null); }
      const position = rulesFor(id).filter((rule) => rule.type === 'manual').flatMap((rule) => rule.rewards).find((item) => item.id === positionId);
      if (!position) throw new Error('Ручная награда не найдена');
      const amount = Number(body<{ amount: string | number }>(config).amount), used = grants.filter((grant) => grant.ruleRewardId === positionId && grant !== existing).reduce((sum, grant) => sum + grant.amount, 0);
      const rawAmount = String(body<{ amount: string | number }>(config).amount);
      const precision = position.reward.isDivisible ? position.reward.divisionPrecision : 0;
      if (!/^\d+(?:\.\d+)?$/.test(rawAmount) || (rawAmount.split('.')[1]?.length ?? 0) > precision || !Number.isFinite(amount) || amount <= 0 || Number((used + amount).toFixed(precision)) > position.amount) throw new Error('Недостаточно наград в ручном пуле или недопустимая точность');
      if (members.has(id) && !members.get(id)?.some((item) => item.ambassadorId === ambassadorId && item.status === 'approved')) throw new Error('Участник не выбран для события');
      if (existing) { existing.amount = amount; return response(existing); }
      return response(addGrant(id, positionId, ambassadorId, amount, 'manual'));
    }
    const deliveryMatch = url.match(/^\/api\/reward-grants\/([^/]+)\/delivery$/);
    if (deliveryMatch && method === 'PATCH') {
      const grant = grants.find((item) => item.id === deliveryMatch[1]); if (!grant) throw new Error('Назначение не найдено');
      const parent = parentFor(grant.sprintId ?? grant.eventId!), delivered = body<{ delivered: boolean }>(config).delivered;
      if (!!grant.deliveredAt === delivered) return response(grant);
      if (delivered && parent.status !== 'awarding') throw new Error('Выдача доступна только после фиксации итогов');
      grant.deliveredAt = delivered ? now() : null;
      grant.history!.push({ id: crypto.randomUUID(), projectId: 'preview-project', action: delivered ? 'delivered' : 'delivery_cancelled', createdAt: now() });
      if (!delivered && parent.status === 'completed') { parent.status = 'awarding'; parent.completedAt = null; }
      return response(grant);
    }
    if (url === `/api/rooms/${state.roomId}/promo-points-rules`) {
      if (method === 'GET') return response(promoRules);
      const data = body<PromoPointsRuleResponseDto>(config), id = data.sprintId ?? data.eventId!;
      if (parentFor(id).status !== 'active' || promoRules.some((rule) => rule.isActive && (rule.sprintId === id || rule.eventId === id))) throw new Error('Правило уже существует или событие завершено');
      const rule = { ...data, id: crypto.randomUUID(), isActive: true, effectiveFrom: now(), createdAt: now(), updatedAt: now() }; promoRules.push(rule); return response(rule);
    }
    const promoMatch = url.match(/^\/api\/promo-points-rules\/([^/]+)$/);
    if (promoMatch) {
      const rule = promoRules.find((item) => item.id === promoMatch[1]); if (!rule || !rule.isActive) throw new Error('Правило не активно');
      rule.isActive = false;
      if (method === 'DELETE') return response(rule);
      const next = { ...rule, ...body<PromoPointsRuleResponseDto>(config), id: crypto.randomUUID(), isActive: true, effectiveFrom: now(), createdAt: now(), updatedAt: now() }; promoRules.push(next); return response(next);
    }
    if (method === 'GET' && url === `/api/rooms/${state.roomId}/promo-points`) {
      const id = config.params?.sprintId ?? config.params?.eventId;
      const rows = accruals.filter((item) => (item.sprintId === id || item.eventId === id) && (!config.params?.ambassadorId || item.ambassadorId === config.params.ambassadorId));
      const paged = pageOf(rows, { page: config.params?.page, size: config.params?.limit });
      const progress = promoRules.filter((rule) => rule.isActive && (rule.sprintId === id || rule.eventId === id)).flatMap((rule) => {
        const ambassadorIds = config.params?.ambassadorId ? [config.params.ambassadorId] : [...new Set(rows.map((item) => item.ambassadorId))];
        return ambassadorIds.map((ambassadorId) => { const successfulUsages = accruals.filter((item) => item.ruleId === rule.id && item.ambassadorId === ambassadorId).length * rule.usagesPerAward; return { ruleId: rule.id, sprintId: rule.sprintId, eventId: rule.eventId, ambassadorId, successfulUsages, usagesTowardNextAward: 0, usagesUntilNextAward: rule.usagesPerAward, usagesPerAward: rule.usagesPerAward, pointsPerAward: rule.pointsPerAward }; });
      });
      return response({ accruals: paged.items, total: paged.total, page: paged.page, limit: paged.size, totalPoints: rows.reduce((sum, row) => sum + BigInt(row.points), 0n).toString(), progress });
    }
    return undefined;
  };
}
