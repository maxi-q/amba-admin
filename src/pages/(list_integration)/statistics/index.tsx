import { useMemo, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import {
  eachDayOfInterval,
  endOfWeek,
  format,
  startOfWeek,
} from "date-fns";
import { TabsList, TabsRoot, TabsTrigger } from "@senler/ui";

import { StatisticsCharts } from "./components/StatisticsCharts";
import { StatisticsTable } from "./components/StatisticsTable";
import { StatisticsToolbar } from "./components/StatisticsToolbar";

import { useGetRoomAnalytics } from "@/hooks/rooms/useGetRoomAnalytics";
import { useGetRoomPromoCodeUsages } from "@/hooks/rooms/useGetRoomPromoCodeUsages";
import { useRoomApplications } from "@/hooks/ambassador/useRoomApplications";
import { useAmbassadors } from "@/hooks/ambassador/useAmbassadors";
import { useSprints } from "@/hooks/sprints/useSprints";
import { useEvents } from "@/hooks/events/useEvents";
import { useCustomPromoCodes } from "@/hooks/promoCodes/useCustomPromoCodes";
import {
  getPromoCodeFromPayload,
  getPromoCodeUsageTargetName,
} from "./helpers/promoCodeUsagesExport";
import type {
  StatisticsFilterOption,
  StatisticsPeriod,
  StatisticsRow,
  StatisticsTab,
} from "./types";

const tabs: Array<{ id: StatisticsTab; label: string }> = [
  { id: "tasks", label: "Задания" },
  { id: "xp", label: "XP" },
  { id: "promo-codes", label: "Промокоды" },
  { id: "ambassadors", label: "Амбассадоры" },
];

const GREEN = "#00b956";
const RED = "#ff0000";

function formatChartDate(date: Date) {
  const month = new Intl.DateTimeFormat("ru-RU", { month: "short" })
    .format(date)
    .replace(".", "");
  return `${date.getDate()} ${month}`;
}

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error && error.message ? error.message : fallback;
}

