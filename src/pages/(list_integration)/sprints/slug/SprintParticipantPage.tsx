import { useEffect, useMemo, useState } from "react";
import {
  Link,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
import { Banknote, ChevronDown, Gift } from "lucide-react";
import {
  Alert,
  AlertDescription,
  Avatar,
  Button,
  CheckBox,
  PageLoader,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@senler/ui";
import { toast } from "sonner";
import { useGetRoomById } from "@/hooks/rooms/useGetRoomById";
import { useRoomCreativeTasks } from "@/hooks/creativetasks/useRoomCreativeTasks";
import { useParticipantActivity } from "@/hooks/creativetasks/useParticipantActivity";
import { useAmbassadors } from "@/hooks/ambassador/useAmbassadors";
import { useSprints } from "@/hooks/sprints/useSprints";
import { useSprintLeaderboard } from "@/hooks/sprints/useSprintLeaderboard";
import {
  useCompetitionGrants,
} from "@/hooks/competitions/useCompetitionQueries";
import { useCompetitionActions } from "@/hooks/competitions/useCompetitionActions";
import type { RewardGrantDto } from "@/api/generated/model";
import { TaskPlatform } from "../../creativetasks/components/TaskPlatform";
import { SubmissionProgress } from "../../creativetasks/components/TaskDetailSubmissionsList";
import back from "@/assets/task-flow/back.svg";
import user from "@/assets/task-flow/user.svg";
import star from "@/assets/task-flow/star.svg";

const numberFormatter = new Intl.NumberFormat("ru-RU", {
  maximumFractionDigits: 10,
});

type RewardGroup = {
  key: string;
  name: string;
  amount: number;
  grants: RewardGrantDto[];
};

function groupRewards(grants: RewardGrantDto[]): RewardGroup[] {
  const groups = new Map<string, RewardGroup>();

  for (const grant of grants) {
    const key = `${grant.rewardId}:${grant.rewardVersionId}`;
    const current = groups.get(key);
    if (current) {
      current.amount += grant.amount;
      current.grants.push(grant);
    } else {
      groups.set(key, {
        key,
        name: grant.reward.name,
        amount: grant.amount,
        grants: [grant],
      });
    }
  }

  return [...groups.values()];
}

function RewardChip({ group }: { group: RewardGroup }) {
  const isMoney = /руб|[₽$€]/i.test(group.name);
  const currencySymbol = group.name.match(/([₽$€])/)?.[1] ?? "₽";
  const RewardIcon = isMoney ? Banknote : Gift;
  const content = (
    <>
      <RewardIcon
        className={`size-3.5 shrink-0 ${
          isMoney ? "text-[#22c55e]" : "text-[#d52094]"
        }`}
        strokeWidth={1.5}
        aria-hidden
      />
      {!isMoney ? <span className="truncate">{group.name}</span> : null}
      <span className={isMoney ? "text-foreground" : "text-muted-foreground"}>
        {numberFormatter.format(group.amount)}{isMoney ? ` ${currencySymbol}` : ""}
      </span>
      {group.grants.length > 1 ? (
        <ChevronDown
          className="size-3.5 shrink-0 text-muted-foreground"
          strokeWidth={1.5}
          aria-hidden
        />
      ) : null}
    </>
  );
  const className =
    "inline-flex h-6 min-w-0 items-center gap-0.5 rounded-full bg-muted px-1.5 text-[13px] font-medium leading-4 text-foreground";

  if (group.grants.length === 1) {
    return <span className={className}>{content}</span>;
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={className}
          aria-label={`Показать состав награды «${group.name}»`}
        >
          {content}
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-[260px] p-3">
        <p className="text-[13px] font-medium">{group.name}</p>
        <div className="mt-2 space-y-1 text-xs text-muted-foreground">
          {group.grants.map((grant, index) => (
            <p key={grant.id} className="flex justify-between gap-3">
              <span>
                {grant.assignmentType === "manual"
                  ? "Ручной отбор"
                  : `Начисление ${index + 1}`}
              </span>
              <span>{numberFormatter.format(grant.amount)}</span>
            </p>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}

export default function SprintParticipantPage() {
  const { slug = "", sprintId = "", ambassadorId = "" } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const roomQuery = useGetRoomById(slug);
  const sprintsQuery = useSprints(
    { page: 1, size: 100 },
    slug,
    { allPages: true },
  );
  const tasksQuery = useRoomCreativeTasks(
    roomQuery.room?.id ?? "",
    { sprintId, page: 1, size: 100 },
    { allPages: true },
  );
  const tasks = tasksQuery.tasks.filter((task) => task.sprintId === sprintId);
  const activity = useParticipantActivity(
    tasks.map((task) => task.id),
    ambassadorId,
  );
  const leaderboard = useSprintLeaderboard(roomQuery.room?.id ?? "", {
    sprintId,
    page: 1,
    size: 100,
  }, { allPages: true });
  const people = useAmbassadors(
    {
      page: 1,
      size: 1,
      ambassadorIds: [ambassadorId],
      roomIds: roomQuery.room ? [roomQuery.room.id] : [],
    },
    { enabled: Boolean(roomQuery.room && ambassadorId) },
  );
  const participant = people.ambassadors.find((item) => item.id === ambassadorId);
  const sprint = sprintsQuery.sprints.find((item) => item.id === sprintId);
  const scope = {
    kind: "sprint" as const,
    id: sprintId,
    roomId: roomQuery.room?.id ?? "",
  };
  const grantsQuery = useCompetitionGrants(scope, { includeHistory: true });
  const rewardActions = useCompetitionActions(scope);
  const [deliveryChecked, setDeliveryChecked] = useState(false);
  const taskId = searchParams.get("taskId");
  const backLink = taskId
    ? `/rooms/${slug}/creativetasks/${encodeURIComponent(taskId)}/answers`
    : `/rooms/${slug}/sprints/${sprintId}?tab=leaderboard`;
  const backLabel = taskId ? "Назад к ответам задания" : "Назад к рейтингу";
  const loading =
    roomQuery.isLoading ||
    sprintsQuery.isLoading ||
    tasksQuery.isLoading ||
    people.isLoading ||
    activity.isLoading;
  const error =
    roomQuery.isError ||
    sprintsQuery.isError ||
    tasksQuery.isError ||
    people.isError ||
    activity.isError;
  const completed = activity.submissions.filter(
    (item) => item.status === "approved",
  );
  const points =
    leaderboard.sprint?.id === sprintId
      ? leaderboard.entries.find((item) => item.ambassadorId === ambassadorId)
          ?.points
      : undefined;
  const profileUrl =
    participant?.channelTypeId === 1 && /^\d+$/.test(participant.subscriberId)
      ? `https://vk.com/id${participant.subscriberId}`
      : null;
  const participantGrants = useMemo(
    () =>
      (grantsQuery.data?.items ?? []).filter(
        (grant) => grant.ambassadorId === ambassadorId,
      ),
    [ambassadorId, grantsQuery.data?.items],
  );
  const rewardGroups = useMemo(
    () => groupRewards(participantGrants),
    [participantGrants],
  );
  const allParticipantRewardsDelivered =
    participantGrants.length > 0 &&
    participantGrants.every((grant) => Boolean(grant.deliveredAt));

  useEffect(() => setDeliveryChecked(false), [ambassadorId]);

  const confirmRewards = async () => {
    if (!sprint || sprint.status !== "awarding") return;
    const pending = participantGrants.filter((grant) => !grant.deliveredAt);
    if (pending.length === 0) return;

    try {
      for (const grant of pending) {
        await rewardActions.mutateAsync({
          type: "delivery",
          grantId: grant.id,
          delivered: true,
        });
      }

      const pendingForOtherParticipants = (grantsQuery.data?.items ?? []).some(
        (grant) =>
          grant.ambassadorId !== ambassadorId && !grant.deliveredAt,
      );

      setDeliveryChecked(false);
      if (!pendingForOtherParticipants) {
        await rewardActions.mutateAsync({ type: "status", status: "completed" });
        toast.success("Все награды отправлены. Спринт завершён");
        navigate(`/rooms/${slug}/sprints/${sprintId}`);
      } else {
        toast.success("Награды отмечены отправленными");
      }
    } catch (rewardError) {
      toast.error(
        rewardError instanceof Error
          ? rewardError.message
          : "Не удалось подтвердить выдачу наград",
      );
    }
  };

  return (
    <div className="mx-auto w-full max-w-[700px] text-[13px] font-medium leading-4 tracking-[-0.0325px] text-black">
      <Button
        asChild
        variant="outline"
        className="mb-3 size-7 border-[#e4e4e4] p-0 shadow-none"
      >
        <Link to={backLink} aria-label={backLabel}>
          <img src={back} alt="" />
        </Link>
      </Button>
      {error ? (
        <Alert variant="destructive">
          <AlertDescription>
            Не удалось загрузить профиль и всю активность.
            <Button
              variant="outline"
              onClick={() => {
                void roomQuery.refetch();
                void sprintsQuery.refetch();
                void tasksQuery.refetch();
                void people.refetch();
                void activity.refetch();
              }}
            >
              Повторить
            </Button>
          </AlertDescription>
        </Alert>
      ) : loading ? (
        <PageLoader label="Загрузка профиля…" />
      ) : !participant || !sprint ? (
        <p className="py-4 text-[#797979]">
          Участник или спринт не найден в этой компании.
        </p>
      ) : (
        <>
          <section className="overflow-hidden rounded-lg border border-border bg-card">
            <div className="p-4">
              <div className="mb-3 flex items-center gap-3">
                <Avatar
                  src={participant.avatarUrl}
                  name={participant.username}
                  colorKey={participant.id}
                  className="size-16 shrink-0 rounded-full"
                />
                <div className="min-w-0">
                  <h1 className="truncate text-xl font-medium leading-8 tracking-[-0.34px]">
                    {participant.username}
                  </h1>
                  <p
                    className="flex items-center gap-1"
                    title={
                      points == null
                        ? "Рейтинг этого спринта не получен от сервера"
                        : `Очки рейтинга в спринте «${sprint.name}»`
                    }
                  >
                    <img src={star} alt="" />
                    {leaderboard.isLoading
                      ? "…"
                      : points?.toLocaleString("ru-RU") ?? "—"}{" "}
                    XP
                    <span className="sr-only">в выбранном спринте</span>
                  </p>
                  {leaderboard.isError ? (
                    <Button
                      variant="link"
                      className="h-auto p-0 text-xs"
                      onClick={() => void leaderboard.refetch()}
                    >
                      Повторить загрузку XP
                    </Button>
                  ) : null}
                </div>
              </div>

              {sprint.status === "awarding" && participantGrants.length > 0 ? (
                <div className="mb-3">
                  <p className="mb-2 text-muted-foreground">
                    Награды для отправки
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {rewardGroups.map((group) => (
                      <RewardChip key={group.key} group={group} />
                    ))}
                  </div>
                </div>
              ) : null}

              {profileUrl ? (
                <Button
                  asChild
                  variant="outline"
                  className="h-7 gap-1 border-[#e4e4e4] px-2 text-[13px] shadow-none"
                >
                  <a href={profileUrl} target="_blank" rel="noopener noreferrer">
                    <img src={user} alt="" />
                    Профиль
                  </a>
                </Button>
              ) : (
                <span title="API не вернул адрес внешнего профиля">
                  <Button
                    disabled
                    variant="outline"
                    className="h-7 gap-1 border-[#e4e4e4] px-2 text-[13px] shadow-none"
                  >
                    <img src={user} alt="" />
                    Профиль
                  </Button>
                </span>
              )}
            </div>

            {sprint.status === "awarding" && participantGrants.length > 0 ? (
              <div className="flex min-h-[58px] items-center gap-3 border-t border-border bg-muted/30 px-2 py-2">
                <div className="min-w-0 flex-1">
                  <CheckBox
                    label={
                      <span className="flex flex-col text-[13px] leading-4">
                        <span>Я отправил все награды исполнителю</span>
                        <span className="text-destructive">
                          Подтвердите выдачу наград
                        </span>
                      </span>
                    }
                    checked={
                      allParticipantRewardsDelivered || deliveryChecked
                    }
                    disabled={
                      allParticipantRewardsDelivered || rewardActions.isPending
                    }
                    onCheckedChange={(value) =>
                      setDeliveryChecked(value === true)
                    }
                  />
                </div>
                <Button
                  type="button"
                  size="sm"
                  className="h-7 shrink-0 px-2 text-[13px]"
                  disabled={
                    allParticipantRewardsDelivered ||
                    !deliveryChecked ||
                    rewardActions.isPending
                  }
                  loading={rewardActions.isPending}
                  onClick={() => void confirmRewards()}
                >
                  {allParticipantRewardsDelivered
                    ? "Подтверждено"
                    : "Подтвердить"}
                </Button>
              </div>
            ) : null}
          </section>

          <section
            className="mt-3 overflow-hidden rounded-lg border border-border bg-card"
            aria-label={`Активность в спринте «${sprint.name}»`}
          >
            <header className="flex h-[52px] items-center justify-between border-b border-border px-4 text-[15px] leading-5">
              <h2>Активность</h2>
              <p>
                {completed.length}{" "}
                <span className="text-[13px] text-[#797979]">выполнено</span>
              </p>
            </header>
            {activity.submissions.length === 0 ? (
              <p className="p-4 text-[#797979]">
                В этом спринте выполнений пока нет.
              </p>
            ) : (
              activity.submissions.map((submission) => {
                const task = tasks.find((item) => item.id === submission.taskId);
                if (!task) return null;
                return (
                  <Link
                    key={submission.id}
                    to={`/rooms/${slug}/creativetasks/${task.id}/answers?submission=${encodeURIComponent(submission.id)}`}
                    className="flex min-h-12 items-center gap-4 border-b border-border px-4 py-2 last:border-b-0 hover:bg-muted/30"
                    aria-label={`Открыть журнал задания «${task.title}»`}
                  >
                    <span className="flex min-w-0 flex-1 items-center gap-1.5">
                      <TaskPlatform platform={task.targetPlatform} />
                      <span className="truncate">{task.title}</span>
                    </span>
                    {submission.status === "approved" ? (
                      <span className="flex shrink-0 items-center gap-1">
                        <span className="text-[#797979]">+</span>
                        <img src={star} alt="" />
                        {submission.rewardValue.toLocaleString("ru-RU")} XP
                      </span>
                    ) : (
                      <SubmissionProgress submission={submission} />
                    )}
                  </Link>
                );
              })
            )}
          </section>
        </>
      )}
    </div>
  );
}
