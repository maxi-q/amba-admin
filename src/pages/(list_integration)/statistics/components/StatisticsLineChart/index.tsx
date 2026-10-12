import { useId } from "react";

export interface StatisticsChartSeries {
  id: string;
  label: string;
  color: string;
  values: number[];
  fill?: boolean;
}

interface StatisticsLineChartProps {
  labels: string[];
  series: StatisticsChartSeries[];
  isEmpty?: boolean;
  emptyText?: string;
  ariaLabel: string;
}

const VIEWBOX_WIDTH = 860;
const VIEWBOX_HEIGHT = 280;
const PLOT_LEFT = 32;
const PLOT_RIGHT = 8;
const PLOT_TOP = 8;
const PLOT_BOTTOM = 30;
const GRID_LINES = 6;

function niceStep(value: number) {
  if (value <= 0) return 1;

  const roughStep = value / GRID_LINES;
  const magnitude = 10 ** Math.floor(Math.log10(roughStep));
  const normalized = roughStep / magnitude;
  const multiplier = normalized <= 1 ? 1 : normalized <= 2 ? 2 : normalized <= 5 ? 5 : 10;

  return multiplier * magnitude;
}

function smoothPath(points: Array<{ x: number; y: number }>) {
  if (points.length === 0) return "";
  if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;

  return points.reduce((path, point, index) => {
    if (index === 0) return `M ${point.x} ${point.y}`;

    const previous = points[index - 1];
    const previousPrevious = points[index - 2] ?? previous;
    const next = points[index + 1] ?? point;
    const control1X = previous.x + (point.x - previousPrevious.x) / 6;
    const control1Y = previous.y + (point.y - previousPrevious.y) / 6;
    const control2X = point.x - (next.x - previous.x) / 6;
    const control2Y = point.y - (next.y - previous.y) / 6;

    return `${path} C ${control1X} ${control1Y}, ${control2X} ${control2Y}, ${point.x} ${point.y}`;
  }, "");
}

function labelIndices(length: number) {
  if (length <= 7) return Array.from({ length }, (_, index) => index);

  return Array.from({ length: 7 }, (_, index) =>
    Math.round((index * (length - 1)) / 6),
  );
}

export function StatisticsLineChart({
  labels,
  series,
  isEmpty = false,
  emptyText = "Нет данных за выбранный период",
  ariaLabel,
}: StatisticsLineChartProps) {
  const gradientId = useId().replace(/:/g, "");
  const values = series.flatMap((item) => item.values);
  const maxValue = Math.max(0, ...values);
  const step = niceStep(maxValue);
  const scaleMax = Math.max(step * GRID_LINES, 1);
  const plotWidth = VIEWBOX_WIDTH - PLOT_LEFT - PLOT_RIGHT;
  const plotHeight = VIEWBOX_HEIGHT - PLOT_TOP - PLOT_BOTTOM;
  const visibleLabelIndices = new Set(labelIndices(labels.length));

  const getPoints = (data: number[]) =>
    labels.map((_, index) => ({
      x: PLOT_LEFT + (index * plotWidth) / Math.max(1, labels.length - 1),
      y: PLOT_TOP + plotHeight - ((data[index] ?? 0) * plotHeight) / scaleMax,
    }));

  return (
    <div className="relative h-full min-h-[240px] w-full">
      <svg
        className="size-full overflow-visible"
        viewBox={`0 0 ${VIEWBOX_WIDTH} ${VIEWBOX_HEIGHT}`}
        preserveAspectRatio="none"
        role="img"
        aria-label={ariaLabel}
      >
        <defs>
          {series.map((item) => (
            <linearGradient
              key={item.id}
              id={`${gradientId}-${item.id}`}
              x1="0"
              y1="0"
              x2="0"
              y2="1"
            >
              <stop offset="0%" stopColor={item.color} stopOpacity="0.12" />
              <stop offset="100%" stopColor={item.color} stopOpacity="0" />
            </linearGradient>
          ))}
        </defs>

        {Array.from({ length: GRID_LINES + 1 }, (_, index) => {
          const y = PLOT_TOP + (index * plotHeight) / GRID_LINES;
          const value = scaleMax - index * step;

          return (
            <g key={`horizontal-${index}`}>
              <line
                x1={PLOT_LEFT}
                y1={y}
                x2={VIEWBOX_WIDTH - PLOT_RIGHT}
                y2={y}
                stroke="#e4e4e4"
                strokeWidth="1"
                vectorEffect="non-scaling-stroke"
              />
              <text
                x={PLOT_LEFT - 8}
                y={y + 4}
                textAnchor="end"
                fontSize="12"
                fontWeight="400"
                fill="#797979"
              >
                {value.toLocaleString("ru-RU")}
              </text>
            </g>
          );
        })}

        {labels.map((label, index) => {
          const x = PLOT_LEFT + (index * plotWidth) / Math.max(1, labels.length - 1);

          return (
            <g key={`${label}-${index}`}>
              <line
                x1={x}
                y1={PLOT_TOP}
                x2={x}
                y2={PLOT_TOP + plotHeight}
                stroke="#e4e4e4"
                strokeWidth="1"
                vectorEffect="non-scaling-stroke"
              />
              {visibleLabelIndices.has(index) ? (
                <text
                  x={x}
                  y={VIEWBOX_HEIGHT - 8}
                  textAnchor="middle"
                  fontSize="12"
                  fontWeight="400"
                  fill="#797979"
                >
                  {label}
                </text>
              ) : null}
            </g>
          );
        })}

        {!isEmpty
          ? series.map((item) => {
              const points = getPoints(item.values);
              const path = smoothPath(points);
              const areaPath = `${path} L ${points.at(-1)?.x ?? PLOT_LEFT} ${PLOT_TOP + plotHeight} L ${PLOT_LEFT} ${PLOT_TOP + plotHeight} Z`;

              return (
                <g key={item.id}>
                  {item.fill ? (
                    <path d={areaPath} fill={`url(#${gradientId}-${item.id})`} />
                  ) : null}
                  <path
                    d={path}
                    fill="none"
                    stroke={item.color}
                    strokeWidth="1.5"
                    vectorEffect="non-scaling-stroke"
                  />
                  {points.map((point, index) => (
                    <circle
                      key={`${item.id}-${index}`}
                      cx={point.x}
                      cy={point.y}
                      r="2.75"
                      fill="#ffffff"
                      stroke={item.color}
                      strokeWidth="1.5"
                      vectorEffect="non-scaling-stroke"
                    />
                  ))}
                </g>
              );
            })
          : null}
      </svg>

      {isEmpty ? (
        <p className="absolute inset-0 flex items-center justify-center text-[13px] font-medium leading-4 text-[#797979]">
          {emptyText}
        </p>
      ) : null}
    </div>
  );
}
