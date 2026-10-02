import assert from 'node:assert/strict';
import { registerHooks } from 'node:module';
import { checkEventStatus } from '../src/pages/(list_integration)/events/constants/eventStatus.ts';
import { checkSprintStatus } from '../src/pages/(list_integration)/sprints/constants/sprintStatus.ts';
registerHooks({ resolve(specifier, context, next) { return next(specifier.endsWith('/utils/sprintRewardPreview') ? `${specifier}.ts` : specifier, context); } });
const { createCompetitionPreview } = await import('../src/dev/preview-competitions.ts');
const reward = { id: 'gift', versionId: 'gift-v1', version: 1, name: 'Подарок', iconUrl: null, isDivisible: false, divisionPrecision: 0 };
const position = (id, amount) => ({ id, rewardId: reward.id, rewardVersionId: reward.versionId, amount, reward });
const state = {
  roomId: 'room',
  sprints: [{ id: 'sprint-active', status: 'active', isDraft: false, resultsFixedAt: null }],
  rules: [
    { id: 'rank', sprintId: 'sprint-active', type: 'byRank', rankFrom: 1, rankTo: 1, rewards: [position('rank-gift', 1)] },
    { id: 'manual', sprintId: 'sprint-active', type: 'manual', rewards: [position('manual-gift', 3)] },
  ],
  rewards: [reward],
  entries: [{ ambassadorId: 'ambassador-1', username: 'Первый', promoCode: 'FIRST', points: 100, taskPoints: 100, promoPoints: 0, rewards: [] }, { ambassadorId: 'ambassador-2', username: 'Второй', promoCode: 'SECOND', points: 50, taskPoints: 50, promoPoints: 0, rewards: [] }],
  tasks: [{ id: 'task', sprintId: 'sprint-active', isDeleted: false, isFrozen: false }],
  submissions: [{ taskId: 'task', ambassadorId: 'ambassador-2', status: 'waiting_for_review_materials' }],
};
const mock = createCompetitionPreview();
const request = (method, url, data, params) => mock({ method, url, data, params }, state)?.data;
const sprint = '/api/sprints/sprint-active';
const rank = (params = {}) => request('GET', '/api/sprints/room/leaderboard', undefined, { sprintId: 'sprint-active', ...params });
assert.equal(rank({ search: 'SECOND' }).items[0].rank, 2, 'Search retains the server rank');
state.rules.push({ id: 'points', sprintId: 'sprint-active', type: 'byPoints', rankFrom: 2, rankTo: 2, minPoints: 0, rewards: [position('points-gift', 5)] });
assert.equal(rank().items[0].rewards[0].amount, 1, 'Starting rank excludes first place from a proportional pool');
assert.equal(rank().items[1].rewards[0].amount, 5);
state.rules.pop();
assert.throws(() => request('POST', `${sprint}/finish-review`));
request('PUT', `${sprint}/manual-rewards/manual-gift/participants/ambassador-2`, { amount: '2' });
assert.throws(() => request('PUT', `${sprint}/manual-rewards/manual-gift/participants/ambassador-1`, { amount: '2' }), /пуле/);
assert.throws(() => request('PUT', `${sprint}/manual-rewards/manual-gift/participants/ambassador-1`, { amount: '0.5' }), /точность/);
request('PATCH', sprint, { status: 'reviewing' });
assert.equal(request('GET', `${sprint}/review`).uniqueAmbassadors, 1);
request('POST', `${sprint}/finish-review`);
const fixed = rank();
assert.equal(fixed.isFinal, true);
assert.equal(fixed.items[0].points, 100);
state.entries[0].points = 1;
assert.equal(rank().items[0].points, 100, 'Results remain fixed after live points change');
request('POST', `${sprint}/finish-review`);
const grants = request('GET', `${sprint}/reward-grants`).items;
assert.equal(grants.length, 2, 'Finishing twice does not duplicate grants');
assert.throws(() => request('PATCH', sprint, { status: 'completed' }));
for (const grant of grants) request('PATCH', `/api/reward-grants/${grant.id}/delivery`, { delivered: true });
request('PATCH', sprint, { status: 'completed' });
assert.equal(state.sprints[0].status, 'completed');
request('PATCH', `/api/reward-grants/${grants[0].id}/delivery`, { delivered: false });
assert.equal(state.sprints[0].status, 'awarding');
assert.equal(request('GET', `${sprint}/reward-grants`).items[0].history.length, 2);
state.rules.find((rule) => rule.type === 'manual').rewards.push({ ...position('fractional', 0.3), reward: { ...reward, isDivisible: true, divisionPrecision: 2 } });
request('PUT', `${sprint}/manual-rewards/fractional/participants/ambassador-1`, { amount: '0.1' });
assert.doesNotThrow(() => request('PUT', `${sprint}/manual-rewards/fractional/participants/ambassador-2`, { amount: '0.2' }), 'Decimal rounding must not reject a fully allocated pool');

const event = '/api/events/event-everyone';
request('PUT', `${event}/participants`, { ambassadorIds: ['ambassador-1', 'ambassador-2'] });
request('PATCH', event, { status: 'reviewing' });
request('POST', `${event}/finish-review`);
assert.equal(request('GET', `${event}/reward-grants`).total, 2, 'Each participant receives an everyone reward');
assert.throws(() => request('PUT', `${event}/participants`, { ambassadorIds: [] }));
state.rewards[0] = { ...reward, versionId: 'gift-v2', version: 2 };
assert.equal(request('GET', '/api/events/event-contest/reward-rules')[0].rewards[0].reward.version, 1);
const updatedVersions = request('PATCH', '/api/events/event-contest/reward-versions', { rewardIds: ['gift'] });
assert.equal(updatedVersions.items[0].rewards[0].reward.version, 2, 'Pinned versions only change explicitly');

const previous = request('GET', '/api/rooms/room/promo-points-rules').find((rule) => rule.sprintId === 'sprint-active');
const changed = request('PATCH', `/api/promo-points-rules/${previous.id}`, { usagesPerAward: 2, pointsPerAward: '500' });
assert.notEqual(changed.id, previous.id);
const points = request('GET', '/api/rooms/room/promo-points', undefined, { sprintId: 'sprint-active', ambassadorId: 'ambassador-1' });
assert.equal(points.totalPoints, '100', 'Editing a rule preserves past accruals');
assert.equal(points.progress[0].successfulUsages, 0, 'A new rule restarts the threshold');
assert.equal(request('GET', '/api/rooms/room/promo-points-rules').find((rule) => rule.id === previous.id).isActive, false);
const future = new Date(Date.now() + 86400000).toISOString();
assert.equal(checkEventStatus(future, null, true).label, 'предстоящий');
assert.equal(checkSprintStatus(future, null, true).status, 'upcoming');
console.log('Competitions: search, review, immutable snapshot, manual pool, delivery/cancellation, event participants and promo-rule history passed.');
