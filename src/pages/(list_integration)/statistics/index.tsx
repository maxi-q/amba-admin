import { useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Typography } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { ru } from 'date-fns/locale';
import { subDays, format } from 'date-fns';

import { DateRangeSelector } from './components/DateRangeSelector';
import { FilterSelector } from './components/FilterSelector';
import { EventChart } from './components/EventChart';
import { EventList } from './components/EventList';

import { useGetRoomAnalytics } from '@/hooks/rooms/useGetRoomAnalytics';
import { useGetRoomPromoCodeUsages } from '@/hooks/rooms/useGetRoomPromoCodeUsages';
import { useSprints } from '@/hooks/sprints/useSprints';
import { useEvents } from '@/hooks/events/useEvents';
import type { EventData } from './types';

export default function StatisticsPage() {
  const { slug } = useParams();
  const [startDate, setStartDate] = useState(subDays(new Date(), 14));
  const [endDate, setEndDate] = useState(new Date());
  const [selectedAmbassadors, setSelectedAmbassadors] = useState<string[]>([]);
  const [selectedSprints, setSelectedSprints] = useState<string[]>([]);
  const [selectedEvents, setSelectedEvents] = useState<string[]>([]);

  const analyticsParams = useMemo(() => ({
    ambassadorId: selectedAmbassadors.length > 0 ? selectedAmbassadors : undefined,
    eventId: selectedEvents.length > 0 ? selectedEvents : undefined,
    sprintId: selectedSprints.length > 0 ? selectedSprints : undefined,
    dateFrom: format(startDate, 'yyyy-MM-dd'),
    dateTo: format(endDate, 'yyyy-MM-dd'),
  }), [selectedAmbassadors, selectedEvents, selectedSprints, startDate, endDate]);

  const { analytics } = useGetRoomAnalytics(
    slug || '',
    analyticsParams
  );

  const filteredChartData = useMemo(() => {
    if (!analytics?.items) return [];
    return analytics.items.map(item => ({
      date: item.date,
      count: item.count,
    }));
  }, [analytics]);

  // Получение данных об использовании промокодов
  const {
    items: promoCodeUsages,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: isLoadingUsages,
  } = useGetRoomPromoCodeUsages(slug || '', {
    ...analyticsParams,
    size: 5,
  });

  // Получение списка спринтов для получения названий
  const { sprints } = useSprints({ page: 1, size: 100 }, slug || '');

  // Получение списка событий для получения названий
  const { events } = useEvents({ page: 1, size: 100 }, slug || '');

  // Преобразование данных в формат EventData
  const filteredEvents = useMemo<EventData[]>(() => {
    if (!promoCodeUsages || promoCodeUsages.length === 0) return [];

    return promoCodeUsages.map((usage) => {
      // Определяем название спринта или события
      let eventName = 'Не указано';
      if (usage.sprintId) {
        const sprint = sprints.find((s) => s.id === usage.sprintId);
        eventName = sprint?.name || 'Спринт';
      } else if (usage.eventId) {
        const event = events.find((e) => e.id === usage.eventId);
        eventName = event?.name || 'Событие';
      }

      // Форматируем дату
      const date = usage.createdAt
        ? format(new Date(usage.createdAt), 'dd.MM.yyyy')
        : '';

      return {
        id: usage.id,
        name: eventName,
        event: eventName,
        date,
      };
    });
  }, [promoCodeUsages, sprints, events]);

  const handleStartDateChange = (date: Date | null) => {
    if (date) setStartDate(date);
  };

  const handleEndDateChange = (date: Date | null) => {
    if (date) setEndDate(date);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ru}>
      <Box sx={{ width: "100%", px: 2, py: 3 }}>
        <Typography variant="h6" fontWeight={700} sx={{ mb: 3 }}>
          Статистика
        </Typography>

        {/* Выбор дат */}
        <DateRangeSelector
          startDate={startDate}
          endDate={endDate}
          onStartDateChange={handleStartDateChange}
          onEndDateChange={handleEndDateChange}
        />

        {/* Селект фильтров */}
        <FilterSelector
          selectedAmbassadors={selectedAmbassadors}
          selectedSprints={selectedSprints}
          selectedEvents={selectedEvents}
          onAmbassadorsChange={setSelectedAmbassadors}
          onSprintsChange={setSelectedSprints}
          onEventsChange={setSelectedEvents}
          roomId={slug || ''}
        />

        {/* График */}
        <EventChart
          data={filteredChartData}
        />

        {/* Список событий */}
        <EventList
          events={filteredEvents}
          onLoadMore={fetchNextPage}
          hasMore={hasNextPage || false}
          isLoadingMore={isFetchingNextPage}
          isLoading={isLoadingUsages}
        />
      </Box>
    </LocalizationProvider>
  );
}