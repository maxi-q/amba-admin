import { Star, User } from "lucide-react";
import { PageLoader } from "@senler/ui";
import { useSprintLeaderboard } from "@/hooks/sprints/useSprintLeaderboard";

interface OpenSprintLeaderboardTabProps {
  roomId: string;
  sprintId: string;
}

function formatPoints(points: number): string {
  return `${points.toLocaleString("ru-RU")} XP`;
}

export function OpenSprintLeaderboardTab({
  roomId,
  sprintId,
}: OpenSprintLeaderboardTabProps) {
  const { sprint, entries, isLoading, isError, error } = useSprintLeaderboard(
    roomId,
    { page: 1, size: 50 }
  );

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
        Таблица лидеров доступна только для активного спринта комнаты.
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

  return (
    <div className="flex flex-col">
      {entries.map((entry) => (
        <div
          key={entry.ambassadorId}
          className="flex h-12 items-center gap-4 border-b border-[#e4e4e4] px-4"
        >
          <div className="flex min-w-0 flex-1 items-center gap-2">
            <span className="w-[27px] shrink-0 text-right text-[13px] font-medium leading-4 tracking-[-0.25px] text-foreground">
              {entry.rank}.
            </span>
            <div className="flex size-6 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-[#e4e4e4] bg-[#f0f0f0]">
              <User className="size-3.5 text-[#797979]" aria-hidden />
            </div>
            <p className="min-w-0 flex-1 truncate text-[13px] font-medium leading-4 tracking-[-0.25px] text-foreground">
              {entry.username}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <Star className="size-3.5 text-foreground" aria-hidden />
            <span className="text-[13px] font-medium leading-4 tracking-[-0.25px] text-foreground">
              {formatPoints(entry.points)}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
