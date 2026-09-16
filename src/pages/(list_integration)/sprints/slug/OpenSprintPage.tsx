import { useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { Pencil, Plus } from "lucide-react";
import { Button, CheckBox, Input, PageLoader } from "@senler/ui";
import { toast } from "sonner";
import { useSprints } from "@/hooks/sprints/useSprints";
import { useGetRoomById } from "@/hooks/rooms/useGetRoomById";
import { useRoomCreativeTasks } from "@/hooks/creativetasks/useRoomCreativeTasks";
import { useSprintRewardRules } from "@/hooks/sprints/useSprintRewardRules";
import { usePatchSprint } from "@/hooks/sprints/usePatchSprint";
import { SprintNotFoundState } from "./components/SprintNotFoundState";
import { OpenSprintQuestRow } from "./components/OpenSprintQuestRow";
import { OpenSprintSidebar } from "./components/OpenSprintSidebar";
import { OpenSprintLeaderboardTab } from "./components/OpenSprintLeaderboardTab";
import SprintSetting from "./index";

type OpenSprintTab = "quests" | "leaderboard";

export default function OpenSprintPage() {
  const { sprintId = "", slug = "" } = useParams();
  const navigate = useNavigate();
  const [tabState, setTabState] = useState<{
    sprintId: string;
    value: OpenSprintTab;
  } | null>(null);
  const [searchState, setSearchState] = useState({ sprintId: "", value: "" });
  const [confirmedSprintId, setConfirmedSprintId] = useState<string | null>(null);
  const { patchSprint, isPending: isCompleting } = usePatchSprint();

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

  if (sprint.isDraft) {
    return (
      <Navigate
        to={`/rooms/${slug}/sprints/${sprint.id}/edit`}
        replace
      />
    );
  }

  const isAwarding = sprint.status === "awarding";
  const defaultTab: OpenSprintTab =
    sprint.status === "active" ? "quests" : "leaderboard";
  const tab =
    tabState?.sprintId === sprint.id ? tabState.value : defaultTab;
  const search =
    searchState.sprintId === sprint.id ? searchState.value : "";
  const normalizedSearch = search.trim().toLocaleLowerCase("ru-RU");
  const awardsSent = confirmedSprintId === sprint.id;

  const completeSprint = () => {
    patchSprint(
      {
        sprintId: sprint.id,
        data: { status: "completed" },
      },
      {
        onSuccess: () => toast.success("Спринт завершён"),
        onError: (error) =>
          toast.error(
            error instanceof Error
              ? error.message
              : "Не удалось завершить спринт"
          ),
      }
    );
  };

  return (
    <div className="-m-4 grid min-h-dvh w-[calc(100%+2rem)] min-w-0 flex-1 grid-cols-1 bg-white md:-m-6 md:w-[calc(100%+3rem)] lg:grid-cols-[minmax(0,680px)_260px]">
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-center justify-between gap-3 px-4 pb-3 pt-4">
          <h1 className="min-w-0 truncate text-[20px] font-medium leading-8 tracking-[-0.34px] text-foreground">
            {sprint.name}
          </h1>
          <div className="flex shrink-0 items-center gap-1">
            {isAwarding ? (
              <>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  disabled
                  className="size-7 border-[#e4e4e4] shadow-none disabled:opacity-100"
                  aria-label="Редактирование недоступно во время выдачи наград"
                  title="Редактирование недоступно во время выдачи наград"
                >
                  <Pencil
                    className="size-4 text-[#707070]"
                    strokeWidth={1.5}
                    aria-hidden
                  />
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  disabled
                  className="size-7 border-[#e4e4e4] shadow-none disabled:opacity-100"
                  aria-label="Добавление заданий недоступно во время выдачи наград"
                  title="Добавление заданий недоступно во время выдачи наград"
                >
                  <Plus
                    className="size-4 text-[#9a9a9a]"
                    strokeWidth={1.5}
                    aria-hidden
                  />
                </Button>
              </>
            ) : sprint.status === "active" ? (
              <>
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
                  <Pencil
                    className="size-4 text-[#707070]"
                    strokeWidth={1.5}
                    aria-hidden
                  />
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="size-7 border-[#e4e4e4] shadow-none"
                  aria-label="Добавить задание"
                  onClick={() =>
                    navigate(
                      `/rooms/${slug}/sprints/${sprint.id}/edit?step=tasks`
                    )
                  }
                >
                  <Plus
                    className="size-4 text-[#9a9a9a]"
                    strokeWidth={1.5}
                    aria-hidden
                  />
                </Button>
              </>
            ) : null}
          </div>
        </div>

        {isAwarding ? (
          <div className="mx-4 mb-4 flex h-[46px] items-center justify-between gap-3 rounded-md border border-[#e4e4e4] px-2">
            <div className="[&_label]:text-[13px] [&_label]:font-medium [&_label]:tracking-[-0.25px]">
              <CheckBox
                checked={awardsSent}
                onCheckedChange={(checked) =>
                  setConfirmedSprintId(checked === true ? sprint.id : null)
                }
                className="data-[state=checked]:border-[#2563eb] data-[state=checked]:bg-[#2563eb] hover:border-[#2563eb]"
                label="Я отправил все награды"
              />
            </div>
            <Button
              type="button"
              loading={isCompleting}
              disabled={!awardsSent || isCompleting}
              onClick={completeSprint}
              className="bg-[#2563eb] text-[13px] hover:bg-[#2563eb]/90"
            >
              Завершить спринт
            </Button>
          </div>
        ) : null}

        <div
          className={`flex h-12 items-center gap-2 border-y border-[#e4e4e4] px-4 py-2.5 ${
            isAwarding ? "" : "mt-1"
          }`}
        >
          <div className="inline-flex h-7 w-[137px] shrink-0 items-center gap-0.5 rounded-md bg-[#f0f0f0] p-0.5">
            <button
              type="button"
              className={`flex-1 rounded px-1.5 py-1 text-[13px] font-medium leading-4 tracking-[-0.25px] outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${
                tab === "quests" ? "bg-white text-foreground" : "text-foreground"
              }`}
              onClick={() =>
                setTabState({ sprintId: sprint.id, value: "quests" })
              }
              aria-pressed={tab === "quests"}
            >
              Задания
            </button>
            <button
              type="button"
              className={`flex-1 rounded px-1.5 py-1 text-[13px] font-medium leading-4 tracking-[-0.25px] outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${
                tab === "leaderboard"
                  ? "bg-white text-foreground"
                  : "text-foreground"
              }`}
              onClick={() =>
                setTabState({ sprintId: sprint.id, value: "leaderboard" })
              }
              aria-pressed={tab === "leaderboard"}
            >
              Рейтинг
            </button>
          </div>
          <Input
            type="search"
            value={search}
            onChange={(event) =>
              setSearchState({ sprintId: sprint.id, value: event.target.value })
            }
            placeholder="Поиск..."
            aria-label={
              tab === "quests" ? "Поиск по заданиям" : "Поиск по рейтингу"
            }
            className="h-7 flex-1 rounded-md border-0 bg-[#f0f0f0] px-2 py-1.5 text-[13px] shadow-none focus-visible:border-transparent"
          />
        </div>

        {tab === "quests" ? (
          isLoadingTasks ? (
            <div className="flex justify-center py-10">
              <PageLoader label="Загрузка…" />
            </div>
          ) : (() => {
            const sprintTasks = tasks.filter(
              (task) =>
                task.sprintId === sprint.id &&
                !task.isDeleted &&
                (!normalizedSearch ||
                  task.title
                    .toLocaleLowerCase("ru-RU")
                    .includes(normalizedSearch))
            );
            if (sprintTasks.length === 0) {
              return (
                <p className="px-4 py-6 text-[13px] font-medium text-[#797979]">
                  {normalizedSearch ? "Ничего не найдено" : "Заданий пока нет"}
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
                    isFrozen={task.isFrozen}
                  />
                ))}
              </div>
            );
          })()
        ) : (
          <OpenSprintLeaderboardTab
            key={sprint.id}
            roomId={roomId}
            sprintId={sprint.id}
            rules={rules}
            search={search}
          />
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
