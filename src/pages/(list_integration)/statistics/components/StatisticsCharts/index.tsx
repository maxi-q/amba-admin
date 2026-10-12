import { PageLoader } from "@senler/ui";

import { StatisticsLineChart } from "../StatisticsLineChart";
import type { StatisticsChartSeries } from "../StatisticsLineChart";

interface StatisticsChartsProps {
  labels: string[];
  series: StatisticsChartSeries[];
  legend: Array<{ label: string; value: number; color: string }>;
  isLoading?: boolean;
  error?: string;
  emptyText?: string;
  ariaLabel: string;
  showDonut?: boolean;
}

function Legend({
  items,
}: {
  items: Array<{ label: string; value: number; color: string }>;
}) {
  return (
    <div className="flex min-h-[58px] flex-wrap items-center justify-center gap-2 px-4 py-2">
      {items.map((item) => (
        <div
          key={item.label}
          className="flex h-6 items-center gap-1.5 rounded-full border border-[#e4e4e4] bg-white px-2 text-[13px] font-medium leading-4 tracking-[-0.0325px] text-black"
        >
          <span
            className="size-2 rounded-full border"
            style={{ borderColor: item.color }}
            aria-hidden
          />
          <span>
            {item.label} <span className="text-[#797979]">{item.value.toLocaleString("ru-RU")}</span>
          </span>
        </div>
      ))}
    </div>
  );
}

function DonutChart({
  items,
  isEmpty,
}: {
  items: Array<{ label: string; value: number; color: string }>;
  isEmpty: boolean;
}) {
  const total = items.reduce((sum, item) => sum + item.value, 0);
  const radius = 86;
  const circumference = Math.PI * 2 * radius;
  let offset = 0;

  return (
    <div className="relative h-full min-h-[240px] w-full">
      <svg
        viewBox="0 0 280 280"
        className="size-full"
        role="img"
        aria-label="Соотношение присоединившихся и вышедших амбассадоров"
      >
        <circle
          cx="140"
          cy="140"
          r={radius}
          fill="none"
          stroke="#f0f0f0"
          strokeWidth="34"
        />
        {!isEmpty
          ? items.map((item) => {
              const segmentLength = (item.value / total) * circumference;
              const dashOffset = -offset;
              offset += segmentLength;

              return (
                <circle
                  key={item.label}
                  cx="140"
                  cy="140"
                  r={radius}
                  fill="none"
                  stroke={item.color}
                  strokeWidth="34"
                  strokeDasharray={`${Math.max(0, segmentLength - 4)} ${circumference}`}
                  strokeDashoffset={dashOffset}
                  strokeLinecap="round"
                  transform="rotate(-90 140 140)"
                />
              );
            })
          : null}
      </svg>
      {isEmpty ? (
        <p className="absolute inset-0 flex items-center justify-center px-8 text-center text-[13px] font-medium leading-4 text-[#797979]">
          Нет данных за выбранный период
        </p>
      ) : null}
    </div>
  );
}

export function StatisticsCharts({
  labels,
  series,
  legend,
  isLoading = false,
  error,
  emptyText,
  ariaLabel,
  showDonut = false,
}: StatisticsChartsProps) {
  const total = legend.reduce((sum, item) => sum + item.value, 0);
  const isEmpty = total === 0;

  return (
    <section aria-label="Графики статистики">
      <div className={`grid gap-3 p-4 ${showDonut ? "lg:grid-cols-2" : "grid-cols-1"}`}>
        <div className="h-[328px] min-w-0 rounded-lg border border-[#e4e4e4] bg-white p-6">
          {isLoading ? (
            <div className="flex size-full items-center justify-center">
              <PageLoader label="Загрузка…" />
            </div>
          ) : error ? (
            <p role="alert" className="flex size-full items-center justify-center text-[13px] text-destructive">
              {error}
            </p>
          ) : (
            <StatisticsLineChart
              labels={labels}
              series={series}
              isEmpty={isEmpty}
              emptyText={emptyText}
              ariaLabel={ariaLabel}
            />
          )}
        </div>

        {showDonut ? (
          <div className="h-[328px] min-w-0 rounded-lg border border-[#e4e4e4] bg-white p-6">
            {isLoading ? (
              <div className="flex size-full items-center justify-center">
                <PageLoader label="Загрузка…" />
              </div>
            ) : error ? (
              <p role="alert" className="flex size-full items-center justify-center text-[13px] text-destructive">
                {error}
              </p>
            ) : (
              <DonutChart items={legend} isEmpty={isEmpty} />
            )}
          </div>
        ) : null}
      </div>
      <Legend items={legend} />
    </section>
  );
}
