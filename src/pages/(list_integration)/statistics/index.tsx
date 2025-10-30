import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Stack,
  Button,
  MenuItem,
  Chip,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { ru } from 'date-fns/locale';
import { subDays } from 'date-fns';

// Типы
interface EventData {
  id: string;
  name: string;
  event: string;
  date: string;
}

interface ChartData {
  date: string;
  count: number;
}


interface DateRangeSelectorProps {
  startDate: Date;
  endDate: Date;
  onStartDateChange: (date: Date | null) => void;
  onEndDateChange: (date: Date | null) => void;
}

interface FilterSelectorProps {
  selectedFilters: string[];
  onFilterChange: (filters: string[]) => void;
}

interface EventChartProps {
  data: ChartData[];
}

interface EventListProps {
  events: EventData[];
}

// Mock данные для демонстрации
const mockEventData = [
  { id: '1', name: 'Амбассадорович Н.Е.', event: 'активация промокода', date: '10.01.2025' },
  { id: '2', name: 'Иванов И.И.', event: 'регистрация', date: '09.01.2025' },
  { id: '3', name: 'Петров П.П.', event: 'активация промокода', date: '09.01.2025' },
  { id: '4', name: 'Сидоров С.С.', event: 'покупка', date: '08.01.2025' },
  { id: '5', name: 'Козлов К.К.', event: 'активация промокода', date: '08.01.2025' },
  { id: '6', name: 'Морозов М.М.', event: 'регистрация', date: '07.01.2025' },
  { id: '7', name: 'Волков В.В.', event: 'активация промокода', date: '07.01.2025' },
  { id: '8', name: 'Новиков Н.Н.', event: 'покупка', date: '06.01.2025' },
  { id: '9', name: 'Федоров Ф.Ф.', event: 'активация промокода', date: '06.01.2025' },
  { id: '10', name: 'Соколов С.С.', event: 'регистрация', date: '05.01.2025' },
];

const mockChartData = [
  { date: '05.01.2025', count: 1 },
  { date: '06.01.2025', count: 2 },
  { date: '07.01.2025', count: 2 },
  { date: '08.01.2025', count: 2 },
  { date: '09.01.2025', count: 2 },
  { date: '10.01.2025', count: 1 },
];

const filterOptions = [
  { value: 'all', label: 'Все события' },
  { value: 'promo', label: 'Активация промокода' },
  { value: 'registration', label: 'Регистрация' },
  { value: 'purchase', label: 'Покупка' },
];

// Компонент выбора дат
const DateRangeSelector = ({ startDate, endDate, onStartDateChange, onEndDateChange }: DateRangeSelectorProps) => {
  return (
    <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
      <Typography variant="body2" color="text.secondary">
        с
      </Typography>
      <DatePicker
        value={startDate}
        onChange={onStartDateChange}
        slotProps={{
          textField: {
            size: 'small',
            sx: { 
              width: 150,
              '& .MuiInput-underline:before': { borderBottomColor: '#4caf50' },
              '& .MuiInput-underline:after': { borderBottomColor: '#4caf50' },
            }
          }
        }}
      />
      <Typography variant="body2" color="text.secondary">
        по
      </Typography>
      <DatePicker
        value={endDate}
        onChange={onEndDateChange}
        slotProps={{
          textField: {
            size: 'small',
            sx: { 
              width: 150,
              '& .MuiInput-underline:before': { borderBottomColor: '#4caf50' },
              '& .MuiInput-underline:after': { borderBottomColor: '#4caf50' },
            }
          }
        }}
      />
    </Stack>
  );
};

// Компонент селекта фильтров
const FilterSelector = ({ selectedFilters, onFilterChange }: FilterSelectorProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleFilterToggle = (filterValue: string) => {
    if (selectedFilters.includes(filterValue)) {
      onFilterChange(selectedFilters.filter((f: string) => f !== filterValue));
    } else {
      onFilterChange([...selectedFilters, filterValue]);
    }
  };

  return (
    <Box sx={{ mb: 3 }}>
      <Button
        variant="outlined"
        onClick={() => setIsOpen(!isOpen)}
        endIcon={<Typography>▼</Typography>}
        sx={{
          borderColor: '#e0e0e0',
          color: 'text.primary',
          textTransform: 'none',
          justifyContent: 'space-between',
          width: 200,
        }}
      >
        Добавить фильтр
      </Button>
      
      {isOpen && (
        <Paper
          sx={{
            position: 'absolute',
            zIndex: 1000,
            mt: 1,
            p: 1,
            minWidth: 200,
            boxShadow: 2,
          }}
        >
          {filterOptions.map((option) => (
            <MenuItem
              key={option.value}
              onClick={() => handleFilterToggle(option.value)}
              sx={{ fontSize: '0.875rem' }}
            >
              {option.label}
            </MenuItem>
          ))}
        </Paper>
      )}
      
      {selectedFilters.length > 0 && (
        <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
          {selectedFilters.map((filter: string) => {
            const option = filterOptions.find(opt => opt.value === filter);
            return (
              <Chip
                key={filter}
                label={option?.label}
                onDelete={() => handleFilterToggle(filter)}
                size="small"
                color="primary"
                variant="outlined"
              />
            );
          })}
        </Stack>
      )}
    </Box>
  );
};

