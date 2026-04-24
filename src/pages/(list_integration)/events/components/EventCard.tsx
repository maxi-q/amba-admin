import { Pencil } from "lucide-react";
import { Link } from "react-router-dom";
import { Badge, Card, CardContent } from "@senler/ui";
import type { IEvent } from "@services/events/events.types";
import { formatDateRange, isEventActive } from "../utils/eventUtils";
import { checkEventStatus } from "../constants/eventStatus";

interface EventCardProps {
  /** Данные события */
  event: IEvent;
  /** Slug комнаты для формирования ссылки */
  roomSlug: string;
}

/**
 * Карточка события в списке
 * Отображает информацию о событии: название, диапазон дат, статус активности
 * Позволяет перейти к редактированию события по клику
 */
export const EventCard = ({ event, roomSlug }: EventCardProps) => {
  const dateRange = formatDateRange(event.startDate, event.endDate);
  const active = event.ignoreEndDate
    ? true
    : isEventActive(event.startDate, event.endDate);
  const { label, color } = checkEventStatus(
    event.startDate,
    event.endDate,
    event.ignoreEndDate
  );

  const badgeVariant =
    color === "success"
      ? "success"
      : color === "warning"
        ? "warning"
        : "secondary";

  return (
    <Link
      to={`/rooms/${roomSlug}/events/${event.id}`}
      className={`block rounded-lg border border-border bg-card text-card-foreground shadow-sm transition-colors hover:border-primary hover:bg-accent/30 ${
        event.isDeleted ? "opacity-60" : ""
      }`}
    >
      <Card className="border-0 shadow-none">
        <CardContent className="flex items-center justify-between gap-3 p-4">
          <div className="min-w-0 flex-1">
            <p
              className={`mb-1 text-lg font-medium leading-tight ${
                event.isDeleted
                  ? "text-muted-foreground line-through"
                  : "text-foreground"
              }`}
            >
              {event.name}
            </p>
            <p
              className={`text-sm ${
                event.isDeleted
                  ? "text-muted-foreground line-through"
                  : active
                    ? "font-medium text-green-700 dark:text-green-400"
                    : "text-muted-foreground"
              }`}
            >
              {dateRange}
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            {!event.isDeleted ? (
              <Badge variant={badgeVariant}>{label}</Badge>
            ) : null}
            <Pencil className="size-4 text-muted-foreground" aria-hidden />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};
