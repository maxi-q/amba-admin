import { format } from "date-fns";
import { InputField } from "@senler/ui";
import type { DateRangeSelectorProps } from "../../types";

function parseDateInput(value: string): Date | null {
  if (!value) return null;
  const d = new Date(`${value}T12:00:00`);
  return Number.isNaN(d.getTime()) ? null : d;
}

export function DateRangeSelector({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
}: DateRangeSelectorProps) {
  return (
    <div className="mb-6 flex flex-wrap items-end gap-3">
      <div className="grid w-full max-w-[11rem] gap-1.5">
        <span className="text-sm text-muted-foreground">с</span>
        <InputField
          type="date"
          value={format(startDate, "yyyy-MM-dd")}
          onChange={(e) => onStartDateChange(parseDateInput(e.target.value))}
          aria-label="Дата начала периода"
        />
      </div>
      <div className="grid w-full max-w-[11rem] gap-1.5">
        <span className="text-sm text-muted-foreground">по</span>
        <InputField
          type="date"
          value={format(endDate, "yyyy-MM-dd")}
          onChange={(e) => onEndDateChange(parseDateInput(e.target.value))}
          aria-label="Дата окончания периода"
        />
      </div>
    </div>
  );
}
