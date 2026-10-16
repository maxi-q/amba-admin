import { useState } from "react";
import { ClipboardList, Gift } from "lucide-react";
import {
  Button,
  CheckBox,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogRoot,
  DialogTitle,
} from "@senler/ui";
import { toast } from "sonner";
import {
  useCompetitionGrants,
  useCompetitionReview,
} from "@/hooks/competitions/useCompetitionQueries";
import { useCompetitionActions } from "@/hooks/competitions/useCompetitionActions";
import type {
  CompetitionScope,
  CompetitionStatus,
} from "@/hooks/competitions/types";

function SprintCompetitionLifecycle({
  scope,
  status,
}: {
  scope: CompetitionScope;
  status: CompetitionStatus;
}) {
  const review = useCompetitionReview(scope);
  const grants = useCompetitionGrants(scope);
  const action = useCompetitionActions(scope);
  const [dialog, setDialog] = useState<"start" | "finish" | null>(null);
  const unfinished = review.data?.unfinishedAnswers ?? 0;
  const noun = scope.kind === "sprint" ? "спринт" : "событие";

  const recipients = new Map<string, boolean>();
  for (const grant of grants.data?.items ?? []) {
    const wasDelivered = recipients.get(grant.ambassadorId) ?? true;
    recipients.set(grant.ambassadorId, wasDelivered && Boolean(grant.deliveredAt));
  }
  const deliveredRecipients = [...recipients.values()].filter(Boolean).length;

  const run = (value: Parameters<typeof action.mutate>[0]) =>
    action.mutate(value, {
      onSuccess: () => {
        setDialog(null);
        toast.success("Статус обновлён");
      },
      onError: (error) => toast.error(error.message),
    });

  const openFinish = async () => {
    const fresh = await review.refetch();
    if (fresh.isError) {
      toast.error("Не удалось проверить оставшиеся ответы");
      return;
    }
    setDialog("finish");
  };

  if (status === "completed") return null;

  if (status === "awarding" && review.data && !review.data.resultsFixedAt) {
    return (
      <p className="border-b border-border px-4 py-3 text-[13px] text-muted-foreground">
        Исторические итоги не сохранены. Выдача наград недоступна без
        зафиксированных результатов.
      </p>
    );
  }

  return (
    <>
      {status === "active" ? (
        <section
          className="mx-4 mb-4 rounded-lg border border-border p-3 text-[13px] leading-4"
          aria-label="Завершение"
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span>
              Переход к проверке завершит приём новых ответов и активаций
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDialog("start")}
            >
              Завершить {noun}
            </Button>
          </div>
        </section>
      ) : status === "reviewing" ? (
        <section className="flex min-h-[69px] items-center justify-between gap-4 border-b border-border bg-[#e9efff] px-4 py-3 text-[13px] font-medium leading-4">
          <div className="flex min-w-0 items-start gap-1.5">
            <ClipboardList
              className="mt-px size-4 shrink-0 text-[#d52094]"
              strokeWidth={1.8}
              aria-hidden
            />
            <div className="min-w-0">
              <p className="text-foreground">Время на ответы вышло</p>
              <p className="mt-1 text-muted-foreground">
                Проверьте оставшихся участников прежде, чем отправить награды
              </p>
            </div>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-7 shrink-0 border-border bg-white px-2 text-[13px] shadow-none"
            disabled={!review.data || review.isFetching || action.isPending}
            onClick={() => void openFinish()}
          >
            {unfinished ? "Пропустить" : "Подвести итоги"}
          </Button>
        </section>
      ) : (
        <section className="flex min-h-[69px] items-center justify-between gap-4 border-b border-border bg-[#e9efff] px-4 py-3 text-[13px] font-medium leading-4">
          <div className="flex min-w-0 items-start gap-1.5">
            <Gift
              className="mt-px size-4 shrink-0 text-[#22c55e]"
              strokeWidth={1.8}
              aria-hidden
            />
            <div className="min-w-0">
              <p className="text-foreground">Ответы исполнителей оценены</p>
              <p className="mt-1 text-muted-foreground">
                Отправьте награды победителям
              </p>
            </div>
          </div>
          <span className="shrink-0 rounded-full border border-border bg-white px-2 py-1 text-foreground">
            {grants.isLoading
              ? "…"
              : `${deliveredRecipients} из ${recipients.size} отправлено`}
          </span>
        </section>
      )}

      <DialogRoot
        open={dialog !== null}
        onOpenChange={(open) => {
          if (!open && !action.isPending) setDialog(null);
        }}
      >
        <DialogContent className="max-w-[358px] gap-0 p-0">
          <DialogHeader className="px-4 pb-2 pt-3">
            <DialogTitle>
              {dialog === "start"
                ? "Перейти к проверке ответов?"
                : unfinished
                  ? "Пропустить проверку"
                  : "Подвести итоги?"}
            </DialogTitle>
            <DialogDescription className="pt-3">
              {dialog === "start"
                ? "Новые ответы и активации промокодов больше не принимаются. Ранее отправленные ответы можно проверить до фиксации итогов."
                : unfinished
                  ? `${review.data?.uniqueAmbassadors ?? 0} участников еще не завершили задания. Очки за эти задания не будут начислены`
                  : "После подведения итогов результаты нельзя будет изменить"}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="px-4 pb-3 pt-2">
            {dialog === "start" ? (
              <Button
                variant="outline"
                disabled={action.isPending}
                onClick={() => setDialog(null)}
              >
                Отмена
              </Button>
            ) : null}
            <Button
              variant={
                dialog === "finish" && unfinished > 0
                  ? "destructive"
                  : "default"
              }
              loading={action.isPending}
              disabled={action.isPending}
              onClick={() =>
                run(
                  dialog === "start"
                    ? { type: "status", status: "reviewing" }
                    : { type: "finish-review" },
                )
              }
            >
              {dialog === "start"
                ? "Перейти к проверке"
                : unfinished
                  ? "Пропустить"
                  : "Подвести итоги"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </DialogRoot>
    </>
  );
}

