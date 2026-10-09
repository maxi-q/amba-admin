import { useState } from "react";
import { Navigate, useNavigate, useParams, useSearchParams } from "react-router-dom";
import pencil from "@/assets/task-flow/pencil.svg";
import plus from "@/assets/task-flow/plus-muted.svg";
import { Alert, AlertDescription, Button, Input, PageLoader } from "@senler/ui";
import { CompetitionLifecycle } from "@/components/competitions/CompetitionLifecycle";
import { PromoPointsPanel } from "@/components/competitions/PromoPointsPanel";
import { ManualAwardPicker } from "@/components/competitions/ManualAwardPicker";
import { useSprints } from "@/hooks/sprints/useSprints";
import { useGetRoomById } from "@/hooks/rooms/useGetRoomById";
import { useRoomCreativeTasks } from "@/hooks/creativetasks/useRoomCreativeTasks";
import { useSprintRewardRules } from "@/hooks/sprints/useSprintRewardRules";
import { SprintNotFoundState } from "./components/SprintNotFoundState";
import { OpenSprintQuestRow } from "./components/OpenSprintQuestRow";
import { OpenSprintSidebar } from "./components/OpenSprintSidebar";
import { OpenSprintLeaderboardTab } from "./components/OpenSprintLeaderboardTab";
import SprintSetting from "./index";

type OpenSprintTab = "quests" | "leaderboard" | "promo";

