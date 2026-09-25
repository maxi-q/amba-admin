type RewardAmount = { rewardId: string; amount: number };
type Participant = { id: string; points: number };

export function rankParticipants<T extends Participant>(participants: readonly T[]) {
  const sorted = [...participants].sort(
    (first, second) => second.points - first.points || first.id.localeCompare(second.id)
  );
  let rank = 0;
  return sorted.map((participant, index) => {
    if (index === 0 || participant.points !== sorted[index - 1].points) rank = index + 1;
    return { participant, rank };
  });
}

export function isValidRewardRange(from: number, to: number, proportional: boolean) {
  return Number.isSafeInteger(from) && Number.isSafeInteger(to) &&
    from >= 1 && to >= from && (!proportional || from === 1);
}

export function rankRewardPlaceCount(rule: { rankFrom: number | null; rankTo: number | null }) {
  return rule.rankFrom !== null && rule.rankTo !== null &&
    isValidRewardRange(rule.rankFrom, rule.rankTo, false)
    ? rule.rankTo - rule.rankFrom + 1
    : 0;
}

export function sumRewardAmounts(rewards: readonly RewardAmount[]): RewardAmount[] {
  const totals = new Map<string, number>();
  for (const { rewardId, amount } of rewards) {
    totals.set(rewardId, Number(((totals.get(rewardId) ?? 0) + amount).toFixed(10)));
  }
  return [...totals].map(([rewardId, amount]) => ({ rewardId, amount }));
}

export function rankRewardsForParticipant(
  rules: readonly { rankFrom: number; rankTo: number; rewards: RewardAmount[] }[],
  rank: number
) {
  return sumRewardAmounts(rules.flatMap((rule) =>
    rank >= rule.rankFrom && rank <= rule.rankTo ? rule.rewards : []
  ));
}

// Local preview policy: largest remainder in indivisible units, then stable ID.
// The API does not specify its remainder policy; real payouts use server amounts.
export function distributeRewardPool(
  amount: number,
  precision: number,
  participants: readonly Participant[]
): Map<string, number> {
  const result = new Map(participants.map(({ id }) => [id, 0]));
  const eligible = participants.filter(({ points }) => Number.isSafeInteger(points) && points > 0);
  if (eligible.length === 0) return result;

  const multiplier = 10 ** precision;
  if (!Number.isInteger(precision) || precision < 0 || precision > 10 ||
      !Number.isFinite(amount * multiplier) || amount < 0) return result;
  const units = BigInt(Math.round(amount * multiplier));
  const totalPoints = eligible.reduce((total, participant) => total + BigInt(participant.points), 0n);
  const shares = eligible.map(({ id, points }) => {
    const numerator = units * BigInt(points);
    return { id, units: numerator / totalPoints, remainder: numerator % totalPoints };
  });
  const remaining = units - shares.reduce((total, share) => total + share.units, 0n);
  shares.sort((first, second) =>
    first.remainder === second.remainder
      ? first.id.localeCompare(second.id)
      : first.remainder > second.remainder ? -1 : 1
  );
  shares.forEach((share, index) => {
    result.set(share.id, Number(share.units + (BigInt(index) < remaining ? 1n : 0n)) / multiplier);
  });
  return result;
}
