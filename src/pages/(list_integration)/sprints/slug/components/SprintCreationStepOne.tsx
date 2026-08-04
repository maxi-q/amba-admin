import { useEffect, useMemo, useState } from "react";
import { format, isValid, parseISO } from "date-fns";
import type { DateRange } from "react-day-picker";
import {
  Button,
  Calendar,
  Input,
  Textarea,
} from "@senler/ui";
import type { UpdateSprintRequestDto } from "@/api/generated/model";
import { SprintCreationHeader } from "./SprintCreationHeader";

interface SprintCreationStepOneProps {
  formData: UpdateSprintRequestDto;
  description: string;
  fieldErrors?: Record<string, string[]>;
  isSaving: boolean;
  onNameChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onDescriptionChange: (value: string) => void;
  onDateRangeChange: (from?: Date, to?: Date) => void;
  onSaveDraft: () => void;
  onContinue: () => void;
}

const parseFormDate = (value: string | null | undefined) => {
  if (!value) return undefined;
  const parsed = parseISO(value);
  return isValid(parsed) ? parsed : undefined;
};

const formatDisplayDate = (date?: Date) =>
  date ? format(date, "dd.MM.yyyy") : "";

const useDesktopCalendar = () => {
  const [isDesktop, setIsDesktop] = useState(() =>
    typeof window === "undefined"
      ? true
      : window.matchMedia("(min-width: 768px)").matches
  );

  useEffect(() => {
    const media = window.matchMedia("(min-width: 768px)");
    const update = () => setIsDesktop(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  return isDesktop;
};

export const SprintCreationStepOne = ({
  formData,
  description,
  fieldErrors,
  isSaving,
  onNameChange,
  onDescriptionChange,
  onDateRangeChange,
  onSaveDraft,
  onContinue,
}: SprintCreationStepOneProps) => {
  const isDesktop = useDesktopCalendar();
  const selectedRange = useMemo<DateRange>(
    () => ({
      from: parseFormDate(formData.startDate),
      to: parseFormDate(formData.endDate),
    }),
    [formData.endDate, formData.startDate]
  );
  const nameError = fieldErrors?.name?.[0];
  const startDateError = fieldErrors?.startDate?.[0];
  const endDateError = fieldErrors?.endDate?.[0];

  const handleRangeSelect = (range: DateRange | undefined) => {
    onDateRangeChange(range?.from, range?.to);
  };

  return (
    <div className="flex min-w-0 flex-1 flex-col">
      <SprintCreationHeader
        activeStep={1}
        isSaving={isSaving}
        onSaveDraft={onSaveDraft}
      />

      <div className="mx-auto mt-9 flex w-full max-w-[700px] flex-col items-end gap-3">
        <div className="w-full overflow-hidden rounded-lg border border-[#e4e4e4] bg-white">
          <div className="grid gap-4 border-b border-[#e4e4e4] p-4 md:grid-cols-[224px_minmax(0,1fr)] md:items-center">
            <label
              htmlFor="sprint-name"
              className="text-[15px] font-medium leading-5 tracking-[-0.135px] text-foreground"
            >
              Название
            </label>
            <div>
              <Input
                id="sprint-name"
                value={formData.name}
                onChange={onNameChange}
                aria-invalid={Boolean(nameError)}
                className="h-10 border-[#e4e4e4] bg-white text-[13px] shadow-none"
              />
              {nameError ? (
                <p className="mt-1 text-xs text-destructive">{nameError}</p>
              ) : null}
            </div>
          </div>

          <div className="grid gap-4 border-b border-[#e4e4e4] p-4 md:grid-cols-[224px_minmax(0,1fr)] md:items-start">
            <div>
              <label
                htmlFor="sprint-description"
                className="block text-[15px] font-medium leading-5 tracking-[-0.135px] text-foreground"
              >
                Описание
              </label>
              <p className="mt-1 text-[13px] font-medium leading-4 text-[#797979]">
                Пару слов о спринте
              </p>
            </div>
            <Textarea
              id="sprint-description"
              value={description}
              onChange={(event) => onDescriptionChange(event.target.value)}
              className="min-h-[72px] border-[#e4e4e4] bg-white text-[13px] shadow-none"
              aria-label="Описание спринта"
            />
          </div>

          <div className="grid gap-4 p-4 md:grid-cols-[224px_minmax(0,1fr)] md:items-start">
            <p className="text-[15px] font-medium leading-5 tracking-[-0.135px] text-foreground">
              Продолжительность
            </p>
            <div>
              <div className="w-fit max-w-full overflow-x-auto rounded-lg border border-[#e5e5e5] bg-white">
                <Calendar
                  mode="range"
                  selected={selectedRange}
                  onSelect={handleRangeSelect}
                  numberOfMonths={isDesktop ? 2 : 1}
                  defaultMonth={selectedRange.from}
                  className="p-3 [--cell-size:28px]"
                  classNames={{
                    months:
                      "relative flex flex-col gap-3 font-medium capitalize md:flex-row",
                    month: "flex w-full flex-col gap-3",
                    month_caption:
                      "flex h-7 w-full items-center justify-center px-7",
                    caption_label:
                      "select-none text-[13px] font-medium leading-4",
                    nav: "absolute inset-x-0 top-0 flex w-full items-center justify-between gap-1",
                    button_previous:
                      "size-7 select-none rounded-md border border-[#e4e4e4] bg-white p-0",
                    button_next:
                      "size-7 select-none rounded-md border border-[#e4e4e4] bg-white p-0",
                    weekday:
                      "flex-1 select-none rounded-md text-[13px] font-normal text-[#797979]",
                    day: "group/day relative aspect-square h-full w-full select-none p-0 text-center text-[13px] font-medium",
                  }}
                />
                <div className="grid grid-cols-2 gap-3 border-t border-[#e4e4e4] p-3">
                  <Input
                    readOnly
                    value={formatDisplayDate(selectedRange.from)}
                    placeholder="Начало"
                    aria-label="Дата начала"
                    aria-invalid={Boolean(startDateError)}
                    className="h-7 border-[#e4e4e4] bg-white px-2 text-[13px] shadow-none"
                  />
                  <Input
                    readOnly
                    value={formatDisplayDate(selectedRange.to)}
                    placeholder="Окончание"
                    aria-label="Дата окончания"
                    aria-invalid={Boolean(endDateError)}
                    className="h-7 border-[#e4e4e4] bg-white px-2 text-[13px] shadow-none"
                  />
                </div>
              </div>
              {startDateError || endDateError ? (
                <p className="mt-1 text-xs text-destructive">
                  {startDateError ?? endDateError}
                </p>
              ) : null}
            </div>
          </div>
        </div>

        <Button
          type="button"
          className="h-9 bg-[#2563eb] px-3 text-[13px] font-medium hover:bg-[#2563eb]/90"
          disabled={isSaving}
          onClick={onContinue}
        >
          {isSaving ? "Сохранение…" : "Продолжить"}
        </Button>
      </div>
    </div>
  );
};
