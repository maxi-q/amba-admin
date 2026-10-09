import { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Alert, AlertDescription, Button, Input, PageLoader, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@senler/ui";
import { toast } from "sonner";
import { useGetRoomById } from "@/hooks/rooms/useGetRoomById";
import { useSprints } from "@/hooks/sprints/useSprints";
import { useCreativeTask } from "@/hooks/creativetasks/useCreativeTask";
import { useCreateCreativeTask } from "@/hooks/creativetasks/useCreateCreativeTask";
import { SprintCreationTaskDialog } from "../sprints/slug/components/SprintCreationTaskDialog";
import { creativeTaskToDraft, draftTaskToCreatePayload, type DraftSprintTask } from "../sprints/slug/components/draftSprintTask";
import CreativeTasksPage from ".";
import { EditCreativeTaskDialog } from "./components/EditCreativeTaskDialog";
import back from "@/assets/task-flow/back.svg";

export default function CreativeTaskEditorPage() {
  const { taskId = "", slug = "" } = useParams();
  return <CreativeTaskEditor key={`${slug}/${taskId}`} taskId={taskId} roomSlug={slug} />;
}

function CreativeTaskEditor({ taskId, roomSlug }: { taskId: string; roomSlug: string }) {
  const navigate = useNavigate();
  const [step, setStep] = useState<"task" | "settings">("task");
  const [draft, setDraft] = useState<DraftSprintTask | null>(null);
  const [selectedSprintId, setSelectedSprintId] = useState("");
  const [publications, setPublications] = useState<string | null>(null);
  const [clientError, setClientError] = useState("");
  const roomQuery = useGetRoomById(roomSlug);
  const taskQuery = useCreativeTask(taskId);
  const sprintsQuery = useSprints({ page: 1, size: 100 }, roomSlug, { allPages: true });
  const create = useCreateCreativeTask();
  const initialTask = useMemo(() => taskQuery.task ? creativeTaskToDraft(taskQuery.task) : null, [taskQuery.task]);
  const sprintId = taskId ? taskQuery.task?.sprintId ?? "" : selectedSprintId;
  const availableSprints = sprintsQuery.sprints.filter((sprint) => !sprint.isDraft && sprint.status === "active");
  const sprint = sprintsQuery.sprints.find((item) => item.id === sprintId);
  const pending = create.isPending;
  const validationMessages = Object.values(create.validationErrors).flat();
  const error = validationMessages.length ? validationMessages.join(". ") : create.error?.message;
  const listPath = `/rooms/${roomSlug}/creativetasks`;

  const save = () => {
    if (pending || !draft || !roomQuery.room || !sprint || sprint.isDraft || sprint.status !== "active") return;
    const count = Number(publications ?? draft.publicationsCount);
    if (!Number.isInteger(count) || count < 1 || count > 100) {
      setClientError("Количество публикаций должно быть целым числом от 1 до 100");
      return;
    }
    setClientError("");
    const form = { ...draft, publicationsCount: count };
    const onSuccess = () => { toast.success("Задание создано"); navigate(listPath); };
    create.createCreativeTask(draftTaskToCreatePayload(form, roomQuery.room.id, sprintId), { onSuccess });
  };

  if (roomQuery.isError || taskQuery.isError || sprintsQuery.isError) return <Alert variant="destructive"><AlertDescription>Не удалось загрузить данные задания.<Button variant="outline" onClick={() => { void roomQuery.refetch(); void sprintsQuery.refetch(); if (taskId) void taskQuery.refetch(); }}>Повторить</Button></AlertDescription></Alert>;
  if (roomQuery.isLoading || taskQuery.isLoading || sprintsQuery.isLoading) return <PageLoader label="Загрузка задания…" />;
  if (!roomQuery.room || (taskId && (!taskQuery.task || taskQuery.task.roomId !== roomQuery.room.id))) return <p>Задание не найдено в этой компании.</p>;
  if (taskId && (!sprint || sprint.isDraft || sprint.status !== "active")) return <div className="space-y-4"><Button asChild variant="outline"><Link to={listPath}>Назад к заданиям</Link></Button><p>Редактирование доступно только в активном опубликованном спринте.</p></div>;
  if (taskId && taskQuery.task) return <>
    <CreativeTasksPage />
    <EditCreativeTaskDialog
      open
      task={taskQuery.task}
      roomSlug={roomSlug}
      onClose={() => navigate(listPath)}
    />
  </>;

  return <div className="mx-auto w-full max-w-[700px] text-[13px] font-medium leading-4">
    <div className="mb-3 flex items-center gap-3"><Button variant="outline" disabled={pending} onClick={() => navigate(listPath)} aria-label="Назад к заданиям" className="size-7 border-[#e4e4e4] p-0 shadow-none"><img src={back} alt="" /></Button><h1>{taskId ? "Настройка задания" : "Добавить задание"}</h1></div>
    <div className="mb-3 flex gap-1" aria-label="Этапы настройки задания">
      <Button variant="ghost" disabled={pending} onClick={() => setStep("task")} aria-current={step === "task" ? "step" : undefined} className={`h-7 px-2 text-[13px] ${step === "task" ? "bg-muted" : "text-[#797979]"}`}>1 · Задание</Button>
      <Button variant="ghost" disabled={step !== "settings"} aria-current={step === "settings" ? "step" : undefined} className={`h-7 px-2 text-[13px] ${step === "settings" ? "bg-muted" : "text-[#797979]"}`}>2 · Настройки</Button>
    </div>
    {step === "task" ? <SprintCreationTaskDialog open presentation="page" saveLabel="Продолжить" roomId={roomQuery.room.id} roomSlug={roomSlug} initialTask={draft ?? initialTask} onClose={() => navigate(listPath)} onSave={(form) => { setDraft(form); setStep("settings"); }} /> : (
      <section className="overflow-hidden rounded-lg border border-border bg-card">
        <div className="grid gap-3 border-b border-border p-4 md:grid-cols-[248px_minmax(0,1fr)]"><div><p>Спринт</p><p className="mt-1 text-[#797979]">Задание будет доступно его участникам</p></div><div>
          {taskId ? <p className="py-3">{sprint?.name}</p> : <Select value={selectedSprintId} onValueChange={setSelectedSprintId} disabled={pending}><SelectTrigger aria-label="Спринт для задания"><SelectValue placeholder="Выберите спринт" /></SelectTrigger><SelectContent>{availableSprints.map((item) => <SelectItem key={item.id} value={item.id}>{item.name || "Без названия"}</SelectItem>)}</SelectContent></Select>}
          {availableSprints.length === 0 && <p className="mt-2 text-[#797979]">Сначала создайте и опубликуйте спринт.</p>}
        </div></div>
        <div className="grid gap-3 border-b border-border p-4 md:grid-cols-[248px_minmax(0,1fr)]"><div><p>Количество публикаций</p><p className="mt-1 text-[#797979]">От 1 до 100 на одно выполнение</p></div><Input type="number" min={1} max={100} step={1} aria-label="Количество публикаций" value={publications ?? String(draft?.publicationsCount ?? 1)} onChange={(event) => setPublications(event.target.value)} disabled={pending} /></div>
        {(clientError || error) && <Alert variant="destructive" className="m-4 w-auto"><AlertDescription>{clientError || error}</AlertDescription></Alert>}
        <div className="flex justify-end gap-2 px-4 py-2.5"><Button variant="outline" className="border-[#e4e4e4] text-[13px]" onClick={() => setStep("task")} disabled={pending}>Назад</Button><Button onClick={save} loading={pending} disabled={pending || !sprintId || availableSprints.length === 0} className="h-7 bg-[#2563eb] px-2 text-[13px] hover:bg-[#2563eb]/90">{taskId ? "Сохранить" : "Создать задание"}</Button></div>
      </section>
    )}
  </div>;
}
