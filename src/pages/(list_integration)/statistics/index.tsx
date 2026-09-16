import { useMemo, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { subDays, format } from "date-fns";

import { DateRangeSelector } from "./components/DateRangeSelector";
import { FilterSelector } from "./components/FilterSelector";
import { EventChart } from "./components/EventChart";
import { EventList } from "./components/EventList";

import { useGetRoomAnalytics } from "@/hooks/rooms/useGetRoomAnalytics";
import { useGetRoomPromoCodeUsages } from "@/hooks/rooms/useGetRoomPromoCodeUsages";
import { useSprints } from "@/hooks/sprints/useSprints";
import { useEvents } from "@/hooks/events/useEvents";
import { useCustomPromoCodes } from "@/hooks/promoCodes/useCustomPromoCodes";
import type { EventData } from "./types";
import {
  exportPromoCodeUsagesCsv,
  getPromoCodeFromPayload,
  getPromoCodeUsageTargetName,
} from "./helpers/promoCodeUsagesExport";

export default function StatisticsPage() {
  const { slug } = useParams();
  const [searchParams] = useSearchParams();
  const [startDate, setStartDate] = useState(subDays(new Date(), 14));
  const [endDate, setEndDate] = useState(new Date());
  const [selectedAmbassadors, setSelectedAmbassadors] = useState<string[]>([]);
  const [selectedSprints, setSelectedSprints] = useState<string[]>([]);
  const [selectedEvents, setSelectedEvents] = useState<string[]>([]);
  const [selectedPromoCodes, setSelectedPromoCodes] = useState<string[]>(() => {
    const promoCodeId = searchParams.get("promoCodeId");
    return promoCodeId ? [promoCodeId] : [];
  });
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState("");

  const analyticsParams = useMemo(
    () => ({
      ambassadorId: selectedAmbassadors.length > 0 ? selectedAmbassadors : undefined,
      eventId: selectedEvents.length > 0 ? selectedEvents : undefined,
      sprintId: selectedSprints.length > 0 ? selectedSprints : undefined,
      promoCodeId: selectedPromoCodes.length > 0 ? selectedPromoCodes : undefined,
      dateFrom: format(startDate, "yyyy-MM-dd"),
      dateTo: format(endDate, "yyyy-MM-dd"),
    }),
    [selectedAmbassadors, selectedEvents, selectedPromoCodes, selectedSprints, startDate, endDate]
  );

  const { analytics } = useGetRoomAnalytics(slug || "", analyticsParams);

  const filteredChartData = useMemo(() => {
    if (!analytics?.items) return [];
    return analytics.items.map((item) => ({
      date: item.date,
      count: item.count,
    }));
  }, [analytics]);

  const {
    items: promoCodeUsages,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: isLoadingUsages,
  } = useGetRoomPromoCodeUsages(slug || "", {
    ...analyticsParams,
    size: 5,
  });

  const { sprints } = useSprints({ page: 1, size: 100 }, slug || "");
  const { events } = useEvents({ page: 1, size: 100 }, slug || "");
  const { promoCodes } = useCustomPromoCodes(slug || "");
  const publishedSprints = useMemo(
    () =>
      sprints.flatMap((sprint) =>
        !sprint.isDraft && sprint.name
          ? [{ ...sprint, name: sprint.name }]
          : []
      ),
    [sprints]
  );

  const isPromoCodeUsageFilterValid = useMemo(
    () =>
      [analyticsParams.eventId, analyticsParams.sprintId, analyticsParams.promoCodeId].filter(Boolean).length <= 1,
    [analyticsParams.eventId, analyticsParams.promoCodeId, analyticsParams.sprintId]
  );

  const filteredEvents = useMemo<EventData[]>(() => {
    if (!promoCodeUsages || promoCodeUsages.length === 0) return [];

    return promoCodeUsages.map((usage) => {
      const eventName = getPromoCodeUsageTargetName(
        usage,
        publishedSprints,
        events,
        promoCodes
      );
      const promoCode = getPromoCodeFromPayload(usage.payload) || "Промокод";

      const date = usage.createdAt
        ? format(new Date(usage.createdAt), "dd.MM.yyyy")
        : "";

      return {
        id: usage.id,
        name: promoCode,
        event: eventName,
        date,
      };
    });
  }, [events, promoCodeUsages, promoCodes, publishedSprints]);

  const handleAmbassadorsChange = (ids: string[]) => {
    setSelectedAmbassadors(ids);
    if (ids.length > 0) setSelectedPromoCodes([]);
  };

  const handleSprintsChange = (ids: string[]) => {
    setSelectedSprints(ids);
    if (ids.length > 0) {
      setSelectedEvents([]);
      setSelectedPromoCodes([]);
    }
  };

  const handleEventsChange = (ids: string[]) => {
    setSelectedEvents(ids);
    if (ids.length > 0) {
      setSelectedSprints([]);
      setSelectedPromoCodes([]);
    }
  };

  const handlePromoCodesChange = (ids: string[]) => {
    setSelectedPromoCodes(ids);
    if (ids.length > 0) {
      setSelectedAmbassadors([]);
      setSelectedSprints([]);
      setSelectedEvents([]);
    }
  };

  const handleStartDateChange = (date: Date | null) => {
    if (date) setStartDate(date);
  };

  const handleEndDateChange = (date: Date | null) => {
    if (date) setEndDate(date);
  };

  const handleExportPromoCodes = async () => {
    if (!slug) return;

    if (!isPromoCodeUsageFilterValid) {
      setExportError("Для выгрузки выберите либо события, либо спринты, но не оба фильтра одновременно.");
      return;
    }

    setIsExporting(true);
    setExportError("");

    try {
      await exportPromoCodeUsagesCsv({
        roomId: slug,
        filters: analyticsParams,
        sprints: publishedSprints,
        events,
        promoCodes,
      });
    } catch (error) {
      setExportError(
        error instanceof Error
          ? error.message
          : "Не удалось выгрузить промокоды."
      );
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="w-full px-2 py-3">
      <h2 className="mb-4 text-xl font-bold tracking-tight text-foreground">Статистика</h2>

      <DateRangeSelector
        startDate={startDate}
        endDate={endDate}
        onStartDateChange={handleStartDateChange}
        onEndDateChange={handleEndDateChange}
      />

      <FilterSelector
        selectedAmbassadors={selectedAmbassadors}
        selectedSprints={selectedSprints}
        selectedEvents={selectedEvents}
        selectedPromoCodes={selectedPromoCodes}
        onAmbassadorsChange={handleAmbassadorsChange}
        onSprintsChange={handleSprintsChange}
        onEventsChange={handleEventsChange}
        onPromoCodesChange={handlePromoCodesChange}
        roomId={slug || ""}
      />

      <EventChart data={filteredChartData} />

      <EventList
        events={filteredEvents}
        total={analytics?.total}
        onLoadMore={fetchNextPage}
        hasMore={hasNextPage || false}
        isLoadingMore={isFetchingNextPage}
        isLoading={isLoadingUsages}
        onExport={() => void handleExportPromoCodes()}
        isExporting={isExporting}
        isExportDisabled={!slug || isLoadingUsages}
        exportError={exportError}
      />
    </div>
  );
}
