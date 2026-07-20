import { useState } from "react";
import { useParams } from "react-router-dom";
import { Alert, AlertDescription, Badge, Card, CardContent, PageLoader } from "@senler/ui";
import { useGetRoomById } from "@/hooks/rooms/useGetRoomById";
import { useSprintLeaderboard } from "@/hooks/sprints/useSprintLeaderboard";
import { CreativesPaginationControls } from "../../creativetasks/components/CreativesPaginationControls";

export default function SprintLeaderboardPage() {
  const { slug } = useParams<{ slug: string }>();
  const { room, isLoading: isRoomLoading } = useGetRoomById(slug ?? "");
  const roomId = room?.id ?? "";
  const [page, setPage] = useState(1);
  const pageSize = 50;

  const { sprint, entries, pagination, isLoading, isError, error } = useSprintLeaderboard(roomId, {
    page,
    size: pageSize,
  });

  if (isRoomLoading || isLoading) {
    return (
      <div className="flex justify-center py-10">
        <PageLoader label="Загрузка лидерборда…" />
      </div>
    );
  }

  return (
    <div className="w-full px-2 pb-6">
      <div className="mb-4">
        <h1 className="text-xl font-bold tracking-tight text-foreground">Лидерборд</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Рейтинг амбассадоров активного спринта и предпросмотр наград по правилам.
        </p>
      </div>

      {isError ? (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>
            {error instanceof Error ? error.message : "Не удалось загрузить лидерборд"}
          </AlertDescription>
        </Alert>
      ) : null}

      {!sprint ? (
        <Card>
          <CardContent className="p-6 text-sm text-muted-foreground">
            Сейчас нет активного спринта — лидерборд недоступен.
          </CardContent>
        </Card>
      ) : (
        <>
          <Card className="mb-4 border border-border shadow-none">
            <CardContent className="space-y-1 p-4 text-sm">
              <p className="font-medium text-foreground">{sprint.name}</p>
              <p className="text-muted-foreground">
                {new Date(sprint.startDate).toLocaleDateString("ru-RU")}
                {" — "}
                {sprint.ignoreEndDate || !sprint.endDate
                  ? "бессрочно"
                  : new Date(sprint.endDate).toLocaleDateString("ru-RU")}
              </p>
              {sprint.isEndless ? <Badge variant="outline">Бессрочный</Badge> : null}
            </CardContent>
          </Card>

          {entries.length === 0 ? (
            <p className="text-sm text-muted-foreground">Пока нет участников в рейтинге.</p>
          ) : (
            <div className="overflow-x-auto rounded-md border border-border">
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead className="border-b border-border bg-muted/40">
                  <tr>
                    <th className="px-3 py-2 font-medium">Место</th>
                    <th className="px-3 py-2 font-medium">Амбассадор</th>
                    <th className="px-3 py-2 font-medium">Промокод</th>
                    <th className="px-3 py-2 font-medium">Баллы</th>
                    <th className="px-3 py-2 font-medium">Награды</th>
                  </tr>
                </thead>
                <tbody>
                  {entries.map((entry) => (
                    <tr key={entry.ambassadorId} className="border-b border-border last:border-0">
                      <td className="px-3 py-2 font-semibold text-foreground">{entry.rank}</td>
                      <td className="px-3 py-2 text-foreground">{entry.username}</td>
                      <td className="px-3 py-2 text-muted-foreground">{entry.promoCode || "—"}</td>
                      <td className="px-3 py-2 text-foreground">{entry.points}</td>
                      <td className="px-3 py-2 text-muted-foreground">
                        {entry.rewards?.length
                          ? entry.rewards
                              .map((reward) => `${reward.name} × ${reward.amount}`)
                              .join(", ")
                          : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {pagination && pagination.totalPages > 1 ? (
            <CreativesPaginationControls
              page={page}
              totalPages={pagination.totalPages}
              onPageChange={setPage}
              className="mt-4"
            />
          ) : null}
        </>
      )}
    </div>
  );
}
