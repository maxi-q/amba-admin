import { useState } from "react";
import { Link, Navigate, useParams, useSearchParams } from "react-router-dom";
import { Alert, AlertDescription, Button, Input, PageLoader } from "@senler/ui";
import { useEvents } from "@/hooks/events/useEvents";
import { useEventTasks } from "@/hooks/events/useEventTasks";
import { useEventPromoRewardRules } from "@/hooks/events/useEventPromoRewards";
import { usePromoPointsRules } from "@/hooks/promoCodes/usePromoPoints";
import { useCompetitionRules } from "@/hooks/competitions/useCompetitionQueries";
import { CompetitionLifecycle } from "@/components/competitions/CompetitionLifecycle";
import { ManualAwardPicker } from "@/components/competitions/ManualAwardPicker";
import { OpenEventResultsTab } from "./components/OpenEventResultsTab";
import { OpenEventTaskRow } from "./components/OpenEventTaskRow";
import { OpenEventSidebar } from "./components/OpenEventSidebar";
import { OpenEventPromoTab } from "./components/OpenEventPromoTab";
import pencil from "@/assets/task-flow/pencil.svg";
import plus from "@/assets/task-flow/plus.svg";

type OpenEventTab = "tasks" | "promo" | "results";

export default function OpenEventPage() {
  const { slug = "", eventId = "" } = useParams();
  const [urlParams] = useSearchParams();
  const events = useEvents({ page: 1, size: 100 }, slug, { allPages: true });
  const event = events.events.find((item) => item.id === eventId);
  const tasks = useEventTasks(eventId);
  const scope = { kind: "event" as const, id: eventId, roomId: slug };
  const rules = useCompetitionRules(scope);
  const contestPromoRules = usePromoPointsRules(scope, event?.type === "contest");
  const everyonePromoRules = useEventPromoRewardRules(eventId, event?.type === "everyone");
  const [tabState, setTabState] = useState<{
    eventId: string;
    value: OpenEventTab;
  } | null>(null);
  const [searchState, setSearchState] = useState({ eventId: "", value: "" });

  if (events.isLoading) {
    return <div className="flex min-h-[50vh] items-center justify-center"><PageLoader label="Загрузка события…" /></div>;
  }
  if (events.isError) {
    return <Alert variant="destructive"><AlertDescription>Не удалось загрузить событие.<Button variant="outline" className="ml-2" onClick={() => void events.refetch()}>Повторить</Button></AlertDescription></Alert>;
  }
  if (!event) return <p className="p-4 text-[13px] text-[#797979]">Событие не найдено</p>;
  if (event.isDraft) return <Navigate to={`/rooms/${slug}/events/${eventId}/edit`} replace />;

  const hasPromo = event.type === "contest"
    ? contestPromoRules.data?.some((rule) => rule.isActive) ?? false
    : everyonePromoRules.data?.some((rule) => rule.isActive) ?? false;
  const requestedTab = urlParams.get("tab");
  const defaultTab: OpenEventTab =
    requestedTab === "promo" && hasPromo
      ? "promo"
      : requestedTab === "tasks"
        ? "tasks"
      : requestedTab === "results" || event.status === "awarding" || event.status === "completed"
        ? "results"
        : event.type === "everyone"
          ? "results"
          : "tasks";
  const tab = tabState?.eventId === event.id ? tabState.value : defaultTab;
  const search = searchState.eventId === event.id ? searchState.value : "";
  const tabs: Array<{ value: OpenEventTab; label: string }> = event.type === "contest"
    ? [
        { value: "tasks", label: "Задания" },
        ...(hasPromo ? [{ value: "promo" as const, label: "Промокод" }] : []),
        { value: "results", label: "Рейтинг" },
      ]
    : [
        { value: "results", label: "Участники" },
        ...(hasPromo ? [{ value: "promo" as const, label: "Промокод" }] : []),
        { value: "tasks", label: "Задания" },
      ];

  return (
    <div className="-m-4 grid min-h-dvh w-[calc(100%+2rem)] min-w-0 flex-1 grid-cols-1 bg-white text-[13px] font-medium lg:grid-cols-[minmax(0,1fr)_260px]">
      <article className="flex min-w-0 flex-col">
        <header className="flex items-center justify-between gap-3 px-4 pb-3 pt-4">
          <h1 className="min-w-0 truncate text-[20px] font-medium leading-8 tracking-[-0.34px]">
            {event.name}
          </h1>
          <div className="flex shrink-0 items-center gap-1">
            {event.status !== "completed" && rules.data?.some((rule) => rule.type === "manual") ? (
              <ManualAwardPicker scope={scope} />
            ) : null}
            {event.status === "active" ? (
              <>
                <Button asChild size="icon" variant="outline" className="size-7 border-[#e4e4e4] shadow-none">
                  <Link to={`/rooms/${slug}/events/${eventId}/edit`} aria-label="Редактировать событие"><img src={pencil} alt="" /></Link>
                </Button>
                <Button asChild size="icon" variant="outline" className="size-7 border-[#e4e4e4] shadow-none">
                  <Link to={`/rooms/${slug}/events/${eventId}/edit?step=3`} aria-label="Добавить задание"><img src={plus} alt="" /></Link>
                </Button>
              </>
            ) : null}
          </div>
        </header>

        <CompetitionLifecycle
          scope={scope}
          status={event.status}
          onReview={() => setTabState({ eventId: event.id, value: "tasks" })}
        />

        <div className="flex h-12 items-center gap-2 border-y border-[#e4e4e4] px-4 py-2.5">
          <div className="inline-flex h-7 shrink-0 items-center gap-0.5 rounded-md bg-[#f0f0f0] p-0.5">
            {tabs.map((item) => (
              <button
                key={item.value}
                type="button"
                className={`rounded px-1.5 py-1 text-[13px] leading-4 tracking-[-0.25px] outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${tab === item.value ? "bg-white" : ""}`}
                onClick={() => setTabState({ eventId: event.id, value: item.value })}
                aria-pressed={tab === item.value}
              >
                {item.label}
              </button>
            ))}
          </div>
          {tab === "results" || tab === "promo" ? (
            <Input
              className="h-7 flex-1 rounded-md border-0 bg-[#f0f0f0] px-2 py-1.5 text-[13px] shadow-none focus-visible:border-transparent"
              aria-label={tab === "promo" ? "Поиск по активациям" : event.type === "contest" ? "Поиск по рейтингу" : "Поиск по участникам"}
              placeholder="Поиск..."
              type="search"
              value={search}
              onChange={(inputEvent) => setSearchState({ eventId: event.id, value: inputEvent.target.value })}
            />
          ) : null}
        </div>

        {tab === "results" ? (
          <OpenEventResultsTab event={event} roomSlug={slug} search={search} />
        ) : tab === "promo" ? (
          <OpenEventPromoTab event={event} scope={scope} search={search} />
        ) : tasks.isError ? (
          <Alert variant="destructive" className="m-4 w-auto"><AlertDescription>Не удалось загрузить задания события.<Button variant="outline" className="ml-2" onClick={() => void tasks.refetch()}>Повторить</Button></AlertDescription></Alert>
        ) : tasks.isLoading ? (
          <div className="flex justify-center py-10"><PageLoader label="Загрузка заданий…" /></div>
        ) : tasks.tasks.filter((task) => !task.isDeleted).length === 0 ? (
          <p className="p-4 text-[#797979]">Заданий пока нет</p>
        ) : (
          <div className="flex flex-col">
            {tasks.tasks.filter((task) => !task.isDeleted).map((task) => (
              <OpenEventTaskRow key={task.id} eventId={event.id} roomSlug={slug} task={task} />
            ))}
          </div>
        )}
      </article>

      {rules.isError ? (
        <aside className="border-l border-[#e4e4e4] p-4"><Alert variant="destructive"><AlertDescription>Не удалось загрузить награды.<Button variant="outline" className="mt-2" onClick={() => void rules.refetch()}>Повторить</Button></AlertDescription></Alert></aside>
      ) : rules.isLoading || tasks.isLoading || contestPromoRules.isLoading || everyonePromoRules.isLoading ? (
        <aside className="flex w-full items-center justify-center border-l border-[#e4e4e4] py-10 lg:w-[260px]"><PageLoader label="Загрузка…" /></aside>
      ) : (
        <OpenEventSidebar event={event} rules={rules.data ?? []} tasks={tasks.tasks} />
      )}
    </div>
  );
}
