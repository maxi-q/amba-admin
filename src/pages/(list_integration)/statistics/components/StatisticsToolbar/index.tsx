import { useMemo, useState } from "react";
import {
  Button,
  Calendar,
  CheckBox,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuRoot,
  DropdownMenuTrigger,
  Input,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@senler/ui";
import { endOfMonth, endOfWeek, format, startOfMonth, startOfWeek } from "date-fns";
import { ru } from "date-fns/locale";
import { CalendarDays, ChevronDown, ChevronRight, Plus, X } from "lucide-react";

import type {
  StatisticsFilterOption,
  StatisticsPeriod,
  StatisticsTab,
} from "../../types";

interface StatisticsToolbarProps {
  tab: StatisticsTab;
  period: StatisticsPeriod;
  startDate: Date;
  endDate: Date;
  sprintOptions: StatisticsFilterOption[];
  eventOptions: StatisticsFilterOption[];
  selectedSprintIds: string[];
  selectedEventIds: string[];
  selectedAmbassadorStatuses: string[];
  selectedPromoCodeLabel?: string;
  isSprintsLoading?: boolean;
  isEventsLoading?: boolean;
  onPeriodChange: (period: StatisticsPeriod, range: { from: Date; to: Date }) => void;
  onDateRangeChange: (range: { from: Date; to: Date }) => void;
  onSprintIdsChange: (ids: string[]) => void;
  onEventIdsChange: (ids: string[]) => void;
  onAmbassadorStatusesChange: (statuses: string[]) => void;
  onPromoCodeClear?: () => void;
  onClearAll: () => void;
}

type FilterPanel = "sprint" | "event" | "status";

const periodLabels: Record<StatisticsPeriod, string> = {
  day: "День",
  week: "Неделя",
  month: "Месяц",
};

const ambassadorStatuses: StatisticsFilterOption[] = [
  { id: "joined", label: "Присоединился" },
  { id: "left", label: "Вышел" },
];

const controlClassName =
  "h-7 rounded-md border-[#e4e4e4] bg-white px-2 py-1.5 text-[13px] font-medium leading-4 tracking-[-0.0325px] text-black shadow-none hover:bg-[#f7f7f7]";

function dateRangeForPeriod(period: StatisticsPeriod, anchor = new Date()) {
  if (period === "day") return { from: anchor, to: anchor };
  if (period === "month") {
    return { from: startOfMonth(anchor), to: endOfMonth(anchor) };
  }

  return {
    from: startOfWeek(anchor, { weekStartsOn: 1 }),
    to: endOfWeek(anchor, { weekStartsOn: 1 }),
  };
}

function toggleValue(values: string[], value: string) {
  return values.includes(value)
    ? values.filter((item) => item !== value)
    : [...values, value];
}

function filterChipValue(ids: string[], options: StatisticsFilterOption[]) {
  if (ids.length > 1) return `+${ids.length}`;
  return options.find((option) => option.id === ids[0])?.label ?? ids[0] ?? "";
}

function FilterChip({
  label,
  value,
  onRemove,
}: {
  label: string;
  value: string;
  onRemove: () => void;
}) {
  return (
    <div className="flex h-6 max-w-full items-center overflow-hidden rounded border border-[#e4e4e4] bg-white text-[13px] font-medium leading-4 tracking-[-0.0325px] text-black">
      <span className="h-full border-r border-[#e4e4e4] px-1.5 py-1">{label}</span>
      <span className="max-w-56 truncate border-r border-[#e4e4e4] px-1.5 py-1">
        {value}
      </span>
      <button
        type="button"
        className="flex size-6 shrink-0 items-center justify-center text-[#707070] hover:bg-[#f0f0f0]"
        aria-label={`Убрать фильтр «${label}»`}
        onClick={onRemove}
      >
        <X className="size-4" strokeWidth={1.5} />
      </button>
    </div>
  );
}

function FilterOptions({
  options,
  selectedIds,
  search,
  isLoading,
  onSearchChange,
  onChange,
}: {
  options: StatisticsFilterOption[];
  selectedIds: string[];
  search: string;
  isLoading?: boolean;
  onSearchChange: (value: string) => void;
  onChange: (ids: string[]) => void;
}) {
  const filteredOptions = useMemo(() => {
    const query = search.trim().toLocaleLowerCase("ru-RU");
    if (!query) return options;
    return options.filter((option) =>
      option.label.toLocaleLowerCase("ru-RU").includes(query),
    );
  }, [options, search]);

  return (
    <div className="w-[188px] border-l border-[#e4e4e4] p-1">
      <Input
        type="search"
        value={search}
        onChange={(event) => onSearchChange(event.target.value)}
        placeholder="Поиск..."
        aria-label="Поиск по фильтру"
        className="mb-1 h-7 rounded-md border-0 bg-[#f0f0f0] px-2 py-1.5 text-[13px] font-medium leading-4 shadow-none placeholder:text-[#797979]"
      />
      <div className="max-h-56 overflow-y-auto px-1 py-0.5">
        {isLoading ? (
          <p className="px-1 py-2 text-[12px] text-[#797979]">Загрузка…</p>
        ) : filteredOptions.length === 0 ? (
          <p className="px-1 py-2 text-[12px] text-[#797979]">Ничего не найдено</p>
        ) : (
          <div className="grid gap-0.5">
            {filteredOptions.map((option) => (
              <CheckBox
                key={option.id}
                checked={selectedIds.includes(option.id)}
                onCheckedChange={() => onChange(toggleValue(selectedIds, option.id))}
                label={<span className="block max-w-36 truncate">{option.label}</span>}
                className="border-[#e4e4e4]"
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export function StatisticsToolbar({
  tab,
  period,
  startDate,
  endDate,
  sprintOptions,
  eventOptions,
  selectedSprintIds,
  selectedEventIds,
  selectedAmbassadorStatuses,
  selectedPromoCodeLabel,
  isSprintsLoading,
  isEventsLoading,
  onPeriodChange,
  onDateRangeChange,
  onSprintIdsChange,
  onEventIdsChange,
  onAmbassadorStatusesChange,
  onPromoCodeClear,
  onClearAll,
}: StatisticsToolbarProps) {
  const [filterOpen, setFilterOpen] = useState(false);
  const [filterPanel, setFilterPanel] = useState<FilterPanel>(
    tab === "ambassadors" ? "status" : "sprint",
  );
  const [search, setSearch] = useState("");
  const [calendarOpen, setCalendarOpen] = useState(false);

  const hasScopeFilters = selectedSprintIds.length > 0 || selectedEventIds.length > 0;
  const hasAmbassadorFilters = selectedAmbassadorStatuses.length > 0;
  const hasFilters =
    (tab === "ambassadors" ? hasAmbassadorFilters : hasScopeFilters) ||
    Boolean(selectedPromoCodeLabel);

  const panelOptions =
    filterPanel === "sprint"
      ? sprintOptions
      : filterPanel === "event"
        ? eventOptions
        : ambassadorStatuses;
  const panelSelectedIds =
    filterPanel === "sprint"
      ? selectedSprintIds
      : filterPanel === "event"
        ? selectedEventIds
        : selectedAmbassadorStatuses;
  const panelLoading =
    filterPanel === "sprint"
      ? isSprintsLoading
      : filterPanel === "event"
        ? isEventsLoading
        : false;
  const handlePanelChange =
    filterPanel === "sprint"
      ? onSprintIdsChange
      : filterPanel === "event"
        ? onEventIdsChange
        : onAmbassadorStatusesChange;

  const selectPanel = (panel: FilterPanel) => {
    setFilterPanel(panel);
    setSearch("");
  };

  const handlePeriodChange = (nextPeriod: StatisticsPeriod) => {
    onPeriodChange(nextPeriod, dateRangeForPeriod(nextPeriod));
  };

  return (
    <>
      <div className="flex min-h-12 flex-wrap items-center justify-between gap-2 border-b border-[#e4e4e4] px-4 py-2.5">
        <Popover
          open={filterOpen}
          onOpenChange={(open) => {
            setFilterOpen(open);
            if (open) {
              setFilterPanel(tab === "ambassadors" ? "status" : "sprint");
              setSearch("");
            }
          }}
        >
          <PopoverTrigger asChild>
            <Button type="button" variant="outline" className={`${controlClassName} gap-1`}>
              <Plus className="size-4" strokeWidth={1.5} />
              Фильтры
            </Button>
          </PopoverTrigger>
          <PopoverContent
            align="start"
            sideOffset={4}
            className="flex w-auto overflow-hidden rounded-lg border-[#e4e4e4] p-0 text-[13px] font-medium leading-4 shadow-[0_16px_16px_0_rgba(0,0,0,0.16)]"
          >
            <div className="w-28 p-1">
              {tab === "ambassadors" ? (
                <button
                  type="button"
                  className={`flex h-7 w-full items-center justify-between rounded px-1.5 text-left ${filterPanel === "status" ? "bg-[#f0f0f0]" : "hover:bg-[#f7f7f7]"}`}
                  onClick={() => selectPanel("status")}
                >
                  Статус
                  <ChevronRight className="size-4 text-[#707070]" strokeWidth={1.5} />
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    className={`flex h-7 w-full items-center justify-between rounded px-1.5 text-left ${filterPanel === "sprint" ? "bg-[#f0f0f0]" : "hover:bg-[#f7f7f7]"}`}
                    onClick={() => selectPanel("sprint")}
                  >
                    Спринт
                    <ChevronRight className="size-4 text-[#707070]" strokeWidth={1.5} />
                  </button>
                  <button
                    type="button"
                    className={`flex h-7 w-full items-center justify-between rounded px-1.5 text-left ${filterPanel === "event" ? "bg-[#f0f0f0]" : "hover:bg-[#f7f7f7]"}`}
                    onClick={() => selectPanel("event")}
                  >
                    Событие
                    <ChevronRight className="size-4 text-[#707070]" strokeWidth={1.5} />
                  </button>
                </>
              )}
            </div>
            <FilterOptions
              options={panelOptions}
              selectedIds={panelSelectedIds}
              search={search}
              isLoading={panelLoading}
              onSearchChange={setSearch}
              onChange={handlePanelChange}
            />
          </PopoverContent>
        </Popover>

        <div className="flex min-w-0 flex-wrap items-center justify-end gap-2.5">
          <DropdownMenuRoot>
            <DropdownMenuTrigger asChild>
              <Button type="button" variant="outline" className={`${controlClassName} gap-1`}>
                <ChevronDown className="size-4" strokeWidth={1.5} />
                {periodLabels[period]}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-28 text-[13px] font-medium">
              {(Object.keys(periodLabels) as StatisticsPeriod[]).map((value) => (
                <DropdownMenuItem key={value} onSelect={() => handlePeriodChange(value)}>
                  {periodLabels[value]}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenuRoot>

          <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
            <PopoverTrigger asChild>
              <Button type="button" variant="outline" className={`${controlClassName} max-w-full gap-1`}>
                <CalendarDays className="size-4 shrink-0" strokeWidth={1.5} />
                <span className="truncate">
                  {format(startDate, "d MMMM, yyyy", { locale: ru })} – {format(endDate, "d MMMM, yyyy", { locale: ru })}
                </span>
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-auto p-0">
              <Calendar
                mode="range"
                numberOfMonths={2}
                locale={ru}
                selected={{ from: startDate, to: endDate }}
                onSelect={(range) => {
                  if (!range?.from) return;
                  const to = range.to ?? range.from;
                  onDateRangeChange({ from: range.from, to });
                  if (range.to) setCalendarOpen(false);
                }}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {hasFilters ? (
        <div className="flex min-h-11 items-start justify-between gap-4 border-b border-[#e4e4e4] px-4 py-2.5">
          <div className="flex min-w-0 flex-wrap items-center gap-1.5">
            {tab !== "ambassadors" && selectedSprintIds.length > 0 ? (
              <FilterChip
                label="Спринт"
                value={filterChipValue(selectedSprintIds, sprintOptions)}
                onRemove={() => onSprintIdsChange([])}
              />
            ) : null}
            {tab !== "ambassadors" && selectedEventIds.length > 0 ? (
              <FilterChip
                label="Событие"
                value={filterChipValue(selectedEventIds, eventOptions)}
                onRemove={() => onEventIdsChange([])}
              />
            ) : null}
            {tab === "ambassadors" && selectedAmbassadorStatuses.length > 0 ? (
              <FilterChip
                label="Статус"
                value={filterChipValue(selectedAmbassadorStatuses, ambassadorStatuses)}
                onRemove={() => onAmbassadorStatusesChange([])}
              />
            ) : null}
            {selectedPromoCodeLabel ? (
              <FilterChip
                label="Промокод"
                value={selectedPromoCodeLabel}
                onRemove={() => onPromoCodeClear?.()}
              />
            ) : null}
          </div>
          <button
            type="button"
            className="shrink-0 text-[13px] font-medium leading-4 tracking-[-0.0325px] text-[#2563eb] hover:underline"
            onClick={onClearAll}
          >
            Очистить все
          </button>
        </div>
      ) : null}
    </>
  );
}
