import { useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { Pencil } from "lucide-react";
import { Button, PageLoader } from "@senler/ui";
import { useSprints } from "@/hooks/sprints/useSprints";
import { useGetRoomById } from "@/hooks/rooms/useGetRoomById";
import { useRoomCreativeTasks } from "@/hooks/creativetasks/useRoomCreativeTasks";
import { useSprintRewardRules } from "@/hooks/sprints/useSprintRewardRules";
import { SprintNotFoundState } from "./components/SprintNotFoundState";
import { OpenSprintQuestRow } from "./components/OpenSprintQuestRow";
import { OpenSprintSidebar } from "./components/OpenSprintSidebar";
import { OpenSprintLeaderboardTab } from "./components/OpenSprintLeaderboardTab";
import SprintSetting from "./index";

type OpenSprintTab = "quests" | "leaderboard";

export default function OpenSprintPage() {
  const { sprintId = "", slug = "" } = useParams();
  const navigate = useNavigate();
  const [tab, setTab] = useState<OpenSprintTab>("quests");

  const isCreatePath = sprintId === "new";
  const effectiveSprintId = isCreatePath ? "" : sprintId;

  const { room } = useGetRoomById(slug);
  const roomId = room?.id ?? "";

  const { sprints, isLoading: isLoadingSprints } = useSprints(
    { page: 1, size: 100 },
    slug
  );
  const sprint =
    sprints.find((item) => item.id === effectiveSprintId) ?? null;

  const { rules, isLoading: isLoadingRules } =
    useSprintRewardRules(effectiveSprintId);
  const { tasks, isLoading: isLoadingTasks } = useRoomCreativeTasks(roomId, {
    page: 1,
    size: 100,
  });

  if (isCreatePath) {
    return <SprintSetting />;
  }

  if (!sprintId) {
    return <Navigate to={`/rooms/${slug}/sprints`} replace />;
  }

  if (isLoadingSprints) {
    return (
      <div className="flex min-h-[50vh] w-full items-center justify-center">
        <PageLoader label="Загрузка…" />
      </div>
    );
  }

  if (!sprint) {
    return <SprintNotFoundState />;
  }

  return (
    <div className="-m-4 grid min-h-dvh w-[calc(100%+2rem)] min-w-0 flex-1 grid-cols-1 bg-white md:-m-6 md:w-[calc(100%+3rem)] lg:grid-cols-[minmax(0,680px)_260px]">
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-center justify-between gap-3 px-4 pb-3 pt-4">
          <h1 className="min-w-0 truncate text-[20px] font-medium leading-8 tracking-[-0.34px] text-foreground">
            {sprint.name}
          </h1>
          <div className="flex shrink-0 items-center gap-1.5">
            {sprint.status === "active" ? (
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="size-7 border-[#e4e4e4] shadow-none"
                aria-label="Редактировать спринт"
                onClick={() =>
                  navigate(`/rooms/${slug}/sprints/${sprint.id}/edit`)
                }
              >
                <Pencil className="size-4" aria-hidden />
              </Button>
            ) : null}
          </div>
        </div>

        <div className="px-4">
          <div className="inline-flex items-center gap-0.5 rounded-md bg-[#f0f0f0] p-0.5">
            <button
              type="button"
              className={`rounded px-1.5 py-1 text-[13px] font-medium leading-4 tracking-[-0.25px] outline-none focus:ring-0 ${
                tab === "quests" ? "bg-white text-foreground" : "text-foreground"
              }`}
              onClick={() => setTab("quests")}
              aria-pressed={tab === "quests"}
            >
              Задания
            </button>
            <button
              type="button"
              className={`rounded px-1.5 py-1 text-[13px] font-medium leading-4 tracking-[-0.25px] outline-none focus:ring-0 ${
                tab === "leaderboard"
                  ? "bg-white text-foreground"
                  : "text-foreground"
              }`}
              onClick={() => setTab("leaderboard")}
              aria-pressed={tab === "leaderboard"}
            >
              Таблица лидеров
            </button>
          </div>
        </div>

        {tab === "quests" ? (
          isLoadingTasks ? (
            <div className="flex justify-center py-10">
              <PageLoader label="Загрузка…" />
            </div>
          ) : (() => {
            const sprintTasks = tasks.filter(
              (task) => task.sprintId === sprint.id && !task.isDeleted
            );
            if (sprintTasks.length === 0) {
              return (
                <p className="px-4 py-6 text-[13px] font-medium text-[#797979]">
                  Заданий пока нет
                </p>
              );
            }
            return (
              <div className="flex flex-col">
                {sprintTasks.map((task) => (
                  <OpenSprintQuestRow
                    key={task.id}
                    taskId={task.id}
                    title={task.title}
                    roomSlug={slug}
                  />
                ))}
              </div>
            );
          })()
        ) : (
          <OpenSprintLeaderboardTab roomId={roomId} sprintId={sprint.id} />
        )}
      </div>

      {isLoadingRules ? (
        <aside className="flex w-full shrink-0 items-center justify-center border-l border-[#e4e4e4] py-10 lg:w-[260px]">
          <PageLoader label="Загрузка…" />
        </aside>
      ) : (
        <OpenSprintSidebar sprint={sprint} rules={rules} />
      )}
    </div>
  );
}
