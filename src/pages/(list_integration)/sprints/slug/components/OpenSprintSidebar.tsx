import { Calendar, Gift } from "lucide-react";
import type { BaseSprintDto, SprintRewardRuleDto } from "@/api/generated/model";

const placeDotClass: Record<number, string> = {
  1: "bg-[#fddb91]",
  2: "bg-[#e8e8e8]",
  3: "bg-[#cfb9b5]",
};

function formatDuration(sprint: BaseSprintDto): string {
  const formatPart = (value: string | null) => {
    if (!value) return null;
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return null;
    return date.toLocaleString("ru-RU", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const start = formatPart(sprint.startDate);
  if (!start) return "Даты не указаны";
  if (sprint.ignoreEndDate || !sprint.endDate) {
    return `${start} – бессрочно`;
  }
  const end = formatPart(sprint.endDate);
  return end ? `${start} – ${end}` : start;
}

function placeLabel(rankFrom: number | null, rankTo: number | null): string {
  if (rankFrom != null && rankTo != null && rankFrom !== rankTo) {
    return `${rankFrom}–${rankTo} места`;
  }
  const place = rankFrom ?? rankTo;
  if (place == null) return "Места";
  return `${place} место`;
}

interface OpenSprintSidebarProps {
  sprint: BaseSprintDto;
  rules: SprintRewardRuleDto[];
}

export function OpenSprintSidebar({ sprint, rules }: OpenSprintSidebarProps) {
  const catalog = new Map<
    string,
    { name: string; iconUrl: string | null; amount: number }
  >();

  for (const rule of rules) {
    for (const item of rule.rewards) {
      const prev = catalog.get(item.rewardId);
      catalog.set(item.rewardId, {
        name: item.reward.name,
        iconUrl: item.reward.iconUrl,
        amount: (prev?.amount ?? 0) + item.amount,
      });
    }
  }

  const catalogItems = Array.from(catalog.values());
  const rankRules = rules
    .filter((rule) => rule.type === "byRank" && rule.rewards.length > 0)
    .slice()
    .sort((a, b) => (a.rankFrom ?? 999) - (b.rankFrom ?? 999));

  return (
    <aside className="flex w-full shrink-0 flex-col border-l border-[#e4e4e4] lg:w-[260px]">
      <div className="flex flex-col gap-1 border-b border-[#e4e4e4] p-4 text-[13px] font-medium leading-4 tracking-[-0.25px]">
        <p className="text-foreground">О спринте</p>
        <p className="text-[#797979]">Нет описания</p>
      </div>

      <div className="flex flex-col gap-1 border-b border-[#e4e4e4] p-4">
        <p className="text-[13px] font-medium leading-4 tracking-[-0.25px] text-foreground">
          Сколько длится
        </p>
        <div className="flex items-center gap-1">
          <Calendar className="size-3.5 shrink-0 text-[#797979]" aria-hidden />
          <p className="text-[13px] font-medium leading-4 tracking-[-0.25px] text-[#797979]">
            {formatDuration(sprint)}
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-2 p-4">
        <p className="text-[13px] font-medium leading-4 tracking-[-0.25px] text-foreground">
          Награды
        </p>

        {catalogItems.length === 0 ? (
          <p className="text-[13px] font-medium leading-4 text-[#797979]">
            Награды не настроены
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {catalogItems.map((item) => (
              <div
                key={`${item.name}-${item.amount}`}
                className="flex h-12 items-center gap-1.5"
              >
                <div className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-[#e4e4e4] bg-[#f0f0f0]">
                  {item.iconUrl ? (
                    <img
                      src={item.iconUrl}
                      alt=""
                      className="size-10 object-cover"
                    />
                  ) : (
                    <Gift className="size-5 text-[#797979]" aria-hidden />
                  )}
                </div>
                <div className="min-w-0 flex-1 text-[13px] font-medium leading-4 tracking-[-0.25px]">
                  <p className="truncate text-foreground">{item.name}</p>
                  <p className="text-[#797979]">{item.amount} шт.</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {rankRules.length > 0 ? (
          <div className="mt-2 flex flex-col overflow-hidden rounded-xl border border-[#e4e4e4] px-3">
            {rankRules.map((rule) => {
              const place = rule.rankFrom ?? rule.rankTo ?? 0;
              return (
                <div
                  key={rule.id}
                  className="flex flex-col gap-1 border-b border-[#e4e4e4] py-3 last:border-b-0"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-[13px] font-medium leading-4 tracking-[-0.25px] text-foreground">
                      {placeLabel(rule.rankFrom, rule.rankTo)}
                    </p>
                    {placeDotClass[place] ? (
                      <span
                        className={`size-3 shrink-0 rounded-full ${placeDotClass[place]}`}
                      />
                    ) : null}
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {rule.rewards.map((reward) => (
                      <span
                        key={reward.id}
                        className="inline-flex items-center gap-0.5 rounded-[13px] bg-[#f0f0f0] px-1.5 py-1 text-[13px] font-medium leading-4 tracking-[-0.25px] text-foreground"
                      >
                        {reward.reward.iconUrl ? (
                          <img
                            src={reward.reward.iconUrl}
                            alt=""
                            className="size-3.5 object-cover"
                          />
                        ) : (
                          <Gift className="size-3.5" aria-hidden />
                        )}
                        {reward.reward.name}
                        {reward.amount > 1 ? ` ×${reward.amount}` : ""}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        ) : null}
      </div>
    </aside>
  );
}
