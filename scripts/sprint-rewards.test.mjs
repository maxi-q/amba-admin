import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  distributeRewardPool,
  isValidRewardRange,
  rankParticipants,
  rankRewardPlaceCount,
  rankRewardsForParticipant,
  sumRewardAmounts,
} from "../src/utils/sprintRewardPreview.ts";

const equalParticipants = ["b", "a", "c"].map((id) => ({ id, points: 100 }));
for (const count of [2, 3]) {
  const participants = equalParticipants.slice(0, count);
  const shares = distributeRewardPool(1, 0, participants);
  assert.equal([...shares.values()].reduce((sum, value) => sum + value, 0), 1);
  assert.equal(shares.get("a"), 1, "Stable ID breaks equal remainders");
  assert.deepEqual(shares, distributeRewardPool(1, 0, [...participants].reverse()));
  assert.ok([...shares.values()].every(Number.isInteger));
}
const fractional = distributeRewardPool(1, 2, equalParticipants);
assert.equal(fractional.get("a"), 0.34);
assert.equal(fractional.get("b"), 0.33);
assert.equal(fractional.get("c"), 0.33);
assert.equal([...fractional.values()].reduce((sum, value) => sum + Math.round(value * 100), 0), 100);

const ordinary = distributeRewardPool(5000, 0, [
  { id: "sergey", points: 1000 },
  { id: "anzhelika", points: 500 },
  { id: "dmitry", points: 400 },
]);
assert.equal([...ordinary.values()].reduce((sum, value) => sum + value, 0), 5000);
assert.deepEqual(Object.fromEntries(ordinary), { anzhelika: 1316, dmitry: 1053, sergey: 2631 });

for (const precision of [0, 1, 2, 10]) {
  for (const amount of [1, 29, 1000]) {
    const shares = distributeRewardPool(amount, precision, [
      { id: "zero", points: 0 },
      { id: "a", points: Number.MAX_SAFE_INTEGER },
      { id: "b", points: Number.MAX_SAFE_INTEGER - 1 },
      { id: "c", points: 41 },
    ]);
    const units = [...shares.values()].reduce((sum, value) => sum + BigInt(Math.round(value * 10 ** precision)), 0n);
    assert.equal(units, BigInt(amount * 10 ** precision));
    assert.equal(shares.get("zero"), 0);
  }
}
assert.deepEqual([...distributeRewardPool(1, 0, [{ id: "zero", points: 0 }]).values()], [1]);
assert.deepEqual(Object.fromEntries(distributeRewardPool(3, 0, [{ id: "b", points: 0 }, { id: "a", points: 0 }])), { b: 1, a: 2 });
assert.equal(distributeRewardPool(1, 0, []).size, 0);
for (const amount of [NaN, Infinity, -1]) {
  assert.ok([...distributeRewardPool(amount, 0, equalParticipants).values()].every((value) => value === 0));
}
assert.deepEqual([...distributeRewardPool(1, 0, [{ id: "invalid", points: Infinity }]).values()], [0]);

const ranked = rankParticipants([...equalParticipants.slice(0, 2), { id: "last", points: 50 }]);
assert.deepEqual(ranked.map(({ participant, rank }) => [participant.id, rank]), [["a", 1], ["b", 1], ["last", 3]]);
const eligible = ranked.filter(({ rank }) => rank <= 1).map(({ participant }) => participant);
assert.equal(eligible.length, 2, "Rank boundary includes every tied participant");
assert.equal([...distributeRewardPool(1, 0, eligible).values()].reduce((sum, value) => sum + value, 0), 1);

const rankRules = [
  { rankFrom: 1, rankTo: 1, rewards: [{ rewardId: "reward", amount: 10 }] },
  { rankFrom: 1, rankTo: 3, rewards: [{ rewardId: "reward", amount: 20 }, { rewardId: "other", amount: 2 }] },
];
assert.deepEqual(rankRewardsForParticipant(rankRules, 1), [{ rewardId: "reward", amount: 30 }, { rewardId: "other", amount: 2 }]);
assert.deepEqual(rankRewardsForParticipant(rankRules, 4), []);
assert.equal(rankRewardPlaceCount({ rankFrom: 2, rankTo: 5 }) * 2, 8);
assert.equal(rankRewardPlaceCount({ rankFrom: null, rankTo: null }), 0);
assert.deepEqual(sumRewardAmounts([{ rewardId: "r", amount: 0.1 }, { rewardId: "r", amount: 0.2 }]), [{ rewardId: "r", amount: 0.3 }]);

assert.equal(isValidRewardRange(2, 5, true), true, "The API now respects rankFrom for byPoints");
assert.equal(isValidRewardRange(1, 5, true), true);
assert.equal(isValidRewardRange(2, 5, false), true);
for (const [from, to] of [[0, 1], [2, 1], [1, 1.5], [NaN, 5], [1, Infinity]]) {
  assert.equal(isValidRewardRange(from, to, false), false);
}

// JSX is checked separately by TypeScript; keep the DTO amount regression explicit.
const leaderboardSource = readFileSync(new URL("../src/pages/(list_integration)/sprints/slug/components/OpenSprintLeaderboardTab.tsx", import.meta.url), "utf8");
assert.match(leaderboardSource, /const total = reward\.amount;/);
assert.match(leaderboardSource, /const amount = reward\.amount;/);
assert.doesNotMatch(leaderboardSource, /currencyAmount|leaderboardRewardAmount/);
const editorSource = readFileSync(new URL("../src/pages/(list_integration)/sprints/slug/components/SprintCreationStepTwo.tsx", import.meta.url), "utf8");
assert.match(editorSource, /setRangeTo\(proportional\.rankTo\);/);
assert.match(editorSource, /const hasProportionalRule = proportionalRewards\.length > 0;/);
assert.match(editorSource, /activeRewards\.map\([\s\S]*?pinnedRewards/);
assert.match(editorSource, /rewardDraft\.map\(\(reward\) => reward\.rewardId\)/);
const rewardsSource = readFileSync(new URL("../src/pages/(list_integration)/rewards/index.tsx", import.meta.url), "utf8");
assert.doesNotMatch(rewardsSource, /isSystemReward/);
console.log("Sprint rewards: conserved pools, precise units, overlaps, ties, rank ranges and DTO amounts passed.");
