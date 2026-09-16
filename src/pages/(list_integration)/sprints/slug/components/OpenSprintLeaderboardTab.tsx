import { Fragment, useEffect, useState } from "react";
import { Banknote, ChevronDown, Gift, User } from "lucide-react";
import {
  Avatar,
  PageLoader,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@senler/ui";
import type {
  LeaderboardEntryDto,
  LeaderboardRewardDto,
  SprintRewardRuleDto,
} from "@/api/generated/model";
import { useSprintLeaderboard } from "@/hooks/sprints/useSprintLeaderboard";
import { CreativesPaginationControls } from "../../../creativetasks/components/CreativesPaginationControls";
import xpStarUrl from "../assets/xp-star.svg";

interface OpenSprintLeaderboardTabProps {
  roomId: string;
  sprintId: string;
  rules: SprintRewardRuleDto[];
  search?: string;
}

interface RewardBreakdown {
  name: string;
  total: number;
  fixed: number;
  proportional: number;
  proportionalPool: number;
}

const numberFormatter = new Intl.NumberFormat("ru-RU", {
  maximumFractionDigits: 10,
});

function formatPoints(points: number): string {
  return `${points.toLocaleString("ru-RU")} XP`;
}

function leaderboardRewardAmount(reward: LeaderboardRewardDto): number {
  const currencyAmount = reward.name.match(/^([\d\s]+(?:[,.]\d+)?)\s*[₽$€]$/);
  if (!currencyAmount) return reward.amount;

  const parsed = Number(
    currencyAmount[1].replace(/\s/g, "").replace(",", ".")
  );
  return Number.isFinite(parsed) ? parsed : reward.amount;
}

function ruleMatchesEntry(
  rule: SprintRewardRuleDto,
  entry: LeaderboardEntryDto
): boolean {
  if (rule.type === "byRank") {
    return (
      rule.rankFrom !== null &&
      rule.rankTo !== null &&
      entry.rank >= rule.rankFrom &&
      entry.rank <= rule.rankTo
    );
  }

  return (
    rule.type === "byPoints" &&
    (rule.rankTo === null || entry.rank <= rule.rankTo) &&
    (rule.minPoints === null || entry.points >= rule.minPoints)
  );
}

function getRewardBreakdown(
  entry: LeaderboardEntryDto,
  reward: LeaderboardRewardDto,
  rules: SprintRewardRuleDto[]
): RewardBreakdown | null {
  const sources = rules.flatMap((rule) => {
    if (!ruleMatchesEntry(rule, entry)) return [];
    const item = rule.rewards.find(
      (ruleReward) => ruleReward.rewardId === reward.rewardId
    );
    return item ? [{ type: rule.type, item }] : [];
  });

  const fixedSources = sources.filter((source) => source.type === "byRank");
  const proportionalSources = sources.filter(
    (source) => source.type === "byPoints"
  );
  const fixed = fixedSources
    .reduce((total, source) => total + source.item.amount, 0);
  const proportionalPool = proportionalSources
    .reduce((total, source) => total + source.item.amount, 0);
  const precision = reward.isDivisible ? reward.divisionPrecision : 0;
  const multiplier = 10 ** precision;
  const total = leaderboardRewardAmount(reward);
  const proportional =
    Math.round(Math.max(0, total - fixed) * multiplier) / multiplier;
  const contributionCount =
    fixedSources.length + (proportional > 0 ? proportionalSources.length : 0);

  if (contributionCount < 2) return null;

  const sourceName = sources[0].item.reward.name;

  return {
    name: /руб|₽/i.test(sourceName) ? "Рубли" : sourceName,
    total,
    fixed,
    proportional,
    proportionalPool,
  };
}

function RewardChip({
  entry,
  reward,
  rules,
}: {
  entry: LeaderboardEntryDto;
  reward: LeaderboardRewardDto;
  rules: SprintRewardRuleDto[];
}) {
  const [isBreakdownOpen, setIsBreakdownOpen] = useState(false);
  const ruleReward = rules
    .flatMap((rule) => rule.rewards)
    .find((item) => item.rewardId === reward.rewardId)?.reward;
  const currencySymbol = reward.name.match(/([₽$€])$/)?.[1] ?? "₽";
  const isMoney = /руб|[₽$€]/i.test(`${ruleReward?.name ?? ""} ${reward.name}`);
  const amount = leaderboardRewardAmount(reward);
  const breakdown = getRewardBreakdown(entry, reward, rules);
  const RewardIcon = isMoney ? Banknote : Gift;
  const content = (
    <>
      <RewardIcon
        className={`size-3.5 shrink-0 ${
          isMoney ? "text-[#22c55e]" : "text-[#d52094]"
        }`}
        strokeWidth={1.5}
        aria-hidden
      />
      <span className="truncate">
        {isMoney ? numberFormatter.format(amount) : reward.name}
      </span>
      <span className="shrink-0 text-[#797979]">
        {isMoney ? currencySymbol : numberFormatter.format(reward.amount)}
      </span>
      {breakdown ? (
        <ChevronDown
          className="size-3.5 shrink-0 text-[#797979]"
          strokeWidth={1.5}
          aria-hidden
        />
      ) : null}
    </>
  );
  const className =
    "inline-flex h-6 min-w-0 items-center gap-0.5 rounded-[13px] bg-[#f0f0f0] px-1.5 text-[13px] font-medium leading-4 tracking-[-0.25px] text-foreground";

  if (!breakdown) return <span className={className}>{content}</span>;

  return (
    <Tooltip open={isBreakdownOpen} onOpenChange={setIsBreakdownOpen}>
      <TooltipTrigger asChild>
        <button
          type="button"
          className={className}
          aria-label={`Показать состав награды «${breakdown.name}»`}
          aria-expanded={isBreakdownOpen}
          onClick={() => setIsBreakdownOpen((open) => !open)}
        >
          {content}
        </button>
      </TooltipTrigger>
      <TooltipContent
        side="bottom"
        align="end"
        sideOffset={4}
        className="w-[260px] p-1.5 text-[13px] font-medium leading-4 tracking-[-0.25px]"
      >
        <div className="flex gap-1">
          <div className="flex w-3.5 shrink-0 flex-col items-center">
            <RewardIcon
              className={`size-3.5 shrink-0 ${
                isMoney ? "text-[#22c55e]" : "text-[#d52094]"
              }`}
              strokeWidth={1.5}
              aria-hidden
            />
            <span className="mt-0.5 min-h-8 flex-1 border-l border-dashed border-[#cfcfcf]" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex justify-between gap-2">
              <span className="truncate">{breakdown.name}</span>
              <span>{numberFormatter.format(breakdown.total)}</span>
            </div>
            {breakdown.fixed > 0 ? (
              <div className="mt-1 flex justify-between gap-2 text-[12px]">
                <span className="text-[#797979]">Фиксировано</span>
                <span>{numberFormatter.format(breakdown.fixed)}</span>
              </div>
            ) : null}
            {breakdown.proportionalPool > 0 ? (
              <div className="mt-1 flex justify-between gap-2 text-[12px]">
                <span className="text-[#797979]">Плавающий процент</span>
                <span>
                  {numberFormatter.format(breakdown.proportional)}{" "}
                  <span className="text-[#797979]">
                    из {numberFormatter.format(breakdown.proportionalPool)}
                  </span>
                </span>
              </div>
            ) : null}
          </div>
        </div>
      </TooltipContent>
    </Tooltip>
  );
}

export function OpenSprintLeaderboardTab({
  roomId,
  sprintId,
  rules,
  search = "",
}: OpenSprintLeaderboardTabProps) {
  const [page, setPage] = useState(1);
  const { sprint, entries, pagination, isLoading, isError, error } =
    useSprintLeaderboard(roomId, { page, size: 50 });

  useEffect(() => setPage(1), [search]);

  if (isLoading) {
    return (
      <div className="flex justify-center py-10">
        <PageLoader label="Загрузка…" />
      </div>
    );
  }

  if (isError) {
    return (
      <p className="px-4 py-6 text-[13px] font-medium text-destructive">
        {error instanceof Error
          ? error.message
          : "Не удалось загрузить таблицу лидеров"}
      </p>
    );
  }

  if (!sprint || sprint.id !== sprintId) {
    return (
      <p className="px-4 py-6 text-[13px] font-medium text-[#797979]">
        Таблица лидеров доступна только для активного спринта компании.
      </p>
    );
  }

  if (entries.length === 0) {
    return (
      <p className="px-4 py-6 text-[13px] font-medium text-[#797979]">
        Пока нет участников в рейтинге.
      </p>
    );
  }

  const normalizedSearch = search.trim().toLocaleLowerCase("ru-RU");
  const visibleEntries = normalizedSearch
    ? entries.filter((entry) =>
        entry.username.toLocaleLowerCase("ru-RU").includes(normalizedSearch)
      )
    : entries;
  const paginationControls =
    pagination && pagination.totalPages > 1 ? (
      <CreativesPaginationControls
        page={page}
        totalPages={pagination.totalPages}
        onPageChange={setPage}
        aria-label="Страницы рейтинга спринта"
        className="border-b border-[#e4e4e4] py-3"
      />
    ) : null;

  if (visibleEntries.length === 0) {
    return (
      <>
        <p className="px-4 py-6 text-[13px] font-medium text-[#797979]">
          Ничего не найдено
        </p>
        {paginationControls}
      </>
    );
  }

  return (
    <>
      <div className="flex flex-col">
        {visibleEntries.map((entry) => {
          const entryIndex = entries.indexOf(entry);
          const visibleRewards = entry.rewards.slice(0, 2);
          const hiddenRewardsCount = entry.rewards.length - visibleRewards.length;
          const nextEntry = entries[entryIndex + 1];
          const isEndOfRewardZone =
            entry.rewards.length > 0 &&
            (nextEntry
              ? nextEntry.rewards.length === 0
              : pagination?.page === pagination?.totalPages);

          return (
            <Fragment key={entry.ambassadorId}>
              <div className="flex h-12 items-center gap-4 border-b border-[#e4e4e4] px-4">
                <div className="flex min-w-0 flex-1 items-center gap-2">
                  <span className="shrink-0 text-right text-[13px] font-medium leading-4 tracking-[-0.25px] text-foreground">
                    {entry.rank}.
                  </span>
                  <Avatar
                    src={entry.avatarUrl}
                    size="sm"
                    shape="rounded"
                    name={entry.username}
                    colorKey={entry.ambassadorId}
                    className="shrink-0"
                  />
                  <p className="min-w-0 flex-1 truncate text-[13px] font-medium leading-4 tracking-[-0.25px] text-foreground">
                    {entry.username}
                  </p>
                </div>

                {visibleRewards.length > 0 ? (
                  <div className="flex max-w-[211px] shrink-0 items-center gap-1 overflow-hidden">
                    {visibleRewards.map((reward) => {
                      return (
                        <RewardChip
                          key={reward.rewardId}
                          entry={entry}
                          reward={reward}
                          rules={rules}
                        />
                      );
                    })}
                    {hiddenRewardsCount > 0 ? (
                      <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-[#e9efff] text-[13px] font-medium leading-4 text-[#2563eb]">
                        +{hiddenRewardsCount}
                      </span>
                    ) : null}
                  </div>
                ) : null}

                <div className="flex w-[81px] shrink-0 items-center gap-1">
                  <img
                    src={xpStarUrl}
                    alt=""
                    width={14}
                    height={14}
                    className="size-3.5 shrink-0"
                  />
                  <span className="whitespace-nowrap text-[13px] font-medium leading-4 tracking-[-0.25px] text-foreground">
                    {formatPoints(entry.points)}
                  </span>
                </div>

                <span
                  className="flex size-7 shrink-0 items-center justify-center rounded-md border border-[#e4e4e4] bg-white"
                  aria-hidden
                >
                  <User className="size-4" strokeWidth={1.5} />
                </span>
              </div>

              {isEndOfRewardZone ? (
                <div className="flex h-[25px] items-center justify-center border-b border-[#e4e4e4] px-2.5 text-center text-[12px] font-medium leading-4 text-[#797979]">
                  Конец зоны вознаграждений
                </div>
              ) : null}
            </Fragment>
          );
        })}
      </div>
      {paginationControls}
    </>
  );
}
