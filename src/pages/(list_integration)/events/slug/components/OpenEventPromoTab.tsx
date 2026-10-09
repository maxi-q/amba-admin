import { Avatar, Button, PageLoader } from "@senler/ui";
import { Gift } from "lucide-react";
import type { GetMyEventsResponseItemDto } from "@/api/generated/model";
import { useAmbassadors } from "@/hooks/ambassador/useAmbassadors";
import type { CompetitionScope } from "@/hooks/competitions/types";
import { useEventPromoRewardJournal } from "@/hooks/events/useEventPromoRewards";
import { usePromoPoints } from "@/hooks/promoCodes/usePromoPoints";
import star from "@/assets/task-flow/star.svg";

function formatDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "—"
    : date.toLocaleString("ru-RU", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
}

function PromoStats({ event }: { event: GetMyEventsResponseItemDto }) {
  return (
    <div className="grid grid-cols-2 border-b border-[#e4e4e4]">
      <div className="p-4">
        <p className="text-[#797979]">Промокод</p>
        <p className="mt-1 text-[20px] leading-8 tracking-[-0.34px]">{event.promoCodesPrefix}</p>
      </div>
      <div className="border-l border-[#e4e4e4] p-4">
        <p className="text-[#797979]">Активаций</p>
        <p className="mt-1 text-[20px] leading-8 tracking-[-0.34px]">{event.promoCodeUsagesCount.toLocaleString("ru-RU")}</p>
      </div>
    </div>
  );
}

function ContestPromoTab({
  event,
  scope,
  search,
}: {
  event: GetMyEventsResponseItemDto;
  scope: CompetitionScope;
  search: string;
}) {
  const journal = usePromoPoints(scope);
  const ids = [...new Set(journal.data?.accruals.map((entry) => entry.ambassadorId) ?? [])];
  const people = useAmbassadors(
    { roomIds: [event.roomId], ambassadorIds: ids, page: 1, size: Math.max(ids.length, 1) },
    { enabled: ids.length > 0, allPages: true },
  );
  const byId = new Map(people.ambassadors.map((person) => [person.id, person]));
  const normalizedSearch = search.trim().toLocaleLowerCase("ru-RU");
  const rows = (journal.data?.accruals ?? []).filter((entry) => {
    const person = byId.get(entry.ambassadorId);
    return !normalizedSearch || person?.username.toLocaleLowerCase("ru-RU").includes(normalizedSearch);
  });

  if (journal.isLoading) return <div className="flex justify-center py-10"><PageLoader label="Загрузка активаций…" /></div>;
  if (journal.isError) return <div className="p-4 text-destructive">Не удалось загрузить активации.<Button variant="outline" className="ml-2" onClick={() => void journal.refetch()}>Повторить</Button></div>;

  return (
    <>
      <PromoStats event={event} />
      {rows.length === 0 ? <p className="p-4 text-[#797979]">{search ? "Ничего не найдено" : "Активаций пока нет"}</p> : (
        <div className="flex flex-col">
          {rows.map((entry) => {
            const person = byId.get(entry.ambassadorId);
            return (
              <div key={entry.id} className="flex h-12 items-center gap-3 border-b border-[#e4e4e4] px-4">
                <Avatar src={person?.avatarUrl} name={person?.username ?? "Участник"} colorKey={entry.ambassadorId} size="sm" shape="rounded" />
                <span className="min-w-0 flex-1 truncate">{person?.username ?? "Участник"}</span>
                <span className="rounded-full bg-[#eafaf0] px-2 py-1 text-[#26c464]">{entry.thresholdNumber}-я активация</span>
                <span className="shrink-0 text-[#797979]">{formatDate(entry.createdAt)}</span>
                <span className="flex min-w-[86px] shrink-0 items-center justify-end gap-1"><span className="text-[#797979]">+</span><img src={star} alt="" className="size-3.5" />{BigInt(entry.points).toLocaleString("ru-RU")} XP</span>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}

function EveryonePromoTab({
  event,
  search,
}: {
  event: GetMyEventsResponseItemDto;
  search: string;
}) {
  const journal = useEventPromoRewardJournal(event.id);
  const ids = [...new Set(journal.data?.items.map((entry) => entry.ambassadorId) ?? [])];
  const people = useAmbassadors(
    { roomIds: [event.roomId], ambassadorIds: ids, page: 1, size: Math.max(ids.length, 1) },
    { enabled: ids.length > 0, allPages: true },
  );
  const byId = new Map(people.ambassadors.map((person) => [person.id, person]));
  const normalizedSearch = search.trim().toLocaleLowerCase("ru-RU");
  const rows = (journal.data?.items ?? []).filter((entry) => {
    const person = byId.get(entry.ambassadorId);
    return !normalizedSearch || person?.username.toLocaleLowerCase("ru-RU").includes(normalizedSearch);
  });

  if (journal.isLoading) return <div className="flex justify-center py-10"><PageLoader label="Загрузка активаций…" /></div>;
  if (journal.isError) return <div className="p-4 text-destructive">Не удалось загрузить активации.<Button variant="outline" className="ml-2" onClick={() => void journal.refetch()}>Повторить</Button></div>;

  return (
    <>
      <PromoStats event={event} />
      {rows.length === 0 ? <p className="p-4 text-[#797979]">{search ? "Ничего не найдено" : "Активаций пока нет"}</p> : (
        <div className="flex flex-col">
          {rows.map((entry) => {
            const person = byId.get(entry.ambassadorId);
            return (
              <div key={entry.id} className="flex h-12 items-center gap-3 border-b border-[#e4e4e4] px-4">
                <Avatar src={person?.avatarUrl} name={person?.username ?? "Участник"} colorKey={entry.ambassadorId} size="sm" shape="rounded" />
                <span className="min-w-0 flex-1 truncate">{person?.username ?? "Участник"}</span>
                <span className="rounded-full bg-[#eafaf0] px-2 py-1 text-[#26c464]">{entry.thresholdNumber}-я активация</span>
                <span className="shrink-0 text-[#797979]">{formatDate(entry.createdAt)}</span>
                <span className="inline-flex max-w-[150px] shrink-0 items-center gap-1 rounded-full bg-[#f0f0f0] px-2 py-1">
                  <span className="text-[#797979]">+</span><Gift className="size-3.5 text-[#d52094]" aria-hidden /><span className="truncate">{entry.reward.name}</span><span className="text-[#797979]">{entry.reward.amount.toLocaleString("ru-RU")}</span>
                </span>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}

export function OpenEventPromoTab({
  event,
  scope,
  search,
}: {
  event: GetMyEventsResponseItemDto;
  scope: CompetitionScope;
  search: string;
}) {
  return event.type === "contest" ? (
    <ContestPromoTab event={event} scope={scope} search={search} />
  ) : (
    <EveryonePromoTab event={event} search={search} />
  );
}
