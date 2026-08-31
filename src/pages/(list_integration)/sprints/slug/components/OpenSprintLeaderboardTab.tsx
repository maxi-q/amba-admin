import { Fragment, useEffect, useState } from "react";
import { Banknote, ChevronDown, Gift, User } from "lucide-react";
import { Avatar, PageLoader } from "@senler/ui";
import { useSprintLeaderboard } from "@/hooks/sprints/useSprintLeaderboard";
import { CreativesPaginationControls } from "../../../creativetasks/components/CreativesPaginationControls";
import xpStarUrl from "../assets/xp-star.svg";

interface OpenSprintLeaderboardTabProps {
  roomId: string;
  sprintId: string;
  search?: string;
}

function formatPoints(points: number): string {
  return `${points.toLocaleString("ru-RU")} XP`;
}

export function OpenSprintLeaderboardTab({
  roomId,
  sprintId,
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
                      const moneyMatch = reward.name.match(/^(.*?)([₽$€])$/);
                      const isMoney = moneyMatch !== null;
                      const RewardIcon = isMoney ? Banknote : Gift;

                      return (
                        <span
                          key={reward.rewardId}
                          className="inline-flex h-6 min-w-0 items-center gap-0.5 rounded-[13px] bg-[#f0f0f0] px-1.5 text-[13px] font-medium leading-4 tracking-[-0.25px] text-foreground"
                        >
                          <RewardIcon
                            className={`size-3.5 shrink-0 ${
                              isMoney ? "text-[#22c55e]" : "text-[#d52094]"
                            }`}
                            strokeWidth={1.5}
                            aria-hidden
                          />
                          <span className="truncate">
                            {moneyMatch ? (
                              <>
                                {moneyMatch[1]}
                                <span className="text-[#797979]">
                                  {moneyMatch[2]}
                                </span>
                              </>
                            ) : (
                              reward.name
                            )}
                          </span>
                          {reward.isDivisible ? (
                            <ChevronDown
                              className="size-3.5 shrink-0 text-[#797979]"
                              strokeWidth={1.5}
                              aria-hidden
                            />
                          ) : null}
                          {!isMoney ? (
                            <span className="shrink-0 text-[#797979]">
                              {reward.amount.toLocaleString("ru-RU")}
                            </span>
                          ) : null}
                        </span>
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
