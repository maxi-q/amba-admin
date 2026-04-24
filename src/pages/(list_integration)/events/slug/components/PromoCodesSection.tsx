import { InputField, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Switch } from "@senler/ui";
import type { IPatchEventsRequest } from "@services/events/events.types";
import { rewardUnits, getRewardUnitShortName } from "../constants/rewardUnits";

interface PromoCodesSectionProps {
  formData: IPatchEventsRequest;
  onInputChange: (field: keyof IPatchEventsRequest) => (event: React.ChangeEvent<HTMLInputElement>) => void;
  onRewardUnitsChange: (value: string) => void;
  createValidationErrors?: Record<string, string[]>;
  updateValidationErrors?: Record<string, string[]>;
  onIgnorePromoCodeUsageLimitChange: (value: boolean) => void;
}

export const PromoCodesSection = ({
  formData,
  onInputChange,
  onRewardUnitsChange,
  createValidationErrors,
  updateValidationErrors,
  onIgnorePromoCodeUsageLimitChange,
}: PromoCodesSectionProps) => {
  const rewardValErr = createValidationErrors?.rewardValue || updateValidationErrors?.rewardValue;
  const limitErr = createValidationErrors?.promoCodeUsageLimit || updateValidationErrors?.promoCodeUsageLimit;

  return (
    <div className="grid gap-6">
      <div>
        <h3 className="mb-2 text-xl font-bold tracking-tight">Промокоды</h3>
        <p className="max-w-3xl text-sm text-muted-foreground">
          Для какого участка будет сгенерирован уникальный промокод, который
          отправится при добавлении в группу амбассадоров, а также будут
          отправлены указанные ниже награды
        </p>
      </div>

      <div className="space-y-2">
        <p className="text-sm font-medium text-foreground">Единицы награды</p>
        <Select
          value={formData.rewardUnits}
          onValueChange={onRewardUnitsChange}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Выберите единицы" />
          </SelectTrigger>
          <SelectContent>
            {rewardUnits.map((unit) => (
              <SelectItem key={unit.value} value={unit.value}>
                {unit.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <p className="text-sm font-medium text-foreground">Награда для привлеченных пользователей</p>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="min-w-0 flex-1">
            <InputField
              type="number"
              value={String(formData.rewardValue)}
              onChange={onInputChange("rewardValue")}
              error={!!rewardValErr}
              helperText={rewardValErr?.join(", ")}
            />
          </div>
          <p className="shrink-0 text-sm text-muted-foreground">
            {getRewardUnitShortName(formData.rewardUnits)}
          </p>
        </div>
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between gap-4">
          <span className="text-sm font-medium text-foreground">
            Ограничить число использования каждого промокода
          </span>
          <Switch
            checked={!formData.ignorePromoCodeUsageLimit}
            onCheckedChange={(c) => onIgnorePromoCodeUsageLimitChange(!c)}
          />
        </div>
        {!formData.ignorePromoCodeUsageLimit && (
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className="min-w-0 flex-1">
              <InputField
                type="number"
                value={String(formData.promoCodeUsageLimit)}
                onChange={onInputChange("promoCodeUsageLimit")}
                error={!!limitErr}
                helperText={limitErr?.join(", ")}
              />
            </div>
            <p className="shrink-0 text-sm text-muted-foreground">раз</p>
          </div>
        )}
      </div>
    </div>
  );
};
