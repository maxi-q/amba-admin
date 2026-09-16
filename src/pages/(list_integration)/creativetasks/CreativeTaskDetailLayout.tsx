import { useState } from "react";
import { Link, Outlet, useParams } from "react-router-dom";
import { ChevronLeft, CirclePause, CirclePlay, Pencil } from "lucide-react";
import { toast } from "sonner";
import { useCreativeTask } from "@/hooks/creativetasks/useCreativeTask";
import { useFreezeCreativeTask } from "@/hooks/creativetasks/useFreezeCreativeTask";
import { useUnfreezeCreativeTask } from "@/hooks/creativetasks/useUnfreezeCreativeTask";
import { CreativeTasksErrorState } from "./components/CreativeTasksErrorState";
import { CreativeTaskDetailHeader } from "./components/CreativeTaskDetailHeader";
import { EditCreativeTaskDialog } from "./components/EditCreativeTaskDialog";
import { StopCreativeTaskDialog } from "./components/StopCreativeTaskDialog";
import { formatTaskFormat } from "./utils/creativetaskUtils";
import { Badge, Button, PageLoader } from "@senler/ui";
import xpStarUrl from "@/pages/(list_integration)/sprints/slug/assets/xp-star.svg";

function getReviewLabel(materials: boolean, publication: boolean) {
  if (materials && publication) return "До/после публикации";
  if (materials) return "До публикации";
  if (publication) return "После публикации";
  return "Без проверки";
}

function getPlatformLabel(platform: string) {
  switch (platform) {
    case "YOUTUBE_CHANNEL":
      return "YouTube";
    case "RUTUBE_CHANNEL":
      return "Rutube";
    case "VK_GROUP":
      return "Сообщество VK";
    case "VK_USER":
      return "Профиль VK";
    default:
      return platform;
  }
}

