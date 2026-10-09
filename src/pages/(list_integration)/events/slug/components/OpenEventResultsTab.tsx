import { useEffect, useState } from "react";
import { Banknote, Check, Gift } from "lucide-react";
import { Link } from "react-router-dom";
import { Avatar, Button, PageLoader } from "@senler/ui";
import type { GetMyEventsResponseItemDto, LeaderboardRewardDto } from "@/api/generated/model";
import { useCompetitionGrants, useEventResults } from "@/hooks/competitions/useCompetitionQueries";
import { CreativesPaginationControls } from "../../../creativetasks/components/CreativesPaginationControls";
import profileIcon from "@/assets/task-flow/user.svg";
import star from "@/assets/task-flow/star.svg";

function RewardChip({ reward }: { reward: LeaderboardRewardDto }) {
  const isMoney = /руб|[₽$€]/i.test(reward.name);
  const currency = reward.name.match(/([₽$€])$/)?.[1] ?? "₽";
  return (
    <span className="inline-flex max-w-[132px] items-center gap-0.5 rounded-full bg-[#f0f0f0] px-1.5 py-1 text-[13px] leading-4">
      {isMoney ? (
        <Banknote className="size-3.5 shrink-0 text-[#26c464]" strokeWidth={1.5} aria-hidden />
      ) : (
        <Gift className="size-3.5 shrink-0 text-[#d52094]" strokeWidth={1.5} aria-hidden />
      )}
      <span className="truncate">{isMoney ? reward.amount.toLocaleString("ru-RU") : reward.name}</span>
      <span className="text-[#797979]">{isMoney ? currency : reward.amount.toLocaleString("ru-RU")}</span>
    </span>
  );
}

export function OpenEventResultsTab({
  event,
  roomSlug,
  search,
}: {
  event: GetMyEventsResponseItemDto;
  roomSlug: string;
  search: string;
}) {
  const [page, setPage] = useState(1);
  const results = useEventResults(event.id, page, search.trim());
  const scope = { kind: "event" as const, id: event.id, roomId: event.roomId };
  const grants = useCompetitionGrants(scope);

  useEffect(() => setPage(1), [search]);

  if (results.isLoading) {
    return <div className="flex justify-center py-10"><PageLoader label="Загрузка…" /></div>;
  }
  if (results.isError) {
    return <div className="p-4 text-[13px] text-destructive">Не удалось загрузить участников.<Button variant="outline" className="ml-2" onClick={() => void results.refetch()}>Повторить</Button></div>;
  }
  if (results.data?.historyUnavailable) {
    return <p className="p-4 text-[13px] text-[#797979]">Исторические результаты этого события не сохранены.</p>;
  }

  const items = results.data?.items ?? [];
  if (items.length === 0) {
    return <p className="p-4 text-[13px] text-[#797979]">{search ? "Ничего не найдено" : "Участников пока нет"}</p>;
  }

  return (
    <>
      <div className="flex flex-col">
        {items.map((entry) => {
          const profile = `/rooms/${roomSlug}/events/${event.id}/participants/${entry.ambassadorId}`;
          const ownGrants = grants.data?.items.filter(
            (grant) => grant.ambassadorId === entry.ambassadorId,
          ) ?? [];
          const allDelivered = ownGrants.length > 0 && ownGrants.every((grant) => Boolean(grant.deliveredAt));
          const visibleRewards = entry.rewards.slice(0, 2);
          const hiddenRewards = entry.rewards.length - visibleRewards.length;

          return (
            <div key={entry.ambassadorId} className="flex h-12 items-center gap-4 border-b border-[#e4e4e4] px-4">
              <Link to={profile} className="flex min-w-0 flex-1 items-center gap-2">
                {event.type === "contest" ? (
                  <span className="shrink-0 text-right text-[13px] leading-4">{entry.rank == null ? "—" : `${entry.rank}.`}</span>
                ) : null}
                <Avatar name={entry.username} colorKey={entry.ambassadorId} size="sm" shape="rounded" className="shrink-0" />
                <span className="min-w-0 flex-1 truncate text-[13px] leading-4">{entry.username}</span>
              </Link>

              {visibleRewards.length > 0 ? (
                <div className="flex max-w-[211px] shrink-0 items-center gap-1 overflow-hidden">
                  {visibleRewards.map((reward) => (
                    <RewardChip key={`${reward.rewardId}-${reward.rewardVersionId}`} reward={reward} />
                  ))}
                  {hiddenRewards > 0 ? (
                    <span className="rounded-full bg-[#e9efff] px-1.5 py-1 text-[#2563eb]">+{hiddenRewards}</span>
                  ) : null}
                </div>
              ) : null}

              {event.type === "contest" ? (
                <span className="flex w-[81px] shrink-0 items-center gap-1 whitespace-nowrap text-[13px] leading-4" title={`Задания: ${entry.taskPoints} XP`}>
                  <img src={star} alt="" className="size-3.5" />
                  {entry.points.toLocaleString("ru-RU")} XP
                </span>
              ) : allDelivered ? (
                <span className="flex shrink-0 items-center gap-1 text-[#797979]"><Check className="size-4" aria-hidden />Награды отправлены</span>
              ) : ownGrants.length > 0 ? (
                <Button asChild variant="ghost" className="h-7 rounded-full bg-[#eafaf0] px-2 text-[13px] text-[#26c464] hover:bg-[#eafaf0]">
                  <Link to={profile}><Gift className="size-4" aria-hidden />Отправьте награды</Link>
                </Button>
              ) : null}

              <Button asChild variant="outline" className="size-7 shrink-0 border-[#e4e4e4] p-0 shadow-none">
                <Link to={profile} aria-label={`Профиль исполнителя: ${entry.username}`}><img src={profileIcon} alt="" /></Link>
              </Button>
            </div>
          );
        })}
      </div>

      {(results.data?.totalPages ?? 0) > 1 ? (
        <CreativesPaginationControls
          page={page}
          totalPages={results.data?.totalPages ?? 1}
          onPageChange={setPage}
          className="border-b border-[#e4e4e4] py-3"
        />
      ) : null}
    </>
  );
}
