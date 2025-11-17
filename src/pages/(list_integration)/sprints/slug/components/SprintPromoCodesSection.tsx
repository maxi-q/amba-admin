import { Box, FormControl, MenuItem, Select, Stack, Switch, TextField, Typography } from "@mui/material";
import type { IPatchSprintsRequest } from "@services/sprints/sprints.types";
import { rewardUnits, getRewardUnitShortName } from "../constants/rewardUnits";

interface SprintPromoCodesSectionProps {
  formData: IPatchSprintsRequest;
  onInputChange: (field: keyof IPatchSprintsRequest) => (event: React.ChangeEvent<HTMLInputElement>) => void;
  onSelectChange: (field: keyof IPatchSprintsRequest) => (event: any) => void;
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
    <>
      <Box>
        <Typography variant="h5" fontWeight={700} mb={2}>Промокоды</Typography>
        <Typography variant="body2" color="text.secondary" maxWidth="md">
          Для какого участка будет спеймерован уникальный промокод, который отправится при добавлении в группу амбассадоров, а также будет отправлен указанные ниже награды
        </Typography>
      </Box>

      <Box>
        <Typography variant="subtitle2" mb={1}>
          Единицы награды
        </Typography>
        <FormControl fullWidth>
          <Select
            value={formData.rewardUnits}
            onChange={onSelectChange('rewardUnits')}
            variant="outlined"
          >
            {rewardUnits.map((unit) => (
              <MenuItem key={unit.value} value={unit.value}>
                {unit.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      <Box>
        <Typography variant="subtitle2" mb={1}>
          Награда для привлеченных пользователей
        </Typography>
        <Stack direction="row" spacing={2} alignItems="center">
          <TextField
            type="number"
            value={formData.rewardValue}
            onChange={onInputChange('rewardValue')}
            variant="outlined"
            sx={{ flex: 1 }}
            error={hasError('rewardValue')}
            helperText={getFirstError('rewardValue')}
          />
          <Typography variant="body2" color="text.secondary">
            {getRewardUnitShortName(formData.rewardUnits)}
          </Typography>
        </Stack>
      </Box>

      <Box>
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
          <Typography variant="subtitle2">
            Ограничить число использования каждого промокода
          </Typography>
          <Switch
            checked={!formData.ignorePromoCodeUsageLimit}
            onChange={(e) => onIgnorePromoCodeUsageLimitChange(!e.target.checked)}
          />
        </Stack>
        {!formData.ignorePromoCodeUsageLimit && (
          <Stack direction="row" spacing={2} alignItems="center">
            <TextField
              type="number"
              value={formData.promoCodeUsageLimit}
              onChange={onInputChange('promoCodeUsageLimit')}
              variant="outlined"
              sx={{ flex: 1 }}
              error={hasError('promoCodeUsageLimit')}
              helperText={getFirstError('promoCodeUsageLimit')}
            />
            <Typography variant="body2" color="text.secondary">
              раз
            </Typography>
          </Stack>
        )}
      </Box>
    </>
  );
};

