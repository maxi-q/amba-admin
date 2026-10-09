import { Link, useParams } from "react-router-dom";
import { Alert, AlertDescription, Avatar, Button, PageLoader } from "@senler/ui";
import type { EventTaskSubmissionDto } from "@/api/generated/model";
import { useEvents } from "@/hooks/events/useEvents";
import { useEventTasks } from "@/hooks/events/useEventTasks";
import { useEventParticipantActivity } from "@/hooks/events/useEventParticipantActivity";
import { useAmbassadors } from "@/hooks/ambassador/useAmbassadors";
import { useCompetitionRules, useEventResults } from "@/hooks/competitions/useCompetitionQueries";
import { CompetitionAwards } from "@/components/competitions/CompetitionAwards";
import { TaskPlatform } from "../../creativetasks/components/TaskPlatform";
import { OpenEventSidebar } from "./components/OpenEventSidebar";
import { EventRewardConfirmations } from "./components/EventRewardConfirmations";
import back from "@/assets/task-flow/back.svg";
import user from "@/assets/task-flow/user.svg";
import star from "@/assets/task-flow/star.svg";

const progressByStatus: Record<
  EventTaskSubmissionDto["status"],
  { progress: number; label: string; needsReview?: boolean }
> = {
  new: { progress: 0, label: "Ожидает ответа…" },
  waiting_for_review_materials: { progress: 1, label: "Проверьте работу", needsReview: true },
  rejected_for_materials: { progress: 1, label: "Материалы отклонены" },
  waiting_for_publication: { progress: 2, label: "Публикация..." },
  waiting_for_review_publication: { progress: 2, label: "Проверьте публикацию", needsReview: true },
  rejected_for_publication: { progress: 2, label: "Публикация отклонена" },
  approved: { progress: 3, label: "Выполнено" },
};

function EventSubmissionProgress({ submission }: { submission: EventTaskSubmissionDto }) {
  const meta = progressByStatus[submission.status];
  return (
    <div className="flex w-[149px] shrink-0 flex-col gap-1">
      <div className="flex gap-0.5" aria-hidden>
        {[1, 2, 3].map((step) => (
          <span key={step} className={`h-1 min-w-0 flex-1 rounded-full ${step <= meta.progress ? "bg-[#26c464]" : "bg-[#e4e4e4]"}`} />
        ))}
      </div>
      <span className={`flex min-w-0 items-center gap-1 truncate text-[12px] leading-4 ${meta.needsReview ? "text-black" : "text-[#797979]"}`}>
        {meta.needsReview ? <span className="size-1 shrink-0 rounded-full bg-[#26c464]" aria-hidden /> : null}
        <span className="truncate">{meta.label}</span>
      </span>
    </div>
  );
}

