import { Calendar, Gift } from "lucide-react";
import type {
  CompetitionRewardRuleDto,
  EventTaskDto,
  GetMyEventsResponseItemDto,
  SprintRewardRuleDto,
} from "@/api/generated/model";
import { competitionStatusLabels } from "@/hooks/competitions/types";
import { useEventPromoRewardRules } from "@/hooks/events/useEventPromoRewards";
import { usePromoPointsRules } from "@/hooks/promoCodes/usePromoPoints";
import { TaskPlatform } from "../../../creativetasks/components/TaskPlatform";
import star from "@/assets/task-flow/star.svg";

type SidebarReward = {
  key: string;
  name: string;
  iconUrl: string | null;
  amount: number;
};

const monthNames = [
  "янв",
  "фев",
  "мар",
  "апр",
  "мая",
  "июн",
  "июл",
  "авг",
  "сен",
  "окт",
  "ноя",
  "дек",
];

function formatDateTime(value: string | null): string | null {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return `${date.getDate()} ${monthNames[date.getMonth()]}, ${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}

function formatDuration(event: GetMyEventsResponseItemDto): string {
  const start = formatDateTime(event.startDate);
  if (!start) return "Даты не указаны";
  if (event.ignoreEndDate || !event.endDate) return `${start} – бессрочно`;
  const end = formatDateTime(event.endDate);
  return end ? `${start} – ${end}` : start;
}

function collectRewards(rules: Array<CompetitionRewardRuleDto | SprintRewardRuleDto>): SidebarReward[] {
  const rewards = new Map<string, SidebarReward>();
  for (const rule of rules) {
    if (rule.type === "manual") continue;
    const positions =
      rule.type === "byRank" && rule.rankFrom != null && rule.rankTo != null
        ? Math.max(0, rule.rankTo - rule.rankFrom + 1)
        : 1;
    for (const item of rule.rewards) {
      const key = `${item.rewardId}-${item.rewardVersionId}`;
      const previous = rewards.get(key);
      rewards.set(key, {
        key,
        name: item.reward.name,
        iconUrl: item.reward.iconUrl,
        amount: Number(
          ((previous?.amount ?? 0) + item.amount * positions).toFixed(10),
        ),
      });
    }
  }
  return [...rewards.values()];
}

export function OpenEventSidebar({
  event,
  rules,
  tasks,
}: {
  event: GetMyEventsResponseItemDto;
  rules: Array<CompetitionRewardRuleDto | SprintRewardRuleDto>;
  tasks: EventTaskDto[];
}) {
  const scope = { kind: "event" as const, id: event.id, roomId: event.roomId };
  const contestPromoRules = usePromoPointsRules(scope, event.type === "contest");
  const everyonePromoRules = useEventPromoRewardRules(event.id, event.type === "everyone");
  const contestPromo = contestPromoRules.data?.find((rule) => rule.isActive);
  const everyonePromo = everyonePromoRules.data?.find((rule) => rule.isActive);
  const rewards = collectRewards(rules);
  const platforms = [
    ...new Set(
      tasks
        .filter((task) => !task.isDeleted)
        .map((task) => task.targetPlatform),
    ),
  ];
  const statusClassName =
    event.status === "active" || event.status === "awarding"
      ? "text-[#26c464]"
      : "text-[#797979]";

  return (
    <aside className="flex w-full shrink-0 flex-col border-l border-[#e4e4e4] bg-white lg:w-[260px]">
      <section className="min-h-[84px] border-b border-[#e4e4e4] p-4 text-[13px] font-medium leading-4 tracking-[-0.25px]">
        <h2>О событии</h2>
        <p className="mt-1 whitespace-pre-wrap text-[#797979]">
          {event.description?.trim() || "Нет описания"}
        </p>
      </section>

      <section className="min-h-[68px] border-b border-[#e4e4e4] p-4 text-[13px] font-medium leading-4 tracking-[-0.25px]">
        <h2 className="mb-1">Платформы</h2>
        {platforms.length > 0 ? (
          <div className="flex items-center gap-1.5">
            {platforms.map((platform) => (
              <TaskPlatform key={platform} platform={platform} />
            ))}
          </div>
        ) : (
          <p className="text-[#797979]">Заданий пока нет</p>
        )}
      </section>

      <section className="min-h-[68px] border-b border-[#e4e4e4] p-4 text-[13px] font-medium leading-4 tracking-[-0.25px]">
        <p>
          Статус{" "}
          <span className={statusClassName}>
            {competitionStatusLabels[event.status]}
          </span>
        </p>
        <div className="mt-1 flex items-center gap-1 text-[#797979]">
          <Calendar className="size-3.5 shrink-0" strokeWidth={1.5} aria-hidden />
          <p className="min-w-0">{formatDuration(event)}</p>
        </div>
      </section>

      <section className="flex flex-col gap-2 p-4 text-[13px] font-medium leading-4 tracking-[-0.25px]">
        <div className="flex flex-col gap-1">
          <h2>{event.type === "contest" ? "Награды рейтинга" : "Награды каждому"}</h2>
          {event.type === "contest" ? (
            <p className="text-[#797979]">Распределяются по количеству XP</p>
          ) : null}
        </div>
        {rewards.length > 0 ? rewards.map((reward) => {
          const isMoney = /руб|[₽$€]/i.test(reward.name);
          const currency = reward.name.match(/([₽$€])$/)?.[1] ?? "₽";
          const amount = reward.amount.toLocaleString("ru-RU", {
            maximumFractionDigits: 10,
          });
          return (
            <div key={reward.key} className="flex h-12 items-center gap-1.5">
              <span className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-[#e4e4e4] bg-[#f0f0f0]">
                {reward.iconUrl ? (
                  <img src={reward.iconUrl} alt="" className="size-10 object-cover" />
                ) : (
                  <Gift className="size-5 text-[#797979]" aria-hidden />
                )}
              </span>
              <span className="min-w-0">
                <span className="block truncate">
                  {isMoney ? `${amount} ${currency}` : reward.name}
                </span>
                {!isMoney ? (
                  <span className="mt-1 block text-[#797979]">{amount} шт.</span>
                ) : null}
              </span>
            </div>
          );
        }) : <p className="text-[#797979]">Награды не настроены</p>}
      </section>

      {contestPromo ? (
        <section className="flex flex-col gap-2 border-t border-[#e4e4e4] p-4 text-[13px] font-medium leading-4 tracking-[-0.25px]">
          <div>
            <h2>Очки по промокоду</h2>
            <p className="mt-1 text-[#797979]">Каждые {contestPromo.usagesPerAward} активаций</p>
          </div>
          <p className="flex items-center gap-1"><img src={star} alt="" className="size-3.5" />{BigInt(contestPromo.pointsPerAward).toLocaleString("ru-RU")} XP</p>
        </section>
      ) : everyonePromo ? (
        <section className="flex flex-col gap-2 border-t border-[#e4e4e4] p-4 text-[13px] font-medium leading-4 tracking-[-0.25px]">
          <div>
            <h2>Награды по промокоду</h2>
            <p className="mt-1 text-[#797979]">Каждые {everyonePromo.usagesPerAward} активаций</p>
          </div>
          <div className="flex h-12 items-center gap-1.5">
            <span className="flex size-12 shrink-0 items-center justify-center rounded-lg border border-[#e4e4e4] bg-[#f0f0f0]"><Gift className="size-5 text-[#d52094]" aria-hidden /></span>
            <span className="min-w-0"><span className="block truncate">{everyonePromo.reward.name}</span><span className="mt-1 block text-[#797979]">{everyonePromo.reward.amount.toLocaleString("ru-RU")}</span></span>
          </div>
        </section>
      ) : null}
    </aside>
  );
}