// Компонент графика
const EventChart = ({ data }: EventChartProps) => {
  const maxCount = Math.max(...data.map((d: ChartData) => d.count));
  
  return (
    <Paper
      sx={{
        p: 3,
        mb: 3,
        borderRadius: 3,
        border: '1px solid #e0e0e0',
        minHeight: 300,
      }}
    >
      <Typography variant="h6" sx={{ mb: 2 }}>
        Количество событий по дням
      </Typography>
      
      <Box sx={{ position: 'relative', height: 300, width: '100%' }}>
        {/* Простой SVG график */}
        <svg width="100%" height="100%" viewBox="0 0 800 300">
          {/* Вертикальные линии сетки */}
          {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(i => (
            <line
              key={`v-${i}`}
              x1={80 + (i * 720) / 10}
              y1="20"
              x2={80 + (i * 720) / 10}
              y2="250"
              stroke="#f0f0f0"
              strokeWidth="1"
            />
          ))}
          
          {/* Горизонтальные линии сетки */}
          {Array.from({ length: maxCount + 1 }, (_, i) => i).map(value => {
            const y = 250 - (value * 230) / maxCount;
            return (
              <line
                key={`h-${value}`}
                x1="80"
                y1={y}
                x2="800"
                y2={y}
                stroke="#f0f0f0"
                strokeWidth="1"
              />
            );
          })}
          
          {/* Вертикальная ось Y - количество событий */}
          {Array.from({ length: maxCount + 1 }, (_, i) => i).map(value => {
            const y = 250 - (value * 230) / maxCount;
            return (
              <text
                key={`y-${value}`}
                x="70"
                y={y + 5}
                textAnchor="end"
                fontSize="12"
                fill="#666"
              >
                {value}
              </text>
            );
          })}
          
          {/* Линия графика */}
          <polyline
            fill="none"
            stroke="#4caf50"
            strokeWidth="3"
            points={data.map((point: ChartData, index: number) => 
              `${80 + (index * 720) / (data.length - 1)},${250 - (point.count * 230) / maxCount}`
            ).join(' ')}
          />
          
          {/* Точки на графике */}
          {data.map((point: ChartData, index: number) => (
            <circle
              key={index}
              cx={80 + (index * 720) / (data.length - 1)}
              cy={250 - (point.count * 230) / maxCount}
              r="6"
              fill="#4caf50"
              stroke="#fff"
              strokeWidth="2"
            />
          ))}
          
          {/* Подписи дат на оси X */}
          {data.map((point: ChartData, index: number) => (
            <text
              key={index}
              x={80 + (index * 720) / (data.length - 1)}
              y="280"
              textAnchor="middle"
              fontSize="11"
              fill="#666"
            >
              {point.date}
            </text>
          ))}
          
          {/* Подпись оси Y */}
          <text
            x="20"
            y="140"
            textAnchor="middle"
            fontSize="12"
            fill="#666"
            transform="rotate(-90, 20, 140)"
          >
            Количество событий
          </text>
        </svg>
      </Box>
    </Paper>
  );
};

// Компонент списка событий с инфинити скроллом
const EventList = ({ events }: EventListProps) => {
  const [displayedEvents, setDisplayedEvents] = useState(events.slice(0, 5));
  const [hasMore, setHasMore] = useState(events.length > 5);

  useEffect(() => {
    setDisplayedEvents(events.slice(0, 5));
    setHasMore(events.length > 5);
  }, [events]);

  const handleLoadMore = () => {
    const currentLength = displayedEvents.length;
    const nextBatch = events.slice(currentLength, currentLength + 5);
    setDisplayedEvents([...displayedEvents, ...nextBatch]);
    setHasMore(displayedEvents.length + nextBatch.length < events.length);
  };

  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Количество: {events.length}
      </Typography>
      
      <Stack spacing={2}>
        {displayedEvents.map((event: EventData) => (
          <Paper
            key={event.id}
            sx={{
              p: 2,
              borderRadius: 3,
              border: '1px solid #e0e0e0',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Typography variant="body1" fontWeight={500}>
              {event.name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {event.event} {event.date}
            </Typography>
          </Paper>
        ))}
        
        {hasMore && (
          <Button
            variant="outlined"
            onClick={handleLoadMore}
            sx={{ mt: 2 }}
          >
            Загрузить еще
          </Button>
        )}
      </Stack>
    </Box>
  );
};

export default function StatisticsPage() {
  const [startDate, setStartDate] = useState(subDays(new Date(), 14));
  const [endDate, setEndDate] = useState(new Date());
  const [selectedFilters, setSelectedFilters] = useState(['all']);

  // Фильтрация событий по выбранным фильтрам
  const filteredEvents = mockEventData.filter(event => {
    if (selectedFilters.includes('all')) return true;
    if (selectedFilters.includes('promo') && event.event.includes('промокод')) return true;
    if (selectedFilters.includes('registration') && event.event.includes('регистрация')) return true;
    if (selectedFilters.includes('purchase') && event.event.includes('покупка')) return true;
    return false;
  });

  // Фильтрация данных графика
  const filteredChartData = mockChartData;

  const handleStartDateChange = (date: Date | null) => {
    if (date) setStartDate(date);
  };

  const handleEndDateChange = (date: Date | null) => {
    if (date) setEndDate(date);
  };

  const handleFilterChange = (filters: string[]) => {
    setSelectedFilters(filters);
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
          selectedFilters={selectedFilters}
          onFilterChange={handleFilterChange}
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
