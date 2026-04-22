import {
  InputField,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Switch,
} from "@senler/ui";
import type { IPatchSprintsRequest } from "@services/sprints/sprints.types";
import { rewardUnits, getRewardUnitShortName } from "../constants/rewardUnits";

interface SprintPromoCodesSectionProps {
  formData: IPatchSprintsRequest;
  onInputChange: (
    field: keyof IPatchSprintsRequest
  ) => (event: React.ChangeEvent<HTMLInputElement>) => void;
  onSelectChange: (
    field: keyof IPatchSprintsRequest
  ) => (event: { target: { value: string } }) => void;
  fieldErrors?: Record<string, string[]>;
  onIgnorePromoCodeUsageLimitChange: (value: boolean) => void;
}

export const SprintPromoCodesSection = ({
  formData,
  onInputChange,
  onSelectChange,
  fieldErrors,
  onIgnorePromoCodeUsageLimitChange,
}: SprintPromoCodesSectionProps) => {
  const getFirstError = (field: string) => fieldErrors?.[field]?.[0];
  const hasError = (field: string) => !!fieldErrors?.[field];

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
          onValueChange={(v) =>
            onSelectChange("rewardUnits")({ target: { value: v } })
          }
        >
          <SelectTrigger className="w-full max-w-md">
            <SelectValue placeholder="Выберите единицу" />
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
        <p className="text-sm font-medium text-foreground">
          Награда для привлечённых пользователей
        </p>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="min-w-0 flex-1 sm:max-w-xs">
            <InputField
              type="number"
              value={String(formData.rewardValue)}
              onChange={onInputChange("rewardValue")}
              error={hasError("rewardValue")}
              helperText={getFirstError("rewardValue") ?? undefined}
              aria-label="Значение награды"
            />
          </div>
          <p className="shrink-0 text-sm text-muted-foreground">
            {getRewardUnitShortName(formData.rewardUnits)}
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-medium text-foreground">
            Ограничить число использования каждого промокода
          </p>
          <Switch
            checked={!formData.ignorePromoCodeUsageLimit}
            onCheckedChange={(checked) =>
              onIgnorePromoCodeUsageLimitChange(!checked)
            }
            aria-label="Ограничить число использований промокода"
          />
        </div>
        {!formData.ignorePromoCodeUsageLimit ? (
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className="min-w-0 flex-1 sm:max-w-xs">
              <InputField
                type="number"
                value={String(formData.promoCodeUsageLimit)}
                onChange={onInputChange("promoCodeUsageLimit")}
                error={hasError("promoCodeUsageLimit")}
                helperText={getFirstError("promoCodeUsageLimit") ?? undefined}
                aria-label="Лимит использований промокода"
              />
            </div>
            <p className="shrink-0 text-sm text-muted-foreground">раз</p>
          </div>
        ) : null}
      </div>
    </div>
  );
};
