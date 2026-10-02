import { Link, useParams } from "react-router-dom";
import { Alert, AlertDescription, Avatar, Button, PageLoader } from "@senler/ui";
import { useGetRoomById } from "@/hooks/rooms/useGetRoomById";
import { useRoomCreativeTasks } from "@/hooks/creativetasks/useRoomCreativeTasks";
import { useParticipantActivity } from "@/hooks/creativetasks/useParticipantActivity";
import { useAmbassadors } from "@/hooks/ambassador/useAmbassadors";
import { useSprints } from "@/hooks/sprints/useSprints";
import { useSprintLeaderboard } from "@/hooks/sprints/useSprintLeaderboard";
import { TaskPlatform } from "../../creativetasks/components/TaskPlatform";
import { SubmissionProgress } from "../../creativetasks/components/TaskDetailSubmissionsList";
import back from "@/assets/task-flow/back.svg";
import user from "@/assets/task-flow/user.svg";
import star from "@/assets/task-flow/star.svg";
import { CompetitionAwards } from "@/components/competitions/CompetitionAwards";
import { PromoPointsPanel } from "@/components/competitions/PromoPointsPanel";

export default function SprintParticipantPage() {
  const { slug = "", sprintId = "", ambassadorId = "" } = useParams();
  const roomQuery = useGetRoomById(slug);
  const sprintsQuery = useSprints({ page: 1, size: 100 }, slug, { allPages: true });
  const tasksQuery = useRoomCreativeTasks(roomQuery.room?.id ?? "", { sprintId, page: 1, size: 100 }, { allPages: true });
  const tasks = tasksQuery.tasks.filter((task) => task.sprintId === sprintId);
  const activity = useParticipantActivity(tasks.map((task) => task.id), ambassadorId);
  const leaderboard = useSprintLeaderboard(roomQuery.room?.id ?? "", { sprintId, page: 1, size: 100 }, { allPages: true });
  const people = useAmbassadors({ page: 1, size: 1, ambassadorIds: [ambassadorId], roomIds: roomQuery.room ? [roomQuery.room.id] : [] }, { enabled: !!roomQuery.room && !!ambassadorId });
  const participant = people.ambassadors.find((item) => item.id === ambassadorId);
  const sprint = sprintsQuery.sprints.find((item) => item.id === sprintId);
  const backLink = `/rooms/${slug}/sprints/${sprintId}?tab=leaderboard`;
  const loading = roomQuery.isLoading || sprintsQuery.isLoading || tasksQuery.isLoading || people.isLoading || activity.isLoading;
  const error = roomQuery.isError || sprintsQuery.isError || tasksQuery.isError || people.isError || activity.isError;
  const completed = activity.submissions.filter((item) => item.status === "approved");
  const points = leaderboard.sprint?.id === sprintId ? leaderboard.entries.find((item) => item.ambassadorId === ambassadorId)?.points : undefined;
  const profileUrl = participant?.channelTypeId === 1 && /^\d+$/.test(participant.subscriberId)
    ? `https://vk.com/id${participant.subscriberId}` : null;

  return <div className="mx-auto w-full max-w-[700px] text-[13px] font-medium leading-4 tracking-[-0.0325px] text-black">
    <Button asChild variant="outline" className="border-[#e4e4e4] mb-3 size-7 p-0 shadow-none"><Link to={backLink} aria-label="Назад к рейтингу"><img src={back} alt="" /></Link></Button>
    {error ? <Alert variant="destructive"><AlertDescription>Не удалось загрузить профиль и всю активность.<Button variant="outline" onClick={() => { void roomQuery.refetch(); void sprintsQuery.refetch(); void tasksQuery.refetch(); void people.refetch(); void activity.refetch(); }}>Повторить</Button></AlertDescription></Alert>
      : loading ? <PageLoader label="Загрузка профиля…" />
      : !participant || !sprint ? <p className="py-4 text-[#797979]">Участник или спринт не найден в этой компании.</p>
      : <>
        <section className="rounded-lg border border-border bg-card p-4">
          <div className="mb-3 flex items-center gap-3">
            <Avatar src={participant.avatarUrl} name={participant.username} colorKey={participant.id} className="size-16 shrink-0 rounded-full" />
            <div className="min-w-0"><h1 className="truncate text-xl font-medium leading-8 tracking-[-0.34px]">{participant.username}</h1>
              <p className="flex items-center gap-1" title={points == null ? "Рейтинг этого спринта не получен от сервера" : `Очки рейтинга в спринте «${sprint.name}»`}><img src={star} alt="" />{leaderboard.isLoading ? "…" : points?.toLocaleString("ru-RU") ?? "—"} XP<span className="sr-only">в выбранном спринте</span></p>
              {leaderboard.isError && <Button variant="link" className="h-auto p-0 text-xs" onClick={() => void leaderboard.refetch()}>Повторить загрузку XP</Button>}
            </div>
          </div>
          {profileUrl ? <Button asChild variant="outline" className="border-[#e4e4e4] h-7 gap-1 px-2 text-[13px] shadow-none"><a href={profileUrl} target="_blank" rel="noopener noreferrer"><img src={user} alt="" />Профиль</a></Button>
            : <span title="API не вернул адрес внешнего профиля"><Button disabled variant="outline" className="border-[#e4e4e4] h-7 gap-1 px-2 text-[13px] shadow-none"><img src={user} alt="" />Профиль</Button></span>}
        </section>
        <CompetitionAwards scope={{ kind: 'sprint', id: sprintId, roomId: roomQuery.room!.id }} ambassadorId={ambassadorId} status={sprint.status} />
        <PromoPointsPanel scope={{ kind: 'sprint', id: sprintId, roomId: roomQuery.room!.id }} ambassadorId={ambassadorId} />
        <section className="mt-3 overflow-hidden rounded-lg border border-border bg-card" aria-label={`Активность в спринте «${sprint.name}»`}>
          <header className="flex h-[52px] items-center justify-between border-b border-border px-4 text-[15px] leading-5"><h2>Активность</h2><p>{completed.length} <span className="text-[13px] text-[#797979]">выполнено</span></p></header>
          {activity.submissions.length === 0 ? <p className="p-4 text-[#797979]">В этом спринте выполнений пока нет.</p> : activity.submissions.map((submission) => {
            const task = tasks.find((item) => item.id === submission.taskId)!;
            return <Link key={submission.id} to={`/rooms/${slug}/creativetasks/${task.id}/answers?submission=${encodeURIComponent(submission.id)}`} className="flex min-h-12 items-center gap-4 border-b border-border px-4 py-2 last:border-b-0 hover:bg-muted/30" aria-label={`Открыть журнал задания «${task.title}»`}>
              <span className="flex min-w-0 flex-1 items-center gap-1.5"><TaskPlatform platform={task.targetPlatform} /><span className="truncate">{task.title}</span></span>
              {submission.status === "approved" ? <span className="flex shrink-0 items-center gap-1"><span className="text-[#797979]">+</span><img src={star} alt="" />{submission.rewardValue.toLocaleString("ru-RU")} XP</span> : <SubmissionProgress submission={submission} />}
            </Link>;
          })}
        </section>
      </>}
  </div>;
}
