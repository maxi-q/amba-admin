import { Box, Stack, TextField, Typography, Switch } from "@mui/material";
import type { IPatchSprintsRequest } from "@services/sprints/sprints.types";

interface SprintSettingsSectionProps {
  formData: IPatchSprintsRequest;
  onInputChange: (field: keyof IPatchSprintsRequest) => (event: React.ChangeEvent<HTMLInputElement>) => void;
  fieldErrors?: Record<string, string[]>;
  onIgnoreEndDateChange: (value: boolean) => void;
}

export const SprintSettingsSection = ({
  formData,
  onInputChange,
  fieldErrors,
  onIgnoreEndDateChange,
}: SprintSettingsSectionProps) => {
  const getFirstError = (field: string) => fieldErrors?.[field]?.[0];
  const hasError = (field: string) => !!fieldErrors?.[field];

  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="subtitle2" mb={1}>
          Название
        </Typography>
        <TextField
          fullWidth
          placeholder="Будет показываться вам и определенным амбассадорам"
          variant="outlined"
          value={formData.name}
          onChange={onInputChange('name')}
          error={hasError('name')}
          helperText={getFirstError('name')}
        />
      </Box>

      <Box>
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
          <Typography variant="subtitle2">
            Ограничить спринт датами
          </Typography>
          <Switch
            checked={!formData.ignoreEndDate}
            onChange={(e) => onIgnoreEndDateChange(!e.target.checked)}
          />
        </Stack>
        {!formData.ignoreEndDate && (
          <Stack direction="row" spacing={2} alignItems="center">
            <TextField
              type="date"
              value={formData.startDate}
              onChange={onInputChange('startDate')}
              variant="outlined"
              sx={{ flex: 1 }}
              error={hasError('startDate')}
              helperText={getFirstError('startDate')}
            />
            <TextField
              type="date"
              value={formData.endDate}
              onChange={onInputChange('endDate')}
              variant="outlined"
              sx={{ flex: 1 }}
              error={hasError('endDate')}
              helperText={getFirstError('endDate')}
            />
          </Stack>
        )}
      </Box>
    </Stack>
  );
};

