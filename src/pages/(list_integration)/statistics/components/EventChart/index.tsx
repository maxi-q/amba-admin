import { Box, Paper, Typography } from '@mui/material';
import type { EventChartProps, ChartData } from '../../types';

export const EventChart = ({ data }: EventChartProps) => {
  const maxCount = Math.max(...data.map((d: ChartData) => d.count), 0);

  // Генерируем максимум 10 подписей для оси Y
  const getYAxisLabels = () => {
    const maxLabels = 10;
    const step = Math.max(1, Math.ceil(maxCount / maxLabels));
    const labels: number[] = [];
    for (let i = 0; i <= maxCount; i += step) {
      labels.push(i);
      if (labels.length >= maxLabels) break;
    }
    // Всегда добавляем максимальное значение, если его еще нет
    if (labels[labels.length - 1] !== maxCount && maxCount > 0) {
      labels[labels.length - 1] = maxCount;
    }
    return labels;
  };

  const yAxisLabels = getYAxisLabels();

  // Генерируем разумное количество подписей для оси X (максимум 8 для избежания наложения)
  const getXAxisLabels = () => {
    const maxLabels = 8; // Максимум 8 подписей для лучшей читаемости
    if (data.length === 0) return [];
    if (data.length === 1) return [0];

    // Если данных мало, показываем все
    if (data.length <= maxLabels) {
      return data.map((_, index) => index);
    }

    // Для большого количества данных равномерно распределяем подписи
    const step = Math.ceil(data.length / maxLabels);
    const indices: number[] = [0]; // Всегда начинаем с первой даты

    // Добавляем промежуточные индексы
    for (let i = step; i < data.length - 1; i += step) {
      indices.push(i);
      if (indices.length >= maxLabels - 1) break; // Оставляем место для последней даты
    }

    // Всегда добавляем последний индекс
    if (indices[indices.length - 1] !== data.length - 1) {
      indices.push(data.length - 1);
    }

    return indices;
  };

  const xAxisLabelIndices = getXAxisLabels();

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
          {yAxisLabels.map(value => {
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
          
          {/* Вертикальная ось Y - количество событий (максимум 10 подписей) */}
          {yAxisLabels.map(value => {
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
              `${80 + (index * 720) / Math.max(1, data.length - 1)},${250 - (point.count * 230) / Math.max(1, maxCount)}`
            ).join(' ')}
          />
          
          {/* Точки на графике */}
          {data.map((point: ChartData, index: number) => (
            <circle
              key={index}
              cx={80 + (index * 720) / Math.max(1, data.length - 1)}
              cy={250 - (point.count * 230) / Math.max(1, maxCount)}
              r="6"
              fill="#4caf50"
              stroke="#fff"
              strokeWidth="2"
            />
          ))}
          
          {/* Подписи дат на оси X (только выбранные индексы) */}
          {xAxisLabelIndices.map(index => (
            <text
              key={`x-${index}`}
              x={80 + (index * 720) / Math.max(1, data.length - 1)}
              y="280"
              textAnchor="middle"
              fontSize="11"
              fill="#666"
            >
              {data[index]?.date}
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
