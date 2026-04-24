import { InputField, Switch, Textarea } from "@senler/ui";
import type { IPatchEventsRequest } from "@services/events/events.types";

interface EventSettingsSectionProps {
  formData: IPatchEventsRequest;
  prefix: string;
  onInputChange: (field: keyof IPatchEventsRequest) => (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onPrefixChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  createValidationErrors?: Record<string, string[]>;
  updateValidationErrors?: Record<string, string[]>;
  prefixValidationError?: string;
  prefixOccupiedError?: string;
  checkPrefixValidationErrors?: Record<string, string[]>;
  isNewEvent: boolean;
  onIgnoreEndDateChange: (value: boolean) => void;
}

export const EventSettingsSection = ({
  formData,
  prefix,
  onInputChange,
  onPrefixChange,
  createValidationErrors,
  updateValidationErrors,
  prefixValidationError,
  prefixOccupiedError,
  checkPrefixValidationErrors,
  isNewEvent,
  onIgnoreEndDateChange,
}: EventSettingsSectionProps) => {
  const nameErr = createValidationErrors?.name || updateValidationErrors?.name;
  const descErr = createValidationErrors?.description || updateValidationErrors?.description;
  const startErr = createValidationErrors?.startDate || updateValidationErrors?.startDate;
  const endErr = createValidationErrors?.endDate || updateValidationErrors?.endDate;
  const prefixFieldErr = createValidationErrors?.promoCodesPrefix || checkPrefixValidationErrors?.promoCodesPrefix;

  const prefixHelper =
    prefixFieldErr?.join(", ") ||
    prefixValidationError ||
    prefixOccupiedError ||
    (!isNewEvent
      ? "Префикс создается один раз при создании события и не может быть изменен"
      : "Префикс будет использоваться для генерации уникальных промокодов");

  return (
    <div className="grid gap-6">
      <div className="space-y-2">
        <p className="text-sm font-medium text-foreground">Название</p>
        <InputField
          placeholder="Будет показываться вам и определенным амбассадорам"
          value={formData.name}
          onChange={onInputChange("name")}
          error={!!nameErr}
          helperText={nameErr?.join(", ")}
        />
      </div>

      <div className="space-y-2">
        <p className="text-sm font-medium text-foreground">Описание</p>
        <Textarea
          placeholder="Текст описания события"
          className="min-h-[100px] w-full"
          value={formData.description}
          onChange={onInputChange("description")}
        />
        {descErr ? (
          <p className="text-sm text-destructive">{descErr.join(", ")}</p>
        ) : null}
      </div>

      <div className="space-y-2">
        <p className="text-sm font-medium text-foreground">Префикс промокода</p>
        <InputField
          placeholder="Уникальный префикс для промокодов этого события"
          value={prefix}
          onChange={onPrefixChange}
          disabled={!isNewEvent}
          error={!!prefixFieldErr || !!prefixValidationError || !!prefixOccupiedError}
          helperText={prefixHelper}
        />
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between gap-4">
          <span className="text-sm font-medium text-foreground">Ограничить событие датами</span>
          <Switch
            checked={!formData.ignoreEndDate}
            onCheckedChange={(c) => onIgnoreEndDateChange(!c)}
          />
        </div>
        {!formData.ignoreEndDate && (
          <div className="grid gap-3 sm:grid-cols-2 sm:items-start">
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">Начало</p>
              <InputField
                type="date"
                value={formData.startDate ?? ""}
                onChange={onInputChange("startDate")}
                error={!!startErr}
                helperText={startErr?.join(", ")}
              />
            </div>
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">Конец</p>
              <InputField
                type="date"
                value={formData.endDate ?? ""}
                onChange={onInputChange("endDate")}
                error={!!endErr}
                helperText={endErr?.join(", ")}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
