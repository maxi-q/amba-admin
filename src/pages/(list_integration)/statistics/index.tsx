import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Typography } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { ru } from 'date-fns/locale';
import { subDays } from 'date-fns';

import { DateRangeSelector } from './components/DateRangeSelector';
import { FilterSelector } from './components/FilterSelector';
import { EventChart } from './components/EventChart';
import { EventList } from './components/EventList';

import { mockEventData, mockChartData } from './helpers/mockData';
import { filterEvents } from './helpers/filters';

export default function StatisticsPage() {
  const { slug } = useParams();
  const [startDate, setStartDate] = useState(subDays(new Date(), 14));
  const [endDate, setEndDate] = useState(new Date());
  const [selectedAmbassadors, setSelectedAmbassadors] = useState<string[]>([]);
  const [selectedSprints, setSelectedSprints] = useState<string[]>([]);
  const [selectedEvents, setSelectedEvents] = useState<string[]>([]);

  // Фильтрация событий по выбранным фильтрам
  const filteredEvents = filterEvents(
    mockEventData,
    selectedAmbassadors,
    selectedSprints,
    selectedEvents
  );

  // Фильтрация данных графика
  const filteredChartData = mockChartData;

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
        />
      </Box>
    </LocalizationProvider>
  );
}