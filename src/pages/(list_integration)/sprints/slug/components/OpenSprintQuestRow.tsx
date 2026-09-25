import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@senler/ui";
import { useFreezeCreativeTask } from "@/hooks/creativetasks/useFreezeCreativeTask";
import { useUnfreezeCreativeTask } from "@/hooks/creativetasks/useUnfreezeCreativeTask";
import type { BaseCreativeTaskDto } from "@/api/generated/model";
import { TaskPlatform } from "../../../creativetasks/components/TaskPlatform";
import { TaskSubmissionBadges } from "../../../creativetasks/components/TaskSubmissionBadges";
import pause from "@/assets/task-flow/pause.svg";
import play from "@/assets/task-flow/play.svg";
import { StopCreativeTaskDialog } from "@/pages/(list_integration)/creativetasks/components/StopCreativeTaskDialog";

interface OpenSprintQuestRowProps {
  taskId: string;
  title: string;
  roomSlug: string;
  isFrozen: boolean;
  targetPlatform: BaseCreativeTaskDto["targetPlatform"];
}

export function OpenSprintQuestRow({
  taskId,
  title,
  roomSlug,
  isFrozen,
  targetPlatform,
}: OpenSprintQuestRowProps) {
  const [stopOpen, setStopOpen] = useState(false);
  const [frozen, setFrozen] = useState(isFrozen);
  const {
    freezeCreativeTask,
    isPending: isFreezing,
    generalError: freezeError,
  } = useFreezeCreativeTask();
  const {
    unfreezeCreativeTask,
    isPending: isUnfreezing,
    generalError: unfreezeError,
  } = useUnfreezeCreativeTask();
  const isChangingFrozenState = isFreezing || isUnfreezing;

  useEffect(() => setFrozen(isFrozen), [isFrozen]);

  const handleFrozenStateChange = () => {
    const mutation = frozen ? unfreezeCreativeTask : freezeCreativeTask;
    mutation(
      { id: taskId },
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
          to={`/rooms/${roomSlug}/creativetasks/${taskId}/answers`}
          className="flex min-w-0 flex-1 items-center gap-1.5 self-stretch"
        >
          <TaskPlatform platform={targetPlatform} />
          <p className="min-w-0 truncate text-[13px] font-medium leading-4 tracking-[-0.0325px] text-foreground">
            {title}
          </p>
          {frozen && <span className="shrink-0 text-[13px] font-medium text-muted-foreground">На паузе</span>}
        </Link>
        <div className="flex shrink-0 items-center gap-1"><TaskSubmissionBadges taskId={taskId} roomSlug={roomSlug} /></div>
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="size-7 shrink-0 border-[#e4e4e4] bg-white shadow-none"
          onClick={() => setStopOpen(true)}
          disabled={isChangingFrozenState}
          aria-label={`${frozen ? "Возобновить" : "Остановить"} задание «${title}»`}
          title={frozen ? "Возобновить задание" : "Остановить задание"}
        >
          <img src={frozen ? play : pause} alt="" />
        </Button>
      </div>
      <StopCreativeTaskDialog
        open={stopOpen}
        onOpenChange={setStopOpen}
        isFrozen={frozen}
        isPending={isChangingFrozenState}
        errorMessage={frozen ? unfreezeError : freezeError}
        onConfirm={handleFrozenStateChange}
      />
    </>
  );
}
