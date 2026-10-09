import { useMemo, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { Check, User } from "lucide-react";
import { Alert, AlertDescription, Avatar, Button, Input, PageLoader } from "@senler/ui";
import type { EventTaskDto, EventTaskSubmissionDto } from "@/api/generated/model";
import { useEventTasks } from "@/hooks/events/useEventTasks";
import { useEventTaskSubmissions } from "@/hooks/events/useEventTaskSubmissions";
import { useAmbassadors } from "@/hooks/ambassador/useAmbassadors";
import { TaskPlatform } from "../../creativetasks/components/TaskPlatform";
import back from "@/assets/task-flow/back.svg";
import pencil from "@/assets/task-flow/pencil.svg";
import pause from "@/assets/task-flow/pause.svg";
import star from "@/assets/task-flow/star.svg";

const formatLabels: Record<string, string> = {
  STORY: "История",
  POST: "Публикация",
  ARTICLE: "Статья",
  VIDEO: "Видео",
};

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

function SubmissionProgress({ submission }: { submission: EventTaskSubmissionDto }) {
  const meta = progressByStatus[submission.status];
  return (
    <div className="flex w-[149px] shrink-0 flex-col gap-1">
      <div className="flex gap-0.5" aria-hidden>
        {[1, 2, 3].map((step) => (
          <span key={step} className={`h-1 min-w-0 flex-1 rounded-full ${step <= meta.progress ? "bg-[#26c464]" : "bg-[#e4e4e4]"}`} />
        ))}
      </div>
      <span className={`flex min-w-0 items-center gap-1 truncate text-[12px] leading-4 ${meta.needsReview ? "text-black" : "text-[#797979]"}`}>
        {submission.status === "approved" ? <Check className="size-3.5 shrink-0" aria-hidden /> : meta.needsReview ? <span className="size-1 shrink-0 rounded-full bg-[#26c464]" aria-hidden /> : null}
        <span className="truncate">{meta.label}</span>
      </span>
    </div>
  );
}

function TaskInformation({ task }: { task: EventTaskDto }) {
  return (
    <div className="p-4">
      <section className="overflow-hidden rounded-lg border border-[#e4e4e4]">
        <div className="border-b border-[#e4e4e4] p-4">
          <h2 className="text-[15px] leading-5">Описание</h2>
          <p className="mt-1 whitespace-pre-wrap text-[#797979]">{task.description?.trim() || "Описание не добавлено"}</p>
        </div>
        <div className="border-b border-[#e4e4e4] p-4">
          <h2 className="text-[15px] leading-5">Критерии выполнения</h2>
          {task.criteria?.length ? <ul className="mt-2 list-disc space-y-1 pl-5 text-[#797979]">{task.criteria.map((criterion) => <li key={criterion}>{criterion}</li>)}</ul> : <p className="mt-1 text-[#797979]">Критерии не добавлены</p>}
        </div>
        <div className="p-4">
          <h2 className="text-[15px] leading-5">Что запрещено</h2>
          {task.restrictions?.length ? <ul className="mt-2 list-disc space-y-1 pl-5 text-[#797979]">{task.restrictions.map((restriction) => <li key={restriction}>{restriction}</li>)}</ul> : <p className="mt-1 text-[#797979]">Ограничения не добавлены</p>}
        </div>
      </section>
    </div>
  );
}

export default function EventTaskPage() {
  const { slug = "", eventId = "", taskId = "" } = useParams();
  const tasks = useEventTasks(eventId);
  const task = tasks.tasks.find((item) => item.id === taskId && !item.isDeleted);
  const submissions = useEventTaskSubmissions(eventId, taskId);
  const [tab, setTab] = useState<"submissions" | "information">("submissions");
  const [search, setSearch] = useState("");
  const ambassadorIds = useMemo(
    () => [...new Set(submissions.submissions.map((submission) => submission.ambassadorId))],
    [submissions.submissions],
  );
  const people = useAmbassadors(
    { page: 1, size: Math.max(ambassadorIds.length, 1), ambassadorIds },
    { allPages: true, enabled: ambassadorIds.length > 0 },
  );
  const peopleById = useMemo(
    () => new Map(people.ambassadors.map((person) => [person.id, person])),
    [people.ambassadors],
  );
  const normalizedSearch = search.trim().toLocaleLowerCase("ru-RU");
  const visibleSubmissions = submissions.submissions.filter((submission) => {
    if (!normalizedSearch) return true;
    const person = peopleById.get(submission.ambassadorId);
    return `${person?.username ?? ""} ${submission.ambassadorId}`.toLocaleLowerCase("ru-RU").includes(normalizedSearch);
  });

  if (tasks.isLoading) return <div className="flex min-h-[50vh] items-center justify-center"><PageLoader label="Загрузка задания…" /></div>;
  if (tasks.isError) return <Alert variant="destructive"><AlertDescription>Не удалось загрузить задание.<Button variant="outline" className="ml-2" onClick={() => void tasks.refetch()}>Повторить</Button></AlertDescription></Alert>;
  if (!task) return <Navigate to={`/rooms/${slug}/events/${eventId}?tab=tasks`} replace />;

  const reviewLabel = task.requirePublicationReview
    ? "До/после публикации"
    : task.requireMaterialsReview
      ? "До публикации"
      : "Без ручной проверки";

  return (
    <div className="-m-4 grid min-h-dvh w-[calc(100%+2rem)] grid-cols-1 bg-white text-[13px] font-medium leading-4 tracking-[-0.25px] lg:grid-cols-[minmax(0,1fr)_260px]">
      <main className="min-w-0">
        <header className="flex items-center justify-between gap-3 px-4 pb-3 pt-4">
          <div className="flex min-w-0 items-center gap-3">
            <Button asChild variant="outline" className="size-7 shrink-0 border-[#e4e4e4] p-0 shadow-none"><Link to={`/rooms/${slug}/events/${eventId}?tab=tasks`} aria-label="Назад к заданиям события"><img src={back} alt="" /></Link></Button>
            <h1 className="min-w-0 truncate text-[20px] font-medium leading-8 tracking-[-0.34px]">{task.title}</h1>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <Button type="button" variant="outline" size="icon" disabled className="size-7 border-[#e4e4e4] shadow-none disabled:opacity-100" aria-label="Редактирование задания пока недоступно"><img src={pencil} alt="" /></Button>
            <Button type="button" variant="outline" size="icon" disabled className="size-7 border-[#e4e4e4] shadow-none disabled:opacity-100" aria-label="Управление заданием доступно в списке"><img src={pause} alt="" /></Button>
          </div>
        </header>

        <div className="flex h-12 items-center gap-2 border-y border-[#e4e4e4] px-4 py-2.5">
          <div className="inline-flex h-7 shrink-0 items-center gap-0.5 rounded-md bg-[#f0f0f0] p-0.5">
            <button type="button" className={`rounded px-1.5 py-1 ${tab === "submissions" ? "bg-white" : ""}`} onClick={() => setTab("submissions")}>Выполнение</button>
            <button type="button" className={`rounded px-1.5 py-1 ${tab === "information" ? "bg-white" : ""}`} onClick={() => setTab("information")}>Информация</button>
          </div>
          {tab === "submissions" ? <Input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Поиск..." aria-label="Поиск по исполнителям" className="h-7 flex-1 rounded-md border-0 bg-[#f0f0f0] px-2 py-1.5 text-[13px] shadow-none" /> : null}
        </div>

        {tab === "information" ? <TaskInformation task={task} /> : submissions.isError || people.isError ? (
          <Alert variant="destructive" className="m-4 w-auto"><AlertDescription>Не удалось загрузить выполнения задания.<Button variant="outline" className="ml-2" onClick={() => { void submissions.refetch(); void people.refetch(); }}>Повторить</Button></AlertDescription></Alert>
        ) : submissions.isLoading || people.isLoading ? (
          <div className="flex justify-center py-10"><PageLoader label="Загрузка выполнений…" /></div>
        ) : visibleSubmissions.length === 0 ? (
          <p className="p-4 text-[#797979]">{normalizedSearch ? "Ничего не найдено" : "Выполнений пока нет"}</p>
        ) : (
          visibleSubmissions.map((submission) => {
            const person = peopleById.get(submission.ambassadorId);
            const name = person?.username ?? submission.ambassadorId;
            return (
              <div key={submission.id} className="flex h-12 items-center gap-4 border-b border-[#e4e4e4] px-4">
                <span className="flex min-w-0 flex-1 items-center gap-2">
                  <Avatar src={person?.avatarUrl} name={name} colorKey={submission.ambassadorId} size="sm" shape="rounded" />
                  <span className="truncate">{name}</span>
                </span>
                {submission.status === "approved" && task.eventType === "contest" ? (
                  <span className="flex shrink-0 items-center gap-1"><span className="text-[#797979]">+</span><img src={star} alt="" className="size-3.5" />{submission.experiencePoints.toLocaleString("ru-RU")} XP</span>
                ) : <SubmissionProgress submission={submission} />}
                <Button asChild variant="outline" className="size-7 shrink-0 border-[#e4e4e4] p-0 shadow-none"><Link to={`/rooms/${slug}/events/${eventId}/participants/${submission.ambassadorId}`} aria-label={`Профиль исполнителя: ${name}`}><User className="size-4" strokeWidth={1.5} aria-hidden /></Link></Button>
              </div>
            );
          })
        )}
      </main>

      <aside className="border-l border-[#e4e4e4]">
        <section className="border-b border-[#e4e4e4] p-4"><h2>Вид задания</h2><p className="mt-1 text-[#797979]">{task.allowedFormats?.map((format) => formatLabels[format] ?? format).join(", ") || "Не указан"}</p></section>
        <section className="border-b border-[#e4e4e4] p-4"><h2>Платформа</h2><p className="mt-1 flex items-center gap-1.5"><TaskPlatform platform={task.targetPlatform} />{task.targetPlatform === "YOUTUBE_CHANNEL" ? "YouTube" : task.targetPlatform === "RUTUBE_CHANNEL" ? "Rutube" : "VK"}</p></section>
        <section className="border-b border-[#e4e4e4] p-4"><h2>Проверка задания</h2><p className="mt-1 text-[#797979]">{reviewLabel}</p></section>
        {task.eventType === "contest" ? <section className="border-b border-[#e4e4e4] p-4"><h2>Очки</h2><p className="mt-1 flex items-center gap-1"><img src={star} alt="" className="size-3.5" />от {task.experiencePoints.toLocaleString("ru-RU")} XP</p></section> : null}
      </aside>
    </div>
  );
}
