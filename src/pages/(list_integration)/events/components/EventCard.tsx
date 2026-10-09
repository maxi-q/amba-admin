import { Users } from "lucide-react";
import { Link } from "react-router-dom";
import type { GetMyEventsResponseItemDto } from "@/api/generated/model";
import { formatDateRange } from "../utils/eventUtils";
import { checkEventStatus } from "../constants/eventStatus";
import pencil from "@/assets/task-flow/pencil.svg";

interface EventCardProps {
  /** Данные события */
  event: GetMyEventsResponseItemDto;
  /** Slug комнаты для формирования ссылки */
  roomSlug: string;
}

/**
 * Карточка события в списке
 * Отображает информацию о событии: название, диапазон дат, статус активности
 * Позволяет перейти к редактированию события по клику
 */
export const EventCard = ({ event, roomSlug }: EventCardProps) => {
  const dateRange = event.ignoreEndDate
    ? `${new Date(event.startDate).toLocaleDateString("ru-RU")} — бессрочно`
    : formatDateRange(event.startDate, event.endDate);
  const timing = checkEventStatus(
    event.startDate,
    event.endDate,
    event.ignoreEndDate
  );
  const status = event.isDraft
    ? { label: "Черновик", dotClassName: "border-[#989898]" }
    : event.status === "active" && timing.color === "warning"
      ? { label: "Запланирован", dotClassName: "border-[#f59e0b]" }
      : event.status === "completed"
        ? { label: "Завершен", dotClassName: "border-[#989898]" }
        : {
            label:
              event.status === "reviewing"
                ? "Проверка ответов"
                : event.status === "awarding"
                  ? "Выдача наград"
                  : "Активный",
            dotClassName: "border-[#22c55e]",
          };
  const target = `/rooms/${roomSlug}/events/${event.id}${event.isDraft ? "/edit" : ""}`;

  return (
    <Link
      to={target}
      className="flex h-12 min-w-[650px] items-center gap-4 border-b border-[#e4e4e4] px-4 text-[13px] font-medium leading-4 tracking-[-0.0325px] text-black transition-colors hover:bg-muted/30"
    >
      <span className="min-w-0 flex-1 truncate">{event.name}</span>
      <span className="shrink-0 rounded-full bg-[#f0f0f0] px-1.5 py-1 text-[#797979]">
        {event.type === "contest" ? "Конкурс" : "Не конкурс"}
      </span>
      <span className="flex h-6 shrink-0 items-center gap-0.5 rounded-full border border-[#e4e4e4] px-1.5 py-1 whitespace-nowrap">
        <span className={`size-2 rounded-full border ${status.dotClassName}`} aria-hidden />
        {status.label}
      </span>
      {!event.isDraft ? (
        <span
          className="flex h-6 shrink-0 items-center gap-0.5 rounded-full border border-[#e4e4e4] px-1.5 py-1 tabular-nums"
          aria-label={`Использований промокода: ${event.promoCodeUsagesCount}`}
          title="Использований промокода"
        >
          <Users className="size-4 text-[#707070]" strokeWidth={1.5} aria-hidden />
          {event.promoCodeUsagesCount}
        </span>
      ) : null}
      <span className="shrink-0 text-[#797979]">{dateRange}</span>
      <span
        className={`flex size-7 shrink-0 items-center justify-center rounded-md border border-[#e4e4e4] bg-white ${
          event.status === "completed" ? "opacity-50" : ""
        }`}
        aria-hidden
      >
        <img src={pencil} alt="" className="size-4" />
      </span>
    </Link>
  );
};
