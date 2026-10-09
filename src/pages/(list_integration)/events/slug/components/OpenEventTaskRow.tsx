import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { CircleDot, Users } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@senler/ui";
import type { EventTaskDto } from "@/api/generated/model";
import { useEventTaskSubmissions } from "@/hooks/events/useEventTaskSubmissions";
import { useUpdateEventTask } from "@/hooks/events/useUpdateEventTask";
import { TaskPlatform } from "../../../creativetasks/components/TaskPlatform";
import { StopCreativeTaskDialog } from "../../../creativetasks/components/StopCreativeTaskDialog";
import pause from "@/assets/task-flow/pause.svg";
import play from "@/assets/task-flow/play.svg";

export function OpenEventTaskRow({
  eventId,
  roomSlug,
  task,
}: {
  eventId: string;
  roomSlug: string;
  task: EventTaskDto;
}) {
  const [stopOpen, setStopOpen] = useState(false);
  const [frozen, setFrozen] = useState(task.isFrozen);
  const submissions = useEventTaskSubmissions(eventId, task.id);
  const update = useUpdateEventTask(eventId);

  useEffect(() => setFrozen(task.isFrozen), [task.isFrozen]);

  const approved = submissions.submissions.filter(
    (submission) => submission.status === "approved",
  ).length;
  const inProgress = submissions.submissions.length - approved;

  const changeFrozenState = () => {
    update.updateEventTask(
      {
        eventId,
        taskId: task.id,
        data: { isFrozen: !frozen },
      },
      {
        onSuccess: () => {
          setFrozen(!frozen);
          setStopOpen(false);
          toast.success(frozen ? "Задание возобновлено" : "Задание остановлено");
        },
      },
    );
  };

  return (
    <>
      <div className="flex h-12 items-center gap-4 border-b border-[#e4e4e4] px-4 transition-colors hover:bg-[#fafafa]">
        <Link
          to={`/rooms/${roomSlug}/events/${eventId}/tasks/${task.id}`}
          className="flex min-w-0 flex-1 items-center gap-1.5 self-stretch"
        >
          <TaskPlatform platform={task.targetPlatform} />
          <span className="min-w-0 truncate text-[13px] font-medium leading-4 tracking-[-0.25px]">
            {task.title}
          </span>
          {frozen ? (
            <span className="shrink-0 text-[13px] text-[#797979]">На паузе</span>
          ) : null}
        </Link>

        {!submissions.isLoading && !submissions.isError && submissions.submissions.length > 0 ? (
          <div className="flex shrink-0 items-center gap-1">
            <span className="rounded-full bg-[#fbe8f5] px-1.5 py-1 text-[13px] leading-4 text-[#d52094]">
              {submissions.submissions.length} {submissions.submissions.length === 1 ? "ответ" : "ответа"}
            </span>
            {inProgress > 0 ? (
              <span className="inline-flex items-center gap-0.5 rounded-full border border-[#e4e4e4] px-1.5 py-1 text-[13px] leading-4">
                <CircleDot className="size-4 text-[#f97316]" strokeWidth={1.5} aria-hidden />
                {inProgress} в работе
              </span>
            ) : null}
            {task.eventType === "everyone" && approved > 0 ? (
              <span className="inline-flex items-center gap-1 rounded-full border border-[#e4e4e4] px-1.5 py-1 text-[13px] leading-4">
                <Users className="size-4" strokeWidth={1.5} aria-hidden />
                {approved} выполнили
              </span>
            ) : null}
          </div>
        ) : null}

        <Button
          type="button"
          variant="outline"
          size="icon"
          className="size-7 shrink-0 border-[#e4e4e4] bg-white shadow-none"
          onClick={() => setStopOpen(true)}
          disabled={update.isPending}
          aria-label={`${frozen ? "Возобновить" : "Остановить"} задание «${task.title}»`}
        >
          <img src={frozen ? play : pause} alt="" />
        </Button>
      </div>

      <StopCreativeTaskDialog
        open={stopOpen}
        onOpenChange={setStopOpen}
        isFrozen={frozen}
        isPending={update.isPending}
        errorMessage={update.error instanceof Error ? update.error.message : undefined}
        onConfirm={changeFrozenState}
      />
    </>
  );
}
