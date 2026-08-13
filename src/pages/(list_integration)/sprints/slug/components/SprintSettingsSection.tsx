import { InputField, Switch, Textarea } from "@senler/ui";
import type { UpdateSprintRequestDto } from "@/api/generated/model";

interface SprintSettingsSectionProps {
  formData: UpdateSprintRequestDto;
  onInputChange: (
    field: keyof UpdateSprintRequestDto
  ) => (event: React.ChangeEvent<HTMLInputElement>) => void;
  fieldErrors?: Record<string, string[]>;
  onIgnoreEndDateChange: (value: boolean) => void;
  onDescriptionChange?: (value: string) => void;
}

export const SprintSettingsSection = ({
  formData,
  onInputChange,
  fieldErrors,
  onIgnoreEndDateChange,
  onDescriptionChange,
}: SprintSettingsSectionProps) => {
  const getFirstError = (field: string) => fieldErrors?.[field]?.[0];
  const hasError = (field: string) => !!fieldErrors?.[field];

  return (
    <div className="grid gap-6">
      <div className="space-y-2">
        <p className="text-sm font-medium text-foreground">Название</p>
        <InputField
          placeholder="Будет показываться вам и определённым амбассадорам"
          value={formData.name}
          onChange={onInputChange("name")}
          error={hasError("name")}
          helperText={getFirstError("name") ?? undefined}
          aria-label="Название спринта"
        />
      </div>

      <div className="space-y-2">
        <p className="text-sm font-medium text-foreground">Описание</p>
        <Textarea
          placeholder="Кратко опишите спринт для участников"
          value={formData.description ?? ""}
          onChange={(event) => onDescriptionChange?.(event.target.value)}
          aria-label="Описание спринта"
          className="min-h-[88px]"
        />
        {hasError("description") ? (
          <p className="text-sm text-destructive">{getFirstError("description")}</p>
        ) : null}
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-medium text-foreground">
            Ограничить спринт датами
          </p>
          <Switch
            checked={!formData.ignoreEndDate}
            onCheckedChange={(checked) => onIgnoreEndDateChange(!checked)}
            aria-label="Ограничить спринт датами"
          />
        </div>
        {!formData.ignoreEndDate ? (
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
            <div className="min-w-0 flex-1">
              <InputField
                type="date"
                value={formData.startDate ?? ""}
                onChange={onInputChange("startDate")}
                error={hasError("startDate")}
                helperText={getFirstError("startDate") ?? undefined}
                aria-label="Дата начала"
              />
            </div>
            <div className="min-w-0 flex-1">
              <InputField
                type="date"
                value={formData.endDate ?? ""}
                onChange={onInputChange("endDate")}
                error={hasError("endDate")}
                helperText={getFirstError("endDate") ?? undefined}
                aria-label="Дата окончания"
              />
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};