export default function StatisticsPage() {
  const { slug = "" } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const promoCodeIdFromUrl = searchParams.get("promoCodeId");
  const currentWeek = useMemo(
    () => ({
      from: startOfWeek(new Date(), { weekStartsOn: 1 }),
      to: endOfWeek(new Date(), { weekStartsOn: 1 }),
    }),
    [],
  );
  const [tab, setTab] = useState<StatisticsTab>(
    promoCodeIdFromUrl ? "promo-codes" : "tasks",
  );
  const [period, setPeriod] = useState<StatisticsPeriod>("week");
  const [startDate, setStartDate] = useState(currentWeek.from);
  const [endDate, setEndDate] = useState(currentWeek.to);
  const [selectedSprintIds, setSelectedSprintIds] = useState<string[]>([]);
  const [selectedEventIds, setSelectedEventIds] = useState<string[]>([]);
  const [selectedAmbassadorStatuses, setSelectedAmbassadorStatuses] = useState<string[]>([]);
  const [selectedPromoCodeIds, setSelectedPromoCodeIds] = useState<string[]>(
    promoCodeIdFromUrl ? [promoCodeIdFromUrl] : [],
  );

  const { sprints, isLoading: isSprintsLoading } = useSprints(
    { page: 1, size: 100 },
    slug,
    { allPages: true },
  );
  const { events, isLoading: isEventsLoading } = useEvents(
    { page: 1, size: 100 },
    slug,
    { allPages: true },
  );
  const { promoCodes } = useCustomPromoCodes(slug);

  const publishedSprints = useMemo(
    () =>
      sprints.flatMap((sprint) =>
        !sprint.isDraft && sprint.name ? [{ ...sprint, name: sprint.name }] : [],
      ),
    [sprints],
  );
  const sprintOptions = useMemo<StatisticsFilterOption[]>(
    () => publishedSprints.map((sprint) => ({ id: sprint.id, label: sprint.name })),
    [publishedSprints],
  );
  const eventOptions = useMemo<StatisticsFilterOption[]>(
    () =>
      events
        .filter((event) => !event.isDraft && !event.isDeleted)
        .map((event) => ({ id: event.id, label: event.name })),
    [events],
  );

  const selectedPromoCodeLabel = useMemo(() => {
    const selectedId = selectedPromoCodeIds[0];
    if (!selectedId) return undefined;
    const selected = promoCodes.find((promoCode) => promoCode.id === selectedId);
    return selected ? `${selected.name} — ${selected.promoCode}` : "Выбранный промокод";
  }, [promoCodes, selectedPromoCodeIds]);

  const dateParams = useMemo(
    () => ({
      dateFrom: format(startDate, "yyyy-MM-dd"),
      dateTo: format(endDate, "yyyy-MM-dd"),
      promoCodeId: selectedPromoCodeIds.length > 0 ? selectedPromoCodeIds : undefined,
    }),
    [endDate, selectedPromoCodeIds, startDate],
  );
  const hasMixedScope = selectedSprintIds.length > 0 && selectedEventIds.length > 0;
  const primaryParams = useMemo(
    () => ({
      ...dateParams,
      sprintId: selectedSprintIds.length > 0 ? selectedSprintIds : undefined,
      eventId: hasMixedScope
        ? undefined
        : selectedEventIds.length > 0
          ? selectedEventIds
          : undefined,
    }),
    [dateParams, hasMixedScope, selectedEventIds, selectedSprintIds],
  );
  const secondaryParams = useMemo(
    () => ({
      ...dateParams,
      eventId: selectedEventIds.length > 0 ? selectedEventIds : undefined,
    }),
    [dateParams, selectedEventIds],
  );
  const promoStatisticsRoomId = tab === "promo-codes" ? slug : "";

  const primaryAnalytics = useGetRoomAnalytics(promoStatisticsRoomId, primaryParams);
  const secondaryAnalytics = useGetRoomAnalytics(
    hasMixedScope ? promoStatisticsRoomId : "",
    secondaryParams,
  );
  const primaryUsages = useGetRoomPromoCodeUsages(promoStatisticsRoomId, {
    ...primaryParams,
    size: 100,
  });
  const secondaryUsages = useGetRoomPromoCodeUsages(
    hasMixedScope ? promoStatisticsRoomId : "",
    { ...secondaryParams, size: 100 },
  );

  const analytics = useMemo(() => {
    const byDate = new Map<string, number>();
    for (const item of [
      ...(primaryAnalytics.analytics?.items ?? []),
      ...(secondaryAnalytics.analytics?.items ?? []),
    ]) {
      byDate.set(item.date, (byDate.get(item.date) ?? 0) + item.count);
    }

    return {
      byDate,
      total:
        (primaryAnalytics.analytics?.total ?? 0) +
        (secondaryAnalytics.analytics?.total ?? 0),
    };
  }, [primaryAnalytics.analytics, secondaryAnalytics.analytics]);

  const promoCodeUsages = useMemo(() => {
    const unique = new Map(
      [...primaryUsages.items, ...secondaryUsages.items].map((usage) => [usage.id, usage]),
    );
    return [...unique.values()].sort(
      (left, right) =>
        new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime(),
    );
  }, [primaryUsages.items, secondaryUsages.items]);

  const ambassadorIds = useMemo(
    () => [
      ...new Set(
        promoCodeUsages.flatMap((usage) =>
          usage.ambassadorId ? [usage.ambassadorId] : [],
        ),
      ),
    ],
    [promoCodeUsages],
  );
  const applicationsQuery = useRoomApplications(
    { roomIds: slug ? [slug] : undefined, page: 1, size: 100 },
    { enabled: tab === "promo-codes" && Boolean(slug) },
  );
  const ambassadorsQuery = useAmbassadors(
    { ambassadorIds, page: 1, size: 100 },
    { allPages: true, enabled: tab === "promo-codes" && ambassadorIds.length > 0 },
  );

  const ambassadorNames = useMemo(
    () =>
      new Map(
        applicationsQuery.applications.map((application) => [
          application.ambassadorId,
          application.name,
        ]),
      ),
    [applicationsQuery.applications],
  );
  const ambassadorProfiles = useMemo(
    () => new Map(ambassadorsQuery.ambassadors.map((ambassador) => [ambassador.id, ambassador])),
    [ambassadorsQuery.ambassadors],
  );

  const chartDates = useMemo(
    () => eachDayOfInterval({ start: startDate, end: endDate }),
    [endDate, startDate],
  );
  const chartLabels = useMemo(() => chartDates.map(formatChartDate), [chartDates]);
  const promoChartValues = useMemo(
    () =>
      chartDates.map((date) => analytics.byDate.get(format(date, "yyyy-MM-dd")) ?? 0),
    [analytics.byDate, chartDates],
  );

  const promoRows = useMemo<StatisticsRow[]>(() => {
    return promoCodeUsages.map((usage) => {
      const profile = usage.ambassadorId
        ? ambassadorProfiles.get(usage.ambassadorId)
        : undefined;
      const event = usage.eventId
        ? events.find((item) => item.id === usage.eventId)
        : undefined;
      const sprint = usage.sprintId
        ? publishedSprints.find((item) => item.id === usage.sprintId)
        : undefined;
      const customPromoCode = usage.promoCodeId
        ? promoCodes.find((item) => item.id === usage.promoCodeId)
        : undefined;
      const sourceName = getPromoCodeUsageTargetName(
        usage,
        publishedSprints,
        events,
        promoCodes,
      );
      const sourceType = sprint
        ? "Спринт"
        : event
          ? `Событие/${event.type === "contest" ? "Конкурс" : "Равная награда"}`
          : customPromoCode
            ? "Промокод"
            : "";
      const date = usage.createdAt ? new Date(usage.createdAt) : null;

      return {
        id: usage.id,
        ambassadorName:
          (usage.ambassadorId ? ambassadorNames.get(usage.ambassadorId) : undefined) ??
          profile?.username ??
          usage.uniqueId ??
          "Амбассадор",
        avatarUrl: profile?.avatarUrl,
        sourceName,
        sourceType,
        promoCode:
          getPromoCodeFromPayload(usage.payload) || customPromoCode?.promoCode || "Промокод",
        date:
          date && !Number.isNaN(date.getTime())
            ? format(date, "dd.MM.yyyy HH:mm")
            : "—",
      };
    });
  }, [ambassadorNames, ambassadorProfiles, events, promoCodeUsages, promoCodes, publishedSprints]);

  const clearPromoCodeFilter = () => {
    setSelectedPromoCodeIds([]);
    const nextParams = new URLSearchParams(searchParams);
    nextParams.delete("promoCodeId");
    setSearchParams(nextParams, { replace: true });
  };

  const handleScopeFilterChange = (
    setter: (ids: string[]) => void,
    ids: string[],
  ) => {
    setter(ids);
    if (ids.length > 0 && selectedPromoCodeIds.length > 0) clearPromoCodeFilter();
  };

  const clearAllFilters = () => {
    if (tab === "ambassadors") {
      setSelectedAmbassadorStatuses([]);
      return;
    }
    setSelectedSprintIds([]);
    setSelectedEventIds([]);
    if (selectedPromoCodeIds.length > 0) clearPromoCodeFilter();
  };

  const isPromoAnalyticsLoading =
    primaryAnalytics.isLoading || (hasMixedScope && secondaryAnalytics.isLoading);
  const isPromoUsagesLoading =
    primaryUsages.isLoading ||
    (hasMixedScope && secondaryUsages.isLoading) ||
    applicationsQuery.isLoading ||
    ambassadorsQuery.isLoading;
  const promoAnalyticsError = primaryAnalytics.isError
    ? getErrorMessage(primaryAnalytics.error, "Не удалось загрузить график промокодов")
    : secondaryAnalytics.isError
      ? getErrorMessage(secondaryAnalytics.error, "Не удалось загрузить график промокодов")
      : undefined;
  const promoUsagesError = primaryUsages.isError
    ? getErrorMessage(primaryUsages.error, "Не удалось загрузить активации промокодов")
    : secondaryUsages.isError
      ? getErrorMessage(secondaryUsages.error, "Не удалось загрузить активации промокодов")
      : applicationsQuery.isError
        ? getErrorMessage(applicationsQuery.error, "Не удалось загрузить имена амбассадоров")
        : ambassadorsQuery.isError
          ? getErrorMessage(ambassadorsQuery.error, "Не удалось загрузить профили амбассадоров")
          : undefined;

  const zeroValues = useMemo(() => chartDates.map(() => 0), [chartDates]);
  const activeChart =
    tab === "promo-codes"
      ? {
          series: [{ id: "activated", label: "Активировано", color: GREEN, values: promoChartValues, fill: true }],
          legend: [{ label: "Активировано", value: analytics.total, color: GREEN }],
          isLoading: isPromoAnalyticsLoading,
          error: promoAnalyticsError,
          ariaLabel: "Активации промокодов по дням",
          showDonut: false,
        }
      : tab === "ambassadors"
        ? {
            series: [
              { id: "joined", label: "Присоединился", color: GREEN, values: zeroValues, fill: true },
              { id: "left", label: "Вышел", color: RED, values: zeroValues },
            ],
            legend: [
              { label: "Присоединился", value: 0, color: GREEN },
              { label: "Вышел", value: 0, color: RED },
            ],
            isLoading: false,
            error: undefined,
            ariaLabel: "Изменение числа амбассадоров по дням",
            showDonut: true,
          }
        : {
            series: [{ id: tab, label: tab === "tasks" ? "Выполнено" : "Заработано", color: GREEN, values: zeroValues, fill: true }],
            legend: [{ label: tab === "tasks" ? "Выполнено" : "Заработано", value: 0, color: GREEN }],
            isLoading: false,
            error: undefined,
            ariaLabel: tab === "tasks" ? "Выполненные задания по дням" : "Заработанный опыт по дням",
            showDonut: false,
          };
  const activeRows = tab === "promo-codes" ? promoRows : [];

  return (
    <div className="-m-4 min-h-full w-[calc(100%+2rem)] min-w-0 bg-white text-[13px] font-medium leading-4 tracking-[-0.0325px] text-black md:-m-6 md:w-[calc(100%+3rem)]">
      <header className="flex h-12 items-center border-b border-[#e4e4e4] px-4">
        <h1 className="text-[13px] font-medium leading-4">Статистика</h1>
      </header>

      <TabsRoot value={tab} onValueChange={(value) => setTab(value as StatisticsTab)}>
        <div className="flex h-12 items-center border-b border-[#e4e4e4] px-4 py-2.5">
          <TabsList className="h-7">
            {tabs.map((item) => (
              <TabsTrigger key={item.id} value={item.id}>
                {item.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        <StatisticsToolbar
          tab={tab}
          period={period}
          startDate={startDate}
          endDate={endDate}
          sprintOptions={sprintOptions}
          eventOptions={eventOptions}
          selectedSprintIds={selectedSprintIds}
          selectedEventIds={selectedEventIds}
          selectedAmbassadorStatuses={selectedAmbassadorStatuses}
          selectedPromoCodeLabel={tab === "promo-codes" ? selectedPromoCodeLabel : undefined}
          isSprintsLoading={isSprintsLoading}
          isEventsLoading={isEventsLoading}
          onPeriodChange={(nextPeriod, range) => {
            setPeriod(nextPeriod);
            setStartDate(range.from);
            setEndDate(range.to);
          }}
          onDateRangeChange={(range) => {
            setStartDate(range.from);
            setEndDate(range.to);
          }}
          onSprintIdsChange={(ids) => handleScopeFilterChange(setSelectedSprintIds, ids)}
          onEventIdsChange={(ids) => handleScopeFilterChange(setSelectedEventIds, ids)}
          onAmbassadorStatusesChange={setSelectedAmbassadorStatuses}
          onPromoCodeClear={clearPromoCodeFilter}
          onClearAll={clearAllFilters}
        />

        <StatisticsCharts
          labels={chartLabels}
          series={activeChart.series}
          legend={activeChart.legend}
          isLoading={activeChart.isLoading}
          error={activeChart.error}
          ariaLabel={activeChart.ariaLabel}
          showDonut={activeChart.showDonut}
        />

        <StatisticsTable
          tab={tab}
          rows={activeRows}
          isLoading={tab === "promo-codes" && isPromoUsagesLoading}
          error={tab === "promo-codes" ? promoUsagesError : undefined}
        />
      </TabsRoot>
    </div>
  );
}
