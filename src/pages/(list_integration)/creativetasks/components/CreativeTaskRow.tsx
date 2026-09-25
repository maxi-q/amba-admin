import { useState } from "react";
import { Link } from "react-router-dom";
import { Button, DialogContent, DialogDescription, DialogFooter, DialogRoot, DialogTitle } from "@senler/ui";
import { toast } from "sonner";
import type { BaseCreativeTaskDto, GetMySprintsResponseItemDto } from "@/api/generated/model";
import { useUpdateCreativeTask } from "@/hooks/creativetasks/useUpdateCreativeTask";
import { TaskPlatform } from "./TaskPlatform";
import { TaskSubmissionBadges } from "./TaskSubmissionBadges";
import pencil from "@/assets/task-flow/pencil.svg";
import trash from "@/assets/task-flow/trash.svg";

export function CreativeTaskRow({ task, sprint, roomSlug }: { task: BaseCreativeTaskDto; sprint?: GetMySprintsResponseItemDto; roomSlug: string }) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const { updateCreativeTask, isPending, error } = useUpdateCreativeTask();
  const canEdit = sprint && (sprint.isDraft || sprint.status === "active");
  const editPath = sprint?.isDraft ? `/rooms/${roomSlug}/sprints/${sprint.id}/edit?step=tasks` : `/rooms/${roomSlug}/creativetasks/${task.id}/edit`;
  const endDate = sprint?.endDate && !sprint.ignoreEndDate ? new Date(sprint.endDate) : null;
  const dateLabel = endDate && !Number.isNaN(endDate.getTime()) ? endDate.toLocaleDateString("ru-RU") : null;
  return <>
    <div className="flex h-12 min-w-[650px] items-center gap-4 border-b border-border px-4 text-[13px] font-medium leading-4 tracking-[-0.0325px] hover:bg-muted/30">
      <Link to={`/rooms/${roomSlug}/creativetasks/${task.id}`} className="flex min-w-0 flex-1 items-center gap-1.5 self-stretch" title={`${task.title}${sprint?.name ? ` · ${sprint.name}` : ""}`}><TaskPlatform platform={task.targetPlatform} /><span className="truncate">{task.title}</span>{task.isFrozen && <span className="shrink-0 text-[#797979]">На паузе</span>}</Link>
      {sprint?.isDraft ? <span className="rounded-full border border-border px-1.5 py-1">Черновик</span> : <div className="flex shrink-0 items-center gap-2"><TaskSubmissionBadges taskId={task.id} roomSlug={roomSlug} showCompleted /></div>}
      {dateLabel && <span className="shrink-0 text-[#797979]" title={`Окончание спринта «${sprint?.name}»`}>до {dateLabel}</span>}
      <div className="flex shrink-0 gap-1">
        {canEdit ? <Button asChild variant="outline" className="border-[#e4e4e4] size-7 p-0 shadow-none"><Link to={editPath} aria-label={`Редактировать задание «${task.title}»`}><img src={pencil} alt="" /></Link></Button> : <Button disabled variant="outline" className="border-[#e4e4e4] size-7 p-0 shadow-none" aria-label="Редактирование недоступно" title="Спринт закрыт или его данные недоступны"><img src={pencil} alt="" /></Button>}
        <Button variant="outline" className="border-[#e4e4e4] size-7 p-0 shadow-none" disabled={!canEdit || isPending} onClick={() => setConfirmDelete(true)} aria-label={`Удалить задание «${task.title}»`}><img src={trash} alt="" /></Button>
      </div>
    </div>
    <DialogRoot open={confirmDelete} onOpenChange={(open) => { if (!isPending) setConfirmDelete(open); }}><DialogContent className="sm:max-w-[358px]">
      <DialogTitle>Удалить задание?</DialogTitle><DialogDescription>Задание «{task.title}» будет скрыто из списка и станет недоступно исполнителям.</DialogDescription>
      {error && <p role="alert" className="text-sm text-destructive">{error.message || "Не удалось удалить задание"}</p>}
      <DialogFooter><Button variant="outline" disabled={isPending} onClick={() => setConfirmDelete(false)}>Отмена</Button><Button variant="destructive" loading={isPending} onClick={() => updateCreativeTask({ id: task.id, data: { isDeleted: true } }, { onSuccess: () => { setConfirmDelete(false); toast.success("Задание удалено"); } })}>Удалить</Button></DialogFooter>
    </DialogContent></DialogRoot>
  </>;
}