export default function EventParticipantPage() {
  const { slug = "", eventId = "", ambassadorId = "" } = useParams();
  const events = useEvents({ page: 1, size: 100 }, slug, { allPages: true });
  const event = events.events.find((item) => item.id === eventId);
  const tasks = useEventTasks(eventId);
  const people = useAmbassadors(
    { roomIds: [slug], ambassadorIds: [ambassadorId], page: 1, size: 1 },
    { enabled: Boolean(slug && ambassadorId) },
  );
  const person = people.ambassadors.find((item) => item.id === ambassadorId);
  const activity = useEventParticipantActivity(
    eventId,
    tasks.tasks.filter((task) => !task.isDeleted).map((task) => task.id),
    ambassadorId,
  );
  const results = useEventResults(eventId, 1, person?.username ?? "");
  const scope = { kind: "event" as const, id: eventId, roomId: slug };
  const rules = useCompetitionRules(scope);
  const completed = activity.submissions.filter((submission) => submission.status === "approved");
  const participantResult = results.data?.items.find((item) => item.ambassadorId === ambassadorId);
  const activeTasks = tasks.tasks.filter((task) => !task.isDeleted);
  const profileUrl = person?.channelTypeId === 1 && /^\d+$/.test(person.subscriberId)
    ? `https://vk.com/id${person.subscriberId}`
    : null;
  const loading = events.isLoading || tasks.isLoading || people.isLoading || activity.isLoading;
  const error = events.isError || tasks.isError || people.isError || activity.isError;

  const content = (
    <div className={event?.type === "everyone" ? "w-full" : "mx-auto w-full max-w-[700px]"}>
      <Button asChild variant="outline" className="mb-4 size-7 border-[#e4e4e4] p-0 shadow-none">
        <Link to={`/rooms/${slug}/events/${eventId}?tab=results`} aria-label="Назад к событию"><img src={back} alt="" /></Link>
      </Button>

      {error ? (
        <Alert variant="destructive"><AlertDescription>Не удалось загрузить профиль и активность участника.<Button variant="outline" className="ml-2" onClick={() => { void events.refetch(); void tasks.refetch(); void people.refetch(); void activity.refetch(); }}>Повторить</Button></AlertDescription></Alert>
      ) : loading ? (
        <PageLoader label="Загрузка профиля…" />
      ) : !event || !person ? (
        <p className="py-4 text-[#797979]">Участник или событие не найдено в этой компании.</p>
      ) : (
        <>
          <section className="rounded-lg border border-[#e4e4e4] bg-white p-4">
            <div className="flex items-center gap-3">
              <Avatar src={person.avatarUrl} name={person.username} colorKey={person.id} className="size-16 shrink-0 rounded-full" />
              <div className="min-w-0">
                <h1 className="truncate text-[20px] font-medium leading-8 tracking-[-0.34px]">{person.username}</h1>
                {event.type === "contest" ? (
                  <p className="flex items-center gap-1 text-[13px] leading-4">
                    <img src={star} alt="" className="size-3.5" />
                    {results.isLoading ? "…" : `${participantResult?.points.toLocaleString("ru-RU") ?? "—"} XP`}
                  </p>
                ) : null}
              </div>
            </div>
            {profileUrl ? (
              <Button asChild variant="outline" className="mt-3 h-7 gap-1 border-[#e4e4e4] px-2 text-[13px] shadow-none">
                <a href={profileUrl} target="_blank" rel="noopener noreferrer"><img src={user} alt="" />Профиль</a>
              </Button>
            ) : (
              <span title="Адрес внешнего профиля не получен"><Button disabled variant="outline" className="mt-3 h-7 gap-1 border-[#e4e4e4] px-2 text-[13px] shadow-none disabled:opacity-100"><img src={user} alt="" />Профиль</Button></span>
            )}
            {event.type === "everyone" && event.status !== "active" ? (
              <EventRewardConfirmations scope={scope} ambassadorId={ambassadorId} status={event.status} />
            ) : null}
          </section>

          {event.type === "contest" && event.status !== "active" ? (
            <CompetitionAwards scope={scope} ambassadorId={ambassadorId} status={event.status} />
          ) : null}

          <section className="mt-3 overflow-hidden rounded-lg border border-[#e4e4e4] bg-white" aria-label={`Активность в событии «${event.name}»`}>
            <header className="flex h-[52px] items-center justify-between border-b border-[#e4e4e4] px-4 text-[15px] leading-5">
              <h2>Активность</h2>
              <p>
                {event.type === "contest" ? completed.length : `${completed.length}/${activeTasks.length}`} {" "}
                <span className="text-[13px] leading-4 text-[#797979]">выполнено</span>
              </p>
            </header>
            {activity.submissions.length === 0 ? (
              <p className="p-4 text-[#797979]">В этом событии выполнений пока нет.</p>
            ) : activity.submissions.map((submission) => {
              const task = activeTasks.find((item) => item.id === submission.taskId);
              if (!task) return null;
              return (
                <Link
                  key={submission.id}
                  to={`/rooms/${slug}/events/${eventId}/tasks/${task.id}?submission=${encodeURIComponent(submission.id)}`}
                  className="flex h-12 items-center gap-4 border-b border-[#e4e4e4] px-4 last:border-b-0 hover:bg-[#fafafa]"
                >
                  <span className="flex min-w-0 flex-1 items-center gap-1.5">
                    <TaskPlatform platform={task.targetPlatform} />
                    <span className="truncate">{task.title}</span>
                  </span>
                  {submission.status === "approved" && event.type === "contest" ? (
                    <span className="flex shrink-0 items-center gap-1"><span className="text-[#797979]">+</span><img src={star} alt="" className="size-3.5" />{submission.experiencePoints.toLocaleString("ru-RU")} XP</span>
                  ) : (
                    <EventSubmissionProgress submission={submission} />
                  )}
                </Link>
              );
            })}
          </section>
        </>
      )}
    </div>
  );

  if (event?.type === "everyone") {
    return (
      <div className="-m-4 grid min-h-dvh w-[calc(100%+2rem)] grid-cols-1 bg-white text-[13px] font-medium leading-4 tracking-[-0.25px] lg:grid-cols-[minmax(0,1fr)_260px]">
        <main className="min-w-0 p-4">{content}</main>
        {rules.isLoading || tasks.isLoading ? (
          <aside className="flex items-center justify-center border-l border-[#e4e4e4]"><PageLoader label="Загрузка…" /></aside>
        ) : rules.isError ? (
          <aside className="border-l border-[#e4e4e4] p-4 text-destructive">Не удалось загрузить информацию о наградах.</aside>
        ) : (
          <OpenEventSidebar event={event} rules={rules.data ?? []} tasks={tasks.tasks} />
        )}
      </div>
    );
  }

  return <main className="-m-4 min-h-dvh bg-white p-4 text-[13px] font-medium leading-4 tracking-[-0.25px]">{content}</main>;
}