export default function CreativeTaskDetailLayout() {
  const { slug, taskId } = useParams<{ slug: string; taskId: string }>();
  const { task, isLoading, isError, error } = useCreativeTask(taskId ?? "");
  const [editOpen, setEditOpen] = useState(false);
  const [stopOpen, setStopOpen] = useState(false);
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

  if (isLoading) {
    return (
      <div className="flex min-h-dvh w-full items-center justify-center px-2 py-6">
        <PageLoader label="Загрузка…" />
      </div>
    );
  }

  if (isError || !task) {
    return (
      <CreativeTasksErrorState
        errorMessage={(error as Error)?.message ?? "Задача не найдена"}
      />
    );
  }

  const taskListPath = `/rooms/${slug ?? ""}/creativetasks`;
  const backPath = task.sprintId
    ? `/rooms/${slug ?? ""}/sprints/${task.sprintId}`
    : taskListPath;
  const backLabel = task.sprintId ? "Вернуться к спринту" : "Вернуться к списку заданий";
  const formatLabel = task.allowedFormats?.length
    ? task.allowedFormats.map(formatTaskFormat).join(", ")
    : "Любой формат";
  const platformLabel = getPlatformLabel(task.targetPlatform);
  const isChangingFrozenState = isFreezing || isUnfreezing;
  const frozenStateError = task.isFrozen ? unfreezeError : freezeError;

  const handleFrozenStateChange = () => {
    const mutation = task.isFrozen ? unfreezeCreativeTask : freezeCreativeTask;
    mutation(
      { id: task.id },
      {
        onSuccess: () => {
          setStopOpen(false);
          toast.success(task.isFrozen ? "Задание возобновлено" : "Задание остановлено");
        },
      },
    );
  };

  return (
    <>
      <div className="-m-4 flex min-h-dvh w-[calc(100%+2rem)] overflow-hidden bg-white">
        <main className="flex min-w-0 flex-1 flex-col overflow-y-auto">
          <div className="px-4 pt-4">
            <div className="flex h-8 min-w-0 items-center gap-3">
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="size-7 shrink-0 border-[#e4e4e4] shadow-none"
                asChild
              >
                <Link to={backPath} aria-label={backLabel} title={backLabel}>
                  <ChevronLeft className="size-4" strokeWidth={1.5} aria-hidden />
                </Link>
              </Button>

              <h1
                className={`min-w-0 flex-1 truncate text-[20px] font-medium leading-8 tracking-[-0.34px] ${
                  task.isDeleted ? "text-[#797979] line-through" : "text-black"
                }`}
              >
                {task.title}
              </h1>

              {task.isFrozen ? (
                <Badge variant="outline" className="shrink-0">
                  Остановлено
                </Badge>
              ) : null}

              <div className="flex shrink-0 items-center gap-1.5">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="size-7 border-[#e4e4e4] shadow-none"
                  onClick={() => setEditOpen(true)}
                  aria-label="Редактировать задание"
                  title="Редактировать задание"
                >
                  <Pencil className="size-4" strokeWidth={1.5} aria-hidden />
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="size-7 border-[#e4e4e4] shadow-none"
                  onClick={() => setStopOpen(true)}
                  disabled={task.isDeleted || isChangingFrozenState}
                  aria-label={task.isFrozen ? "Возобновить задание" : "Остановить задание"}
                  title={task.isFrozen ? "Возобновить задание" : "Остановить задание"}
                >
                  {task.isFrozen ? (
                    <CirclePlay className="size-4" strokeWidth={1.5} aria-hidden />
                  ) : (
                    <CirclePause className="size-4" strokeWidth={1.5} aria-hidden />
                  )}
                </Button>
              </div>
            </div>
          </div>

          <CreativeTaskDetailHeader />
          <Outlet context={{ task }} />
        </main>

        <aside className="hidden w-[260px] shrink-0 overflow-y-auto border-l border-[#e4e4e4] bg-white lg:!block">
          <div className="flex h-[68px] flex-col gap-1 border-b border-[#e4e4e4] p-4 text-[13px] font-medium leading-4 tracking-[-0.0325px]">
            <p className="text-black">Вид задания</p>
            <p className="truncate text-[#797979]">{formatLabel}</p>
          </div>
          <div className="flex h-[68px] flex-col gap-1 border-b border-[#e4e4e4] p-4 text-[13px] font-medium leading-4 tracking-[-0.0325px]">
            <p className="text-black">Платформа</p>
            <div className="flex items-center gap-1.5 text-black">
              {task.targetPlatform === "YOUTUBE_CHANNEL" ? (
                <span
                  className="flex h-3 w-[18px] items-center justify-center rounded-[3px] bg-[#ff0000] text-[8px] leading-none text-white"
                  aria-hidden
                >
                  ▶
                </span>
              ) : null}
              <span>{platformLabel}</span>
            </div>
          </div>
          <div className="flex h-[68px] flex-col gap-1 border-b border-[#e4e4e4] p-4 text-[13px] font-medium leading-4 tracking-[-0.0325px]">
            <p className="text-black">Проверка задания</p>
            <p className="text-[#797979]">
              {getReviewLabel(task.requireMaterialsReview, task.requirePublicationReview)}
            </p>
          </div>
          <div className="flex h-[68px] flex-col gap-1 border-b border-[#e4e4e4] p-4 text-[13px] font-medium leading-4 tracking-[-0.0325px]">
            <p className="text-black">Очки</p>
            <div className="flex items-center gap-1 text-black">
              <img src={xpStarUrl} alt="" className="size-[14px]" />
              <span>от {task.minimalRewardInBalls.toLocaleString("ru-RU")} XP</span>
            </div>
          </div>
        </aside>
      </div>

      <EditCreativeTaskDialog
        open={editOpen}
        onClose={() => setEditOpen(false)}
        task={task}
      />
      <StopCreativeTaskDialog
        open={stopOpen}
        onOpenChange={setStopOpen}
        isFrozen={task.isFrozen}
        isPending={isChangingFrozenState}
        errorMessage={frozenStateError}
        onConfirm={handleFrozenStateChange}
      />
    </>
  );
}
