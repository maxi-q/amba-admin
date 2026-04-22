import { Card, CardContent } from "@senler/ui";
import type { EventChartProps, ChartData } from "../../types";

export const EventChart = ({ data }: EventChartProps) => {
  const maxCount = Math.max(...data.map((d: ChartData) => d.count), 0);
  const scaleMax = Math.max(maxCount, 1);

  const getYAxisLabels = () => {
    const maxLabels = 10;
    const step = Math.max(1, Math.ceil(maxCount / maxLabels));
    const labels: number[] = [];
    for (let i = 0; i <= maxCount; i += step) {
      labels.push(i);
      if (labels.length >= maxLabels) break;
    }
    if (labels.length > 0 && labels[labels.length - 1] !== maxCount && maxCount > 0) {
      labels[labels.length - 1] = maxCount;
    }
    if (labels.length === 0) labels.push(0);
    return labels;
  };

  const yAxisLabels = getYAxisLabels();

  const getXAxisLabels = () => {
    const maxLabels = 8;
    if (data.length === 0) return [];
    if (data.length === 1) return [0];
    if (data.length <= maxLabels) {
      return data.map((_, index) => index);
    }
    const step = Math.ceil(data.length / maxLabels);
    const indices: number[] = [0];
    for (let i = step; i < data.length - 1; i += step) {
      indices.push(i);
      if (indices.length >= maxLabels - 1) break;
    }
    if (indices[indices.length - 1] !== data.length - 1) {
      indices.push(data.length - 1);
    }
    return indices;
  };

  const xAxisLabelIndices = getXAxisLabels();

  return (
    <Card className="mb-6 min-h-[300px] border border-border shadow-sm">
      <CardContent className="p-4 sm:p-6">
        <h3 className="mb-3 text-lg font-semibold tracking-tight text-foreground">
          Количество событий по дням
        </h3>

        {data.length === 0 ? (
          <p className="py-12 text-center text-sm text-muted-foreground">
            Нет данных за выбранный период
          </p>
        ) : (
          <div className="relative h-[300px] w-full">
            <svg
              width="100%"
              height="100%"
              viewBox="0 0 800 300"
              preserveAspectRatio="xMidYMid meet"
              className="overflow-visible"
              aria-label="График количества событий по дням"
            >
              <g className="text-zinc-200 dark:text-zinc-700">
                {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
                  <line
                    key={`v-${i}`}
                    x1={80 + (i * 720) / 10}
                    y1="20"
                    x2={80 + (i * 720) / 10}
                    y2="250"
                    stroke="currentColor"
                    strokeWidth="1"
                  />
                ))}
                {yAxisLabels.map((value) => {
                  const y = 250 - (value * 230) / scaleMax;
                  return (
                    <line
                      key={`h-${value}`}
                      x1="80"
                      y1={y}
                      x2="800"
                      y2={y}
                      stroke="currentColor"
                      strokeWidth="1"
                    />
                  );
                })}
              </g>

              <g className="fill-muted-foreground text-muted-foreground">
                {yAxisLabels.map((value) => {
                  const y = 250 - (value * 230) / scaleMax;
                  return (
                    <text
                      key={`y-${value}`}
                      x="70"
                      y={y + 5}
                      textAnchor="end"
                      fontSize="12"
                      fill="currentColor"
                    >
                      {value}
                    </text>
                  );
                })}
                {xAxisLabelIndices.map((index) => (
                  <text
                    key={`x-${index}`}
                    x={80 + (index * 720) / Math.max(1, data.length - 1)}
                    y="280"
                    textAnchor="middle"
                    fontSize="11"
                    fill="currentColor"
                  >
                    {data[index]?.date}
                  </text>
                ))}
                <text
                  x="20"
                  y="140"
                  textAnchor="middle"
                  fontSize="12"
                  fill="currentColor"
                  transform="rotate(-90, 20, 140)"
                >
                  Количество событий
                </text>
              </g>

              <g className="text-primary">
                <polyline
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  points={data
                    .map(
                      (point: ChartData, index: number) =>
                        `${80 + (index * 720) / Math.max(1, data.length - 1)},${250 - (point.count * 230) / scaleMax}`
                    )
                    .join(" ")}
                />
                {data.map((point: ChartData, index: number) => (
                  <circle
                    key={index}
                    cx={80 + (index * 720) / Math.max(1, data.length - 1)}
                    cy={250 - (point.count * 230) / scaleMax}
                    r="6"
                    fill="currentColor"
                    stroke="white"
                    strokeWidth="2"
                  />
                ))}
              </g>
            </svg>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