export default function OpenSprintPage() {
  const { sprintId = "", slug = "" } = useParams();
  const navigate = useNavigate();
  const [urlParams] = useSearchParams();
  const [tabState, setTabState] = useState<{
    sprintId: string;
    value: OpenSprintTab;
  } | null>(null);
  const [searchState, setSearchState] = useState({ sprintId: "", value: "" });

  const isCreatePath = sprintId === "new";
  const effectiveSprintId = isCreatePath ? "" : sprintId;

  const { room, isLoading: isLoadingRoom, isError: isRoomError, refetch: refetchRoom } = useGetRoomById(slug);
  const roomId = room?.id ?? "";

  const { sprints, isLoading: isLoadingSprints, isError: isSprintsError, refetch: refetchSprints } = useSprints(
    { page: 1, size: 100 },
    slug,
    { allPages: true }
  );
  const sprint =
    sprints.find((item) => item.id === effectiveSprintId) ?? null;

  const { rules, isLoading: isLoadingRules, isError: isRulesError, refetch: refetchRules } =
    useSprintRewardRules(effectiveSprintId);
  const { tasks, isLoading: isLoadingTasks, isError: isTasksError, refetch: refetchTasks } = useRoomCreativeTasks(roomId, {
    sprintId: effectiveSprintId || undefined,
    page: 1,
    size: 100,
  }, { allPages: true });

  if (isCreatePath) {
    return <SprintSetting />;
  }

  if (!sprintId) {
    return <Navigate to={`/rooms/${slug}/sprints`} replace />;
  }

  if (isSprintsError || isRoomError) {
    return <Alert variant="destructive"><AlertDescription>Не удалось загрузить спринт. Проверьте подключение и обновите страницу.<Button variant="outline" className="ml-2" onClick={() => { void refetchSprints(); void refetchRoom(); }}>Повторить</Button></AlertDescription></Alert>;
  }

  if (isLoadingSprints || isLoadingRoom) {
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
  const canEditSprint = sprint.status === "active";
  const unavailableActionReason =
    sprint.status === "reviewing"
      ? "во время проверки"
      : sprint.status === "awarding"
        ? "во время выдачи наград"
        : "после завершения спринта";
  const defaultTab: OpenSprintTab =
    urlParams.get("tab") === "leaderboard" || isAwarding || sprint.status === "completed" ? "leaderboard" : "quests";
  const tab =
    tabState?.sprintId === sprint.id ? tabState.value : defaultTab;
  const search =
    searchState.sprintId === sprint.id ? searchState.value : "";
  const normalizedSearch = search.trim().toLocaleLowerCase("ru-RU");

  return (
    <div className="-m-4 grid min-h-dvh w-[calc(100%+2rem)] min-w-0 flex-1 grid-cols-1 bg-white lg:grid-cols-[minmax(0,1fr)_260px]">
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-center justify-between gap-3 px-4 pb-3 pt-4">
          <h1 className="min-w-0 truncate text-[20px] font-medium leading-8 tracking-[-0.34px] text-foreground">
            {sprint.name}
          </h1>
          <div className="flex shrink-0 items-center gap-1">
            {sprint.status !== 'completed' && <ManualAwardPicker scope={{ kind: 'sprint', id: sprint.id, roomId }} />}
            <Button
              type="button"
              variant="outline"
              size="icon"
              disabled={!canEditSprint}
              className="size-7 border-[#e4e4e4] shadow-none disabled:opacity-100"
              aria-label={canEditSprint ? "Редактировать спринт" : `Редактирование недоступно ${unavailableActionReason}`}
              title={canEditSprint ? "Редактировать спринт" : `Редактирование недоступно ${unavailableActionReason}`}
              onClick={() =>
                navigate(`/rooms/${slug}/sprints/${sprint.id}/edit`)
              }
            >
              <img src={pencil} alt="" />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="icon"
              disabled={!canEditSprint}
              className="size-7 border-[#e4e4e4] shadow-none disabled:opacity-100"
              aria-label={canEditSprint ? "Добавить задание" : `Добавление заданий недоступно ${unavailableActionReason}`}
              title={canEditSprint ? "Добавить задание" : `Добавление заданий недоступно ${unavailableActionReason}`}
              onClick={() =>
                navigate(
                  `/rooms/${slug}/sprints/${sprint.id}/edit?step=tasks`
                )
              }
            >
              <img src={plus} alt="" />
            </Button>
          </div>
        </div>

        <CompetitionLifecycle scope={{ kind: 'sprint', id: sprint.id, roomId }} status={sprint.status} onReview={() => setTabState({ sprintId: sprint.id, value: 'quests' })} />

        <div
          className={`flex h-12 items-center gap-2 border-y border-[#e4e4e4] px-4 py-2.5 ${
            isAwarding ? "" : "mt-1"
          }`}
        >
          <div className="inline-flex h-7 shrink-0 items-center gap-0.5 rounded-md bg-[#f0f0f0] p-0.5">
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
            <Button variant="ghost" className={`h-6 px-1.5 text-[13px] ${tab === 'promo' ? 'bg-white' : ''}`} onClick={() => setTabState({ sprintId: sprint.id, value: 'promo' })}>Промокод</Button>
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

        {tab === "promo" ? <div className="p-4"><PromoPointsPanel scope={{ kind: 'sprint', id: sprint.id, roomId }} editable={sprint.status === 'active'} /></div> : tab === "quests" ? (
          isTasksError ? <Alert variant="destructive" className="m-4 w-auto"><AlertDescription>Не удалось загрузить задания.<Button variant="outline" className="ml-2" onClick={() => void refetchTasks()}>Повторить</Button></AlertDescription></Alert> : isLoadingTasks ? (
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
                    targetPlatform={task.targetPlatform}
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

      {isRulesError ? <aside className="border-l border-[#e4e4e4] p-4"><Alert variant="destructive"><AlertDescription>Не удалось загрузить награды.<Button variant="outline" onClick={() => void refetchRules()}>Повторить</Button></AlertDescription></Alert></aside> : isLoadingRules ? (
        <aside className="flex w-full shrink-0 items-center justify-center border-l border-[#e4e4e4] py-10 lg:w-[260px]">
          <PageLoader label="Загрузка…" />
        </aside>
      ) : (
        <OpenSprintSidebar sprint={sprint} rules={rules} platforms={tasks.filter((task) => task.sprintId === sprint.id && !task.isDeleted).map((task) => task.targetPlatform)} platformsLoading={isLoadingTasks} platformsError={isTasksError} />
      )}
    </div>
  );
}