function EventCompetitionLifecycle({
  scope,
  status,
  onReview,
}: {
  scope: CompetitionScope;
  status: CompetitionStatus;
  onReview?: () => void;
}) {
  const review = useCompetitionReview(scope);
  const grants = useCompetitionGrants(scope, { delivered: false });
  const action = useCompetitionActions(scope);
  const [dialog, setDialog] = useState<"start" | "finish" | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const unfinished = review.data?.unfinishedAnswers ?? 0;

  const run = (value: Parameters<typeof action.mutate>[0]) =>
    action.mutate(value, {
      onSuccess: () => {
        setDialog(null);
        setConfirmed(false);
        toast.success("Статус обновлён");
      },
      onError: (error) => toast.error(error.message),
    });

  const openFinish = async () => {
    const fresh = await review.refetch();
    if (fresh.isError) {
      toast.error("Не удалось проверить оставшиеся ответы");
      return;
    }
    setDialog("finish");
  };

  if (status === "completed") {
    return (
      <p className="px-4 pb-3 text-[13px] text-muted-foreground">
        {review.data?.resultsFixedAt
          ? "Итоги зафиксированы. Все назначенные награды выданы."
          : "Завершено."}
      </p>
    );
  }

  if (status === "awarding" && review.data && !review.data.resultsFixedAt) {
    return (
      <p className="px-4 pb-3 text-[13px] text-muted-foreground">
        Исторические итоги не сохранены. Выдача и завершение недоступны без
        зафиксированных результатов.
      </p>
    );
  }

  return (
    <>
      <section
        className="mx-4 mb-4 rounded-lg border border-border p-3 text-[13px] leading-4"
        aria-label="Завершение"
      >
        {status === "active" ? (
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span>
              Переход к проверке завершит приём новых ответов и активаций
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDialog("start")}
            >
              Завершить событие
            </Button>
          </div>
        ) : status === "reviewing" ? (
          <>
            <p>Приём новых ответов завершён</p>
            <p className="mt-1 text-muted-foreground">
              Проверьте оставшиеся ответы перед начислением наград
            </p>
            {review.isError ? (
              <Button variant="outline" onClick={() => void review.refetch()}>
                Повторить загрузку проверки
              </Button>
            ) : (
              <div className="mt-2 flex flex-wrap items-center gap-2">
                {onReview ? (
                  <Button size="sm" onClick={onReview}>
                    Смотреть ответы · {review.data?.waitingReviewAnswers ?? "…"}
                  </Button>
                ) : null}
                <Button
                  size="sm"
                  variant="outline"
                  disabled={!review.data || review.isFetching || action.isPending}
                  onClick={() => void openFinish()}
                >
                  {unfinished ? "Пропустить" : "Зафиксировать итоги"}
                </Button>
                {review.data ? (
                  <span className="text-muted-foreground">
                    На проверке: {review.data.uniqueAmbassadors} участников · Не
                    завершено: {unfinished} ответов
                  </span>
                ) : null}
              </div>
            )}
          </>
        ) : (
          <>
            <p>Итоги зафиксированы. Отправьте награды оставшимся участникам.</p>
            {grants.isError ? (
              <Button variant="outline" onClick={() => void grants.refetch()}>
                Повторить загрузку наград
              </Button>
            ) : (
              <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                {grants.data?.total === 0 ? (
                  <CheckBox
                    checked={confirmed}
                    onCheckedChange={(value) => setConfirmed(value === true)}
                    label="Я отправил все награды"
                  />
                ) : (
                  <span className="text-muted-foreground">
                    Осталось выдать: {grants.data?.total ?? "…"}. Откройте
                    награды участника в рейтинге.
                  </span>
                )}
                <Button
                  size="sm"
                  disabled={
                    !confirmed ||
                    !grants.data ||
                    grants.data.total > 0 ||
                    grants.isFetching ||
                    action.isPending
                  }
                  onClick={() => run({ type: "status", status: "completed" })}
                >
                  Завершить событие
                </Button>
              </div>
            )}
          </>
        )}
      </section>
      <DialogRoot
        open={dialog !== null}
        onOpenChange={(open) => {
          if (!open && !action.isPending) setDialog(null);
        }}
      >
        <DialogContent className="max-w-[358px]">
          <DialogHeader>
            <DialogTitle>
              {dialog === "start"
                ? "Перейти к проверке ответов?"
                : unfinished
                  ? "Пропустить проверку"
                  : "Зафиксировать итоги?"}
            </DialogTitle>
            <DialogDescription>
              {dialog === "start"
                ? "Новые ответы и активации промокодов больше не принимаются. Ранее отправленные ответы можно проверить до фиксации итогов."
                : `Не завершено: ${unfinished} ответов. У ${review.data?.uniqueAmbassadors ?? 0} участников есть ответы на проверке. Неутверждённые ответы не принесут XP. После фиксации изменить результаты нельзя.`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              disabled={action.isPending}
              onClick={() => setDialog(null)}
            >
              Отмена
            </Button>
            <Button
              variant={
                dialog === "finish" && unfinished > 0
                  ? "destructive"
                  : "default"
              }
              loading={action.isPending}
              disabled={action.isPending}
              onClick={() =>
                run(
                  dialog === "start"
                    ? { type: "status", status: "reviewing" }
                    : { type: "finish-review" },
                )
              }
            >
              {dialog === "start"
                ? "Перейти к проверке"
                : unfinished
                  ? "Пропустить"
                  : "Зафиксировать"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </DialogRoot>
    </>
  );
}

export function CompetitionLifecycle({
  scope,
  status,
  onReview,
}: {
  scope: CompetitionScope;
  status: CompetitionStatus;
  onReview?: () => void;
}) {
  return scope.kind === "event" ? (
    <EventCompetitionLifecycle
      scope={scope}
      status={status}
      onReview={onReview}
    />
  ) : (
    <SprintCompetitionLifecycle scope={scope} status={status} />
  );
}
