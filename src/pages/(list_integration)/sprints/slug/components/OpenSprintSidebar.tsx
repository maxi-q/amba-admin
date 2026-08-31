import { Calendar, Gift } from "lucide-react";
import type { BaseSprintDto, SprintRewardRuleDto } from "@/api/generated/model";
import { checkSprintStatus } from "../../constants/sprintStatus";

type SidebarReward = {
  rewardId: string;
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

  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${date.getDate()} ${monthNames[date.getMonth()]}, ${hours}:${minutes}`;
}

function formatDuration(sprint: BaseSprintDto): string {
  const start = formatDateTime(sprint.startDate);
  if (!start) return "Даты не указаны";
  if (sprint.ignoreEndDate || !sprint.endDate) {
    return `${start} – бессрочно`;
  }
  const end = formatDateTime(sprint.endDate);
  return end ? `${start} – ${end}` : start;
}

function collectRewards(
  rules: SprintRewardRuleDto[],
  isManual: boolean
): SidebarReward[] {
  const rewards = new Map<string, SidebarReward>();

  for (const rule of rules) {
    if ((rule.type === "manual") !== isManual) continue;
    for (const item of rule.rewards) {
      const previous = rewards.get(item.rewardId);
      rewards.set(item.rewardId, {
        rewardId: item.rewardId,
        name: item.reward.name,
        iconUrl: item.reward.iconUrl,
        amount: (previous?.amount ?? 0) + item.amount,
      });
    }
  }

  return Array.from(rewards.values());
}

function RewardItem({ reward }: { reward: SidebarReward }) {
  const amountIsPartOfName = /[₽$€]/.test(reward.name);

  return (
    <div className="flex h-12 items-center gap-1.5">
      <div className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-[#e4e4e4] bg-[#f0f0f0]">
        {reward.iconUrl ? (
          <img
            src={reward.iconUrl}
            alt=""
            className="size-10 object-cover"
          />
        ) : (
          <Gift className="size-5 text-[#797979]" aria-hidden />
        )}
      </div>
      <div className="flex min-w-0 flex-1 flex-col justify-center gap-1 text-[13px] font-medium leading-4 tracking-[-0.25px]">
        <p className="truncate text-foreground">{reward.name}</p>
        {!amountIsPartOfName ? (
          <p className="text-[#797979]">
            {reward.amount.toLocaleString("ru-RU")} шт.
          </p>
        ) : null}
      </div>
    </div>
  );
}

function RewardGroup({
  title,
  description,
  rewards,
}: {
  title: string;
  description: string;
  rewards: SidebarReward[];
}) {
  return (
    <section className="flex flex-col gap-2">
      <div className="flex flex-col gap-1 text-[13px] font-medium leading-4 tracking-[-0.25px]">
        <h2 className="text-foreground">{title}</h2>
        <p className="text-[#797979]">{description}</p>
      </div>
      {rewards.length > 0 ? (
        <div className="flex flex-col gap-2">
          {rewards.map((reward) => (
            <RewardItem key={reward.rewardId} reward={reward} />
          ))}
        </div>
      ) : (
        <p className="text-[13px] font-medium leading-4 text-[#797979]">
          Награды не настроены
        </p>
      )}
    </section>
  );
}

interface OpenSprintSidebarProps {
  sprint: BaseSprintDto;
  rules: SprintRewardRuleDto[];
}

export function OpenSprintSidebar({ sprint, rules }: OpenSprintSidebarProps) {
  const ratingRewards = collectRewards(rules, false);
  const manualRewards = collectRewards(rules, true);
  const { label, tone } = checkSprintStatus(
    sprint.startDate,
    sprint.endDate,
    sprint.ignoreEndDate,
    sprint.status
  );
  const statusLabel =
    sprint.status === "awarding"
      ? "Выдача наград"
      : sprint.status === "completed"
        ? "Завершен"
        : label;
  const statusClassName =
    sprint.status === "awarding"
      ? "text-[#26c464]"
      : sprint.status === "completed"
        ? "text-[#797979]"
        : tone === "active"
          ? "text-[#26c464]"
          : tone === "planned"
            ? "text-[#f97316]"
            : "text-[#797979]";

  return (
    <aside className="flex w-full shrink-0 flex-col border-l border-[#e4e4e4] bg-white lg:w-[260px]">
      <section className="min-h-[116px] border-b border-[#e4e4e4] p-4 text-[13px] font-medium leading-4 tracking-[-0.25px]">
        <h2 className="text-foreground">О спринте</h2>
        <p className="mt-1 whitespace-pre-wrap text-[#797979]">
          {sprint.description?.trim() || "Нет описания"}
        </p>
      </section>

      <section className="min-h-[68px] border-b border-[#e4e4e4] p-4 text-[13px] font-medium leading-4 tracking-[-0.25px]">
        <p className="text-foreground">
          Статус <span className={statusClassName}>{statusLabel}</span>
        </p>
        <div className="mt-1 flex items-center gap-1 text-[#797979]">
          <Calendar className="size-3.5 shrink-0" strokeWidth={1.5} aria-hidden />
          <p className="min-w-0">{formatDuration(sprint)}</p>
        </div>
      </section>

      <div className="flex flex-col gap-4 px-4 pb-6 pt-4">
        <RewardGroup
          title="Награды рейтинга"
          description="Распределяются по количеству XP"
          rewards={ratingRewards}
        />
        <RewardGroup
          title="Ручной отбор"
          description="Распределяются вручную"
          rewards={manualRewards}
        />
      </div>
    </aside>
  );
}
