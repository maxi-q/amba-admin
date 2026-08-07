import { useState } from "react";
import { ArrowLeft, Pencil, Plus, X } from "lucide-react";
import { Button } from "@senler/ui";
import xpStarUrl from "../assets/xp-star.svg";
import { SprintCreationHeader } from "./SprintCreationHeader";
import { SprintCreationTaskDialog } from "./SprintCreationTaskDialog";
import {
  cloneDraftSprintTask,
  formatXpLabel,
  type DraftSprintTask,
} from "./draftSprintTask";

interface SprintCreationStepThreeProps {
  roomId: string;
  roomSlug: string;
  tasks: DraftSprintTask[];
  isLaunching?: boolean;
  onTasksChange: (tasks: DraftSprintTask[]) => void;
  onBack: () => void;
  onLaunch: () => void;
  onSaveDraft: () => void;
}

export function SprintCreationStepThree({
  roomId,
  roomSlug,
  tasks,
  isLaunching = false,
  onTasksChange,
  onBack,
  onLaunch,
  onSaveDraft,
}: SprintCreationStepThreeProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<DraftSprintTask | null>(null);

  const openCreate = () => {
    setEditingTask(null);
    setDialogOpen(true);
  };

  const openEdit = (task: DraftSprintTask) => {
    setEditingTask(cloneDraftSprintTask(task));
    setDialogOpen(true);
  };

  const handleSaveTask = (task: DraftSprintTask) => {
    const exists = tasks.some((item) => item.id === task.id);
    onTasksChange(
      exists
        ? tasks.map((item) => (item.id === task.id ? task : item))
        : [...tasks, task]
    );
    setDialogOpen(false);
    setEditingTask(null);
  };

  const handleDelete = (taskId: string) => {
    onTasksChange(tasks.filter((task) => task.id !== taskId));
  };

  const canLaunch = tasks.length > 0 && !isLaunching;

  return (
    <div className="flex min-w-0 flex-1 flex-col">
      <SprintCreationHeader activeStep={3} onSaveDraft={onSaveDraft} />

      <div className="mx-auto mt-9 flex w-full max-w-[700px] flex-col gap-3">
        <div className="rounded-lg border border-[#e4e4e4] bg-white p-4">
          <div className="space-y-1">
            <h2 className="text-[15px] font-medium leading-5 tracking-[-0.135px]">
              Задания
            </h2>
            <p className="text-[13px] font-medium leading-4 text-[#797979]">
              Создайте задания, которые будут выполнять участники
            </p>
          </div>

          {tasks.length > 0 ? (
            <div className="mt-3 space-y-2">
              <div className="overflow-hidden rounded-lg border border-[#e4e4e4]">
                {tasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex min-h-12 items-center gap-4 border-b border-[#e4e4e4] px-3 last:border-b-0"
                  >
                    <p className="min-w-0 flex-1 truncate text-[13px] font-medium leading-4">
                      {task.title}
                    </p>
                    <div className="flex shrink-0 items-center gap-1">
                      <img
                        src={xpStarUrl}
                        alt=""
                        width={14}
                        height={14}
                        className="size-[14px] shrink-0"
                      />
                      <span className="whitespace-nowrap text-[13px] font-medium leading-4">
                        {formatXpLabel(task.minimalRewardInBalls)}
                      </span>
                    </div>
                    <div className="flex shrink-0 items-center gap-1">
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="size-7 border-[#e4e4e4] bg-white shadow-none"
                        aria-label="Изменить задание"
                        onClick={() => openEdit(task)}
                      >
                        <Pencil className="size-4" aria-hidden />
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="size-7 border-[#e4e4e4] bg-white shadow-none"
                        aria-label="Удалить задание"
                        onClick={() => handleDelete(task.id)}
                      >
                        <X className="size-4" aria-hidden />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-7 border-[#e4e4e4] bg-white px-2 text-[13px] shadow-none"
                onClick={openCreate}
              >
                <Plus className="size-4" aria-hidden />
                Добавить
              </Button>
            </div>
          ) : (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-3 h-7 border-[#e4e4e4] bg-white px-2 text-[13px] shadow-none"
              onClick={openCreate}
            >
              <Plus className="size-4" aria-hidden />
              Добавить
            </Button>
          )}
        </div>

        <div className="flex items-center justify-between">
          <Button
            type="button"
            variant="outline"
            className="h-10 border-[#e4e4e4] bg-white px-3 text-[13px] shadow-none"
            onClick={onBack}
            disabled={isLaunching}
          >
            <ArrowLeft className="size-4" aria-hidden />
            Назад
          </Button>
          <Button
            type="button"
            className="h-10 bg-[#2563eb] px-3 text-[13px] font-medium hover:bg-[#2563eb]/90 disabled:bg-[#e4e4e4] disabled:text-[#797979]"
            disabled={!canLaunch}
            onClick={onLaunch}
          >
            {isLaunching
              ? "Запуск…"
              : tasks.length > 0
                ? "Запустить спринт"
                : "Продолжить"}
          </Button>
        </div>
      </div>

      <SprintCreationTaskDialog
        open={dialogOpen}
        roomId={roomId}
        roomSlug={roomSlug}
        initialTask={editingTask}
        onClose={() => {
          setDialogOpen(false);
          setEditingTask(null);
        }}
        onSave={handleSaveTask}
      />
    </div>
  );
}
